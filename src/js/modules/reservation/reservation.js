ptc.module('Reservation', function(Mod, App, Backbone, Marionette, $, _){
	
	App.on("reservation:new", function() {
		API.newReservation();
	});
	App.on("students:list", function() {
		API.listStudents();
	});
	App.on("teachers:list", function(studentID) {
		API.listTeachers(studentID);
	});
	App.on("times:list", function() {
		API.listTimes();
	});
	
	var API = {
		listStudents: function() {
			Mod.Controller.listStudents();
		},
		listTeachers: function(studentID) {
			Mod.Controller.listTeachers(studentID);
		},
		listTimes: function() {
			Mod.Controller.listTimes();
		},
		newReservation: function() {
			Mod.Controller.startNewReservation();
		}
	};
	
});