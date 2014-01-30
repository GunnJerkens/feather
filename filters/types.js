function(doc) {
  if (doc.collection == "types" || doc._deleted)
    return true;
  else
    return false;
};