# -*- coding: utf-8 -*-

ADMINS = (
    ('Vít Stanislav', 'slaweet@gmail.com'),
    ('Jan Papoušek', 'jan.papousek@gmail.com'),
)
MANAGERS = ADMINS

ALLOWED_HOSTS = [
    '.autoskolachytre.cz',
]

PROSO_PREDICTIVE_MODEL = 'proso.models.prediction.AlwaysLearningPredictiveModel'
PROSO_ENVIRONMENT = 'proso_models.models.DatabaseEnvironment'
PROSO_RECOMMENDATION = 'proso.models.recommendation.ScoreRecommendation'
PROSO_TEST_EVALUATOR = 'proso_questions.models.CategoryTestEvaluator'
PROSO_TEST_EVALUATOR_ARGS = [{
    u'Pravidla provozu na pozemních komunikacích': {
        'correct': 2,
        'answers': 10
    },
    u'Dopravní značky': {
        'correct': 1,
        'answers': 3
    },
    u'Zásady bezpečné jízdy': {
        'correct': 2,
        'answers': 4
    },
    u'Dopravní situace': {
        'correct': 4,
        'answers': 3
    },
    u'Předpisy o podmínkách provozu vozidel': {
        'correct': 1,
        'answers': 2
    },
    u'Předpisy související s provozem': {
        'correct': 2,
        'answers': 2
    },
    u'Zdravotnická příprava': {
        'correct': 1,
        'answers': 1
    }
}, 43]

FEEDBACK_TO = 'autoskolachytre@googlegroups.com'
FEEDBACK_FROM = 'feedback@autoskolachytre.cz'
FEEDBACK_FROM_SPAM = 'spam@autoskolachytre.cz'
