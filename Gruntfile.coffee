module.exports = (grunt) ->

  # load all grunt tasks
  require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks)

  couch_config = grunt.file.readJSON 'couch_config.json'

  grunt.initConfig
    pkg: grunt.file.readJSON 'package.json'

    compass:
      dist:
        options:
          config: '_attachments/style/config.rb'
          sassDir: '_attachments/style/sass'
          imagesDir: '_attachments/img'
          cssDir: '_attachments/style'
          environment: 'production'
          outputStyle: 'compressed'
          force: true

    imagemin:
      dynamic:
        files: [
          expand: true
          cwd: '_attachments/img/src'
          src: ['*.{png,jpg,gif}']
          dest: '_attachments/img/'
        ]

    browser_sync:
      files:
        src: '_attachments/style/screen.css'
      options:
        host: "localhost"
        watchTask: true

    convert:
      options:
        explicitArray: true
      dist:
        files: [
          expand: true
          cwd: 'data/csv/'
          src: ['*.csv']
          dest: 'data/'
          ext: '.json'
        ]

    mkcouchdb: couch_config
    couchapp: couch_config

    watch:
      styles:
        files: ['_attachments/style/**/*.{sass,scss}','_attachments/img/ui/*.png']
        tasks: ['compass', 'couchapp:local']
      images:
        files: ['_attachments/img/src/*.{png,jpg,gif}']
        tasks: ['imagemin', 'couchapp:local']
      couch:
        files: ['_attachments/js/*.js', '_attachments/index.html', '_attachments/style/screen.scss']
        tasks: ['couchapp:local']

  grunt.registerTask('default', ['compass', 'imagemin', 'couchapp:local', 'watch'])
  grunt.registerTask('build', ['compass', 'imagemin', 'couchapp'])
  grunt.registerTask('csv', ['convert'])
