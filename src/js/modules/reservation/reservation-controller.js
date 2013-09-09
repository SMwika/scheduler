ptc.module("Reservation", function(Mod, App, Backbone, Marionette, $, _){

	Mod.Controller = {
		startNewReservation: function() {
			App.trigger("students:list");
		},
		listStudents: function() {
			var data = new Mod.StudentCollection(App.Data.Config.students),
				studentList = new Mod.Views.StudentList({
					collection: data
				});
			// show view in schedule region
			App.studentRegion.show(studentList);
		},
		listTeachers: function(ID) {
			var teacherArray = App.Data.Config.teachers,
				filtered = _.where(teacherArray, {studentID: ID}),
				data = new Mod.TeacherCollection(filtered),
				teacherList = new Mod.Views.TeacherList({
					collection: data
				});
			// show view in schedule region
			App.teacherRegion.show(teacherList);			
		}
		
	};
	
});