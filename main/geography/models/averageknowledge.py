# -*- coding: utf-8 -*-
from django.db import models
from place import Place
from django.contrib.auth.models import User


class AverageKnowledgeManager(models.Manager):

    def for_user_and_map_prepared(self, user, map):
        return self.raw("""
    SELECT
        geography_currentskill_prepared.user_id * 100000 + geography_placerelation.place_id AS dummy_id,
        geography_placerelation.place_id AS place_id,
        geography_currentskill_prepared.user_id AS user_id,
        geography_place.type AS type,
        AVG(geography_currentskill_prepared.value) AS skill
    FROM
        geography_placerelation
        INNER JOIN geography_placerelation_related_places
            ON geography_placerelation.id =
                geography_placerelation_related_places.placerelation_id
        INNER JOIN geography_currentskill_prepared
            ON geography_placerelation_related_places.place_id =
                geography_currentskill_prepared.place_id
        INNER JOIN geography_place
            ON geography_place.id = geography_placerelation_related_places.place_id
    WHERE
        (geography_placerelation.type = 1 OR
        geography_placerelation.type = 4 ) AND
        geography_currentskill_prepared.user_id = %s AND
        geography_placerelation.place_id = %s
    GROUP BY
        geography_placerelation.place_id,
        geography_currentskill_prepared.user_id,
        geography_place.type
    ORDER BY
        geography_place.name;
        """, [user.id, map.place.id]
        )


class AverageKnowledge(models.Model):

    dummy_id = models.CharField(primary_key=True, max_length=40)
    user = models.ForeignKey(User, on_delete=models.DO_NOTHING)
    place = models.ForeignKey(Place, on_delete=models.DO_NOTHING)
    skill = models.FloatField(default=0)

    objects = AverageKnowledgeManager()

    class Meta:
        app_label = 'geography'
        managed = False

    """ READ ONLY MODEL """
    def save(self, **kwargs):
        raise NotImplementedError
