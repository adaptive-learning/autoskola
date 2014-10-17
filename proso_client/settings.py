# -*- coding: utf-8 -*-
import os

ON_PRODUCTION = False
ON_STAGING = False
if 'DRIVING_SCHOOL_ON_PRODUCTION' in os.environ:
    ON_PRODUCTION = True
elif 'DRIVING_SCHOOL_ON_STAGING' in os.environ:
    ON_STAGING = True

PROJECT_DIR = os.path.dirname(os.path.realpath(__file__))
if ON_PRODUCTION:
    DEBUG = False
elif ON_STAGING:
    DEBUG = True
else:
    DEBUG = True
TEMPLATE_DEBUG = DEBUG

ADMINS = (
    ('Vít Stanislav', 'slaweet@seznam.cz'),
    ('Jan Papoušek', 'jan.papousek@gmail.com'),
)
MANAGERS = ADMINS

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql_psycopg2',
        'NAME': 'proso_apps',
        'USER': 'proso_apps',
        'PASSWORD': 'proso_apps',
        'HOST': 'localhost'
    }
}


# Local time zone for this installation. Choices can be found here:
# http://en.wikipedia.org/wiki/List_of_tz_zones_by_name
# although not all choices may be available on all operating systems.
# On Unix systems, a value of None will cause Django to use the same
# timezone as the operating system.
# If running in a Windows environment this must be set to the same as your
# system time zone.
TIME_ZONE = 'Europe/Prague'

# Language code for this installation. All choices can be found here:
# http://www.i18nguy.com/unicode/language-identifiers.html
LANGUAGE_CODE = 'cz'

_ = lambda s: s

LANGUAGES = (
    ('cz', _('Czech')),
    ('en', _('English')),
)

SITE_ID = 1

# If you set this to False, Django will make some optimizations so as not
# to load the internationalization machinery.
USE_I18N = True

# If you set this to False, Django will not format dates, numbers and
# calendars according to the current locale
USE_L10N = True

# Absolute filesystem path to the directory that will hold user-uploaded files.
# Example: "/home/media/media.lawrence.com/media/"
MEDIA_ROOT = os.environ.get('DRIVING_SCHOOL_DATA_DIR', '')

# URL that handles the media served from MEDIA_ROOT. Make sure to use a
# trailing slash.
# Examples: "http://media.lawrence.com/media/", "http://example.com/media/"
MEDIA_URL = 'media/'

# Absolute path to the directory static files should be collected to.
# Don't put anything in this directory yourself; store your static files
# in apps' "static/" subdirectories and in STATICFILES_DIRS.
# Example: "/home/media/media.lawrence.com/static/"
STATIC_ROOT = os.path.join(PROJECT_DIR, '../../static/')

# URL prefix for static files.
# Example: "http://media.lawrence.com/static/"
STATIC_URL = '/static/'

# Additional locations of static files
STATICFILES_DIRS = (
    # Put strings here, like "/home/html/static" or "C:/www/django/static".
    # Always use forward slashes, even on Windows.
    # Don't forget to use absolute paths, not relative paths.
)

# List of finder classes that know how to find static files in
# various locations.
STATICFILES_FINDERS = (
    'django.contrib.staticfiles.finders.FileSystemFinder',
    'django.contrib.staticfiles.finders.AppDirectoriesFinder',
)

# Make a dictionary of default keys
default_keys = {
    'SECRET_KEY': 'vm4rl5*ymb@2&d_(gc$gb-^twq9w(u69hi--%$5xrh!xk(t%hw'
}

# Replace default keys with dynamic values if we are on server
use_keys = default_keys
if ON_PRODUCTION or ON_STAGING:
    default_keys['SECRET_KEY'] = os.environ['DRIVING_SCHOOL_SECRET_KEY']

# Make this unique, and don't share it with anybody.
SECRET_KEY = use_keys['SECRET_KEY']

# List of callables that know how to import templates from various sources.
TEMPLATE_LOADERS = (
    'django.template.loaders.filesystem.Loader',
    'django.template.loaders.app_directories.Loader',
)

MIDDLEWARE_CLASSES = (
    'django.middleware.common.CommonMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.locale.LocaleMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'proso_client.middleware.SqldumpMiddleware',
    'proso_client.middleware.AuthAlreadyAssociatedMiddleware',
)

ROOT_URLCONF = 'proso_client.urls'

TEMPLATE_DIRS = (
    # Put strings here, like "/home/html/django_templates" or "C:/www/django/templates".
    # Always use forward slashes, even on Windows.
    # Don't forget to use absolute paths, not relative paths.
    os.path.join(PROJECT_DIR, 'templates'),
)

INSTALLED_APPS = (
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'django.contrib.sitemaps',
    # Uncomment the next line to enable the admin:
    'django.contrib.admin',
    # Uncomment the next line to enable admin documentation:
    # 'django.contrib.admindocs',
    'south',
    'social_auth',
    'lazysignup',
    'proso_common',
    'proso_models',
    'proso_questions',
    'proso_ab',
    'proso_client',
)

# A sample logging configuration. The only tangible logging
# performed by this configuration is to send an email to
# the site admins on every HTTP 500 error.
# See http://docs.djangoproject.com/en/dev/topics/logging for
# more details on how to customize your logging configuration.
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '%(levelname)s %(asctime)s %(module)s %(process)d %(thread)d "%(message)s"'
        },
        'simple': {
            'format': '[%(asctime)s] %(levelname)s "%(message)s"'
        },
    },
    'filters': {
        'require_debug_false': {
            '()': 'django.utils.log.RequireDebugFalse'
        }
    },
    'handlers': {
        'console': {
            'level': 'DEBUG',
            'class': 'logging.StreamHandler',
            'formatter': 'simple'
        },
        'mail_admins': {
            'level': 'ERROR',
            'filters': ['require_debug_false'],
            'class': 'django.utils.log.AdminEmailHandler'
        },
        'proso_client_file': {
            'level': 'DEBUG',
            'class': 'logging.FileHandler',
            'filename': os.path.join(MEDIA_ROOT, 'proso_client.log'),
            'formatter': 'simple'
        },
        'proso_file': {

            'level': 'DEBUG',
            'class': 'logging.FileHandler',
            'filename': os.path.join(MEDIA_ROOT, 'proso.log'),
            'formatter': 'simple'
        },
        'queries_file': {
            'level': ('DEBUG' if DEBUG else 'INFO'),
            'class': 'logging.FileHandler',
            'filename': os.path.join(MEDIA_ROOT, 'proso_client_sql.log')
        }
    },
    'loggers': {
        'django.request': {
            'handlers': ['mail_admins'],
            'level': 'ERROR',
            'propagate': True,
        },
        'proso_client': {
            'handlers': ['proso_client_file'],
            'level': 'DEBUG',
            'propagate': True,
        },
        'proso': {
            'handlers': ['proso_file'],
            'level': 'DEBUG',
            'propagate': True,
        },
        'django.db': {
            'level': 'DEBUG',
            'handlers': ['queries_file'],
            'propagate': True
        }
    }
}
if DEBUG:
    # make all loggers use the console.
    for logger in LOGGING['loggers']:
        if logger != 'django.db':
            LOGGING['loggers'][logger]['handlers'].append('console')

if DEBUG:
    INSTALLED_APPS += ('debug_toolbar',)
    MIDDLEWARE_CLASSES += ('debug_toolbar.middleware.DebugToolbarMiddleware',)
    if 'DRIVING_SCHOOL_ON_STAGING' in os.environ:
        DEBUG_TOOLBAR_PATCH_SETTINGS = False

FACEBOOK_APP_ID = os.getenv('DRIVING_SCHOOL_FACEBOOK_APP_ID', '')
FACEBOOK_API_SECRET = os.getenv('DRIVING_SCHOOL_FACEBOOK_API_SECRET', '')
SOCIAL_AUTH_CREATE_USERS = True
SOCIAL_AUTH_FORCE_RANDOM_USERNAME = False
SOCIAL_AUTH_DEFAULT_USERNAME = 'socialauth_user'
LOGIN_ERROR_URL = '/login/error/'
SOCIAL_AUTH_ERROR_KEY = 'socialauth_error'
SOCIAL_AUTH_RAISE_EXCEPTIONS = False
GOOGLE_OAUTH2_CLIENT_ID = os.getenv('DRIVING_SCHOOL_GOOGLE_OAUTH2_CLIENT_ID', '')
GOOGLE_OAUTH2_CLIENT_SECRET = os.getenv('DRIVING_SCHOOL_GOOGLE_OAUTH2_CLIENT_SECRET', '')

# http://stackoverflow.com/questions/22005841/is-not-json-serializable-django-social-auth-facebook-login
SESSION_SERIALIZER='django.contrib.sessions.serializers.PickleSerializer'

AUTHENTICATION_BACKENDS = (
    'django.contrib.auth.backends.ModelBackend',
    'lazysignup.backends.LazySignupBackend',
    'social_auth.backends.facebook.FacebookBackend',
    'social_auth.backends.google.GoogleOAuth2Backend',
)

ALLOWED_HOSTS = [
    '.autoskolachytre.cz',
    'altest.thran.cz',
]

CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.filebased.FileBasedCache',
        'LOCATION': os.path.join(MEDIA_ROOT, '.django_cache'),
    }
}

LOGIN_REDIRECT_URL = '/'

SOCIAL_AUTH_DEFAULT_USERNAME = 'new_social_auth_user'

SOCIAL_AUTH_UID_LENGTH = 222
SOCIAL_AUTH_NONCE_SERVER_URL_LENGTH = 200
SOCIAL_AUTH_ASSOCIATION_SERVER_URL_LENGTH = 135
SOCIAL_AUTH_ASSOCIATION_HANDLE_LENGTH = 125


# http://stackoverflow.com/questions/4882377/django-manage-py-test-fails-table-already-exists
SOUTH_TESTS_MIGRATE = False

try:
    from hashes import HASHES
except ImportError:
    HASHES = {}
except SyntaxError:
    HASHES = {}

PROSO_PREDICTIVE_MODEL = 'proso.models.prediction.AlwaysLearningPredictiveModel'
PROSO_ENVIRONMENT = 'proso_models.models.DatabaseEnvironment'
PROSO_RECOMMENDATION = 'proso.models.recommendation.ScoreRecommendation'
