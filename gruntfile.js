'use strict';
module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    files: {
      js: ['gruntfile.js', 'js/**/*.js', 'server/**/*.js'],
    },
    sass: {
      dist: {
        options: {
          sourcemap: 'none'
        },
        files: {
          'css/styles.css': 'sass/styles.scss'
        }
      }
    },
    jshint: {
      files: '<%= files.js %>',
      options: {
        jshintrc: true,
      },
    },
    jsbeautifier: {
      files: '<%= files.js %>',
      options: {
        js: {
          indentChar: ' ',
          indentSize: 2,
        },
        css: {
          fileTypes: ['.scss'],
          indentChar: ' ',
          indentSize: 2,
        }
      }
    },
    watch: {
      css: {
        files: ['sass/**/*.scss'],
        tasks: ['sass'],
      },
      js: {
        files: '<%= files.js %>',
        tasks: ['jshint', 'jsbeautifier'],
      }
    }
  });
  grunt.loadNpmTasks('grunt-contrib-sass');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-jsbeautifier');
  //Specify an output folder for minified files
  //grunt.loadNpmTasks('grunt-contrib-uglify');

  grunt.registerTask('default', ['jshint', 'jsbeautifier', 'sass']);
};
