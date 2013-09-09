ptc.module("Data", function(Mod, App, Backbone, Marionette, $, _){
	
	// global config area to store 'session'-level data
	Mod.Config = {
		loggedInUser: "",
		students: [],
		teachers: [],
		times: [],
		schedule: []
	};

	
	App.on("user:message", function(message) {
		var statustemplate = $("#loading").html();
		$(".status-bar").append(_.template(statustemplate, {'message': message}));
	});
	
	// data endpoints/requests
	App.reqres.setHandler("data:getinitial", function() {
		return API.getInitialData();
	});
	App.reqres.setHandler("user:getloggedin", function() {
		return API.getLoggedInUser();
	});
	App.reqres.setHandler("user:getstudents", function(userLogon) {
		return API.getStudents(userLogon);
	});
	App.reqres.setHandler("student:getteachers", function(studentList) {
		return API.getTeachers(studentList);
	});
	App.reqres.setHandler("teacher:gettimes", function(teacherList) {
		return API.getTimes(teacherList);
	});
	App.reqres.setHandler("schedule:getmy", function(familyCode) {
		return API.getSchedule(familyCode);
	});

	
	// local controller that manages data requests
	var API = {
		getInitialData: function() {
			var status = 0,
				defer = $.Deferred(),
				user = App.request("user:getloggedin");
			
			$.when(user).done(function(userLogon) {
			App.trigger("user:message", "get logged in user");
				
				Mod.Config.loggedInUser = userLogon;
				
				var schedule = App.request("schedule:getmy", userLogon.familyCode);
				
				$.when(schedule).done(function(scheduleList) {
					App.trigger("user:message", "get schedule");
					Mod.Config.schedule = scheduleList;
				});

				var students = App.request("user:getstudents", userLogon.familyCode);
				$.when(students).done(function(studentList) {
					App.trigger("user:message", "get students");
					
					Mod.Config.students = studentList;
					
					
					var teachers = App.request("student:getteachers", studentList);
					$.when(teachers).done(function(teacherList) {
						App.trigger("user:message", "get teachers");
					
						Mod.Config.teachers = teacherList;

						var times = App.request("teacher:gettimes", teacherList);
						$.when(times).done(function(timeList) {
							App.trigger("user:message", "get available time slots");
							
							Mod.Config.times = timeList;
							
							defer.resolve();
						});
					});
				});
			});
			return defer.promise();
		},
		getLoggedInUser: function() {
			var defer = $.Deferred();
			// get user
			var userLogon = {
				username: "Mark.Tedder",
				familyCode: "Ted234"
			}
			
			defer.resolve(userLogon);
			return defer.promise();
		},
		
		getStudents: function(userLogon) {
			// this should just get a list of all students of the user
			// the list should be formatted as an array of objects
			// each student should have an ID, name, and familyCode
			var defer = $.Deferred(),
				studentList = [
					{studentID: "234258", fullName: "Ben Tedder", familyCode: "Ted234"},
					{studentID: "23453258", fullName: "Daniel Tedder", familyCode: "Ted234"}
				];
			// get students of user	using SPServices and the user's LogonName		
			// studentList = [{studentID: "234258", fullName: "Ben Tedder", familyCode: "Ted234"}, {studentID: "23453258", fullName: "Daniel Tedder", familyCode: "Ted234"}];
			defer.resolve(studentList);
			return defer.promise();
		},
		getSchedule: function(familyCode) {
			// this should just get a list of all students of the user
			// the list should be formatted as an array of objects
			// each student should have an ID, name, and familyCode
			var defer = $.Deferred(),
				schedule = [
					{ID: "12", studentName: "Ben Tedder", teacherName: "Science", startTime: "2013-02-23", endTime: "2020-23-42", roomNumber: "2311"},
					{ID: "23", studentName: "Daniel Tedder", teacherName: "Math", familyCode: "Math", startTime: "2013-02-23", endTime: "2020-23-42", roomNumber: "2311"}
				];
			// get students of user	using SPServices and the user's LogonName		
			// studentList = [{studentID: "234258", fullName: "Ben Tedder", familyCode: "Ted234"}, {studentID: "23453258", fullName: "Daniel Tedder", familyCode: "Ted234"}];
			defer.resolve(schedule);
			return defer.promise();
		},
		
		getTeachers: function(studentList) {
			var defer = $.Deferred(),
				i,
				counter = 0,
				total = studentList.length,
				teacherList = [
					{studentID: '234258', teacherLogon: 'jim.stewart', teacherName:"Math"},
					{studentID: '23453258', teacherLogon: 'james.dean', teacherName:"Science"},
					{studentID: '234258', teacherLogon: 'james.dean', teacherName:"Science"}
				];
		
				// iterate through each student
				for(i = 0; i < total; i++) {
					// with each iteration, iterate counter, so we can resolve once counter is done
					counter++;
					// SPServices query for teachers of studentList[i].studentID
					// teacherList.push(['studentID', 'teacherLogon', 'teacherName']);
					if(counter == total) {
						defer.resolve(teacherList);
					}
				}
			return defer.promise();
		},
		
		getTimes: function(teacherList) {
			var defer = $.Deferred(),
				i,
				counter = 0,
				total = teacherList.length,
				timeList = [
					{teacherLogon: 'jim.stewart', startTime: '2013-08-20', endTime: '2013-08-21'},
					{teacherLogon: 'james.dean', startTime: '2013-08-22', endTime: '2013-08-22'},
					{teacherLogon: 'jim.stewart', startTime: '2013-08-23', endTime: '2013-08-23'},
					{teacherLogon: 'jim.stewart', startTime: '2013-08-24', endTime: '2013-08-25'},
				];
				
			// iterate through each teacher
			for(i = 0; i < total; i++) {
				// with each iteration, iterate counter, so we can resolve once counter is done
				counter++;
				// SPServices query for times of teacherList[i].teacherLogon
				// timeList.push(['teacherLogon', 'startTime', 'endTime']);
				if(counter == total) {
					defer.resolve(timeList);
				}
			}
			return defer.promise();
		}
	}
});