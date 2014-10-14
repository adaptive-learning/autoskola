# -*- coding: utf-8 -*-
from django.conf import settings
from django.core.context_processors import csrf
from django.shortcuts import render_to_response
from proso_client.utils import StaticFiles
from proso_client.utils import get_user
from proso_questions.models import Category
import json


def home(request, hack=None):
    JS_FILES = (
        "static/dist/js/fallbacks.min.js",
        "static/dist/js/libs.min.js",
        "static/dist/js/proso-apps-client.min.js",
        "static/lib/angular-1.2.9/i18n/angular-locale_cs.js",
    )
    CSS_FILES = (
        "static/bower_components/angular-material/angular-material.min.css",
        "static/bower_components/bootstrap/dist/css/bootstrap.css",
        "static/css/app.css",
    )
    request.META["CSRF_COOKIE_USED"] = True
    if settings.ON_PRODUCTION:
        title = ''
    elif settings.ON_STAGING:
        title = 'Stage - '
    else:
        title = 'Loc - '
    hashes = dict((key, value)
                  for key, value
                  in settings.HASHES.iteritems()
                  if "/lib/" not in key and "/js/" not in key and "/sass/" not in key
                  )
    c = {
        'title': title + 'Autoškola Chytře - testy z autoškoly na míru',
        'isProduction': settings.ON_PRODUCTION,
        'css_files': StaticFiles.add_hash(CSS_FILES),
        'js_files': StaticFiles.add_hash(JS_FILES),
        'hashes': json.dumps(hashes),
        'user': get_user(request),
        'isHomepage': hack is None,
        'categories': Category.objects.all().order_by('id'),
    }
    c.update(csrf(request))
    return render_to_response('home.html', c)
