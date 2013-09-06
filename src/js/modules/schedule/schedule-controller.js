ptc.module('Schedule', function(Mod, App, Backbone, Marionette, $, _){

	Mod.Controller = {
		showSchedule: function() {
			// show loading view first...
			var loadingView = new App.Common.Loading();
			App.scheduleRegion.show(loadingView);
			
			// then actual schedule
			var scheduleData = App.request("schedule:getmy");
			$.when(scheduleData).done(function(data) {
				var data = new Mod.ApptCollection([
						{studentName: "Ben", teacher: "test teacher", time: 'another tes'}
					]);
				var scheduleView = new Mod.View.ApptList({
					collection: data
				});
				// show view in schedule region
				App.scheduleRegion.show(scheduleView);
			});
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