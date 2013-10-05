ptc.module("Data", function(Mod, App, Backbone, Marionette, $, _){
	
	// global config area to store "session"-level data
	Mod.Config = {
		loggedInUser: "",
		students: [],
		teachers: [],
		times: [],
		schedule: []
	};
	
	App.on("user:message", function(message) {
		var statustemplate = $("#loading").html();
		$(".status-bar").append(_.template(statustemplate, {"message": message}));
	});
	
	// data endpoints/requests
	App.reqres.setHandler("data:getinitial", function() {
		return API.getInitialData();
	});
	
	// local controller that manages data requests
	var API = {
		

		getInitialData: function() {
			
			/*	This initial function is enormous.
				But it must be, because everything
				is dependent on something else. As
				new data comes in, it is used to fetch
				other data. Each time data is fetched,
				a message is sent to the user.
			*/
			
			var defer = $.Deferred(), self = this;

			var user = App.request("user:getloggedin");
			$.when(user).done(function(userLogon) {
				App.trigger("user:message", "get logged in user");
				
				Mod.Config.loggedInUser = userLogon;

				var checkUser = App.request("teacher:getconf", userLogon);
				
				$.when(checkUser).done(function(conference) {
					App.trigger("user:message", "check role and get conferences");
					
					if(!conference) {
					
						console.log("user is not a teacher");
						
						var students = App.request("user:getstudents", userLogon);
						$.when(students).done(function(studentList) {
							App.trigger("user:message", "get students");
							
							Mod.Config.students = studentList;

							var schedule = App.request("schedule:getmy", Mod.Config.students[0].FamilyCode);
							$.when(schedule).done(function(scheduleList) {
								App.trigger("user:message", "get schedule");
								Mod.Config.schedule = scheduleList;
							});

							var teachers = App.request("student:getteachers", studentList);
							$.when(teachers).done(function(teacherList) {
								App.trigger("user:message", "get teachers");
								
								Mod.Config.teachers = teacherList;
								
								var conferences = App.request("teacher:getconferences", teacherList);
								$.when(conferences).done(function(conferenceList) {
									App.trigger("user:message", "get conference details");

									Mod.Config.conferences = conferenceList;
									
									// get any booked appointments for any teachers
									var teacherSchedule = App.request("teacher:getschedule", conferenceList);
									$.when(teacherSchedule).done(function(teacherScheduleList) {
										App.trigger("user:message", "got teacher reservations");
										Mod.Config.teacherSchedules = teacherScheduleList;
										
										var times = App.request("teacher:gettimes", conferenceList);
										$.when(times).done(function(timeList) {

											App.trigger("user:message", "get available time slots");
											
											Mod.Config.times = timeList;
											
											var availableTimes = App.request("times:getavailable");
											$.when(availableTimes).done(function(newTimeList) {

												Mod.Config.newTimes = newTimeList;
												App.trigger("user:message", "filtered the times");
												defer.resolve();

											});
											
										});
										
									});
								});

							});
						});
					} else {
						console.log("user is a teacher");
						Mod.Config.conference = conference;
						
						var getschedule = App.request("teacher:getmyteacherschedule", conference);
						$.when(getschedule).done(function(scheduleList) {
							App.trigger("user:message", "get schedule");
							Mod.Config.schedule = scheduleList;
							console.log(scheduleList);
							defer.resolve();
						});
					}
				});
			});
			return defer.promise();

		}
	};
});