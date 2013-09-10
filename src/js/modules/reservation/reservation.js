ptc.module('Reservation', function(Mod, App, Backbone, Marionette, $, _){
	
	Mod.NewReservation = {
		studentID: '',
		studentName: '',
		teacherName: '',
		teacherLogon: '',
		startTime: '',
		endTime: '',
		familyCode: ''
	}
	
	App.on("reservation:new", function() {
		API.newReservation();
	});
	App.on("reservation:create", function() {
		API.createReservation();
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
			App.submitRegion.close();
			Mod.Controller.listStudents();
		},
		listTeachers: function(studentID) {
			App.timeRegion.close();
			App.submitRegion.close();
			Mod.Controller.listTeachers(studentID);
		},
		listTimes: function(teacherLogon) {
			App.submitRegion.close();
			Mod.Controller.listTimes(teacherLogon);
		},
		newReservation: function() {
			Mod.Controller.startNewReservation();
		},
		createReservation: function() {
			Mod.Controller.createReservation();
		},
		enableSubmit: function() {
			Mod.Controller.enableSubmit();
		}
	};
	
});