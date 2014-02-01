function(doc,req) {
  if (doc.type && doc.collection == "items") {
    emit(doc.type, doc);
  }
};