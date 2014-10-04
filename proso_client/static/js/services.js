(function() {
  'use strict';
  /* global chroma  */

  /* Services */
  angular.module('addaptivePractice.services', [
    'ngCookies'
  ])

  .value('chroma', chroma)

  .value('colors', {
    'GOOD': '#0d0',
    'BAD': '#ff0000',
    'NEUTRAL': '#bbb',
    'BRIGHT_GRAY' : '#ddd',
    'WATER_COLOR' : '#73c5ef'
  })

  .factory('colorScale', ['colors', 'chroma', function(colors, chroma) {
    var scale = chroma.scale([
        colors.BAD,
        '#ff4500',
        '#ffa500',
        '#ffff00',
        colors.GOOD
      ]);
    return scale;
  }])


  .factory('places', ['$http', function($http) {
    var cache = {};
    var mapCache = {};
    var categoriesCache = {};
    var names = {};

    function addOneToNames(code, name) {
      if (!names[code]) {
        names[code] = name;
      }
    }

    function addToNames(code, placesTypes) {
      angular.forEach(placesTypes, function(type) {
        angular.forEach(type.places, function(place) {
          addOneToNames(place.code, place.name);
        });
      });
    }
    
    var that = {
      get : function(category) {
        var url = 'questions/questions/?stats=true';
        if (category) {
          url += '&filter_column=category_id&filter_value=' + category;
        }
        var promise = $http.get(url);
        return promise;
      },
      setName : function(code, name) {
        names[code] = names[code] || name;
      },
      getName : function(code) {
        return names[code];
      },
      _setActiveCategory : function (part, active) {
        that.getCategories(part, active);
        angular.forEach(categoriesCache[part], function(cat) {
          cat.hidden = cat.slug != active &&  
            0 === cat.types.filter(function(t){ 
              return t == active;
            }).length;
        });
      },
      practicing : function (part, type) {
        that._setActiveCategory(part, type);
        // To fetch names of all places on map and be able to show name of wrongly answered place
        var process = function(placesTypes){
          addToNames(part, placesTypes);
        };
        var url = 'usersplaces/' + part + '/';
        if (cache[url]) {
          process(cache[url]);
        } else {
          that.get(part, '', process);
        } 
      },
      getOverview : function () {
        return $http.get('/placesoverview/', {cache: true});
      },
      getMapLayers : function(map) {
        return mapCache[map].placesTypes.map(function(l){
          return l.slug;
        });
      },
      getMapLayerCount : function(map, layer) {
        if (!mapCache[map]) {
          return 0;
        }
        return mapCache[map].placesTypes.filter(function(l){
          return l.slug == layer;
        }).map(function(l){
          return l.count;
        })[0];
      }
    };
    return that;
  }])

  .service('question', ['$http', '$log', '$cookies', '$',
      function($http, $log, $cookies, $) {
    var qIndex = 0;
    var url;
    $http.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';
    
    function returnQuestion(fn) {
      var q = questions[qIndex++];
      if (q)
        q.response_time = -new Date().valueOf();
      fn(q);
    }
    function hasNoTwoSameInARow(array) {
      for (var i = 0, j = array.length; i + 1 < j; i++) {
        if (array[i].asked_code == array[i + 1].asked_code) {
          return false;
        }
      }
      return true;
    }
    var questions = [];
    var summary = [];
    return {
      test : function(fn) {
        url = 'questions/test';
        var promise = $http.get(url).success(function(data) {
          fn(data);
        });
        return promise;
      },
      first : function(part, placeType, fn) {
        url = 'questions/practice/' + part + '/' + (placeType ? placeType : '');
        summary = [];
        var promise = $http.get(url).success(function(data) {
          qIndex = 0;
          questions = data;
          returnQuestion(fn);
        });
        return promise;
      },
      next : function(part, placeType, fn) {
        returnQuestion(fn);
      },
      answer : function(question) {
        question.response_time += new Date().valueOf();
        question.index = qIndex - 1;
        var postParams = $.param({
          question : question.id,
          answered : question.answered,
          response_time : question.response_time,
        });
        summary.push(question);
        $http({
          method: 'POST',
          url : 'questions/answer',
          data: postParams,
          headers: {
            'Content-Type' : 'application/x-www-form-urlencoded',
            'X-CSRFToken' : $cookies.csrftoken,
          }
        }).success(function(data) {
          var futureLength = qIndex + data.length;
          // questions array should be always the same size
          // if data sent by server is longer, it means the server is delayed
          if (questions.length == futureLength) {
            // try to handle interleaving
            var questionsCandidate = questions.slice(0, qIndex).concat(data);
            if (hasNoTwoSameInARow(questionsCandidate)) {
              questions = questionsCandidate;
              $log.log('questions updated, question index', qIndex);
            }
          }
        });
        return 100 * qIndex / questions.length;
      },
      summary : function() {
        var correctlyAnswered = summary.filter(function(q) {
            return q.options[q.answered].isCorrect;
          });
        return {
          correctlyAnsweredRatio : correctlyAnswered.length / summary.length,
          questions : summary
        };
      }
    };
  }])

  .factory('user', ['$http', '$cookies', 'events', 
      function($http, $cookies, events) {
    var user;
    return {
      initUser : function(username, points) {
        user = {
          'username' : username,
          'points' : points
        };
        return user;
      },
      getUser : function() {
        return user;
      },
      logout : function(callback) {
        $http.get('user/logout/').success(callback);
        this.initUser('', 0);
        events.emit('userUpdated', user);
        return user;
      },
      addPoint : function() {
        user.points++;
        $cookies.points = user.points;
        events.emit('userUpdated', user);
      }
    };
  }])

  .factory('events', function() {
    var handlers = {};
    return {
      on : function(eventName, handler) {
        handlers[eventName] = handlers[eventName] || [];
        handlers[eventName].push(handler);
      },
      emit : function(eventName, args) {
        handlers[eventName] = handlers[eventName] || [];
        handlers[eventName].map(function(handler) {
          handler(args);
        });
      }
    };
  })

  .factory('pageTitle',[function() {
    
    var titles = {
      '' : '',
      '../templates/home/how_it_works.html' : 'Jak to funguje? - ',
      'static/tpl/about.html' : 'O prjektu - ',
      'static/tpl/overview_tpl.html' : 'Přehled map - ',
      'static/tpl/view_tpl.html' : 'Prohlížení otázek - ',
      'static/tpl/practice_tpl.html' : 'Procvičování otázek - ',
      'static/tpl/test_tpl.html' : 'Test - ',
    };
    return function (route) {
      var title = route.templateUrl ? titles[route.templateUrl] : '';
      return title;
    };
  }]);
}());
