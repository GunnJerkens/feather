;(function($,_,Backbone,Handlebars,window,document,config,undefined){
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
      count: function(){
        return Items.where({'type': this.name}).length;
      },
      collection: "types"
    },
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
    tagName: "div",
    className: "type",

    template: Handlebars.compile($("#type-template").html()),

    initialize: function(){
      _.bindAll(this, "onSubmit");
    },

    render: function(){
      $(this.el).html(this.template(this.model.toJSON()));
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

    addField: function(){
      var fields = this.model.get('fields');
      fields.push({name:'Name',type:'Type',index: fields.length});
      this.model.save({fields: fields});
      this.render();
    },

    removeField: function(e){
      var index = $(this.el).index($(e.currentTarget));
      var fields = this.model.get('fields');
    }
  });

  var TypeListView = Backbone.View.extend({

    el: $('#list'),

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
   * Items
   * 
   */
  var Item = Backbone.Model.extend({
    defaults: {
      name: "default",
      fields: [],
      collection: "items"
    }
  });

  var ItemList = Backbone.Collection.extend({
    db: {
      view: "items",
      changes: false,
      filter: Backbone.couch_connector.config.ddoc_name + "/items"
    },

    url: "/items",
    model: Item,

    count: function(){
      
    }
  });
  var Items = new ItemList();

  var ItemListItemView = Backbone.View.extend({
    tagName: "form",
    className: "form",

    template: Handlebars.compile($("#type-template").html()),

    initialize: function(){
      _.bindAll(this, "onSubmit");
    },

    render: function(){
      $(this.el).html(this.template(this.model.toJSON()));
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

  var ItemListView = Backbone.View.extend({

    el: $('#list'),

    events: {
      "click #addItem": "addItem"
    },

    initialize: function(){
      $(this.el).html('<a id="addItem" href="#">New Item</a><div class="items"></div>');
      Items.fetch({success: function(){

        if (Items.models.length > 0) {
          for (var i in Items.models) {
            var view = new TypeListItemView({model: Items.models[i]})
            $('.items').append(view.render().el);
          }
        }
      }});
    },

    addItem: function(e){
      e.preventDefault();
      type = Types.create();
      $('.items').append(new ItemListItemView({model: type}).render().el);
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
      "/items/:id"     : "listItems"
    },

    initialize: function(){
      UserList.fetch();

      var types = new TypeListView();
    },

    listItems: function(id){

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

    // All link clicks go to app.navigate()
    $(document).on("click", "a:not([data-bypass])", function(evt) {
      var href = { prop: $(this).prop("href"), attr: $(this).attr("href") };
      var root = location.protocol + "//" + location.host + app.root;

        evt.preventDefault();
        Backbone.history.navigate(href.attr, true);
    });
    
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
        $('#list').html('');
      }
    });

  }, 100);

}(jQuery,_,Backbone,Handlebars,window,document));