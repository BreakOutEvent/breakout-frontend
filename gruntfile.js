'use strict';
module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    files: {
      js: ['public/js/**/*.js', '*.js']
    },
    sass: {
      dist: {
        options: {
          sourceMap: false
        },
        files: {
          'public/css/styles.css': 'sass/styles.scss'
        }
      }
    },
    jshint: {
      files: '<%= files.js %>',
      options: {
        jshintrc: true
      }
    },
    jsbeautifier: {
      files: ['public/js/**/*.js', '*.js', 'sass/**/*.scss'],
      options: {
        js: {
          indentChar: ' ',
          indentSize: 2
        },
        css: {
          fileTypes: ['.scss'],
          indentChar: ' ',
          indentSize: 2,
          wrapLineLength: 100
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
    watch: {
      css: {
        files: ['sass/**/*.scss'],
        tasks: ['sass']
      },
      js: {
        files: '<%= files.js %>',
        tasks: ['jsbeautifier', 'jshint']
      }
    }
  });
  grunt.loadNpmTasks('grunt-sass');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-jsbeautifier');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-cssmin');

  grunt.registerTask('default', ['jsbeautifier', 'jshint', 'sass', 'uglify', 'cssmin']);
};
