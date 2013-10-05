ptc.module("Reservation", function(Mod, App, Backbone, Marionette, $, _){

	Mod.Controller = {
		startNewReservation: function() {
			if(App.Data.Config.userRole === "parent") {
				App.trigger("students:list");
			} else if(App.Data.Config.userRole === "teacher") {
				App.trigger("times:list", App.Data.Config.loggedInUser);
			}
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
			
			// show view in student region
			App.studentRegion.show(studentList);
		},
		
		listTeachers: function(studentID) {
			
			var teacherData = this.customizeTeacherList(studentID);
			
			var data = new Mod.TeacherCollection(teacherData),
				teacherList = new Mod.Views.TeacherList({
					collection: data
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
			var timeArray = App.Data.Config.newTimes,
				filtered = _.where(timeArray, {teacherLogon: teacherLogon.toLowerCase()}),
				data = new Mod.TimeCollection(filtered),
				timeList = new Mod.Views.TimeList({
					collection: data
				});

			// show view in time region
			App.timeRegion.show(timeList);
		},
		
		enableSubmit: function(option) {
			var submitArea;
			switch(option) {
			case "submit":
				submitArea = new Mod.Views.SubmitView();
				break;
			case "checking":
				submitArea = new Mod.Views.SubmitChecking();
				break;
			case "unavailable":
				submitArea = new Mod.Views.SubmitUnavailable();
				break;
			case "doublebooked":
				submitArea = new Mod.Views.SubmitDoubleBooked();
				break;
			case "success":
				submitArea = new Mod.Views.SubmitSuccess();
				break;
			}
			
			App.submitRegion.show(submitArea);
		}
	};
});