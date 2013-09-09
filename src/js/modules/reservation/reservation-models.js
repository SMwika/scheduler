ptc.module("Reservation", function(Mod, App, Backbone){

	// Appointment Model and Collection ************************************
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
	
	
	// Student Model and Collection ****************************************
	Mod.Student = Backbone.Model.extend({
		defaults: {
			fullName: "",
			studentID: "",
			familyCode: ""
		}
	});
	
	Mod.StudentCollection = Backbone.Collection.extend({
		model: Mod.Student
	});
	
	// Teacher Model and Collection ****************************************
	Mod.Teacher = Backbone.Model.extend({
		defaults: {
			fullName: "",
			studentID: "",
			familyCode: ""
		}
	});
	
	Mod.TeacherCollection = Backbone.Collection.extend({
		model: Mod.Teacher
	});

});