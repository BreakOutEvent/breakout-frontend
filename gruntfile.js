'use strict';
module.exports = function (grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    files: {
      js: ['src/js/*.js']
    },
    less: {
      development: {
        options: {
          compress: true,
          yuicompress: true,
          optimization: 2
        },
        files: {
          'public/css/styles.css': 'src/less/styles.less'
        }
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
        options: {
          transform: [
            ['babelify', {presets: ['es2015', 'react']}],
          ]
        },
        files: {
          'public/js/bundle.js': ['src/js/main.js'],
          'public/js/registration.js': ['src/js/registration.js'],
          'public/js/profile.js': ['src/js/profile.js'],
          'public/js/admin.js': ['src/js/admin.js'],
          'public/js/sponsoring.js': ['src/js/sponsoring.js'],
          'public/js/map.js': ['src/js/map.js'],
          'public/js/messages.js': ['src/js/messages.js'],
          'public/js/team.js': ['src/js/team.js'],
          'public/js/liveblog.js': ['src/js/liveblog.js'],
          'public/js/landingpage.js': ['src/js/landingpage.js'],
        }
      }
    },
    autoprefixer: {
      dist: {
        files: {
          'public/css/styles.css': 'public/css/styles.css'
        }
      }
    },
    watch: {
      css: {
        files: ['src/less/**/*.less'],
        tasks: ['less', 'autoprefixer']
      },
      js: {
        files: 'src/js/**/*.js*',
        tasks: [
          'browserify',
        ]
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-autoprefixer');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-browserify');
  grunt.loadNpmTasks('grunt-babel');

  grunt.registerTask('default',
    [
      'browserify',
      'less',
      'uglify',
      'autoprefixer',
      'cssmin'
    ]);
};
