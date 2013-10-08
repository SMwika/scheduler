/*
	Again, a super basic piece of the Schedule module.
*/
ptc.module("Schedule", function(Mod, App){

	Mod.Controller = {
		showSchedule: function() {
			// instantiate a new collection from the stored schedule
			// and put it in a view.
			var data = new Mod.ApptCollection(App.Data.Config.schedule),
				scheduleView = new Mod.View.ApptList({
					collection: data
				});
			// when a model is added to the collection, add it to the collection
			App.on("schedule:collection:add", function(model) {
				data.add(model);
			});
			// show view in schedule region
			App.scheduleRegion.show(scheduleView);
		},
		deleteAppt: function(appt) {
			// just trigger the delete on the data module
			App.trigger("data:reservation:delete", appt);
		}
	};
	
});