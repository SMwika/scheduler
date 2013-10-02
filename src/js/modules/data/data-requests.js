ptc.module("Data", function (Mod, App, Backbone, Marionette, $, _) {

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
	App.reqres.setHandler("teacher:gettimes", function (conferenceList) {
		return API.getTimes(conferenceList);
	});
	App.reqres.setHandler("teacher:getconferences", function (teacherList) {
		return API.getConferences(teacherList);
	});
	App.reqres.setHandler("schedule:getmy", function (familyCode) {
		return API.getSchedule(familyCode);
	});
	
	App.reqres.setHandler("data:getTeacherAvailability", function(res) {
		return API.getTeacherAvailability(res);
	});
	
	App.reqres.setHandler("data:getStudentTeacherStatus", function(res) {
		return API.getStudentTeacherStatus(res);
	});
	
	App.on("data:reservation:save", function () {
		API.saveReservation();
	});
	App.on("data:reservation:delete", function(appt) {
		API.deleteReservation(appt);
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
					var start = moment(dates[j].startDateTime, "YYYY-MM-DD HH:mm"),
						end = moment(dates[j].endDateTime, "YYYY-MM-DD HH:mm"),
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
			var defer = $.Deferred();
	/*		var	parentLogon = $().SPServices.SPGetCurrentUser({
					fieldName: "Name",
					debug: false,
					async: true
				});
			parentLogon = parentLogon.split("\\")[1]; */

			var parentLogon = "Lap.Tung"; // for testing
			
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
				completefunc: function (xData) {
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
			var defer = $.Deferred(), self = this,
				fullSchedule = [], counter = 0,
				divisions = _.keys(App.Config.Settings.reservationLists);
				
			_.each(divisions, function(division) {
				$().SPServices({
					operation: "GetListItems",
					webURL: App.Config.Settings.reservationLists[division].webURL,
					async:true,
					listName: App.Config.Settings.reservationLists[division].listName,
					CAMLQuery:"<Query><Where><Eq><FieldRef Name='FamilyCode' /><Value Type='Text'>" + familyCode +"</Value></Eq></Where></Query>",
					completefunc: function (xData) {
						var schedule = $(xData.responseXML).SPFilterNode("z:row").SPXmlToJson({
							includeAllAttrs: true,
							removeOws: true
						});
						
						_.each(schedule, function(appt) {
							var x = self.formatScheduleDates(appt);
							x.Division = division;
							fullSchedule.push(x);
						});
						
						counter++;
						
						if(counter === 3) {
							defer.resolve(fullSchedule);
						}
					}
				});
			});
			
			return defer.promise();
		},
		
		formatScheduleDates: function(appt) {
			appt.StartTime = moment.unix(parseInt(appt.StartTime, 10)).format("ddd D MMM h:mm");
			appt.EndTime = moment.unix(parseInt(appt.EndTime, 10)).format("h:mm a");
			return appt;
		},

		getTeachers: function (studentList) {
			var defer = $.Deferred(), self = this,
				students = [], teacherList = [];
			$().SPServices({
				operation: "GetListItems",
				webURL: App.Config.Settings.studentTeacherList.webURL,
				async:true,
				listName: App.Config.Settings.studentTeacherList.listName,
				CAMLQuery:"<Query><Where><Eq><FieldRef Name='FamilyCode' /><Value>" + studentList[0].FamilyCode +"</Value></Eq></Where></Query>",
				completefunc: function (xData) {
					var studentArray = $(xData.responseXML).SPFilterNode("z:row").SPXmlToJson({
						includeAllAttrs: true,
						removeOws: true
					});
					if(studentArray) {
						
						// iterate through each returned query result
						_.each(studentArray, function(student) {
							students.push({
								studentID: student.StudentID,
								teachers: student.NameValues.toLowerCase(),
							});
						});
						
						// now, iterate and filter through each of the student's teachers
						_.each(students, function(record) {
						
							// split up the teacher column by semicolon
							var teacherArray = record.teachers.split(";");
							
							// process overrides from the teacher list
							var newTeacherArray = self.processOverrides(teacherArray);
							
							// remove everything after parentheses and change to lowercase
							newTeacherArray = _.map(newTeacherArray, function(teacher) {
								return teacher.replace(/\(.+/g, "");
							});	
							
							// trim out any duplicates
							newTeacherArray = _.uniq(newTeacherArray);

							// then iterate through each of the teachers
							_.each(newTeacherArray, function(teacher) {
							
								// and push the individual teacher, with the record's student
								teacherList.push({
									teacherLogon: teacher,
									studentID: record.studentID
								});
						
							});
						});
					}
					defer.resolve(teacherList);
				}
			});
			
			return defer.promise();
		},
		
		processOverrides: function(teacherArray) {
		
			// set the newTeacherArray with the passed variable
			var excluded = [];
			var finalExclusions = [];
			
			// first, let's get a list of excluded teachers
			_.each(App.Config.Settings.overrides.exclusions, function(exclusion) {
				exclusion = exclusion.toLowerCase();
				var eachExclusion = _.filter(teacherArray, function(teacher) {
					// return anything that is excluded
					return teacher.indexOf(exclusion) >= 0;
				});
				excluded = excluded.concat(eachExclusion);
			});
			
			// then, let's take out any of the exclusions that are in the "inclusions"
			_.each(App.Config.Settings.overrides.inclusions, function(inclusion) {
				inclusion = inclusion.toLowerCase();
				var eachInclusion = _.filter(excluded, function(teacher) {
					// return all teachers who AREN'T included by override
					return teacher.indexOf(inclusion) === -1;
				});
				finalExclusions = finalExclusions.concat(eachInclusion);
			});
			
			// iterate through each of the exclusions (strings)
			_.each(finalExclusions, function(exclusion) {
				// set the new array to be a filtered version of itself each time
				teacherArray = _.filter(teacherArray, function(teacher) {
					// return anything that doesn't have an index of the exclusion
					return teacher.indexOf(exclusion) === -1;
				});
			});
			
			return teacherArray;
		},
		
		getConferences: function(teacherList) {
			var defer = $.Deferred(),
				i, list = teacherList, listLength = list.length,
				conferenceList = [], inQuery = "";

			// for each teacher that we have
			for(i = 0; i < listLength; i++) {
				inQuery += "<Value Type='Text'>ISB\\" + list[i].teacherLogon + "</Value>";
			}
			$().SPServices({
				operation: "GetListItems",
				webURL: App.Config.Settings.conferenceList.webURL,
				async:true,
				listName: App.Config.Settings.conferenceList.listName,
				CAMLQuery:"<Query><Where><In><FieldRef Name='Teachers' /><Values>" + inQuery +"</Values></In></Where></Query>",
				completefunc: function (xData) {
					var conferenceArray = $(xData.responseXML).SPFilterNode("z:row").SPXmlToJson({
						includeAllAttrs: true,
						removeOws: true
					});
					
					_.each(conferenceArray, function(conference) {
						var teachers = conference.Teachers.split(";");
						
						if(teachers.length > 2) {
							conferenceList.push({
								conferenceName: conference.Title,
								division: conference.Division,
								roomNumber: conference.Room,
								teacher1: teachers[1].split("\\")[1].toLowerCase(),
								teacher2: teachers[3].split("\\")[1].toLowerCase()
							});
						} else {
							conferenceList.push({
								conferenceName: conference.Title,
								division: conference.Division,
								roomNumber: conference.Room,
								teacher1: teachers[1].split("\\")[1].toLowerCase(),
							});
						}
					});

					defer.resolve(conferenceList);
				}
			});

			return defer.promise();
		},
		
		getTimes: function (conferenceList) {
			var defer = $.Deferred(),
				i, j,
				counter = 0,
				list = conferenceList,
				total = list.length,
				timeList = [],
				teacher = "",
				appts = Mod.TimeSlots;
			// iterate through each teacher
			for (i = 0; i < total; i++) {
				if(list[i].teacher2) {
					teacher = list[i].teacher1 + "-" + list[i].teacher2;
				} else {
					teacher = list[i].teacher1;
				}
				// then iterate through all time slots
				for (j = 0; j < appts.length; j++) {
					if (appts[j].category === list[i].division) {
						timeList.push({
							teacherLogon: teacher,
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
		},
		getTeacherList: function(x) {
			var teachers;
			// check if the teacher is actually a team teaching thing
			if(x.teacherLogon.indexOf("-") > 0) {
				teachers = "-1;#ISB\\" + x.teacherLogon.split("-")[0] + ";#-1;#ISB\\" + x.teacherLogon.split("-")[1] + ";#";
			} else {
				teachers = "-1;#ISB\\" + x.teacherLogon;
			}
			return teachers;
		},
		setDivision: function(x) {
			var division;
			// set the correct list to save to, depending on student's grade level
			if(x.currGrade > 5 && x.currGrade < 9) {
				division = "MS";
			} else if(x.currGrade > 8 && x.currGrade <= 12) {
				division = "HS";
			} else {
				division = "ES";
			}
			return division;
		},
		saveReservation: function() {
			// for ease, set the reservation to a small variable
			var x = App.Reservation.NewReservation,
				self = this;
			// get formatted teacher list
			var teachers = self.getTeacherList(x);
			// set division
			var division = self.setDivision(x);
			
			
			var reservationValues = [
				["Title", x.teacherName],
				["StudentID", x.studentID],
				["StudentName", x.studentName],
				["RoomNumber", x.roomNumber],
				["StartTime", x.startTime],
				["EndTime", x.endTime],
				["FamilyCode", x.familyCode],
				["Teachers", teachers]
			];
			
			$().SPServices({
				operation: "UpdateListItems",
				async: false,
				webURL: App.Config.Settings.reservationLists[division].webURL,
				batchCmd: "New",
				listName: App.Config.Settings.reservationLists[division].listName,
				valuepairs: reservationValues,
				completefunc: function(xData) {
					if(xData.statusText == "OK") {
						var schedule = $(xData.responseXML).SPFilterNode("z:row").SPXmlToJson({
							includeAllAttrs: true,
							removeOws: true
						});
						var x = self.formatScheduleDates(schedule[0]);
						x.Division = division;
						
						App.trigger("schedule:append", x);
						App.trigger("user:message", "successfully reserved");
					} else {
						App.trigger("user:message", "error saving your reservation");
					}
				}
			});
		},
		
		getTeacherAvailability: function(res) {
		// check if teacher has this time slot available
		
			// set teacher and startTime from passed reservation
			var teacher = res.teacherLogon,
				startTime = res.startTime;
			
			if(teacher.indexOf("-") > 0) {
				teacher = teacher.split("-")[0];
			}
			
			// query SP division 
			var defer = $.Deferred(), self = this,
				available = true, counter = 0,
				divisions = _.keys(App.Config.Settings.reservationLists);
				
			_.each(divisions, function(division) {
				$().SPServices({
					operation: "GetListItems",
					webURL: App.Config.Settings.reservationLists[division].webURL,
					async:true,
					listName: App.Config.Settings.reservationLists[division].listName,					
					CAMLQuery:"<Query><Where><And><In><FieldRef Name='Teachers' /><Values><Value Type='Text'>ISB\\" + teacher + "</Value></Values></In><Eq><FieldRef Name='StartTime' /><Value Type='Text'>" + startTime + "</Value></Eq></And></Where></Query>",
					completefunc: function (xData) {
						var schedule = $(xData.responseXML).SPFilterNode("z:row").SPXmlToJson({
							includeAllAttrs: true,
							removeOws: true
						});
						console.log(schedule);
						if(schedule.length > 0) {
							available = false;
							defer.resolve(available);
						}
						
						counter++;
						
						if(counter === 3) {
							console.log(available);
							defer.resolve(available);
						}
					}
				});
			});
			
			return true;
			// return true for available, or false
		},
		getStudentTeacherStatus: function(res) {
		// make sure teacher and student are not already reserved together
		
			// student and teacher from passed reservation
			var teacher = res.teacherLogon,
				student = res.studentID;
			
			return true;
			// return true for available, or false
		},
		
		deleteReservation: function(appt) {
			var reservationID = appt.get("ID"),
				division = appt.get("Division");
			$().SPServices({
				operation: "UpdateListItems",
				async: true,
				webURL: App.Config.Settings.reservationLists[division].webURL,
				listName: App.Config.Settings.reservationLists[division].listName,
				batchCmd: "Delete",
				ID: reservationID,
				completefunc: function() {
					App.trigger("user:message", "reservation deleted");
				}
			});
		}
	};
});