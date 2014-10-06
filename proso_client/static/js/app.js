(function() {
  'use strict';
  /* global jQuery  */
  // Declare app level module which depends on filters, and services
  angular.module('addaptivePractice', [
    'addaptivePractice.filters',
    'addaptivePractice.services',
    'addaptivePractice.directives',
    'addaptivePractice.controllers',
    'ngRoute',
    'ngAnimate',
    'angulartics',
    'angulartics.google.analytics',
    'timer',
    'ng-polymer-elements',
  ])

  .value('$', jQuery)

  .config(['$routeProvider', '$locationProvider',
      function($routeProvider, $locationProvider) {
    $routeProvider.when('/', {
    }).when('/login/:somepath/', {
      controller : 'ReloadController',
      templateUrl : 'loading.html'
    }).when('/how-it-works', {
      templateUrl : '../templates/home/how_it_works.html'
    }).when('/about', {
      templateUrl : 'static/tpl/about.html'
    }).when('/view/:category?', {
      controller : 'AppView',
      templateUrl : 'static/tpl/view_tpl.html'
    }).when('/refreshpractice/:category?', {
      redirectTo : '/practice/:category'
    }).when('/practice/:category?', {
      controller : 'AppPractice',
      templateUrl : 'static/tpl/practice_tpl.html'
    }).when('/test/', {
      controller : 'AppTest',
      templateUrl : 'static/tpl/test_tpl.html'
    }).when('/overview/:user?', {
      controller : 'AppOverview',
      templateUrl : 'static/tpl/overview_tpl.html'
    }).otherwise({
      //redirectTo : '/'
    });

    $locationProvider.html5Mode(true);
  }])

  .run(['$analytics', function($analytics) {
    $analytics.settings.pageTracking.autoTrackFirstPage = false;
  }]);
}());
