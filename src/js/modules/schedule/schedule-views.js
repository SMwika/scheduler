ptc.module("Schedule.View", function(Mod, App, Backbone, Marionette){
	
	Mod.ApptItem = Marionette.ItemView.extend({
		tagName: "li",
		className: "appt",
		template: "#scheduleApptSingle",
		
		events: {
			"click a.js-delete-appt": "deleteClicked"
		},
		
		deleteClicked: function(e) {
			e.preventDefault();
			App.trigger("schedule:appt:delete", this.model);
			this.remove();
		}
	});
	Mod.ApptList = Marionette.CollectionView.extend({
		tagName: "ul",
		className: "appt-schedule",
		itemView: Mod.ApptItem,
		onRender: function(){
			this.$el.fadeIn();
		},
		appendHtml: function(collectionView, itemView, index){
			// puts a new model into the collection view in sort order
			var childrenContainer = $(collectionView.childrenContainer || collectionView.el);
			var children = childrenContainer.children();
			if (children.size() === index) {
				childrenContainer.append(itemView.el);
			} else {
				childrenContainer.children().eq(index).before(itemView.el);
			}
		}
	});
	
});