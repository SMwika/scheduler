ptc.module("Schedule", function(Mod, App){

	App.on("schedule:listAppts", function() {
		API.showSchedule();
	});
	App.on("schedule:appt:delete", function(appt) {
		API.deleteAppt(appt);
	});
	
	App.on("schedule:append", function(data) {
		API.appendAppt(data);
	});
	
	
	var API = {
		showSchedule: function() {
			Mod.Controller.showSchedule();
		},
		deleteAppt: function(appt) {
			Mod.Controller.deleteAppt(appt);
		},
		appendAppt: function(data) {
			var appt = new Mod.Appt(data);
			App.trigger("schedule:collection:add", appt);
		}
	};
	
});