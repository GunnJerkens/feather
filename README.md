## Feather - A micro-CMS

Feather is an example of a Couchapp, and can be used to create JSON endpoints for all sorts of data.

### Install

You'll need to have [CouchDB](http://docs.couchdb.org/en/latest/install/index.html) installed. Run `npm install` for dependencies.  
NOTE: I'm currently using a patched version of `grunt-couchapp` because the version on npm doesn't allow basic auth. I'll remove and re-add to `package.json` if the pull request is accepted.

### Config

Fill in your db info in the Gruntfile under `couch_config`. Run `grunt mkcouchdb` to create the database and `grunt rmcouchdb` to remove it. If you want to use a different database name, you'll also need to edit `app.js`.

### Editing

You can edit the CMS functionality in `_attachments`. Feather uses backbone.js. You can also set up custom views to use as API endpoints in `app.js`.

###License
feather is a FREE framework and is licensed under the following:
http://www.opensource.org/licenses/mit-license.php

Theme files, their HTML, CSS, JavaScript/jQuery and images are licensed under the following unless otherwise stated:
http://www.opensource.org/licenses/mit-license.php