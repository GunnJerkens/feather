function(doc) {
  if (doc.collection == "items" || doc._deleted)
    return true;
  else
    return false;
};