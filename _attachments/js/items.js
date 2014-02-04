/* 
 * Items
 * 
 */
var Item = Backbone.Model.extend({
  defaults: {
    name: "default",
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
  className: "item",

  template: Handlebars.compile($("#item-template").html()),

  events: {
    'click .delete': 'delete',
    'click .submit': 'submit'
  },

  initialize: function(){
    //_.bindAll(this, "onSubmit");
  },

  render: function(){
    $(this.el).html(this.template({ item: this.model.toJSON(), type: app.view.current_type}));
    return this;
  },

  submit: function(){
    this.model.save(this.$el.serializeObject());
  },

  delete: function(){
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

    console.log(self.current_type);

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

    $(this.el).append('<button id="addItem" class="btn btn-primary" href="#">New Item</button>');
    self.collection.each(function(item){
      self.$el.append(new ItemEntryView({model: item}).render().el);
    });
  },

  addOne: function(e){
    var self = this;

    e.stopPropagation();
    this.collection.create({type: this.current_type.id}, {
      wait: true,
      success: function(item){
        self.$el.append(new ItemEntryView({model: item}).render().el);
      }
    });
  }
});