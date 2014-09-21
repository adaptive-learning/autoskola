(function() {
  'use strict';
  /* Controllers */
  angular.module('addaptivePractice.controllers', [])

  .controller('AppCtrl', ['$scope', '$rootScope', 'user', 'pageTitle', '$filter', 'places',
      function($scope, $rootScope, user, pageTitle, $filter, places) {
    $rootScope.topScope = $rootScope;
    
    $rootScope.initTitle = function (title) {
      $rootScope.initialTitle = title;
      $rootScope.title = title;
    };
    
    $rootScope.$on("$routeChangeStart", function(event, next) {
      $rootScope.title = pageTitle(next) + $rootScope.initialTitle;
      $rootScope.isHomepage = !next.templateUrl;
    });
    
    var updateUser = function(data) {
      $rootScope.user = data;
    };
    
    $scope.initUser = function (username, points) {
      $rootScope.user = user.initUser(username, points);
    };

    $rootScope.logout = function() {
      $rootScope.user = user.logout(updateUser);
    };

    $scope.part = '0';
    places.get($scope.part, '', updatePlaces).
      error(function(){
        $scope.error = "V aplikaci bohužel nastala chyba.";
      });

    function updatePlaces(data) {
      $scope.placesTypes = data.placesTypes;
      $scope.expectedPoints = data.expectedPoints;
      angular.forEach($scope.typeCategories, function(category) {
        var filteredTypes = $filter('isTypeCategory')($scope.placesTypes, category);
        angular.forEach(filteredTypes, function(type) {
          type.hidden = category.hidden;
        });
      });
    }
  }])

  .controller('AppView', ['$scope', '$routeParams', '$filter', 'places',
      function($scope, $routeParams, $filter, places) {
    $scope.part = '0';
    $scope.limit = 20;
    $scope.category = $routeParams.part;
    var user = $routeParams.user || '';
    $scope.typeCategories = places.getCategories($scope.part);
    
    $scope.onBottomReached = function() {
      $scope.limit += 20;
    };

    places.get($scope.part, user, updatePlaces).
      error(function(){
        $scope.error = "V aplikaci bohužel nastala chyba.";
      });

    $scope.selectQuestion = function(q) {
      $scope.selected = q != $scope.selected ? q : undefined;
    };
    
    function updatePlaces(data) {
      $scope.placesTypes = [];
      for (var i = 0; i < data.placesTypes.length; i++) {
        if ( data.placesTypes[i].slug == $scope.category) {
          $scope.placesTypes.push(data.placesTypes[i]);
        }
      }
      $scope.expectedPoints = data.expectedPoints;
      angular.forEach($scope.typeCategories, function(category) {
        var filteredTypes = $filter('isTypeCategory')($scope.placesTypes, category);
        angular.forEach(filteredTypes, function(type) {
          type.hidden = category.hidden;
        });
      });
    }
  }])

  .controller('AppPractice', ['$scope', '$routeParams', '$timeout', '$filter',
      'question', 'user', 'events',
      function($scope, $routeParams, $timeout, $filter,
      question, user, events) {
    $scope.part = $routeParams.part;
    $scope.placeType = $routeParams.place_type;

    $scope.checkAnswer = function(selected) {
      highlightOptions(selected);
      if (selected) {
        $scope.question.answered = selected.index;
      }
      $scope.progress = question.answer($scope.question);
      if (selected &&  selected.isCorrect) {
        user.addPoint();
        $timeout(function() {
          $scope.next();
        }, 700);
      } else {
        $scope.canNext = true;
      }
    };

    $scope.next = function() {
      if ($scope.progress < 100) {
        question.next($scope.part, $routeParams.place_type, setQuestion);
      } else {
        setupSummary();
      }
    };

    function setupSummary() {
      $scope.layer = undefined;
      // prevents additional points gain. issue #38
      $scope.summary = question.summary();
      $scope.showSummary = true;
      events.emit('questionSetFinished', user.getUser().points);
    }

    function setQuestion(active) {
      $scope.question = active;
      $scope.canNext = false;
    }

    function highlightOptions(selected) {
      $scope.question.options.map(function(o) {
        if (!$scope.question.isTest) {
          o.correct = o.isCorrect;
          o.disabled = true;
        }
        o.selected = o == selected;
        return o;
      });
    }

    question.first($scope.part, $routeParams.place_type, function(q) {
      setQuestion(q);
    }).error(function(){
      $scope.error = "V aplikaci bohužel nastala chyba.";
    });
  }])

  .controller('AppTest', ['$scope', '$timeout', 'question',
      function($scope, $timeout, question) {

    $scope.checkAnswer = function(selected) {
      highlightOptions(selected);
      if (selected) {
        $scope.question.answered = selected.index;
      }
      $timeout(function() {
        $scope.next();
      }, 700);
    };

    $scope.prev = function() {
      $scope.activeQuestionIndex--;
      setQuestion();
    };

    $scope.next = function() {
      $scope.activeQuestionIndex++;
      setQuestion();
    };

    $scope.activateQuestion = function(index) {
      $scope.activeQuestionIndex = index;
      setQuestion();
    };

    $scope.evaluate = function() {
      $scope.activeQuestionIndex = undefined;
      $scope.showSummary = true;
      $scope.questions.map(function(q) {
        q.isCorrect = q.options[q.answered] && q.options[q.answered].isCorrect;
        q.isWrong = !q.isCorrect;
      });
      $scope.summary = {
        questions : $scope.questions,
        correctlyAnsweredRatio : 0.5,
      };
    };

    function setQuestion() {
      $scope.question = $scope.questions[$scope.activeQuestionIndex];
      $scope.questions.map(function(q) {
        q.slideOut = false;
      });
      $scope.question.slideOut = true;
    }

    function highlightOptions(selected) {
      $scope.question.options.map(function(o) {
        o.selected = o == selected;
        return o;
      });
    }

    question.test(function(data) {
      $scope.questions = data;
      $scope.activateQuestion(0);
    }).error(function(){
      $scope.error = "V aplikaci bohužel nastala chyba.";
    });
  }])

  .controller('ReloadController', ['$window', function($window){
    $window.location.reload();
  }]);
}());
