(function() {
  'use strict';
  /* Directives */
  angular.module('blindMaps.directives', [])

  .directive('placeLabel', ['$filter', 'colorScale', function($filter, colorScale) {
    return {
      restrict : 'A',
      template : ' ',
      link : function($scope, elem) {
        function getOptionClasses (index){
          return ($scope.question.correct === index ? 'alert-success' : 'alert-danger') +
                 (imgOptions ? ' inline-block' : '');
        }
        function getOptionElem (index){
          return '<div class="alert ' + getOptionClasses(index) + '">' +
                     stripImg(options[index]) +
                    '<img src="' + (imgSrc(options[index])||'') + '"/>' +
                  '</div>';
        }
        var stripImg = $filter("stripImg");
        var imgSrc = $filter("imgSrc");
        var options = $scope.question.options.map(function(o){
          return o && o.name || o;
        });
        var imgOptions = imgSrc(options[0]);

        elem.addClass('label');
        elem.addClass('label-default');
        elem.popover({
          trigger : 'focus',
          html : true,
          placement: 'auto',
          title : '<img src="' + (imgSrc($scope.question.text)||'') + '"/>' +
                   stripImg($scope.question.text),
          content : '<div class="skill-tooltip">' +
                  getOptionElem(0) +
                  getOptionElem(1) +
                  getOptionElem(2) +
                 ($scope.question.probability ?
                    ' Odhad znalosti ' + 
                    '<span class="badge badge-default">' +
                      '<i class="color-indicator" style="background-color :' +
                      colorScale($scope.question.probability).hex() + '"></i>' +
                      10 * $scope.question.probability + ' / 10 ' +
                    '</span>' :
                    ''
                  ) +
               '</div>'
        });
      }
    };
  }])

  .directive('blindMap', ['mapControler', 'places', 'singleWindowResizeFn', 'getMapResizeFunction', '$parse',
      function(mapControler, places, singleWindowResizeFn, getMapResizeFunction, $parse) {
    return {
      restrict : 'E',
      template : '<div class="map-container">' +
                  '<div id="map-holder">' +
                      '<div class="loading-indicator" ng-show="loading"></div>' +
                  '</div>' +
                  '<h1 ng-bind="name" ng-show="!practice"></h1>' +
                  '<div class="btn-group-vertical map-switch" data-toggle="buttons" ng-show="!practice" >' +
                    '<a class="btn btn-default atooltip" href="#/view/{{part}}/"' +
                        'ng-class="\'/view/\'+part+\'/\'|isActive"' +
                        'placement="right"' +
                        'title="Moje znalosti">' +
                      '<i class="glyphicon glyphicon-user"></i>' +
                    '</a>' +
                    '<a class="btn btn-default atooltip" href="#/view/{{part}}/average"' +
                        'ng-class="\'/view/\'+part+\'/average\'|isActive"' +
                        'placement="right"' +
                        'title="Průměrný nový uživatel">' +
                      '<i class="glyphicon glyphicon-globe"></i> ' +
                    '</a>' +
                  '</div>' +
                  '<div class="zoom-buttons"></div>'+
                '</div>',
      link : function($scope, elem, attrs) {
        $scope.loading = true;
        $scope.name = places.getName($scope.part);
        $scope.practice = !attrs.showTooltips;
        var showTooltips = attrs.showTooltips !== undefined;

        var map = mapControler($scope.part, showTooltips, elem, function(m) {
          $scope.loading = false;
          var resize = getMapResizeFunction(m, elem, $scope.practice);
          singleWindowResizeFn(resize);
          resize();
          $scope.$eval(attrs.callback);
          $scope.$digest();
        });
        var model = $parse(attrs.map);
        //Set scope variable for the map
        model.assign($scope, map);
      },
      replace : true
    };
  }])

  .directive('zoomButtons', function() {
    return {
      restrict : 'C',
      template : '<div class="btn-group zoom-btn" ng-show="!loading">' +
                    '<a class="btn btn-default" id="zoom-out">' +
                      '<i class="glyphicon glyphicon-minus"></i></a>' +
                    '<a class="btn btn-default" id="zoom-in">' +
                      '<i class="glyphicon glyphicon-plus"></i></a>' +
                  '</div>'
    };
  })

  .directive('email', function() {
    return {
      restrict : 'C',
      compile : function(elem) {
        var emailAddress = elem.html();
        emailAddress = emailAddress.replace('{zavinac}', '@');
        emailAddress = '<a href="mailto:' + emailAddress + 
  '">' + emailAddress + 
  '</a>';
        elem.html(emailAddress);
      }
    };
  })

  .directive('atooltip', function() {
    return {
      restrict : 'C',
      link : function($scope, elem, attrs) {
        elem.tooltip({ 'placement' : attrs.placement || 'bottom' });
      }
    };
  })

  .directive('dropLogin', function() {
    return {
      restrict : 'C',
      compile : function(elem) {
        elem.bind('click', function() {
          elem.tooltip('destroy');
          elem.parent().find('.tooltip').remove();
        });
      }
    };
  })

  .directive('points', ['$timeout', 'events', function($timeout, events) {
    return {
      scope : true,
      restrict : 'C',
      link : function($scope, elem) {
        events.on('userUpdated', function(user) {
          $scope.user = user;
          if (user.points == 1) {
            $timeout(function() {
              elem.tooltip('show');
            }, 0);
          }
        });
      }
    };
  }])

  .directive('dropLogin',['$timeout', 'events', function($timeout, events) {
    return {
      restrict : 'C',
      link : function($scope, elem) {
        events.on('questionSetFinished', function(points) {
          if (10 < points && points <= 20) {
            $timeout(function() {
              elem.tooltip('show');
            }, 0);
          }
        });
      }
    };
  }])

  .directive('mapProgress', [function() {
    return {
      restrict : 'C',
      template : '<div class="progress overview-progress">' +
                    '<div class="progress-bar progress-bar-learned" style="' +
                        'width: {{(skills.learned / count)|percent}};">' +
                    '</div>' +
                    '<div class="progress-bar progress-bar-practiced" style="' +
                        'width: {{(skills.practiced / count)|percent}};">' +
                    '</div>' +
                  '</div>',
      link : function($scope, elem, attrs) {
        $scope.count = attrs.count;
        attrs.$observe('skills', function(skills) {
          if(skills !== '') {
            $scope.skills = angular.fromJson(skills);
            elem.tooltip({
              html : true,
              placement: 'bottom',
              title : '<div class="skill-tooltip">' +
                     'Naučeno: ' +
                     '<span class="badge badge-default">' +
                       '<i class="color-indicator learned"></i>' +
                       $scope.skills.learned + ' / ' + $scope.count +
                     '</span>' +
                   '</div>' +
                   '<div class="skill-tooltip">' +
                     'Procvičováno: ' +
                     '<span class="badge badge-default">' +
                       '<i class="color-indicator practiced"></i>' +
                       $scope.skills.practiced + ' / ' + $scope.count +
                     '</span>' +
                   '</div>'
            });
          }
        });
      }
    };
  }])

  .directive('levelProgressBar',['user', '$timeout', function(user, $timeout) {
    
    function getLevelInfo(points) {
      var levelEnd = 0;
      var levelRange = 30;
      var rangeIncrease = 0;
      for (var i = 1; true; i++) {
        levelEnd += levelRange;
        if (points < levelEnd) {
          return {
            level : i,
            form : levelEnd - levelRange,
            to : levelEnd,
            range : levelRange,
            points : points - (levelEnd - levelRange),
          };
        }
        levelRange += rangeIncrease;
        rangeIncrease += 10;
      }
      
    }
    return {
      restrict : 'C',
      template : '<span class="badge level-start atooltip" ' +
                   'ng-bind="level.level" title="Aktuální úroveň">' +
                 '</span>' +
                 '<div class="progress level-progress" >' +
                   '<div class="progress-bar progress-bar-warning" ' +
                        'style="width: {{(level.points/level.range)|percent}};">' +
                   '</div>' +
                 '</div>' +
                 '<span class="badge level-goal atooltip" ' +
                       'ng-bind="level.level+1" title="Příští úroveň">' +
                 '</span>',
      link : function($scope, elem) {
        $scope.level = getLevelInfo(user.getUser().points);
        $timeout(function(){
          //console.log(elem, elem.find('.level-progress'));
          elem.find('.level-progress').tooltip({
            placement: 'bottom',
            title : $scope.level.points + ' z ' + $scope.level.range + ' bodů',
          });
        },100);
      }
    };
  }]);
}());
