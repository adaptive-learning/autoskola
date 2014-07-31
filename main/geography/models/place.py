# -*- coding: utf-8 -*-
from django.db import models
from django.template.defaultfilters import slugify
from django.db import connection
from contextlib import closing
import proso.geography.recommendation as recommendation
import logging

LOGGER = logging.getLogger(__name__)


class WeghtedPlace:

    def __init__(self, code, name, weight):
        self.code = code
        self.name = name
        self.weight = weight


class PlaceManager(models.Manager):

    DEFAULT_RECOMMENDATION_STRATEGY = 'recommendation_by_additive_function'

    RECOMMENDATION_STRATEGIES = {
        DEFAULT_RECOMMENDATION_STRATEGY: recommendation.by_additive_function,
        'recommendation_by_random': recommendation.by_random
    }

    DEFAULT_OPTIONS_STRATEGY = 'recommendation_options_random'

    OPTIONS_STRATEGIES = {
        DEFAULT_OPTIONS_STRATEGY: recommendation.OPTIONS_RANDOM,
        'recommendation_options_naive': recommendation.OPTIONS_NAIVE
    }

    def get_places_to_ask(
            self, user, map_place, n, place_types, knowledge_env, ab_env,
            strategy_name=None):
        if n <= 0:
            return []
        strategy_name = strategy_name or ab_env.get_membership(
            PlaceManager.RECOMMENDATION_STRATEGIES.keys(),
            PlaceManager.DEFAULT_RECOMMENDATION_STRATEGY,
            Place.AB_REASON_RECOMMENDATION)
        options_strategy_name = ab_env.get_membership(
            PlaceManager.OPTIONS_STRATEGIES.keys(),
            PlaceManager.DEFAULT_OPTIONS_STRATEGY,
            Place.AB_REASON_RECOMMENDATION)
        strategy = PlaceManager.RECOMMENDATION_STRATEGIES[strategy_name]
        options_strategy = PlaceManager.OPTIONS_STRATEGIES[options_strategy_name]
        with closing(connection.cursor()) as cursor:
            cursor.execute(
                '''
                SELECT
                    geography_placerelation_related_places.place_id
                FROM
                    geography_placerelation
                    INNER JOIN geography_placerelation_related_places
                        ON placerelation_id = geography_placerelation.id
                    INNER JOIN geography_place
                        ON geography_placerelation_related_places.place_id = geography_place.id
                WHERE
                    geography_placerelation.place_id = %s
                    AND
                    geography_placerelation.type = %s
                    AND
                    geography_place.type IN ''' + str(tuple(place_types)).replace(',)', ')') + '''
                GROUP BY geography_place.id
                ORDER BY geography_place.id
                ''',
                [
                    int(map_place.place.id),
                    int(PlaceRelation.IS_ON_MAP)
                ])
            available_place_ids = [p[0] for p in cursor.fetchall()]
        candidates = strategy(
            user.id,
            available_place_ids,
            knowledge_env,
            n,
            options_strategy=options_strategy)
        targets, options_flatten = zip(*candidates)
        options = [o for os in options_flatten for o in os]
        all_ids = set(list(targets) + list(options))
        all_places = self.filter(id__in=all_ids)
        all_places_dict = dict([(p.id, p) for p in all_places])
        targets_places = map(lambda i: all_places_dict[i], targets)
        options_flatten_places = map(
            lambda os: map(lambda i: all_places_dict[i], os),
            options_flatten)
        return zip(targets_places, options_flatten_places)

    def get_states_with_map(self):
        return [pr.place for pr in PlaceRelation.objects.filter(
            place__type=Place.TRAFIC_RULES,
            type=PlaceRelation.IS_ON_MAP,
        ).select_related('place').order_by("place__name")]

    def get_continents(self):
        return self.filter(type=Place.TRAFIC_SITUATIONS)


class Place(models.Model):

    AB_REASON_RECOMMENDATION = 'reason_recommendation'

    UNKNOWN = 0
    TRAFIC_RULES = 1
    TRAFIC_SIGNS = 2
    SAFETY_PRINCIPLES = 3
    TRAFIC_SITUATIONS = 4
    VEHICLES_REGULATIONS = 5
    TRAFIC_REGULATIONS = 6
    FIRST_AID = 7
    PLACE_TYPES = (
        (UNKNOWN, 'Unknown'),
        (TRAFIC_RULES, 'Trafic_Rules'),
        (TRAFIC_SIGNS, 'Trafic_Signs'),
        (SAFETY_PRINCIPLES, 'Safety_Principles'),
        (TRAFIC_SITUATIONS, 'Trafic_Situations'),
        (VEHICLES_REGULATIONS, 'Vehicles_Regulations'),
        (TRAFIC_REGULATIONS, 'Trafic_Regulations'),
        (FIRST_AID, 'First_Aid'),
    )
    PLACE_TYPE_PLURALS = (
        (UNKNOWN, u'Neznámé'),
        (TRAFIC_RULES, u'Pravidla provozu na pozemních komunikacích'),
        (TRAFIC_SIGNS, u'Dopravní značky'),
        (SAFETY_PRINCIPLES, u'Zásady bezpečné jízdy'),
        (TRAFIC_SITUATIONS, u'Dopravní situace'),
        (VEHICLES_REGULATIONS, u'Předpisy o podmínkách provozu vozidel'),
        (TRAFIC_REGULATIONS, u'Předpisy související s provozem'),
        (FIRST_AID, u'Zdravotnická příprava'),
    )
    TEST_COMPOSITION = (
        (UNKNOWN, 0, 0),
        (TRAFIC_RULES, 10, 2),
        (TRAFIC_SIGNS, 3, 1),
        (SAFETY_PRINCIPLES, 4, 2),
        (TRAFIC_SITUATIONS, 3, 4),
        (VEHICLES_REGULATIONS, 2, 1),
        (TRAFIC_REGULATIONS, 2, 3),
        (FIRST_AID, 1, 1),
    )
    PLACE_TYPE_SLUGS = dict((t[1].upper(), t[0]) for t in PLACE_TYPES)
    PLACE_TYPE_SLUGS_LOWER = dict((t[0], slugify(t[1].lower())) for t in PLACE_TYPES)
    PLACE_TYPE_SLUGS_LOWER_REVERSE = dict((slugify(t[1].lower()), t[0]) for t in PLACE_TYPES)
    CATEGORIES = {
        'category_b': [
            TRAFIC_RULES,
            TRAFIC_SIGNS,
            VEHICLES_REGULATIONS,
            SAFETY_PRINCIPLES,
            TRAFIC_SITUATIONS,
            TRAFIC_REGULATIONS,
            FIRST_AID,
        ],
    }

    code = models.IntegerField(
        db_index=True,
        unique=True)
    text = models.TextField()
    option_a = models.TextField()
    option_b = models.TextField()
    option_c = models.TextField(null=True, default=None)
    correct = models.SmallIntegerField()
    name = models.CharField(max_length=100)
    type = models.IntegerField(choices=PLACE_TYPES, default=UNKNOWN)

    objects = PlaceManager()

    @property
    def options(self):
        ret = [self.wrap_option(0), self.wrap_option(1)]
        if self.option_c is not None:
            ret.append(self.wrap_option(2))
        return ret

    def wrap_option(self, index):
        opts = [
            self.option_a,
            self.option_b,
            self.option_c,
        ]
        return {
            "name": opts[index],
            "isCorrect": index == self.correct,
            "index": index,
        }

    def __unicode__(self):
        return u'{0} ({1})'.format(self.name, self.code)

    def to_serializable(self):
        return {
            'code': self.code,
            'name': self.name
        }

    class Meta:
        app_label = 'geography'
        ordering = ['type', 'name']


class PlaceRelationManager(models.Manager):

    def get_bordering_places(self, place):
        try:
            pr = self.get(place=place, type=PlaceRelation.HAVE_LAND_BORDER)
            prs = self.filter(
                related_places__in=pr.related_places.all(),
                type=PlaceRelation.HAVE_LAND_BORDER)
            return (
                Place.objects.exclude(id=place.id).filter(
                    id__in=[p.place_id for p in prs])
            )
        except PlaceRelation.DoesNotExist:
            return Place.objects.filter(code="###")


class PlaceRelation(models.Model):
    IS_ON_MAP = 1
    IS_SUBMAP = 2
    HAVE_LAND_BORDER = 3
    IS_TOO_SMALL_ON_MAP = 4
    PLACE_RELATION_TYPES = (
        (IS_ON_MAP, 'Is On Map'),
        (IS_SUBMAP, 'Is Submap'),
        (HAVE_LAND_BORDER, 'Have Land Border'),
        (IS_TOO_SMALL_ON_MAP, 'Is Too Small On Map'),
    )
    place = models.ForeignKey(
        Place,
        db_index=True,
        related_name='place_id')
    related_places = models.ManyToManyField(Place)
    type = models.IntegerField(choices=PLACE_RELATION_TYPES, default=1)
    objects = PlaceRelationManager()

    class Meta:
        app_label = 'geography'
        unique_together = ('type', 'place')

    def __str__(self):
        return "Place Relation: " + str(self.place) + " [" + str(self.id) + "]"
