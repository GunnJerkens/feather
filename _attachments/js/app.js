;(function($,_,Backbone,Handlebars,window,document,config,undefined){

  Backbone.couch_connector.config.db_name = "feather";
  Backbone.couch_connector.config.ddoc_name = "feather";
  Backbone.couch_connector.config.global_changes = false;


  // The App router initializes the app by calling `UserList.fetch()`
  var App = Backbone.Router.extend({
    routes: {
      "": "initialize",
      "types/:id" : "editType",
      "types/:id/items" : "items"
    },

    initialize: function(){
      UserList.fetch();
      this.loadView(new TypeListView({collection: Types}));
    },
    editType: function(id){
      var type = Types.findWhere({ _id: id });
      this.loadView(new TypeFormView({ model: type }));
    },
    items: function(id){
      var type = Types.findWhere({_id: id});
      this.loadView(new ItemListView({collection: Items.filtered(id), current_type: type.toJSON()}));
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

  window.Handlebars.registerHelper('select', function( value, options ){
      var $el = $('<select />').html( options.fn(this) );
      $el.find('[value=' + value + ']').attr({'selected':'selected'});
      return $el.html();
  });

  window.Handlebars.registerHelper('fieldValues', function(item, fields){
    var out = "";
    for (var i in fields){
      console.log(fields[i]);
      out += '<input type="'+ fields[i] +'" name="'+ fields[i] +'" value="'+ item[fields[i]] +'" placeholder="'+ fields[i] +'"/>';
      return out;
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

        // All link clicks go to app.navigate()
        $(document).on("click", "a:not(.data-bypass)", function(e) {
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