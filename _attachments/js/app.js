;(function($,_,Backbone,Mustache,window,document,undefined){
  Backbone.couch_connector.config.db_name = "feather";
  Backbone.couch_connector.config.ddoc_name = "feather";
  Backbone.couch_connector.config.global_changes = false;

  /* Item */
  var Item = Backbone.Model.extend({
    defaults: {
      name: "Default"
    }
  });

  var ItemList = Backbone.Collection.extend({
    db: {
      view: "items",
      changes: true,
      filter: Backbone.couch_connector.config.ddoc_name + "/items"
    },

    url: "/items",
    model: Item,

    comparator: function(item){
      return 'name';
    }
  });
  var Items = new ItemList();

  var ItemListEntry = Backbone.View.extend({
    tagName: "form",

    events: {
      "click #submit": "onSubmit",
      "click #delete": "delete"
    },

    initialize: function(){
      _.bindAll(this, "onSubmit");
    },

    render: function(){
      $(this.el).html(Mustache.render($("#item-view").html(), this.model.toJSON()));
      return this;
    },

    onSubmit: function(e){
      e.preventDefault();
      console.log($(this.el).serializeObject());
      this.model.save($(this.el).serializeObject());
    },

    delete: function(){
      this.model.destroy();
      this.remove();
    }

  });

  var ItemListView = Backbone.View.extend({
    el: $("#items"),

    events: {
      "click #new-item": "addItem"
    },

    initialize: function(){
      Items.fetch({
        success: function(){
          Items.each(function(item){
            var view = new ItemListEntry({model: item});
            $('#item-list').prepend(view.render().el);
          });
        }
      });
    },

    addItem: function(){
      var item = Items.create({
        name: "Default",
        collection: "items"
      });
      var view = new ItemListEntry({model: item});
      $('#item-list').prepend(view.render().el);
    }
  });

  /* User */
  var UserModel = Backbone.Model.extend({
    defaults : {
      name : "Anonymous"
    }
  });
  
  window.CurrentUser = new UserModel();
  var MessageModel = Backbone.Model.extend({
    initialize : function(){
      if(!this.get("date")){
        this.set({"date": new Date().getTime()});
      }
    }
  });
  
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

  // The App router initializes the app by calling `UserList.fetch()`
  var App = Backbone.Router.extend({
    initialize : function(){
      UserList.fetch();
    }
  });

  // The current session will be stored in here
  var CurrentSession = null;
  
  // Booststrap app after delay to avoid continuous activity spinner 
  _.delay(function(){
    
    // Destroy the current session on unload
    $(window).unload(function(){
      $.ajaxSetup({
        async : false
      });
      if(CurrentSession != null)
        CurrentSession.destroy();
    });
    
    // Includes the couchlogin
    // check it out here: <a href="https://github.com/couchapp/couchdb-login-jquery">https://github.com/couchapp/couchdb-login-jquery</a>
    $('#login').couchLogin({
      loggedIn : function(user){
        CurrentUser.set(user);
        $('#items').html('<a id="new-item" href="#">New Item</a><div id="item-list"></div>');
        var items = new ItemListView();
        // Only add a User if it's not already in the list
        if(!UserList.detect(function(user){return user.get("name") == CurrentUser.get("name");})){
          CurrentSession = UserList.create({
            "name" : CurrentUser.get("name"),
            "logged_in_at" : new Date().getTime()
          });
        }
      },
      loggedOut : function(){
        CurrentUser.set(new UserModel().toJSON());
        CurrentUser.trigger("change:name");
        if (items) items.remove();
        if(CurrentSession != null)
          CurrentSession.destroy();
      }
    });
    
    // Bootstrapping
    new App();

  }, 100);
}(jQuery,_,Backbone,Mustache,window,document));