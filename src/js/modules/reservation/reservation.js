ptc.module('Reservation', function(Mod, App, Backbone, Marionette, $, _){
	
	Mod.NewReservation = {
		studentID: '',
		teacherName: '',
		teacherLogon: '',
		startTime: '',
		endTime: '',
		familyCode: ''
	}
	
	App.on("reservation:new", function() {
		API.newReservation();
	});
	App.on("students:list", function() {
		API.listStudents();
	});
	App.on("teachers:list", function(studentID) {
		API.listTeachers(studentID);
	});
	App.on("times:list", function(teacherLogon) {
		API.listTimes(teacherLogon);
	});
	App.on("submit:enable", function() {
		API.enableSubmit();
	});
	
	var API = {
		listStudents: function() {
			App.teacherRegion.close();
			App.timeRegion.close();
			Mod.Controller.listStudents();
		},
		listTeachers: function(studentID) {
			App.timeRegion.close();
			Mod.Controller.listTeachers(studentID);
		},
		listTimes: function(teacherLogon) {
			Mod.Controller.listTimes(teacherLogon);
		},
		newReservation: function() {
			Mod.Controller.startNewReservation();
		},
		enableSubmit: function() {
			Mod.Controller.enableSubmit();
		}
	};
	
});