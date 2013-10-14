/*
	This is the controller for the reservation module. It's accessible
	to the entire app, but mostly it is called from the module's API.
*/
ptc.module("Reservation", function(Mod, App, Backbone, Marionette, $, _){

	Mod.Controller = {
		// dependengin on role, start listing things for the reservation form
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
			// instantiate a new collection from the stored list of students
			// then put that collection in a view
			var data = new Mod.StudentCollection(App.Data.Config.students),
				studentList = new Mod.Views.StudentList({
					collection: data
				});
			// set the family of the temporary reservation object
			Mod.NewReservation.familyCode = App.Data.Config.students[0].FamilyCode;
			
			// show view in student region
			App.studentRegion.show(studentList);
		},
		
		listTeachers: function(studentID) {
			// get a studentID, list their teachers
			var teacherData = this.customizeTeacherList(studentID);
			
			// instantiate a new Backbone collection with the returned teacherData,
			// then display it in a view
			var data = new Mod.TeacherCollection(teacherData),
				teacherList = new Mod.Views.TeacherList({
					collection: data
				});
				
			// show view in teacher region
			App.teacherRegion.show(teacherList);
			
		},
		customizeTeacherList: function(studentID) {
			// get teacherids of studentID passed in parameter
			var teacherids = _.pluck(_.where(App.Data.Config.teachers, {studentID: String(studentID)}), "teacherLogon"),
				teacherData = [], i;
			// iterate through each of the returned teachers
			for(i = 0; i < teacherids.length; i++) {
				// find if any of them have conferences
				var y = _.findWhere(App.Data.Config.conferences, {teacher1: teacherids[i]});

				if(y) {
					// if they do, then push them into the teacherData array
					teacherData.push(y);
				} else {
					// otherwise, they don't have the first teacher, so check the 2nd
					var x = _.findWhere(App.Data.Config.conferences, {teacher2: teacherids[i]});
					if(x) {
						teacherData.push(x);
					}
				}
			}
			
			teacherData = _.uniq(teacherData,function(item,key,a){
				return item.conferenceName;
			});
			
			return teacherData;
		},
		listTimes: function(teacherLogon) {
			// store the array of new times that were generated earlier
			var timeArray = App.Data.Config.newTimes;
			
			// first, we're expecting a single teacher logon in the parameter
			// so we iterate through the newTimes
			var filtered = _.filter(timeArray, function(time) {
				// split the teachers into an array (even if only one)
				var teachers = time.teacherLogon.split("-");
				// set the default output to false (meaning they won't show up in the filter)
				var output = false;
				var teacher = teacherLogon.toLowerCase();
				if(teachers.length > 1) {
					// if the array we created earlier has more than one,
					// then if the teacher name is equal to the teacherLogon that was passed,
					// then we have a match, and we should make sure that time passes the truth test
					if(teacher === teachers[0] || teacher === teachers[1]) {
						output = true;
					}
				} else {
					// otherwise, if the teachers don't match, then pass that time by
					if(teacher === teachers[0]) {
						output = true;
					}
				}
				// finally, this return tells the _.filter function to return this time slot
				return output;
			});
			// then we instantiate a new Backbone collection with this array,
			// and put it into a view.
			var data = new Mod.TimeCollection(filtered),
				timeList = new Mod.Views.TimeList({
					collection: data
				});

			// finallym we show the view in time region
			App.timeRegion.show(timeList);
		},
		
		enableSubmit: function(option) {
			// the option passed to this function determines
			// which view is shown in the submit region
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
			case "error":
				submitArea = new Mod.Views.SubmitError();
				break;
			}
			
			App.submitRegion.show(submitArea);
		}
	};
});