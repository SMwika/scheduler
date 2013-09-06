ptc.module('Schedule', function(Mod, App, Backbone, Marionette, $, _){
	
	App.on("schedule:showmy", function(user) {
	
	});
	App.reqres.setHandler("schedule:getmy", function() {
		return API.getSchedule(user);
	});
	
	var API = {
		getSchedule: function() {
			var user = App.Data.Config.loggedInUser;
			// go get schedule for the provided userID
		}
	};
	
});