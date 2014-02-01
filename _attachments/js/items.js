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

  url: '/by_type',
  model: Item
});
var Items = new ItemList();

var ItemEntryView = Backbone.View.extend({
  tagName: "div",
  className: "item",

  template: Handlebars.compile($("#item-template").html()),

  events: {
    'click .delete': 'delete'
  },

  initialize: function(){
    //_.bindAll(this, "onSubmit");
  },

  render: function(){
    $(this.el).html(this.template(this.model.toJSON()));
    return this;
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
    self.collection.fetch({
      success: function(){
        $("#list").html(self.el);

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

    $(this.el).html('<button id="addItem" class="btn btn-primary" href="#">New Item</button>');
    this.collection.each(function(item){
      self.$el.append(new ItemEntryView({model: item}).render().el);
    });
  },

  addOne: function(e){
    e.stopPropagation();
    var item = this.collection.create({type: this.current_type});
    this.$el.append(new ItemEntryView({model: item}).render().el);
  }
});