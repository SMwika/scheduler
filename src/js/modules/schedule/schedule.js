ptc.module('Schedule', function(Mod, App, Backbone, Marionette, $, _){
	
	Mod.Controller = {
		showSchedule: function() {
			// show loading view first...
			
			// then actual schedule
			var user = App.Data.Config.loggedInUser,
				scheduleData = App.request("schedule:getmy", user);
				$.when(scheduleData).done(function(data) {
					var scheduleView = new Mod.View.ListAll({
						collection: data
					});
				});
		}
	};
	
	App.reqres.setHandler("schedule:getmy", function(user) {
		return API.getSchedule(user);
	});
	
	var API = {
		getSchedule: function(user) {
			// go get schedule for the provided userID
		}
	};
	
});