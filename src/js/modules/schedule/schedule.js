/*
	This is the Schedule module. It's pretty basic,
	and involves some basic Backbone and Marionette juggling.
*/
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
	
	// local API only availabl in this function
	// accessed by the triggers in this module.
	var API = {
		showSchedule: function() {
			Mod.Controller.showSchedule();
		},
		deleteAppt: function(appt) {
			Mod.Controller.deleteAppt(appt);
		},
		appendAppt: function(data) {
			// instantiate a new model of the passed appointment data
			var appt = new Mod.Appt(data);
			// trigger a collection.add() with this model
			App.trigger("schedule:collection:add", appt);
		}
	};
	
});