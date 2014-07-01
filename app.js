var couchapp, ddoc, path, config;

couchapp = require('couchapp');

path = require('path');

config = require('./couch_config.json');

ddoc = {
  _id: '_design/'+config.public.dbName,
  rewrites: {},
  views: {},
  shows: {},
  lists: {},
  validate_doc_update: function(newDoc, oldDoc, userCtx) {
    if (newDoc._deleted === true && userCtx.roles.indexOf('_admin') === -1) {
      throw "Only admin can delete documents on this database.";
    }
  }
};

ddoc.views.by_type = {
  map: function(doc){
    if (doc.collection == "items") {
      emit(doc.type, doc);
    }
  }
}
ddoc.views.byCollection = {
  map: function(doc) {
    if (doc.collection) {
      emit(doc.collection, doc);
    }
  }
}
ddoc.views.items = {
  map: function(doc) {
    if (doc.collection == "items") {
      emit(doc.collection, doc);
    }
  }
}
ddoc.views.types = {
  map: function(doc) {
    if (doc.collection == "types") {
      emit(doc.collection, doc);
    }
  }
}

couchapp.loadAttachments(ddoc, path.join(__dirname, '_attachments'));

module.exports = ddoc;
