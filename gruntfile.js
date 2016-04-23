'use strict';
module.exports = function (grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    files: {
      js: ['src/js/*.js']
    },
    sass: {
      dist: {
        options: {
          sourceMap: false
        },
        files: {
          'public/css/styles.css': 'src/sass/styles.scss'
        }
      }
    },
    jshint: {
      files: '<%= files.js %>',
      options: {
        jshintrc: true
      }
    },
    uglify: {
      build: {
        files: [{
          expand: true,
          cwd: 'public/js',
          src: ['*.js', '!*.min.js'],
          dest: 'public/js',
          ext: '.min.js'
        }]
      }
    },
    cssmin: {
      target: {
        files: [{
          expand: true,
          cwd: 'public/css',
          src: ['*.css', '!*.min.css'],
          dest: 'public/css',
          ext: '.min.css'
        }]
      }
    },
    browserify: {
      options: {
        browserifyOptions: {
          debug: true
        }
      },
      dist: {
        files: {
          'public/js/bundle.js': ['src/js/main.js'],
          'public/js/registration.js': ['src/js/registration.js']
        }
      }
    },
    babel: {
      options: {
        sourceMap: true,
        presets: ['es2015']
      },
      dist: {
        files: {
          'public/js/bundle.js': ['public/js/bundle.js'],
          'public/js/registration.js': ['public/js/registration.js']
        }
      }
    },
    watch: {
      css: {
        files: ['src/sass/**/*.scss'],
        tasks: ['sass']
      },
      js: {
        files: '<%= files.js %>',
        tasks: [
          'browserify',
          'babel'
        ]
      }
    }
  });
  grunt.loadNpmTasks('grunt-sass');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-browserify');
  grunt.loadNpmTasks('grunt-babel');

  grunt.registerTask('default',
    [
      'jshint',
      'browserify',
      'babel',
      'sass',
      'uglify',
      'cssmin'
    ]);
};
