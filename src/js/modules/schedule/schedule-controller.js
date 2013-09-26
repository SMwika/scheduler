ptc.module("Schedule", function(Mod, App){

	Mod.Controller = {
		showSchedule: function() {
			var data = new Mod.ApptCollection(App.Data.Config.schedule);

			var scheduleView = new Mod.View.ApptList({
				collection: data
			});
			App.on("schedule:collection:add", function(model) {
				data.add(model);
			});
			// show view in schedule region
			App.scheduleRegion.show(scheduleView);
		},
		deleteAppt: function(appt) {
			App.trigger("data:reservation:delete", appt);
		}
	};
	
});