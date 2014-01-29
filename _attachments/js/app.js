;(function($,_,Backbone,Mustache,window,document,config,undefined){
  Backbone.couch_connector.config.db_name = "feather";
  Backbone.couch_connector.config.ddoc_name = "feather";
  Backbone.couch_connector.config.global_changes = false;

  /* 
   * Types
   * 
   */
  var Type = Backbone.Model.extend({
    defaults: {
      name: "default",
      fields: [],
      collection: "types"
    }
  });

  var TypeList = Backbone.Collection.extend({
    db: {
      view: "types",
      changes: false,
      filter: Backbone.couch_connector.config.ddoc_name + "/types"
    },

    url: "/types",
    model: Type
  });
  var Types = new TypeList();

  var TypeListItemView = Backbone.View.extend({
    tagName: "form",
    className: "form",

    events: {
      "submit": "onSubmit",
      "click .delete": "delete",
      "click .edit": "showForm",
      "click .addField": "addField",
      "click .removeField": "removeField"
    },

    initialize: function(){
      _.bindAll(this, "onSubmit");
    },

    render: function(){
      $(this.el).html(Mustache.render($("#type-template").html(), this.model.toJSON()));
      return this;
    },

    onSubmit: function(e){
      e.preventDefault();
      console.log($(this.el).serializeObject());
      this.model.save($(this.el).serializeObject(), 
        {
          success: function(){}
        }
      );
    },

    delete: function(){
      if (window.confirm("Are you sure you want to delete '" + this.model.get('name') +"'?")) {
        this.model.destroy();
        this.remove();
      }
    },

    showForm: function(){

    },

    addField: function(){
      var fields = this.model.get('fields');
      fields.push({name:'Name',type:'Type',index: fields.length});
      this.model.save({fields: fields});
      this.render();
    },

    removeField: function(e){
      var index = $(this.el).index($(e.currentTarget));
      console.log(index);
    }
  });

  var TypeListView = Backbone.View.extend({

    el: $('#content'),

    events: {
      "click #addItem": "addItem"
    },

    initialize: function(){
      $(this.el).html('<a id="addItem" href="#">New Item</a><div class="types"></div>');
      Types.fetch({success: function(){

        if (Types.models.length > 0) {
          for (var i in Types.models) {
            var view = new TypeListItemView({model: Types.models[i]})
            $('.types').append(view.render().el);
          }
        }
      }});
    },

    addItem: function(e){
      e.preventDefault();
      type = Types.create();
      $('.types').append(new TypeListItemView({model: type}).render().el);
    }
  });


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

  // The App router initializes the app by calling `UserList.fetch()`
  var App = Backbone.Router.extend({
    routes: {
      "/:type"     : "listItems"
    },

    initialize: function(){
      UserList.fetch();

      var types = new TypeListView();
    },

    listItems: function(){

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

    Backbone.history.start();
    
    // Includes the couchlogin
    // check it out here: <a href="https://github.com/couchapp/couchdb-login-jquery">https://github.com/couchapp/couchdb-login-jquery</a>
    $('#login').couchLogin({
      loggedIn : function(user){
        CurrentUser.set(user);
        // Only add a User if it's not already in the list
        if(!UserList.detect(function(user){return user.get("name") == CurrentUser.get("name");})){
          CurrentSession = UserList.create({
            "name" : CurrentUser.get("name"),
            "logged_in_at" : new Date().getTime()
          });
        }

        // Bootstrapping
        window.app = new App();
        app.navigate("");
      },
      loggedOut : function(){
        CurrentUser.set(new UserModel().toJSON());
        CurrentUser.trigger("change:name");
        if(CurrentSession != null) CurrentSession.destroy();
        $('#content').html('');
      }
    });

  }, 100);

}(jQuery,_,Backbone,Mustache,window,document));