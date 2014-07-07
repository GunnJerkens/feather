;(function($,_,Backbone,Handlebars,window,document,config,undefined){

  Backbone.couch_connector.config.db_name = config.dbName;
  Backbone.couch_connector.config.ddoc_name = config.dbName;
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

  window.Handlebars.registerHelper('adminOnly', function(context, options){
    out = '';
    if (CurrentUser.get('roles').indexOf('admin') > -1) {
      out = options.fn(context);
    }
    return out;
  });

  window.Handlebars.registerHelper('fieldValues', function(item){
    var $el, selected, checked, markup, i, len, fieldsEditable, disabled;
    if (CurrentUser.get('roles').indexOf('admin') > -1) {
      fieldsEditable = true;
    } else {
      fieldsEditable = ['status', 'price']; // TODO: add field property to set editability by non-admin users
    }
    markup = '';
    _.each(item, function(field){
      disabled = !(fieldsEditable === true || fieldsEditable.indexOf(field.name) > -1);
      if (field.type == "checkbox") {
        checked = (field.value == "on" ? ' checked' : '');
        markup += '<div class="row form-group">';
        if ( !disabled ) {
          markup += '<div class="col-sm-offset-2 col-sm-10">' +
              '<div class="checkbox">' +
                '<label>' +
                  '<input type="checkbox" name="'+ field.name +'"'+ checked +' '+(disabled ? 'disabled' : '')+' />' +
                  ' '+ field.name +
                '</label>' +
              '</div>' +
            '</div>';
        } else {
          markup += '<label class="col-sm-2 control-label" for="'+ field.name +'">' +
            field.name +': ' +
            '</label>' +
          '<div class="col-md-6"><span class="value glyphicon glyphicon-' + (checked ? 'ok' : 'remove') + '"></span></div>';
        }
        markup += '</div>';
      } else if (field.type == "select") {
        markup += '<div class="row form-group">' +
            '<label class="col-sm-2 control-label" for="'+ field.name +'">'+
            field.name +': ' +
            '</label>' +
          '<div class="col-md-6">';
        if ( !disabled ) {
          markup += '<select class="form-control" name="'+ field.name +'">';
          for (i = 0, len=field.options.length; i < len; i++) {
            selected = (field.value == field.options[i].value ? ' selected' : '');
            markup += '<option value="' + field.options[i].value + '"' + selected + '>' + field.options[i].label + '</option>';
          }
          markup += '</select>';
        } else {
          markup += '<span class="value">'+ field.value +'</span>';
        }
        markup += '</div></div>';
      } else {
        markup += '<div class="row form-group">' +
          '<label class="col-sm-2 control-label" for="'+ field.name +'">'+ field.name +': </label>' +
          '<div class="col-md-6">';
        if ( !disabled ) {
          markup += '<input type="text" class="form-control" name="'+ field.name +'" value="'+ field.value +'" />';
        } else {
          markup += '<span class="value">'+ field.value +'</span>';
        }
        markup += '</div>' +
          '</div>';
      }
    });
    return markup;
  });

  window.Handlebars.registerHelper('fieldOption', function(option){
    var markup;
    markup = '<li>' +
        '<div class="input-group alignleft">' +
          '<input type="text" class="form-control" name="value" value="'+option.value+'">' +
        '</div>' +
        '<div class="input-group">' +
          '<input type="text" class="form-control" name="label" value="'+option.label+'">' +
          '<div class="input-group-btn">' +
            '<button type="button" class="delOption btn btn-danger"><span class="glyphicon glyphicon-remove"></span></button>' +
          '</div>' +
        '</div>' +
      '</li>';
    return markup;
  });

  window.Handlebars.registerHelper('delete', function(item){
    return '<button class="delete btn btn-danger"><span class="glyphicon glyphicon-remove"></span> Delete</button>';
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

}(jQuery,_,Backbone,Handlebars,window,document,config));
