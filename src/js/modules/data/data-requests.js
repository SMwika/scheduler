ptc.module("Data", function (Mod, App, Backbone, Marionette, $) {

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
				times = App.Config.Settings.timeSlots,
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
						var minuteCount = (times[i].duration + times[i].padding) * k,
							newStart = moment(start).add(minuteCount, "m"),
							newEnd = moment(start).add(minuteCount + times[i].duration, "m"),
							
							niceStart = newStart.format("ddd D MMM h:mm"),
							unixStart = newStart.format("X"),
							
							niceEnd = newEnd.format("h:mm a"),
							unixEnd = newEnd.format("X");
		
						appts.push({
							category: times[i].category,
							startTime: niceStart,
							endTime: niceEnd,
							unixStart: unixStart,
							unixEnd: unixEnd
						});
						
					}
				}
			}
			App.trigger("user:message", "generate time slots");
			Mod.TimeSlots = appts;
		},
		
		getLoggedInUser: function () {
			var defer = $.Deferred(),
				parentLogon = $().SPServices.SPGetCurrentUser({
					fieldName: "Name",
					debug: false,
					async: true
				});
			parentLogon = parentLogon.split("\\")[1];

			parentLogon = "AbdoElian.Kardous"; // for testing
			
			defer.resolve(parentLogon);

			return defer.promise();
		},
		
		getStudents: function (userLogon) {
			// this should just get a list of all students of the user
			// the list should be formatted as an array of objects
			// each student should have an ID, name, and familyCode
			var defer = $.Deferred(),
				familyJSON = [];
				
				$().SPServices({
					operation: "GetListItems",
					webURL: App.Config.Settings.familyList.webURL,
					async:true,
					listName: App.Config.Settings.familyList.listName,
					CAMLQuery:"<Query><Where><Eq><FieldRef Name='ParentLogonName' /><Value Type='Text'>" + userLogon + "</Value></Eq></Where></Query>",
					completefunc: function (xData, Status) {
						familyJSON = $(xData.responseXML).SPFilterNode("z:row").SPXmlToJson({
							includeAllAttrs: true,
							removeOws: true
						});
						defer.resolve(familyJSON);
					}
				});
				
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
					roomNumber: "2311",
					teacherLogon: "jim.dean"
				}, {
					ID: "23",
					studentName: "Daniel Tedder",
					teacherName: "Math",
					familyCode: "Math",
					startTime: "2013-02-23",
					endTime: "2020-23-42",
					roomNumber: "2311",
					teacherLogon: "jim.dean"
				}];

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
				appts = Mod.TimeSlots;
			// iterate through each teacher
			for (i = 0; i < total; i++) {
				// then iterate through all time slots
				for (j = 0; j < appts.length; j++) {
					if (appts[j].category === list[i].division) {
						timeList.push({
							teacherLogon: list[i].teacherLogon,
							startTime: appts[j].startTime,
							endTime: appts[j].endTime,
							unixStart: appts[j].unixStart,
							unixEnd: appts[j].unixEnd
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