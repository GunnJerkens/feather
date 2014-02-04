/* 
 * Types
 * 
 */
var Type = Backbone.Model.extend({
  defaults: {
    name: "New Type",
    fields: [],
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

var TypeEntryView = Backbone.View.extend({
  tagName: "div",
  className: "type",

  template: Handlebars.compile($("#type-template").html()),

  events: {
    'click .delete': 'delete'
  },

  initialize: function(){
  },

  render: function(){
    $(this.el).html(this.template(this.model.toJSON()));
    return this;
  },

  delete: function(){
    var self = this;
    if (window.confirm("Are you sure you want to delete '" + this.model.get('name') +"'? This will also remove its associated items.")) {
      this.model.destroy();
      this.remove();

      Items.fetch({
      success: function(){
        var filtered = Items.where({type: self.model.get('_id')});
        if (Items.models.length > 0) {
          for (var i in Items.models) {
            Items.models[i].destroy();
          }
        }
      }
    });
    }
  }
});

var TypeListView = Backbone.View.extend({
  tagName: "div",
  id: "types",

  events: {
    "click #addType": "addOne"
  },

  initialize: function(){
    var self = this;

    $("#list").append(self.$el);

    self.collection.fetch({
      success: function(){
        self.subViews = [];
        self.collection.each(function(type){
          self.subViews.push( new TypeEntryView({ model: type }) );
        });
        self.render();
      }
    });
  },

  render: function(){
    var self = this;

    self.$el.append('<button id="addType" class="btn btn-primary" href="#">New Type</button>');
    _.each(self.subViews, function(type){
      self.$el.append(type.render().el);
    });
  },

  addOne: function(e){
    var self = this;
    e.stopPropagation();
    
    this.collection.create({}, {
      wait: true,
      success: function(type){
        var view = new TypeEntryView({model: type});
        self.subViews.push(view);
        console.log(view);
        self.$el.append(view.render().el);
      }
    });
  }
});

var TypeFieldView = Backbone.View.extend({
  tagName: "div",
  className: "type",

  template: Handlebars.compile($("#type-field-template").html()),

  events: {
    'click .delete': 'delete',
    "click .dropdown-menu a" : "changeType"
  },

  initialize: function(){
    this.render();
  },

  render: function(){
    $(this.el).html(this.template(this.model));
    return this;
  },

  changeType: function(e){
    e.preventDefault();
    this.$el.first('input[name="text"]').val($(e.currentTarget).attr('data-value'));
    app.view.submit();
  },

  delete: function(){
    var self = this;
    if (window.confirm("Are you sure you want to delete this field? This will also remove its associated items.")) {
      self.remove();
      app.view.subViews.splice(app.view.subViews.indexOf(self));
      app.view.submit();
    }
  }
});

var TypeFormView = Backbone.View.extend({
  tagName: "div",
  id: "types",

  template: Handlebars.compile($('#type-form-template').html()),

  events: {
    "click #addField": "addOne",
    "click #submit": "submit"
  },

  initialize: function(){
    var self = this;

    $("#list").append(self.$el);

    self.subViews = [];
    _.each(self.model.get('fields'), function(field){
      self.subViews.push( new TypeFieldView({ model: field }) );
    });
    self.render();
  },

  render: function(){
    var self = this;

    self.$el.append(self.template(self.model.toJSON()));
    _.each(self.subViews, function(type){
      self.$el.append(type.el);
    });
  },

  addOne: function(e){
    var self = this;
    
    e.stopPropagation();
    var field = new TypeFieldView({model: {name: '', type: 'text'} });
    self.subViews.push(field);
    this.$el.append(field.render().el);
    self.submit();
  },

  submit: function(){
    var self = this;
    var fields = [];
    _.each(self.subViews, function(field){
      fields.push({name: field.$el.find('input[name="name"]').val(), type: field.$el.first('input[name="type"]').val()});
    });
    console.log(fields);
    self.model.save({fields: fields});
  }
});