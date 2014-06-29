(function() {
  'use strict';
  // Declare app level module which depends on filters, and services
  angular.module('blindMaps', [
    'blindMaps.filters',
    'blindMaps.services',
    'blindMaps.directives',
    'blindMaps.controllers',
    'blindMaps.map',
    'ngRoute',
    'ngAnimate',
    'angulartics',
    'angulartics.google.analytics'
  ])

  .config(['$routeProvider', function($routeProvider) {
    $routeProvider.when('/', {
      templateUrl : 'static/tpl/homepage.html'
    }).when('/how-it-works', {
      templateUrl : '../templates/home/how_it_works.html'
    }).when('/about', {
      templateUrl : 'static/tpl/about.html'
    }).when('/view/', {
      redirectTo : '/view/world/'
    }).when('/view/:part/:user?', {
      controller : 'AppView',
      templateUrl : 'static/tpl/view_tpl.html'
    }).when('/practice/', {
      redirectTo : '/practice/0/'
    }).when('/refreshpractice/:part/:place_type?', {
      redirectTo : '/practice/:part/:place_type'
    }).when('/practice/:part/:place_type?', {
      controller : 'AppPractice',
      templateUrl : 'static/tpl/practice_tpl.html'
    }).when('/overview/:user?', {
      controller : 'AppOverview',
      templateUrl : 'static/tpl/overview_tpl.html'
    }).otherwise({
      //redirectTo : '/'
    });
  }])

  .run(['$rootScope', '$', '$analytics', 'places',
      function($rootScope, $, $analytics, places) {
    $analytics.settings.pageTracking.autoTrackFirstPage = false;
    
    $rootScope.$on("$routeChangeStart", function(event, next, current) {
      if (current && current.originalPath !== "" && $(window).width() < 770) {
        $("#nav-main").collapse();
        $("#nav-main").collapse('hide');
      }
    });

    $('.dropdown-menu a[href^="#/view/"]').each( function(i, link){
      var code = $(link).attr('href').replace('#/view/', '').replace('/', '');
      var name = $(link).text();
      places.setName(code, name);
    });
  }]);
}());
