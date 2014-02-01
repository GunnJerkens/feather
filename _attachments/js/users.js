/* 
 * User
 * 
 */
var UserModel = Backbone.Model.extend({
  defaults : {
    name : "Anonymous"
  }
});

window.CurrentUser = new UserModel();

var UserSession = Backbone.Model.extend({
});

var UserListCollection = Backbone.Collection.extend({
  db : {
    changes : true
  },
  url : "/user_list",
  model : UserSession
});

var UserList = new UserListCollection();