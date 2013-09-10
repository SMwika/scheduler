ptc.module("Config", function (Mod, App, Backbone, Marionette, $) {

	// set these settings on a per-conference basis
	Mod.Settings = {
		timeSlots: [{
			category: "ES",
			duration: 30, // conference duration in minutes
			dates: [ // in 24hr Beijing time
				{
					startDateTime: "2013-10-21 12:00",
					endDateTime: "2013-10-21 20:00"
				}, {
					startDateTime: "2013-10-22 08:00",
					endDateTime: "2013-10-22 15:30"
				}
			]

		}, {
			category: "MS",
			duration: 15, // conference duration in minutes
			dates: [ // in 24hr Beijing time
				{
					startDateTime: "2013-10-21 12:00",
					endDateTime: "2013-10-21 20:00"
				}, {
					startDateTime: "2013-10-22 08:00",
					endDateTime: "2013-10-22 15:30"
				}
			]

		}, {
			category: "HS",
			duration: 10, // conference duration in minutes
			dates: [ // in 24hr Beijing time
				{
					startDateTime: "2013-10-21 12:00",
					endDateTime: "2013-10-21 20:00"
				}, {
					startDateTime: "2013-10-22 08:00",
					endDateTime: "2013-10-22 15:30"
				}
			]

		}]
	},

	// generated below
	Mod.TimeSlots = [];

	App.on("times:generate", function () {
		API.generateTimeSlots();
	});
	App.reqres.setHandler("user:getloggedin", function () {
		return API.getLoggedInUser();
	});
	App.reqres.setHandler("user:getstudents", function (userLogon) {
		return API.getStudents(userLogon);
	});
	App.reqres.setHandler("student:getteachers", function (studentList) {
		return API.getTeachers(studentList);
	});
	App.reqres.setHandler("teacher:gettimes", function (teacherList) {
		return API.getTimes(teacherList);
	});
	App.reqres.setHandler("schedule:getmy", function (familyCode) {
		return API.getSchedule(familyCode);
	});
	
	var API = {
		generateTimeSlots: function () {
			var i, j, k,
				times = Mod.Settings.timeSlots,
				timesLength = times.length,
				appts = [];
			for (i = 0; i < timesLength; i++) {
				var dates = times[i].dates,
					datesLength = dates.length;
				for (j = 0; j < datesLength; j++) {
					var start = moment.utc(dates[j].startDateTime, "YYYY-MM-DD HH:mm"),
						end = moment.utc(dates[j].endDateTime, "YYYY-MM-DD HH:mm"),
						diff = end.diff(start, "m", true),
						slotCount = diff / times[i].duration;
					for (k = 0; k <= slotCount; k++) {
						var minuteCount = times[i].duration * k,
							newStart = moment(start).add(minuteCount, "m").format("ddd D MMM h:mm"),
							newEnd = moment(start).add(minuteCount + times[i].duration, "m").format("h:mm a");
						appts.push({
							category: times[i].category,
							startTime: newStart,
							endTime: newEnd,
						});
					}
				}
			}
			App.trigger("user:message", "generate time slots");
			Mod.TimeSlots = appts;
		},
		getLoggedInUser: function () {
			var defer = $.Deferred();
			// get user
			var userLogon = {
				username: "Mark.Tedder",
				familyCode: "Ted234"
			};

			defer.resolve(userLogon);
			return defer.promise();
		},

		getStudents: function (userLogon) {
			// this should just get a list of all students of the user
			// the list should be formatted as an array of objects
			// each student should have an ID, name, and familyCode
			var defer = $.Deferred(),
				studentList = [{
					studentID: "234258",
					fullName: "Ben Tedder",
					familyCode: "Ted234"
				}, {
					studentID: "23453258",
					fullName: "Daniel Tedder",
					familyCode: "Ted234"
				}];
			// get students of user	using SPServices and the user's LogonName		
			// studentList = [{studentID: "234258", fullName: "Ben Tedder", familyCode: "Ted234"}, {studentID: "23453258", fullName: "Daniel Tedder", familyCode: "Ted234"}];
			defer.resolve(studentList);
			return defer.promise();
		},
		getSchedule: function (familyCode) {
			// this should just get a list of all students of the user
			// the list should be formatted as an array of objects
			// each student should have an ID, name, and familyCode
			var defer = $.Deferred(),
				schedule = [{
					ID: "12",
					studentName: "Ben Tedder",
					teacherName: "Science",
					startTime: "2013-02-23",
					endTime: "2020-23-42",
					roomNumber: "2311"
				}, {
					ID: "23",
					studentName: "Daniel Tedder",
					teacherName: "Math",
					familyCode: "Math",
					startTime: "2013-02-23",
					endTime: "2020-23-42",
					roomNumber: "2311"
				}];
			// get students of user	using SPServices and the user's LogonName		
			// studentList = [{studentID: "234258", fullName: "Ben Tedder", familyCode: "Ted234"}, {studentID: "23453258", fullName: "Daniel Tedder", familyCode: "Ted234"}];
			defer.resolve(schedule);
			return defer.promise();
		},

		getTeachers: function (studentList) {
			var defer = $.Deferred(),
				i,
				counter = 0,
				total = studentList.length,
				teacherList = [{
					studentID: "234258",
					teacherLogon: "jim.stewart",
					teacherName: "Math",
					division: "HS"
				}, {
					studentID: "23453258",
					teacherLogon: "james.dean",
					teacherName: "Science",
					division: "MS"
				}, {
					studentID: "234258",
					teacherLogon: "james.dean",
					teacherName: "Science",
					division: "MS"
				}];

			// iterate through each student
			for (i = 0; i < total; i++) {
				// with each iteration, iterate counter, so we can resolve once counter is done
				counter++;
				// SPServices query for teachers of studentList[i].studentID
				// teacherList.push(["studentID", "teacherLogon", "teacherName"]);
				if (counter == total) {
					defer.resolve(teacherList);
				}
			}
			return defer.promise();
		},

		getTimes: function (teacherList) {
			var defer = $.Deferred(),
				i, j,
				counter = 0,
				list = teacherList,
				total = list.length,
				timeList = [],
				appts = App.Config.TimeSlots;

			// iterate through each teacher
			for (i = 0; i < total; i++) {
				// then iterate through all time slots
				for (j = 0; j < appts.length; j++) {
					if (appts[j].category === list[i].division) {
						timeList.push({
							teacherLogon: list[i].teacherLogon,
							startTime: appts[j].startTime,
							endTime: appts[j].endTime
						});
					}
				}
				// with each iteration, iterate counter, so we can resolve once counter is done
				counter++;

				// SPServices query for times of teacherList[i].teacherLogon
				// timeList.push(["teacherLogon", "startTime", "endTime"]);
				if (counter == total) {
					defer.resolve(timeList);
				}
			}
			return defer.promise();
		}
	};

});