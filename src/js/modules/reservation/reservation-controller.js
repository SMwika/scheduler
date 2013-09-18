ptc.module("Reservation", function(Mod, App, Backbone, Marionette, $, _){

	Mod.Controller = {
		startNewReservation: function() {
			App.trigger("students:list");
		},
		
		createReservation: function() {
			var reservation = new Mod.Appt(Mod.NewReservation);
		},
		
		listStudents: function() {
			var data = new Mod.StudentCollection(App.Data.Config.students),
				studentList = new Mod.Views.StudentList({
					collection: data
				});
			Mod.NewReservation.familyCode = App.Data.Config.students[0].FamilyCode;
			
			studentList.on("show", function() {
				this.$el.before("Select a student: ");
			});
			// show view in student region
			App.studentRegion.show(studentList);
		},
		
		listTeachers: function(studentID) {
			// first, get teacherids of current student
			var teacherids = _.pluck(_.where(App.Data.Config.teachers, {studentID: studentID}), "teacherLogon"),
				teacherData = [], i;
			for(i = 0; i < teacherids.length; i++) {
				var x = _.findWhere(App.Data.Config.conferences, {teacherLogon: teacherids[i]});
				if(x) {
					teacherData.push(x);
				}
			}
				data = new Mod.TeacherCollection(teacherData),
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