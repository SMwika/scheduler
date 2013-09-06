ptc.module('Schedule', function(Mod, App, Backbone, Marionette, $, _){

	App.on("schedule:listAppts", function() {
		API.showSchedule();
	});
	App.on("schedule:appt:delete", function(appt) {
		API.deleteAppt(appt);
	});
	App.reqres.setHandler("schedule:getmy", function(user) {
		return API.getSchedule(user);
	});
	
	var API = {
		getSchedule: function(user) {
			// go get schedule for the provided userID
			// 
		},
		showSchedule: function() {
			Mod.Controller.showSchedule();
		},
		deleteAppt: function(appt) {
			Mod.Controller.deleteAppt(appt);
		}
	};
	
});