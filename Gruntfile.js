module.exports = function(grunt) {
  'use strict';

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    templates: {
      main: {
        header: '\n<!-- {{tplbasename}} -->\n<script id="{{tplbasename}}" type="text/template">\n',
        footer: '\n</script>\n',
        src: ['src/templates/*.tpl'],
        dest: 'dist/templates/system.tpl'
      }
    },
    concat: {
      options: {
        banner: '/*!\n <%= pkg.name %> Build version <%= pkg.version %>, <%= grunt.template.today("mm-dd-yyyy") %>\n*/\n',
        separator: ';'
      },
      scheduler: {
        src: [
            'src/js/libs/jquery-1.9.0.js',
            'src/js/libs/json2.js',
            'src/js/libs/underscore.js',
            'src/js/libs/backbone.js',
            'src/js/libs/marionette-1.0.4.js',
            'src/js/libs/jquery.SPServices-0.7.2.js',
			
            'src/js/templates.js',
			
            'src/js/app.js',
			
            'src/js/modules/data/data.js',
			        
    		'src/js/modules/reservation/reservation.js',
            'src/js/modules/reservation/reservation-controller.js',
            'src/js/modules/reservation/reservation-models.js',
            'src/js/modules/reservation/reservation-views.js',

            'src/js/modules/schedule/schedule.js',
            'src/js/modules/schedule/schedule-controller.js',
            'src/js/modules/schedule/schedule-models.js',
            'src/js/modules/schedule/schedule-views.js',
			
            'src/js/app.start.js'
            ],
        dest: 'dist/js/<%= pkg.name %>.js'
      },
      css: {
        src: 'src/css/style.css',
        dest: 'dist/css/screen.css'
      }
    },
    uglify: {
      options: {
        banner: '/*!\n <%= pkg.name %> Build version <%= pkg.version %>, <%= grunt.template.today("mm-dd-yyyy") %>\n*/\n',
        report: 'gzip'
      },
      dist: {
        files: {
          'dist/js/<%= pkg.name %>.min.js': ['<%= concat.scheduler.dest %>']
        }
      }
    },
    cssmin: {
      css:{
        src: '<%= concat.css.dest %>',
        dest: 'dist/css/screen.min.css'
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  
  
  // Template multitask
  grunt.registerMultiTask('templates', 'Wraps templates with header and footer, then concats into single file', function () {
        var data = this.data,
            path = require('path'),
            dest = grunt.template.process(data.dest),
            files = grunt.file.expand(data.src),
            header = data.header,
            footer = data.footer,
            contents = '';

        files.forEach(function(f) {
            contents += header.replace(/\{\{tplbasename\}\}/g, path.basename(f).replace('.tpl','')) + grunt.file.read(f) + footer;
        });
        
        grunt.file.write(dest, contents);
        grunt.log.writeln('Template created');
  });
  
  // Default task(s).
  grunt.registerTask('default', ['templates','concat','uglify','cssmin']);

};