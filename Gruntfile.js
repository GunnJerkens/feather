module.exports = function(grunt) {

  // load all grunt tasks
  require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

  couch_config = {
    demo: {
        db: 'http://admin:xx83983E@localhost:5984/feather',
        app: './app.js',
        options: {
            okay_if_missing: true
        }
    }
  }

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    compass: {
      dist: {
        options: {
          config: '_attachments/style/config.rb',
          sassDir: '_attachments/style/sass',
          imagesDir: '_attachments/img',
          cssDir: '_attachments/style',
          environment: 'production',
          outputStyle: 'compressed',
          force: true
        }
      }
    },

    imagemin: {
      dynamic: {
        files: [{
          expand: true,
          cwd: '_attachments/img/src',
          src: ['*.{png,jpg,gif}'],
          dest: '_attachments/img/'
        }]
      }
    },

    browser_sync: {
      files: {
        src: '_attachments/style/screen.css'
      },
      options: {
          host: "localhost",
          watchTask: true
      }
    },

    convert: {
      options: {
        explicitArray: true,
      },
      dist: {
        files: [
          {
            expand: true,
            cwd: 'data/csv/',
            src: ['*.csv'],
            dest: 'data/',
            ext: '.json'
          }
        ]
      }
    },

    mkcouchdb: couch_config,
    couchapp: couch_config,

    watch: {
      styles: {
        files: ['_attachments/style/**/*.{sass,scss}','_attachments/img/ui/*.png'],
        tasks: ['compass']
      },
      images: {
        files: ['_attachments/img/src/*.{png,jpg,gif}'],
        tasks: ['imagemin']
      },
      couch: {
        files: ['_attachments/js/*.js', '_attachments/index.html', '_attachments/style/screen.scss'],
        tasks: ['couchapp:local']
      }
    }
  });

  grunt.registerTask('default', ['compass', 'imagemin', 'couchapp:local', 'watch']);
  grunt.registerTask('build', ['compass', 'imagemin']);
  grunt.registerTask('csv', ['convert']);

};