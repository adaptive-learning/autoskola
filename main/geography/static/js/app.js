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
    }).when('/view/:part?/:user?', {
      controller : 'AppView',
      templateUrl : 'static/tpl/view_tpl.html'
    }).when('/practice/', {
      redirectTo : '/practice/0/'
    }).when('/refreshpractice/:part/:place_type?', {
      redirectTo : '/practice/:part/:place_type'
    }).when('/practice/:part/:place_type?', {
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
