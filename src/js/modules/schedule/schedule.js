ptc.module("Schedule", function(Mod, App){

	App.on("schedule:listAppts", function() {
		API.showSchedule();
	});
	App.on("schedule:appt:delete", function(appt) {
		API.deleteAppt(appt);
	});
	
	
	var API = {
		showSchedule: function() {
			Mod.Controller.showSchedule();
		},
		deleteAppt: function(appt) {
			Mod.Controller.deleteAppt(appt);
		}
	};
	
});