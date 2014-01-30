function(doc) {
  if (doc.collection == "types") {
    emit(doc.collection, doc);
  }
};