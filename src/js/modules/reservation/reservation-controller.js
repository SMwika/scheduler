ptc.module("Reservation", function(Mod, App, Backbone, Marionette, $, _){

	Mod.Controller = {
		startNewReservation: function() {
			App.trigger("students:list");
		},
		
		createReservation: function() {
			// put logic to begin checking and reserving
			App.trigger("data:reservation:save");
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
			
			var teacherData = this.customizeTeacherList(studentID);
			
			var data = new Mod.TeacherCollection(teacherData),
				teacherList = new Mod.Views.TeacherList({
					collection: data
				});
		
			teacherList.on("show", function() {
				this.$el.before("Select a teacher: ");
			});
			// show view in teacher region
			App.teacherRegion.show(teacherList);
			
		},
		customizeTeacherList: function(studentID) {
			// get teacherids of current student
			var teacherids = _.pluck(_.where(App.Data.Config.teachers, {studentID: String(studentID)}), "teacherLogon"),
				teacherData = [], i;
			// iterate through each of the returned teachers
			for(i = 0; i < teacherids.length; i++) {
				// find if any of them have conferences
				var y = _.findWhere(App.Data.Config.conferences, {teacher1: teacherids[i]});

				if(y) {
					teacherData.push(y);
				}
			}
			return teacherData;
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
			var submitArea = new Mod.Views.SubmitView();
			
			//console.log(submitArea);
			App.submitRegion.show(submitArea);
		}
		
	};
	
});