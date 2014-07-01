## Feather - A micro-CMS

Feather is an example of a Couchapp, and can be used to create JSON endpoints
for all sorts of data.

### Install

You'll need to have
[CouchDB](http://docs.couchdb.org/en/latest/install/index.html) installed. Run
`npm install` for dependencies.

1. log in to your CouchDB web interface
  - http://<hostname>/_utils/index.html, link in the extreme bottom of the right sidebar
2. copy `couch_config.sample.json` to `couch_config.json` and update the values
3. copy `_attachments/js/config.sample.js` to `_attachments/js/config.js` and update the values
4. run `grunt couchapp:public` to populate the database you created
5. go to http://<hostname>/<db_name>/_design/<db_name>/index.html and begin inputting data

NOTE: I'm currently using a patched version of `grunt-couchapp` because the
version on npm doesn't allow basic auth. I'll remove and re-add to
`package.json` if the pull request is accepted.

### Config

Fill in your db info in the Gruntfile under `couch_config`. Run `grunt
mkcouchdb` to create the database and `grunt rmcouchdb` to remove it. If you
want to use a different database name, you'll also need to edit `app.js`.

### Editing

You can edit the CMS functionality in `_attachments`. Feather uses backbone.js.
You can also set up custom views to use as API endpoints in `app.js`.

###License

MIT
