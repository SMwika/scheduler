ptc.module('Schedule', function(Mod, App, Backbone, Marionette, $, _){

	Mod.Controller = {
		showSchedule: function(user) {
			// show loading view first...
			
			// then actual schedule
			var scheduleData = App.request("schedule:getmy");
				
			$.when(scheduleData).done(function(data) {
				var scheduleView = new Mod.View.ListAll({
					collection: data
				});
				// show view in schedule region
				App.scheduleRegion.show(scheduleView);
			});
		}
	};
	
});