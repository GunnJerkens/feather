/* 
 * Items
 * 
 */
var Item = Backbone.Model.extend({
  defaults: {
    collection: "items"
  }
});

var ItemList = Backbone.Collection.extend({
  db: {
    view: "by_type",
    changes: false,
    filter: Backbone.couch_connector.config.ddoc_name + this.url
  },

  initialize: function(conf){
    var self = this;
    if (conf) {
      if (conf.keys) {
        self.db.keys = conf.keys;
      }
    }
  },

  filtered: function(id){
    return new ItemList({ keys: [id] });
  },

  url: '/items',
  model: Item
});
var Items = new ItemList();

var ItemEntryView = Backbone.View.extend({
  tagName: "form",
  className: "item form-horizontal col-md-8",

  template: Handlebars.compile($("#item-template").html()),

  events: {
    'click .delete': 'delete',
    'click .submit': 'submit'
  },

  initialize: function(){
    //_.bindAll(this, "onSubmit");
  },

  render: function(){
    var self = this;

    var current_fields = [];
    _.each(app.view.current_type.fields, function(field){
      field.value = self.model.has(field.name) ? self.model.get(field.name) : '';
      current_fields.push(field);
    });
    $(self.el).html(self.template({ item: self.model.toJSON(), fields: current_fields}));
    return this;
  },

  submit: function(e){
    e.preventDefault();
    console.log(this.$el.serializeObject());
    this.model.save(this.$el.serializeObject());
  },

  delete: function(e){
    e.preventDefault();
    if (window.confirm("Are you sure you want to delete '" + this.model.get('name') +"'?")) {
      this.model.destroy();
      this.remove();
    }
  }
});

var ItemListView = Backbone.View.extend({
  tagName: "div",
  id: "items",

  events: {
    "click #addItem": "addOne"
  },

  initialize: function(id){
    var self = this;

    self.current_type = id.current_type;

    self.collection.fetch({
      success: function(){
        $("#list").append(self.$el);

        self.subViews = [];
        self.collection.each(function(item){
          self.subViews.push( new ItemEntryView({ model: item }) );
        });

        self.render();
      }
    });
    
  },

  render: function(){
    var self = this;

    $(this.el).append('<div class="row"><button id="addItem" class="btn btn-primary" href="#"><span class="glyphicon glyphicon-plus"></span> New Item</button></div>');
    self.collection.each(function(item){
      self.$el.append(new ItemEntryView({model: item}).render().el);
    });
  },

  addOne: function(e){
    var self = this;
    e.stopPropagation();

    self.collection.create({type: self.current_type._id}, {
      wait: true,
      success: function(item){
        self.$el.append(new ItemEntryView({model: item}).render().el);
      }
    });
  }
});