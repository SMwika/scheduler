ptc.module('Schedule', function(Mod, App, Backbone, Marionette, $, _){

	Mod.Controller = {
		showSchedule: function() {
			var data = new Mod.ApptCollection(App.Data.Config.schedule);
			var scheduleView = new Mod.View.ApptList({
				collection: data
			});
			// show view in schedule region
			App.scheduleRegion.show(scheduleView);
		},
		deleteAppt: function(appt) {
			appt.destroy({
				success: function() {
					console.log("deleted");
				},
				error: function() {
					console.log("error destroying the event");
				}
			});
		}
	};
	
});