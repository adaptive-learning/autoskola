# -*- coding: utf-8 -*-
from geography.models import Answer, Place, Value, DatabaseEnvironment
import logging

LOGGER = logging.getLogger(__name__)


class Question():
    def __init__(self, place, options, map_place, ab_values):
        self.place = place
        self.map_place = map_place
        self.ab_values = ab_values

    def to_serializable(self):
        ret = {
            'type': '2' + str(len(self.place.options)),
            'text': self.place.text,
            'asked_code': self.place.code,
            'map_code': self.map_place.place.code,
            'place': self.place.name,
            'ab_values': [v.value for v in self.ab_values],
            "options": self.place.options,
        }
        return ret


class QuestionService:

    def __init__(self, user, map_place, ab_env, target_probability=0.75, history_length=10):
        self.user = user
        self.map_place = map_place
        self.target_probability = target_probability
        self.history_length = history_length
        self.ab_env = ab_env

    def get_questions(self, n, place_types):
        candidates = Place.objects.get_places_to_ask(
            self.user,
            self.map_place,
            n,
            place_types,
            DatabaseEnvironment(),
            self.ab_env)
        return [
            Question(
                place,
                options,
                self.map_place,
                self.ab_env.get_affecting_values(Place.AB_REASON_RECOMMENDATION)).to_serializable()
            for (place, options) in candidates]

    def answer(self, a, ip_address):
        place_asked = Place.objects.get(code=a["asked_code"])
        place_map = Place.objects.get(code=a["map_code"])
        if "answered" in a:
            place_answered = a["answered"]
        else:
            place_answered = None

        answer_dict = {
            'user': self.user.id,
            'place_asked': place_asked.id,
            'place_answered': place_asked.id if place_asked.correct == a['answered'] else None,
            'answer': place_answered,
            'place_map': place_map.id,
            'type': int(str(a["type"])[0]),
            'response_time': a["response_time"],
            'number_of_options': int(str(a["type"][1:])),
            'ip_address': ip_address if ip_address else None,
        }
        answer_dict['options'] = []
        if 'ab_values' in a:
            ab_values = Value.objects.filter(
                value__in=[v for v in a['ab_values']])
            answer_dict['ab_values'] = [v.id for v in ab_values]
        else:
            answer_dict['ab_values'] = []
        Answer.objects.save_with_listeners(answer_dict)
