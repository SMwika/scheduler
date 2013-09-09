ptc.module('Reservation', function(Mod, App, Backbone, Marionette, $, _){
	
	App.on("reservation:new", function() {
		API.newReservation();
	});
	App.on("students:list", function() {
		API.listStudents();
	});
	App.on("teachers:list", function() {
		API.listTeachers();
	});
	App.on("times:list", function() {
		API.listTimes();
	});
	
	var API = {
		listStudents: function() {
			var students = App.Data.Config.students;
			if(!students || students == 0) {
				fetchstudents = App.request("user:getstudents");
				$.when(fetchstudents).done(function(studentList) {
					console.log('hi');
					if(studentList) {						
						students = studentList
					}
					Mod.Controller.listStudents(students);
				});
			}
		},
		listTeachers: function() {
			Mod.Controller.listTeachers();
		},
		listTimes: function() {
			Mod.Controller.listTimes();
		},
		newReservation: function() {
			Mod.Controller.startNewReservation();
		}
	};
	
});