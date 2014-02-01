;(function($,_,Backbone,Handlebars,window,document,config,undefined){

  Backbone.couch_connector.config.db_name = "feather";
  Backbone.couch_connector.config.ddoc_name = "feather";
  Backbone.couch_connector.config.global_changes = false;


  // The App router initializes the app by calling `UserList.fetch()`
  var App = Backbone.Router.extend({
    routes: {
      "": "initialize",
      "types/:id" : "editType",
      "types/:id/items" : "items",
      "items/:id" : "editItem"
    },

    initialize: function(){
      UserList.fetch();
      this.loadView(new TypeListView({collection: Types}));
    },
    editType: function(id){
      console.log(id);
      this.loadView(new TypeFormView({model: Types.where({ id: id })}));
    },
    items: function(id){
      this.loadView(new ItemListView({collection: Items.filtered(id), current_type: id}));
    },
    editItem: function(id){
      console.log(id2);
    },
    loadView: function(view){
      this.view && (this.view.close ? this.view.close() : this.view.remove());
      this.view = view;
    }
  });

  /*
   * Utility
   */
  Backbone.View.prototype.close = function () {
    _.each(this.subViews, function(view) { view.remove(); });
    this.remove();
    this.unbind();
  };

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

        // All link clicks go to app.navigate()
        $(document).on("click", "a:not([data-bypass])", function(e) {
          e.preventDefault();

          var href = { prop: $(this).prop("href"), attr: $(this).attr("href") };
          var root = location.protocol + "//" + location.host + app.root;
          app.navigate(href.attr, true);
        });
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