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

    $("#list").html(self.el);

    self.collection.fetch({
      success: function(){
        $("#list").html(self.el);

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
    e.stopPropagation();
    var type = this.collection.create();
    this.$el.append(new TypeEntryView({model: type}).render().el);
  }
});

var TypeFieldView = Backbone.View.extend({
  tagName: "div",
  className: "type",

  template: Handlebars.compile($("#type-field-template").html()),

  events: {
    'click .delete': 'delete'
  },

  initialize: function(){
  },

  render: function(){
    $(this.el).html(this.template(this.model));
    return this;
  },

  delete: function(){
    var self = this;
    if (window.confirm("Are you sure you want to delete '" + this.model.get('name') +"'? This will also remove its associated items.")) {
      this.model.destroy();
      this.remove();
    }
  }
});

var TypeFormView = Backbone.View.extend({
  tagName: "div",
  id: "types",

  events: {
    "click #addField": "addOne",
    "click #submit": "submit"
  },

  initialize: function(){
    var self = this;

    $("#list").html(self.el);

    this.subViews = [];
    _.each(self.model.get('fields'), function(field){
      self.subViews.push( new TypeFieldView({ model: fields }) );
    });
    self.render();
  },

  render: function(){
    var self = this;

    $(this.el).html('<button id="addField" class="btn btn-primary" href="#">Add Field</button><button id="submit" class="btn btn-default" href="#">Submit</button>');
    _.each(self.subViews, function(type){
      console.log(type);
      self.$el.append(type);
    });
  },

  addOne: function(e){
    var self = this;
    
    e.stopPropagation();
    var field = new TypeFieldView({model: {name: 'New Field', type: 'text'} });
    self.subViews.push(field);
    this.$el.append(field.render().el);
  },

  submit: function(e){
    e.preventDefault();
    var fields = [];
    _.each(self.subViews, function(field){
      console.log(field.$el);
    });
  }
});