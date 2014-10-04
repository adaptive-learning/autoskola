#!/usr/bin/env python

from setuptools import setup

setup(
    name='Autoskola',
    version='1.0',
    description='Intelligent application for practicing driving license test questions.',
    author='Vit Stanislav',
    author_email='slaweet@seznam.cz',
    url='https://github.com/proso/autoskola',
    install_requires=[
        'Django<=1.6',
        'south',
        'django-lazysignup',
        'django-social-auth'
    ],
)
