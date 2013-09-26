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
            return model.get("StartTime");
        }
	});

});