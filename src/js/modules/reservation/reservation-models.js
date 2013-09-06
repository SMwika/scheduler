ptc.module("Reservation", function(Mod, App, Backbone){

	// Model and Collection **********************************************
	Mod.Appt = Backbone.Model.extend({
		defaults: {
			studentName: '',
			teacher: '',
			time: ''
		}
	});
	
	Mod.ApptCollection = Backbone.Collection.extend({
		model: Mod.Appt
	});

});