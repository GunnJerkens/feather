function(doc) {
  if (doc.collection == "items") {
    emit(doc.collection, doc);
  }
};