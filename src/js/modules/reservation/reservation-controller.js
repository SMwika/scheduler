ptc.module('Reservation', function(Mod, App, Backbone, Marionette, $, _){

	Mod.Controller = {
		startNewReservation: function() {
			App.trigger("students:list");
		},
		listStudents: function(studentList) {
			var loading = new App.Common.Loading();
			App.studentRegion.show(loading);
			
			var i, studentCount = studentList.length;
			if(studentCount > 0) {

			}		
		},
		listTeachers: function(resLayout) {
			var loading = new App.Common.Loading();
			App.teacherRegion.show(loading);			
		}
		
	};
	
});