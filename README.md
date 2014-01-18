## Feather - A micro-CMS

Feather is an example of a Couchapp, and can be used to create JSON endpoints for all sorts of data.

### Install

You'll need to have [CouchDB](http://docs.couchdb.org/en/latest/install/index.html) and [Couchapp](http://couchapp.org/page/installing) installed.

### Config

In `.couchapprc`, fill in your local and remote database information. When you're ready to populate, use `couchapp push` to push to local and `couchapp push public` to push to you remote database.

### Editing

You can edit the CMS functionality in `_attachments`. Feather uses backbone.js, so set up models in app.js. You can also set up custom views to use as API endpoints in `views`.

###License
feather is a FREE library and is licensed under the following:
http://www.opensource.org/licenses/mit-license.php

Theme files, their HTML, CSS, JavaScript/jQuery and images are licensed under the following unless otherwise stated:
http://www.opensource.org/licenses/mit-license.php