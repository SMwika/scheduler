/*
	Super basic model/collection of the Schedule module.
*/
ptc.module("Schedule", function(Mod, App, Backbone){

	// Model and Collection **********************************************
	Mod.Appt = Backbone.Model.extend({
		defaults: {
			studentName: "",
			teacher: "",
			time: "",
			room: ""
		}
	});
	
	Mod.ApptCollection = Backbone.Collection.extend({
		model: Mod.Appt,
		comparator: function (model) {
			// sorts our collection by its start time
            return model.get("StartTime");
        }
	});

});