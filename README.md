## Feather - A micro-CMS

Feather is an example of a Couchapp, and can be used to create JSON endpoints
for all sorts of data.

### Install

You'll need to have
[CouchDB](http://docs.couchdb.org/en/latest/install/index.html) installed. Run
`npm install` for dependencies.

1. copy `couch_config.sample.json` to `couch_config.json` and update the values
2. copy `_attachments/js/config.sample.js` to `_attachments/js/config.js` and update the values
3. run `grunt mkcouchdb:public` to create a new database from your configuration
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

### Quick load data

Example data where you have fields of lot, plan, elevation, reverse, x and y.

This is what you could run in the console if you have same 100+ sites to fill in based off your generated data from the site map plotter.

```
var sites = [
    {"lot":"imaginary-1","plan":1,"elevation":"A","reverse":true,"x":669,"y":367},
    {"lot":"imaginary-2","plan":3,"elevation":"C","reverse":false,"x":668,"y":400},
    {"lot":"imaginary-3","plan":2,"elevation":"A","reverse":true,"x":668,"y":434},
    {"lot":"imaginary-4","plan":3,"elevation":"A","reverse":true,"x":666,"y":465},
    {"lot":"imaginary-5","plan":2,"elevation":"C","reverse":false,"x":670,"y":499},
];

for(var i = 0; i < sites.length; i++) {
  $('#addItem').click();
}

$('form.item').each(function(i, obj) {

  $(this).find('input[name="lot"]').attr('value', sites[i]['lot']);
  $(this).find('input[name="plan"]').attr('value', sites[i]['plan']);
  $(this).find('input[name="x"]').attr('value', sites[i]['x']);
  $(this).find('input[name="y"]').attr('value', sites[i]['y']);
  $(this).find('input[name="elevation"]').attr('value', sites[i]['elevation']);

  if(sites[i]['reverse']) {
    $(this).find('input[name="reverse"]').prop('checked', true);
  }

  $(this).find('option[value="available"]').prop('selected', true);


  $(this).find('button.submit').click();

});

```

###License

MIT
