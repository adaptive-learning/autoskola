from django.core.management.base import BaseCommand, CommandError
from geography.models import Place, PlaceRelation
import json


class Command(BaseCommand):
    help = u"""Load questions data"""

    def handle(self, *args, **options):
        if(len(args) < 2):
            raise CommandError(
                'Not enough arguments. One arguments required:' +
                ' <data_file_name> <categories_file_name>')
        json_data = open(args[0])
        data = json.load(json_data, "utf-8")
        json_cateogries = open(args[1])
        self.categories = json.load(json_cateogries, "utf-8")
        Place.objects.all().delete()
        PlaceRelation.objects.all().delete()
        cat_b = Place(
            code=0,
            text="",
            option_a="",
            option_b="",
            option_c="",
            correct=0,
            name="Kategorie B",
            type=0,
        )
        cat_b.save()
        map = PlaceRelation(
            place=cat_b,
            type=PlaceRelation.IS_ON_MAP,
        )
        map.save()

        for d in data:
            p = self.save_place(d)
            map.related_places.add(p)
        map.save()

    def save_place(self, d):
        options = {
            "A": None,
            "B": None,
            "C": None,
        }
        for o in d["correct"] + d["incorrect"]:
            options[o[0]]=o[1]
            if len(d["images"]) == 3:
                options[o[0]] ="[img]" + d["images"][letter_to_int(o[0])].replace("/QuestionImg/", "") + "[/img]"

        if len(d["images"]) == 1:
            d["text"] = "[img]" + d["images"][0].replace("/QuestionImg/", "") + "[/img]" + d["text"]

        p = Place(
            code=int(d["qid"]),
            text=d["text"],
            option_a=options["A"],
            option_b=options["B"],
            option_c=options["C"],
            correct=letter_to_int(d["correct"][0][0]),
            name="",
            type=self.categories.get(d["qid"], 0),
        )
        p.save()
        return p


def letter_to_int(str):
    return ord(str) - ord('A')
