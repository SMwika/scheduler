/*
	This is the View submodule of the Schedule module.
	It handles just the appointment single view, and its
	list view. These views are instantiated in the controller.
*/
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
			// first, check if the deleter is also the reserver :)
			if(this.model.get("Reserver") === App.Data.Config.loggedInUser) {
				// trigger a delete on the server
				App.trigger("schedule:appt:delete", this.model);
				// then remove it from the list
				this.remove();
			} else {
				alert("Sorry, you cannot delete reservations you did not create");
			}
		}
	});
	Mod.ApptList = Marionette.CollectionView.extend({
		tagName: "ul",
		className: "appt-schedule",
		itemView: Mod.ApptItem,
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