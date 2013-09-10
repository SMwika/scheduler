ptc.module("Reservation", function(Mod, App, Backbone){

	// Appointment Model and Collection ************************************
	Mod.Appt = Backbone.Model.extend({
		defaults: {
			studentID: "",
			studentName: "",
			teacherName: "",
			teacherLogon: "",
			startTime: "",
			endTime: "",
			familyCode: ""
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
	
	// Time Model and Collection ****************************************
	Mod.Time = Backbone.Model.extend({
		defaults: {
			startTime: "",
			endTime: ""
		}
	});
	
	Mod.TimeCollection = Backbone.Collection.extend({
		model: Mod.Time
	});

});