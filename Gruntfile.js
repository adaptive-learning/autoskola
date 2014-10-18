module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    sass: {
      options: {
        sourcemap: true,
        style: "compressed"
      },
      dist: {
          files: [{
            expand: true,
            cwd: 'proso_client/static/sass',
            src: ['*.sass'],
            dest: 'proso_client/static/css',
            ext: '.css'
          }]
      }
    },
    concat: {
      app: {
        src: [
          'proso_client/static/js/app.js',
          'proso_client/static/js/controllers.js',
          'proso_client/static/js/services.js',
          'proso_client/static/js/filters.js',
          'proso_client/static/js/directives.js',
          'proso_client/static/dist/js/templates.js',
        ],
        dest: 'proso_client/static/dist/js/<%= pkg.name %>.min.js'
      },
    },
    shell: { 
        runserver: {
            command: './manage.py runserver'
        }
    },
    ngtemplates:    {
      addaptivePractice:          {
        cwd: 'proso_client',
        src: [
          'static/tpl/*.html',
        ],
        dest: 'proso_client/static/dist/js/templates.js',
        options:    {
          htmlmin:  { collapseWhitespace: true, collapseBooleanAttributes: true }
        }
      }
    },
    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n',
        sourceMap: true
      },
      app: {
        src: [
          'proso_client/static/js/app.js',
          'proso_client/static/js/controllers.js',
          'proso_client/static/js/services.js',
          'proso_client/static/js/filters.js',
          'proso_client/static/js/directives.js',
          'proso_client/static/dist/js/templates.js',
        ],
        dest: 'proso_client/static/dist/js/<%= pkg.name %>.min.js'
      },
      fallbacks: {
        src: [
          'proso_client/static/lib/js/fallbacks.js',
        ],
        dest: 'proso_client/static/dist/js/fallbacks.min.js'
      },
      libs: {
        src: [
        /*
          'proso_client/static/lib/angular-1.2.9/i18n/angular-locale_cs.js',
          'proso_client/static/lib/js/jquery-1.11.0.js',
          'proso_client/static/lib/angular-1.2.9/angular.js',
          'proso_client/static/lib/js/chroma.js',
          'proso_client/static/lib/js/bootstrap.js',
          'proso_client/static/lib/angular-1.2.9/angular-route.js',
          'proso_client/static/lib/angular-1.2.9/angular-cookies.js',
          'proso_client/static/lib/angular-1.2.9/angular-animate.js',
          'proso_client/static/lib/js/angulartics.min.js',
          'proso_client/static/lib/js/angulartics-ga.min.js',
          'proso_client/static/lib/js/angular-timer.js',
          'proso_client/static/lib/js/ng-polymer-elements.js',
          'proso_client/static/lib/angular-material/angular-material.js',
          */
          'proso_client/static/bower_components/jquery/dist/jquery.js',
          'proso_client/static/bower_components/angular/angular.js',
          'proso_client/static/bower_components/chroma-js/chroma.js',
          'proso_client/static/bower_components/bootstrap/dist/js/bootstrap.js',
          'proso_client/static/bower_components/angular-route/angular-route.js',
          'proso_client/static/bower_components/angular-cookies/angular-cookies.js',
          'proso_client/static/bower_components/angular-animate/angular-animate.js',
          'proso_client/static/bower_components/angular-sanitize/angular-sanitize.js',
          'proso_client/static/bower_components/angulartics/dist/angulartics.min.js',
          'proso_client/static/bower_components/angulartics/dist/angulartics-ga.min.js',
          'proso_client/static/bower_components/angular-timer/dist/angular-timer.js',
          'proso_client/static/bower_components/platform/platform.js',
          'proso_client/static/bower_components/ng-polymer-elements/ng-polymer-elements.js',
          'proso_client/static/bower_components/angular-material/angular-material.js',
        ],
        dest: 'proso_client/static/dist/js/libs.min.js'
      }
    },
    jshint: {
      options: {
          "undef": true,
          "unused": true,
          "browser": true,
          "globals": { 
              "angular": false
          },
          "maxcomplexity": 5,
          "indent": 2,
          "maxstatements": 12,
          "maxdepth" : 2,
          "maxparams": 11,
          "maxlen": 110
      },
      build: {
        src: 'proso_client/static/js/',
      }
    },
    watch: {
      options: {
        interrupt: true,
      },
      styles: {
        files: ['proso_client/static/sass/*.sass'],
        tasks: ['styles'],
      },
      jstpl: {
        files: ['proso_client/static//jstpl/*.js'],
        tasks: ['string-replace'],
      },
      templates: {
        files: ['proso_client/static/tpl/*.html'],
        tasks: ['templates', 'concat:app'],
      },
      jsapp: {
        files: ['proso_client/static/js/*.js'],
        tasks: ['concat:app'],
      },
      jslibs: {
        files: ['proso_client/static/lib/js/*.js', 'proso_client/static/lib/angular-1.2.9/*.js'],
        tasks: ['uglify:libs'],
      },
    },
    rename: {
        moveAboveFoldCss: {
            src: 'proso_client/static/css/above-fold.css',
            dest: 'proso_client/templates/generated/above-fold.css'
        },
        moveBlueAboveFoldCss: {
            src: 'proso_client/static/css/blue-above-fold.css',
            dest: 'proso_client/templates/generated/blue-above-fold.css'
        },
    },
    protractor: {
      options: {
        configFile: "proso_client/static/test/spec.js", // Default config file
        keepAlive: true, // If false, the grunt process stops when the test fails.
        noColor: false, // If true, protractor will not use colors in its output.
        args: {
          // Arguments passed to the command
        }
      },
      tests: {
        options: {
          args: {} // Target-specific arguments
        }
      },
    },
  });

  // Load plugins.
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-sass');
  grunt.loadNpmTasks('grunt-notify');
  grunt.loadNpmTasks('grunt-rename');
  grunt.loadNpmTasks('grunt-newer');
  grunt.loadNpmTasks('grunt-angular-templates');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-string-replace');
  grunt.loadNpmTasks('grunt-shell');
  grunt.loadNpmTasks('grunt-protractor-runner');

  // Default task(s).
  grunt.registerTask('styles', ['sass','rename']);
  grunt.registerTask('runserver', ['shell:runserver','watch']);
  grunt.registerTask('templates', ['newer:concat', 'ngtemplates']);
  grunt.registerTask('minifyjs', ['templates', 'uglify']);
  grunt.registerTask('default', ['styles', 'jshint', 'minifyjs']);
  grunt.registerTask('deploy', ['styles', 'minifyjs']);
};
