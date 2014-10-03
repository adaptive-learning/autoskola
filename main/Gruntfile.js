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
            cwd: 'geography/static/sass',
            src: ['*.sass'],
            dest: 'geography/static/css',
            ext: '.css'
          }]
      }
    },
    concat: {
      homepage: {
        src: ['geography/static/tpl/homepage.html'],
        dest: 'templates/generated/homepage.html',
      },
      app: {
        src: [
          'geography/static/js/app.js',
          'geography/static/js/controllers.js',
          'geography/static/js/services.js',
          'geography/static/js/filters.js',
          'geography/static/js/directives.js',
          'geography/static/dist/js/templates.js',
        ],
        dest: 'geography/static/dist/js/<%= pkg.name %>.min.js'
      },
    },
    shell: { 
        runserver: {
            command: './manage.py runserver'
        }
    },
    ngtemplates:    {
      addaptivePractice:          {
        cwd: 'geography',
        src: [
          'static/tpl/*.html',
        ],
        dest: 'geography/static/dist/js/templates.js',
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
          'geography/static/js/app.js',
          'geography/static/js/controllers.js',
          'geography/static/js/services.js',
          'geography/static/js/filters.js',
          'geography/static/js/directives.js',
          'geography/static/dist/js/templates.js',
        ],
        dest: 'geography/static/dist/js/<%= pkg.name %>.min.js'
      },
      fallbacks: {
        src: [
          'geography/static/lib/js/fallbacks.js',
        ],
        dest: 'geography/static/dist/js/fallbacks.min.js'
      },
      libs: {
        src: [
        /*
          'geography/static/lib/angular-1.2.9/i18n/angular-locale_cs.js',
          */
          'geography/static/lib/js/jquery-1.11.0.js',
          'geography/static/lib/angular-1.2.9/angular.js',
          'geography/static/lib/js/chroma.js',
          'geography/static/lib/js/bootstrap.js',
          'geography/static/lib/angular-1.2.9/angular-route.js',
          'geography/static/lib/angular-1.2.9/angular-cookies.js',
          'geography/static/lib/angular-1.2.9/angular-animate.js',
          'geography/static/lib/js/angulartics.min.js',
          'geography/static/lib/js/angulartics-ga.min.js',
          'geography/static/lib/js/angular-timer.js',
          'geography/static/lib/js/ng-polymer-elements.js',
          'geography/static/lib/angular-material/angular-material.js',
        ],
        dest: 'geography/static/dist/js/libs.min.js'
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
        src: 'geography/static/js/',
      }
    },
    watch: {
      options: {
        interrupt: true,
      },
      styles: {
        files: ['geography/static/sass/*.sass'],
        tasks: ['styles'],
      },
      jstpl: {
        files: ['geography/static//jstpl/*.js'],
        tasks: ['string-replace'],
      },
      templates: {
        files: ['geography/static/tpl/*.html'],
        tasks: ['templates', 'concat:app'],
      },
      jsapp: {
        files: ['geography/static/js/*.js'],
        tasks: ['concat:app'],
      },
      jslibs: {
        files: ['geography/static/lib/js/*.js', 'geography/static/lib/angular-1.2.9/*.js'],
        tasks: ['uglify:libs'],
      },
    },
    rename: {
        moveAboveFoldCss: {
            src: 'geography/static/css/above-fold.css',
            dest: 'templates/generated/above-fold.css'
        },
    },
    protractor: {
      options: {
        configFile: "geography/static/test/spec.js", // Default config file
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
