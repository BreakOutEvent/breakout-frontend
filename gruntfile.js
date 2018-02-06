'use strict';
module.exports = function (grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
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
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-autoprefixer');
  grunt.loadNpmTasks('grunt-contrib-cssmin');

  grunt.registerTask('default',
    [
      'less',
      'autoprefixer',
      'cssmin'
    ]);
};
