#!/usr/bin/env python
# -*- coding: utf-8 -*-
import json
import re
import random
random.seed(11111111)


################################################################################
# Constants
################################################################################

CATEGORY_NAMES = [
    "Pravidla provozu na pozemních komunikacích",
    "Dopravní značky",
    "Dopravní situace",
    "Zásady bezpečné jízdy",
    "Předpisy související s provozem",
    "Předpisy o podmínkách provozu vozidel",
    "Zdravotnická příprava",
]

CATEGORY_INDEXES = {}
for i, c in enumerate(CATEGORY_NAMES):
    CATEGORY_INDEXES[c] = i


################################################################################
# Util functions
################################################################################

def load_data(filename):
    with open(filename) as json_data:
        return json.load(json_data)


def process_option(opt, correct):
    return opt[0], {'text': re.sub(r'\n$', '', opt[1]), 'correct': correct}


def process_question(q):
    images = map(
        lambda s: {'path': s[1:], 'name': s.replace(' ', '_').replace('/QuestionImg/', '')[-20:]} ,
        q['images'])
    opts = map(lambda opt: process_option(opt, True), q['correct'])
    opts += map(lambda opt: process_option(opt, False), q['incorrect'])
    opts = map(lambda (x, y): y, sorted(opts))
    order = 0
    for opt in opts:
        opt['order'] = order
        if len(images) == len(opts) and opt['text'] == '.':
            opt['text'] = '![Image](%s)' % images[order]['name']
            opt['images'] = [images[order]]
        order += 1
    if len(images) == len(opts):
        images = []
    images_text = ' '.join(map(lambda im: '<br />![Image](%s)' % im['name'], images))
    return {
        'text': re.sub(r'\r\n$', '', q['text']) + images_text,
        'options': opts,
        'images': images,
        'categories': [CATEGORY_NAMES[categories[q['qid']] - 1]],
        'identifier': q['qid'],
    }


"""
10 otázek z kategorie Pravidla provozu na pozemních komunikacích po 2 bodech.
3 otázky z kategorie Dopravní značky po 1 bodu.
3 otázky z kategorie Dopravní situace po 4 bodech.
4 otázky z kategorie Zásady bezpečné jízdy po 2 bodech.
2 otázky z kategorie Předpisy související s provozem po 3 bodech.
2 otázky z kategorie Předpisy o podmínkách provozu vozidel po 1 bodu.
1 otázka z kategorie Zdravotnická příprava po 1 bodu.
"""
def create_test_set(new_questions, test_name):
    nums = [
            10,
            3,
            3,
            4,
            2,
            2,
            1,
            ]
    iters = 0
    while sum(nums) > 0:
        iters += 1
        i = random.randint(0, len(new_questions['questions']) - 1)
        question = new_questions['questions'][i]
        category_index = CATEGORY_INDEXES[question['categories'][0]]
        if nums[category_index] > 0:
            if not 'sets' in question:
                question['sets'] = []
            if not test_name in question['sets']:
                question['sets'].append(test_name)
                nums[category_index] -= 1


################################################################################
# Processing
################################################################################

questions = load_data('data.json')
categories = load_data('categories.json')

new_questions = {'resources': [], 'questions': map(process_question, questions)}
for i in range(1,20):
     create_test_set(new_questions, 'test%d'%i)

with open('questions.json', 'w') as f:
    json.dump(new_questions, f, indent=2)
