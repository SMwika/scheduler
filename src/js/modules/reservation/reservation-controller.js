ptc.module("Reservation", function(Mod, App, Backbone, Marionette, $, _){

	Mod.Controller = {
		startNewReservation: function() {
			App.trigger("students:list");
		},
		
		createReservation: function() {
			var reservation = new Mod.Appt(Mod.NewReservation);
			console.log(reservation);
		},
		
		listStudents: function() {
			var data = new Mod.StudentCollection(App.Data.Config.students),
				studentList = new Mod.Views.StudentList({
					collection: data
				});
			Mod.NewReservation.familyCode = App.Data.Config.loggedInUser.familyCode;
			
			studentList.on("show", function() {
				this.$el.before("Select a student: ");
			});
			// show view in student region
			App.studentRegion.show(studentList);
		},
		
		listTeachers: function(studentID) {
			var teacherArray = App.Data.Config.teachers,
				filtered = _.where(teacherArray, {studentID: studentID}),
				data = new Mod.TeacherCollection(filtered),
				teacherList = new Mod.Views.TeacherList({
					collection: data
				});
				teacherList.on("show", function() {
					this.$el.before("Select a teacher: ");
				});
			// show view in teacher region
			App.teacherRegion.show(teacherList);			
		},
		
		listTimes: function(teacherLogon) {
			var timeArray = App.Data.Config.times,
				filtered = _.where(timeArray, {teacherLogon: teacherLogon}),
				data = new Mod.TimeCollection(filtered),
				timeList = new Mod.Views.TimeList({
					collection: data
				});
				timeList.on("show", function() {
					this.$el.before("Select a time slot: ");
				});
			// show view in time region
			App.timeRegion.show(timeList);
		},
		
		enableSubmit: function() {
			var submitArea = Marionette.ItemView.extend({
				template: "#submitForm",
				events: {
					"click .js-submit-form": "submitFormClicked"
				},
				submitFormClicked: function(e) {
					e.preventDefault();
					App.trigger("reservation:create");
				}
			});
			
			//console.log(submitArea);
			App.submitRegion.show(new submitArea());
		}
		
	};
	
});