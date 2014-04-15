## Feather - A micro-CMS

Feather is an example of a Couchapp, and can be used to create JSON endpoints
for all sorts of data.

### Install

You'll need to have
[CouchDB](http://docs.couchdb.org/en/latest/install/index.html) installed. Run
`npm install` for dependencies.

Add a `couch_config.json` file, like the following (replace `<username>`,
`<password>`, and `example.com` with your info:
```
{
  "local": {
    "db": "http://<username>:<password>@localhost:5984/feather",
    "app": "./app.js",
    "options": {
      "okay_if_missing": true
    }
  },
  "public": {
    "db": "http://<username>:<password>@example.com/feather",
    "app": "./app.js"
  }
}
```

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
