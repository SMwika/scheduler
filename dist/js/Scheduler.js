/*!
 scheduler Build version 0.0.1, 10-09-2013
*/
// all of the templates for the app should be referenced here
// this keeps index.html clean
$(function () {
    
    var i, z, 
        rawTmpls = [
			"loading",
			"scheduleApptSingle",
			"singleStudent",
			"singleTeacher",
			"singleTimeSlot",
			"studentListContainer",
			"teacherListContainer",
			"timeListContainer",
			"submitChecking",
			"submitUnavailable",
			"submitDoubleBooked",
			"submitSuccess",
			"submitError",
			"submitForm"

        ];
    
    if ( $("body").data("env") === "dev" ) {
        
        // Dev env, load all scripts
        z = rawTmpls.length;
        
        var appendTmpl = function (tmpl) {
            $.ajax({
                url: "src/templates/"+tmpl+".tpl",
                async: false,
                success: function (data) {
                    $("#templates").append("<script type=\"text/template\" id=\""+tmpl+"\">"+data+"</script>"); 
                }
            });
        };
        
        for (i=0; i<z; i++) {
            appendTmpl(rawTmpls[i]);
        }
        
        
    } else {
        
        // Production, load compiled
        $.ajax({
            url: "dist/templates/system.tpl",
            async: false,
            success: function (data) {
                $("#templates").append(data); 
            }
        });
        
    }
    
});;// change underscore to use {{ }}
_.templateSettings = {
    interpolate: /\{\{([\s\S]+?)\}\}/g
};

// make the regions slide down as they open - fancy fancy!
Marionette.Region.prototype.open = function(view){
	this.$el.hide();
	this.$el.html(view.el);
	this.$el.slideDown("medium");
};

// just a method to check if an object has a property
Object.prototype.hasOwnProperty = function(property) {
	return this[property] !== undefined;
};

// create the marionette app
var ptc = new Marionette.Application();

// add regions to the app for displaying data
ptc.addRegions({
    studentRegion: "#studentRegion",
    teacherRegion: "#teacherRegion",
    timeRegion: "#timeRegion",
	submitRegion: "#submitRegion",
	
    scheduleRegion: "#scheduleRegion"
});

// when the app runs for the first time, do this stuff
ptc.on("initialize:after", function () {
	
	// generate the time stored in app-config.js
	ptc.trigger("times:generate");
	
	// get the initial set of data (a big function)
	var datafetch = ptc.request("data:getinitial");
	$.when(datafetch).done(function(data){
		// when all data has been fetched, tell the user
		ptc.trigger("user:message", "successfully retrieved all data");
		
		// then begin to list the schedule and show the reservation form
		ptc.trigger("schedule:listAppts");
		ptc.trigger("reservation:new");
	});
});
;ptc.module("Config", function (Mod, App, Backbone, Marionette, $) {

	// set these settings on a per-conference basis
	Mod.Settings = {
		
		overrides: {
			// exclusions are processed first
			exclusions: ["(ASA)", "(MSE)","hanichowski(Homeroom)", "mskinner(Homeroom)","fpanych(Homeroom)","scoe(Homeroom)","ehillmann(Homeroom)","GRussell(Homeroom)","bjogi(Homeroom)","jbinns(Homeroom)","breverman(Homeroom)","boreilly(Homeroom)","jkinsella(Homeroom)","DMonroe(Homeroom)","jmcroberts(Homeroom)","drussell(Homeroom)","mdawson(Homeroom)","gloynes(Homeroom)"],
			
			// then inclusions override any exclusions
			inclusions: ["aflores"]
		},
		
		familyList: {
			// used to get family information
			webURL: "https://g.isb.bj.edu.cn/my/",
			listName: "FamilyInfo"
		},
		studentTeacherList: {
			// used to get list of teachers of studentids
			webURL: "https://g.isb.bj.edu.cn/my/",
			listName: "SchedulingApplicationTeachersList"
		},
		conferenceList: {
			// used to get list of conferences
			webURL: "https://g.isb.bj.edu.cn/test/conferencing/",
			listName: "ConferenceList"
		},
		// where all of the reservations are stored
		reservationLists: {
			"HS": {
				webURL: "https://g.isb.bj.edu.cn/test/conferencing/",
				listName: "ReservationsHS"
			},
			"MS": {
				webURL: "https://g.isb.bj.edu.cn/test/conferencing/",
				listName: "ReservationsMS"
			},
			"ES": {
				webURL: "https://g.isb.bj.edu.cn/test/conferencing/",
				listName: "ReservationsES"
			}
		},
		timeSlots: [{
			category: "ES",
			duration: 20, // conference duration in minutes
			padding:10, // minutes after a conference where no bookings can be made
			dates: [ // in 24hr Beijing time
				{
					startDateTime: "2013-10-21 12:00 +0800", // first conference START time
					endDateTime: "2013-10-21 19:30 +0800" // last conference START time
				}, {
					startDateTime: "2013-10-22 08:00 +0800", // first conference START time
					endDateTime: "2013-10-22 15:00 +0800" // last conference START time
				}
			]
		}, {
			category: "MS",
			duration: 15, // conference duration in minutes
			padding: 0, // minutes after a conference where no bookings can be made
			dates: [ // in 24hr Beijing time
				{
					startDateTime: "2013-10-21 12:00 +0800", // first conference START time
					endDateTime: "2013-10-21 19:45 +0800" // last conference START time
				}, {
					startDateTime: "2013-10-22 08:00 +0800", // first conference START time
					endDateTime: "2013-10-22 15:15 +0800" // last conference START time
				}
			]
		}, {
			category: "HS",
			duration: 10, // conference duration in minutes
			padding: 0, // minutes after a conference where no bookings can be made
			dates: [ // in 24hr Beijing time
				{
					startDateTime: "2013-10-21 12:00 +0800", // first conference START time
					endDateTime: "2013-10-21 19:50 +0800" // last conference START time
				}, {
					startDateTime: "2013-10-22 08:00 +0800", // first conference START time
					endDateTime: "2013-10-22 15:20 +0800" // last conference START time
				}
			]
		}]
	};

});;ptc.module("Data", function(Mod, App, Backbone, Marionette, $, _){
	
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
				$.when(checkUser).done(function(conferences) {
					App.trigger("user:message", "check role and get conferences");
					
					if(!conferences) {
						
						Mod.Config.userRole = "parent";
								
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
								var teacherArray = [];
								_.each(teacherList, function(teacher) {
									teacherArray.push(teacher.teacherLogon);
								});
								
								var conferences = App.request("teacher:getconferences", teacherArray);
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



						Mod.Config.conferences = conferences;
						Mod.Config.userRole = "teacher";
						
						// set reservation variables
						App.Reservation.NewReservation.roomNumber = conferences[0].roomNumber;
						App.Reservation.NewReservation.teacherName = conferences[0].conferenceName;
						if (conferences[0].hasOwnProperty('teacher2')) {
							App.Reservation.NewReservation.teacherLogon = conferences[0].teacher1 + "-" + conferences[0].teacher2;
						} else {
							App.Reservation.NewReservation.teacherLogon = conferences[0].teacher1;
						}
						App.Reservation.NewReservation.division = conferences[0].division;
						App.Reservation.NewReservation.studentName = "-";
						App.Reservation.NewReservation.reserver = Mod.Config.loggedInUser;
						
						var getschedule = App.request("teacher:getmyteacherschedule", conferences[0]);
						$.when(getschedule).done(function(scheduleList) {
							App.trigger("user:message", "get schedule");
							Mod.Config.schedule = scheduleList;
						
							var teacherSchedule = App.request("teacher:getschedule", conferences);
							$.when(teacherSchedule).done(function(teacherScheduleList) {
								App.trigger("user:message", "got teacher reservations");
								Mod.Config.teacherSchedules = teacherScheduleList;

								var times = App.request("teacher:gettimes", conferences);
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

					}
				});
			});
			return defer.promise();

		}
	};
});;ptc.module("Data", function (Mod, App, Backbone, Marionette, $, _) {

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
	
	App.reqres.setHandler("teacher:getschedule", function(teacher) {
		return API.getTeacherSchedule(teacher);
	});
	
	App.reqres.setHandler("teacher:getconf", function(teacherLogon) {
		return API.getTeacherConf(teacherLogon);
	});
	
	App.reqres.setHandler("teacher:getconferences", function (teacherList) {
		return API.getConferences(teacherList);
	});
	
	App.reqres.setHandler("teacher:getmyteacherschedule", function (conference) {
		return API.getMyTeacherSchedule(conference);
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
	
	App.reqres.setHandler("times:getavailable", function() {
		return API.getAvailableTimes();
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
					var start = moment(dates[j].startDateTime, "YYYY-MM-DD HH:mm Z"),
						end = moment(dates[j].endDateTime, "YYYY-MM-DD HH:mm Z"),
						diff = end.diff(start, "m", true),
						slotCount = diff / (times[i].duration + times[i].padding);
					for (k = 0; k <= slotCount; k++) {
						var minuteCount = (times[i].duration + times[i].padding) * k,
							newStart = moment(start).add(minuteCount, "m"),
							newEnd = moment(start).add(minuteCount + times[i].duration, "m"),
							
							niceStart = newStart.zone("+08:00").format("ddd D MMM h:mm"),
							unixStart = newStart.format("X"),
							
							niceEnd = newEnd.zone("+08:00").format("h:mm a"),
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
			var	parentLogon = $().SPServices.SPGetCurrentUser({
					fieldName: "Name",
					debug: false,
					async: true
				});
			parentLogon = parentLogon.split("\\")[1];

		//	var parentLogon = "rebecca.lei";
			
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
			appt.StartTime = moment.unix(parseInt(appt.StartTime, 10)).zone("+08:00").format("ddd D MMM h:mm");
			appt.EndTime = moment.unix(parseInt(appt.EndTime, 10)).zone("+08:00").format("h:mm a");
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
								teachers: student.NameValues.toLowerCase()
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
			var defer = $.Deferred(), self = this,
				i, list = teacherList, listLength = list.length,
				conferenceList = [], inQuery = "";

			// for each teacher that we have
			for(i = 0; i < listLength; i++) {
				inQuery += "<Value Type='Text'>ISB\\" + list[i] + "</Value>";
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
					
					var conferenceList = self.niceifyConferences(conferenceArray);

					defer.resolve(conferenceList);
				}
			});

			return defer.promise();
		},
		niceifyConferences: function (conferenceArray) {
			var conferenceList = [];
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
						teacher1: teachers[1].split("\\")[1].toLowerCase()
					});
				}
			});
			return conferenceList;
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
		getAvailableTimes: function() {
			// we're trying to get filter the 'times' list and
			// remove anything from the 'teacherSchedules' list that matches
			var defer = $.Deferred(),
				oldTimes = App.Data.Config.times,
				blockedTimes = App.Data.Config.teacherSchedules,
				matchingBlockedTimes = [],
				newTimes = [];
			
			// first, filter through all the blockedTimes
			_.each(blockedTimes, function(time) {
				var teacherBits = time.Teachers.split(";"),
					teacherName = "";
						
				if(teacherBits.length > 2) {
					// if > 2, then there are two teachers in the field
					teacherName = teacherBits[1].split("\\")[1] + "-" + teacherBits[3].split("\\")[1];
				} else {
					// otherwise, there's only one teacher
					teacherName = teacherBits[1].split("\\")[1];
				}
				// convert to lowercase so we can compare to the times array
				teacherName = teacherName.toLowerCase();
				
				// now we have the teacherName (eg 'bweir' or 'jbinns-aflores')
				matchingBlockedTimes.push({
					teacherLogon: teacherName,
					unixStart: time.StartTime
				});
			});
				
			newTimes = _.reject(oldTimes, function(oldtime) {
				var output = false;
				
				_.each(matchingBlockedTimes, function(blockedtime) {
					var sameTime = (blockedtime.unixStart === oldtime.unixStart);
					var sameTeacher = (blockedtime.teacherLogon === oldtime.teacherLogon);
					// if the new time matches the old time
					if(sameTime && sameTeacher) {
						output = true;
					}
				});
				
				return output;
			});

			defer.resolve(newTimes);
			
			return defer.promise();
		},
		getTeacherConf: function(teacherLogon) {
			// get the conference for this teacher from SharePoint
			var defer = $.Deferred(), self = this;
			$().SPServices({
				operation: "GetListItems",
				webURL: App.Config.Settings.conferenceList.webURL,
				async:true,
				listName: App.Config.Settings.conferenceList.listName,
				CAMLRowLimit: 1,
				CAMLQuery:"<Query><Where><In><FieldRef Name='Teachers' /><Values><Value Type='Text'>ISB\\" + teacherLogon +"</Value></Values></In></Where></Query>",
				completefunc: function (xData) {
					var conferenceArray = $(xData.responseXML).SPFilterNode("z:row").SPXmlToJson({
						includeAllAttrs: true,
						removeOws: true
					});
					if(conferenceArray.length > 0) {
						var conferenceList = self.niceifyConferences(conferenceArray);

						defer.resolve(conferenceList);
					} else {
						defer.resolve(false);
					}

				}
			});

			return defer.promise();
		},
		getMyTeacherSchedule: function(conference) {
			var defer = $.Deferred(), self = this,
				fullSchedule = [];
				
			$().SPServices({
				operation: "GetListItems",
				webURL: App.Config.Settings.reservationLists[conference.division].webURL,
				async:true,
				listName: App.Config.Settings.reservationLists[conference.division].listName,					
				CAMLQuery:"<Query><Where><In><FieldRef Name='Teachers' /><Values><Value Type='Text'>ISB\\" + Mod.Config.loggedInUser + "</Value></Values></In></Where></Query>",
				completefunc: function (xData) {
					var teacherSchedule = $(xData.responseXML).SPFilterNode("z:row").SPXmlToJson({
						includeAllAttrs: true,
						removeOws: true
					});
											
					if(teacherSchedule.length > 0) {
						_.each(teacherSchedule, function(appt) {
							var x = self.formatScheduleDates(appt);
							x.Division = conference.division;
							fullSchedule.push(x);
						});

						// if this teacher has reservations, add them to the master list
						defer.resolve(fullSchedule);
					} else {
						defer.resolve(false);
					}
				}
			});
			return defer.promise();
		},
		getTeacherSchedule: function(teachers) {
			// get all of the reservations for this/these teacher(s) in their list
			var defer = $.Deferred(),
				counter = 0,
				scheduleList = [];
			
			_.each(teachers, function(teacher) {
				// should have access to teacher.teacher1 and teacher.division				
				// query SharePoint for any reservations for this teacher
				$().SPServices({
					operation: "GetListItems",
					webURL: App.Config.Settings.reservationLists[teacher.division].webURL,
					async:true,
					listName: App.Config.Settings.reservationLists[teacher.division].listName,					
					CAMLQuery:"<Query><Where><In><FieldRef Name='Teachers' /><Values><Value Type='Text'>ISB\\" + teacher.teacher1 + "</Value></Values></In></Where></Query>",
					completefunc: function (xData) {
						var teacherSchedule = $(xData.responseXML).SPFilterNode("z:row").SPXmlToJson({
							includeAllAttrs: true,
							removeOws: true
						});
												
						if(teacherSchedule.length > 0) {
							// if this teacher has reservations, add them to the master list
							scheduleList = scheduleList.concat(teacherSchedule);
						}
						
						counter++;
						
						if(counter === teachers.length) {
							// once we've iterated through all teachers,
							// resolve the full list
							defer.resolve(scheduleList);
						}
					}
				});
			});
			
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
			
			var reservationValues = [
				["Title", x.teacherName],
				["StudentID", x.studentID],
				["StudentName", x.studentName],
				["RoomNumber", x.roomNumber],
				["StartTime", x.startTime],
				["EndTime", x.endTime],
				["FamilyCode", x.familyCode],
				["Reserver", x.reserver],
				["Teachers", teachers]
			];
			
			$().SPServices({
				operation: "UpdateListItems",
				async: false,
				webURL: App.Config.Settings.reservationLists[x.division].webURL,
				batchCmd: "New",
				listName: App.Config.Settings.reservationLists[x.division].listName,
				valuepairs: reservationValues,
				completefunc: function(xData) {
					if(xData.statusText == "OK") {
						var schedule = $(xData.responseXML).SPFilterNode("z:row").SPXmlToJson({
							includeAllAttrs: true,
							removeOws: true
						});
						var y = self.formatScheduleDates(schedule[0]);
						y.Division = x.division;
						App.Reservation.ReservingStatus = false;
						App.trigger("submit:options", "success");
						App.trigger("schedule:append", y);
						App.trigger("user:message", "successfully reserved");
					} else {
						App.trigger("submit:options", "error");
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
			var defer = $.Deferred(),
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

						if(schedule.length > 0) {
							available = false;
							defer.resolve(available);
						}
						
						counter++;
						
						if(counter === divisions.length) {
							defer.resolve(available);
						}
					}
				});
			});
			
			return defer.promise();
			// return true for available, or false
		},
		getStudentTeacherStatus: function(res) {
		// make sure teacher and student are not already reserved together
		
			// student and teacher from passed reservation
			var teacher = res.teacherLogon,
				student = res.studentID;
			
			if(teacher.indexOf("-") > 0) {
				teacher = teacher.split("-")[0];
			}
			
			// query SP division 
			var defer = $.Deferred(),
				available = true, counter = 0,
				divisions = _.keys(App.Config.Settings.reservationLists);
				
			_.each(divisions, function(division) {
				$().SPServices({
					operation: "GetListItems",
					webURL: App.Config.Settings.reservationLists[division].webURL,
					async:true,
					listName: App.Config.Settings.reservationLists[division].listName,					
					CAMLQuery:"<Query><Where><And><In><FieldRef Name='Teachers' /><Values><Value Type='Text'>ISB\\" + teacher + "</Value></Values></In><Eq><FieldRef Name='StudentID' /><Value Type='Text'>" + student + "</Value></Eq></And></Where></Query>",
					completefunc: function (xData) {
						var schedule = $(xData.responseXML).SPFilterNode("z:row").SPXmlToJson({
							includeAllAttrs: true,
							removeOws: true
						});

						if(schedule.length > 0) {
							available = false;
							defer.resolve(available);
						}
						
						counter++;
						
						if(counter === divisions.length) {
							defer.resolve(available);
						}
					}
				});
			});
			
			return defer.promise();
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
});;/*
	This is the reservation module. It has 4 pieces:
	a controller, the models, the views, and this main
	file here.
*/
ptc.module("Reservation", function(Mod, App){
	
	// used when reserving/checking reservations
	// so that the app doesn't continually check while it's checking
	Mod.ReservingStatus = false;
	
	// a holder for the reservation. gets populated along the way.
	Mod.NewReservation = {
		studentID: "",
		studentName: "",
		teacherName: "",
		teacherLogon: "",
		startTime: "",
		endTime: "",
		familyCode: "",
		currGrade: "",
		roomNumber: ""
	};
	
	// triggers
	App.on("reservation:new", function() {
		API.newReservation();
	});
	App.on("reservation:create", function() {
		API.createReservation();
	});
	App.on("students:list", function() {
		API.listStudents();
	});
	App.on("teachers:list", function(studentID) {
		API.listTeachers(studentID);
	});
	App.on("times:list", function(teacherLogon) {
		API.listTimes(teacherLogon);
	});
	App.on("submit:options", function(option) {
		API.enableSubmit(option);
	});
	
	// request handlers
	App.reqres.setHandler("reservation:availability", function(res) {
		return API.checkAvailability(res);
	});
	
	// local API, not accessible outside of this function
	var API = {
		listStudents: function() {
			// close all the other regions
			App.teacherRegion.close();
			App.timeRegion.close();
			App.submitRegion.close();
			
			// then tell the controller to list the students
			Mod.Controller.listStudents();
		},
		listTeachers: function(studentID) {
			// close some of the other regions
			App.timeRegion.close();
			App.submitRegion.close();
			
			// then tell the controller to list the teachers
			Mod.Controller.listTeachers(studentID);
		},
		listTimes: function(teacherLogon) {
			// close the submit region
			App.submitRegion.close();
			
			// then tell the controller to list all the times
			Mod.Controller.listTimes(teacherLogon);
		},
		newReservation: function() {
			// tell the controller to start a new reservation
			Mod.Controller.startNewReservation();
		},
		createReservation: function() {
			// when a reservation is submitted, set the status to true
			// this just means that the app is currently in process of reserving
			Mod.ReservingStatus = true;

			// check if possible to create a reservation
			var checkAvailability = App.request("reservation:availability", Mod.NewReservation);
			$.when(checkAvailability).done(function(status) {
				if(status === true) {
					// if so, then tell the controller to create it
					Mod.Controller.createReservation();
				} else {
					// otherwise allow reserving to happen again
					Mod.ReservingStatus = false;
				}
			});
		},
		checkAvailability: function(res) {
			// this function is passed the reservation object
			
			var defer = $.Deferred();
			
			// not available by default
			var availability = false;
			
			// see if this slot is reserved for this teacher
			var checkTeacherAvailability = App.request("data:getTeacherAvailability", res);
			$.when(checkTeacherAvailability).done(function(teacherStatus) {
				if(teacherStatus === true) {
					// if the teacher is available during that time
					// see if this student and teacher already have a reservation together
					var checkStudentTeacherStatus = App.request("data:getStudentTeacherStatus", res);
					$.when(checkStudentTeacherStatus).done(function(studentStatus) {
						if(studentStatus === true) {
							// if the student and teacher are both available, then return true
							availability = true;
							defer.resolve(availability);
						} else {
							// otherwise return false and trigger a response to the user
							availability = false;
							App.trigger("submit:options", "unavailable");
							defer.resolve(availability);
						}
					});
				} else {
					// if the teacher already has a time, then tell the user it's already booked
					App.trigger("submit:options", "doublebooked");
					defer.resolve(availability);
				}
			});			
			
			return defer.promise();
		},
		
		enableSubmit: function(option) {
			// tell the controller to enable the submit button, passing options
			Mod.Controller.enableSubmit(option);
		}
	};
	
});;/*
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
				}
			}
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
});;/*
	This is the model and collections area of the module.
	It's super simple. It just stores all the models and collections
	of the Reservation module. Notice how empty this page is? You really
	shouldn't ever need to mess with it...
*/
ptc.module("Reservation", function(Mod, App, Backbone){


	// Appointment Model and Collection ************************************
	Mod.Appt = Backbone.Model.extend({
		defaults: {
			studentID: "",
			studentName: "",
			teacherName: "",
			teacherLogon: "",
			startTime: "",
			endTime: "",
			familyCode: ""
		}
	});
	
	Mod.ApptCollection = Backbone.Collection.extend({
		model: Mod.Appt
	});
	
	
	// Student Model and Collection ****************************************
	Mod.Student = Backbone.Model.extend({
		defaults: {
			fullName: "",
			studentID: "",
			familyCode: ""
		}
	});
	
	Mod.StudentCollection = Backbone.Collection.extend({
		model: Mod.Student
	});
	
	// Teacher Model and Collection ****************************************
	Mod.Teacher = Backbone.Model.extend({
		defaults: {
			fullName: "",
			studentID: "",
			familyCode: ""
		}
	});
	
	Mod.TeacherCollection = Backbone.Collection.extend({
		model: Mod.Teacher
	});
	
	// Time Model and Collection ****************************************
	Mod.Time = Backbone.Model.extend({
		defaults: {
			startTime: "",
			endTime: ""
		}
	});
	
	Mod.TimeCollection = Backbone.Collection.extend({
		model: Mod.Time
	});

});;/*
	This is a submodule of the Reservations module. It holds all of the
	Backbone and Marionette views. They are instantiated typically
	from the controller.
*/
ptc.module("Reservation.Views", function(Mod, App, Backbone, Marionette, $){
	
	// this layout will eventually hold three other views in its regions
	Mod.Layout = Marionette.Layout.extend({
		template: "#reservationLayout",
		
		regions: {
			studentRegion: "#resStudents",
			teacherRegion: "#resTeachers",
			timeRegion: "#resTimes"
		}
	});
	
	/*
		the following five views are the views for the different
		stages of the submit area. some of them merely call a template,
		but they are kept here all together to keep things organized.
	*/
	Mod.SubmitView = Marionette.ItemView.extend({
		template: "#submitForm",
		events: {
			"click .js-submit-form": "submitFormClicked"
		},
		submitFormClicked: function(e) {
			e.preventDefault();
			// as long as the app is not reserving, then carry on
			if(App.Reservation.ReservingStatus === false) {
				App.trigger("reservation:create");
				App.trigger("submit:options", "checking");
			} else {
				App.trigger("submit:options", "checking");
			}
		}
	});
	
	Mod.SubmitChecking = Marionette.ItemView.extend({
		template: "#submitChecking",
		className: "status-res"
	});
	Mod.SubmitUnavailable = Marionette.ItemView.extend({
		template: "#submitUnavailable",
		className: "status-res"
	});
	Mod.SubmitDoubleBooked = Marionette.ItemView.extend({
		template: "#submitDoubleBooked",
		className: "status-res",
		initialize: function() {
			// while the "double booked" message is up,
			// close the time region so the parent can try again
			if(App.Data.Config.userRole === "parent") {
				App.timeRegion.close();
			}
		}
	});
	Mod.SubmitSuccess = Marionette.ItemView.extend({
		template: "#submitSuccess",
		className: "status-res",
		initialize: function() {
			// while the "success" message is up, close some regions
			if(App.Data.Config.userRole === "parent") {
				App.teacherRegion.close();
				App.timeRegion.close();
			}
		}
	});
	
	// this is a single student view. notice we set it's data-*
	// attributes on render based on the model. we use these later.
	Mod.StudentItem = Marionette.ItemView.extend({
		tagName: "option",
		className: "student",
		template: "#singleStudent",
		onRender: function() {
			$(this.el)
				.attr("data-studentid", this.model.get("StudentID"))
				.attr("data-currgrade", this.model.get("CurrentGrade"))
				.attr("data-fullname", this.model.get("StudentFullName"));
		}

	});
	
	// this is the student list view. it holds the select menu, 
	// as well as the select button. the button was implemented
	// because older browser...ahem...IE7 and IE8...don't really
	// handle the "change" event very well on select menus
	Mod.StudentList = Marionette.CompositeView.extend({
		itemViewContainer: ".student-selector",
		template: "#studentListContainer",
		className: "student-list",
		itemView: Mod.StudentItem,

		events: {
			"click button": "optionSelected",
			"click select": "closeStuff"
		},
		optionSelected: function(e) {
			e.preventDefault();
			var x = $(e.currentTarget).siblings(".student-selector");
			if(!x.val() || x.val() == 0) {
				this.closeStuff();
			} else {
				var studentID = $(x).find(":selected").data("studentid");
				var studentName = $(x).find(":selected").data("fullname");
				var currGrade = $(x).find(":selected").data("currgrade");
				// set properties of our temporary reservation object
				App.Reservation.NewReservation.reserver = App.Data.Config.loggedInUser;
				App.Reservation.NewReservation.currGrade = currGrade;
				App.Reservation.NewReservation.studentID = studentID;
				App.Reservation.NewReservation.studentName = studentName;
				// list teachers once the student is selected
				App.trigger("teachers:list", studentID);
			}
		},
		closeStuff: function() {
			// when a student is selected, we should close any
			// remaining regions that were previously opened for other students
			App.teacherRegion.close();
			App.timeRegion.close();
			App.submitRegion.close();
		}
	});
	
	// a single teacher view. notice that on render we perform a little logic
	// to set the data-* of the teacher and their details
	Mod.TeacherItem = Marionette.ItemView.extend({
		tagName: "option",
		className: "teacher",
		template: "#singleTeacher",
				
		onRender: function() {
			if(this.model.get("teacher2")) {
				var teacherLogon = this.model.get("teacher1") + "-" + this.model.get("teacher2");
				$(this.el).attr("data-teacherlogon", teacherLogon);
			} else {
				$(this.el).attr("data-teacherlogon", this.model.get("teacher1"));
			}
			$(this.el).attr("data-roomnumber", this.model.get("roomNumber"));
			$(this.el).attr("data-division", this.model.get("division"));
		}

	});
	
	// the view that holds the list of teachers and the select button
	Mod.TeacherList = Marionette.CompositeView.extend({
		itemViewContainer: ".teacher-selector",
		template: "#teacherListContainer",
		className: "teacher-list",
		itemView: Mod.TeacherItem,
		
		events: {
			"click button": "optionSelected",
			"click select": "closeStuff"
		},
		optionSelected: function(e) {
			e.preventDefault();
			var x = $(e.currentTarget).siblings(".teacher-selector");
			if(!x.val() || x.val() == 0) {
				this.closeStuff();
			} else {
				var teacherLogon = $(x).find(":selected").data("teacherlogon");
				var roomNumber = $(x).find(":selected").data("roomnumber");
				var division = $(x).find(":selected").data("division");
				var teacherName = $(x).find(":selected").val();
				// set variables on our temporary reservation object
				App.Reservation.NewReservation.teacherName = teacherName;
				App.Reservation.NewReservation.teacherLogon = teacherLogon;
				App.Reservation.NewReservation.roomNumber = roomNumber;
				App.Reservation.NewReservation.division = division;
				
				// list the times menu when a teacher is selected
				App.trigger("times:list", teacherLogon.split("-")[0]);
			}
		},
		closeStuff: function() {
			App.timeRegion.close();
			App.submitRegion.close();
		}
		
	});	
	
	// single time item view. we store the unix date in data-* attributes
	Mod.TimeItem = Marionette.ItemView.extend({
		tagName: "option",
		className: "time",
		template: "#singleTimeSlot",
		
		onRender: function() {
			// set data att
			$(this.el)
				.attr("data-start", this.model.get("unixStart"))
				.attr("data-end", this.model.get("unixEnd"));
		}
	});
	
	// the list of times and the select button
	Mod.TimeList = Marionette.CompositeView.extend({
		itemViewContainer: ".time-selector",
		template: "#timeListContainer",
		className: "time-list",
		itemView: Mod.TimeItem,
		
		events: {
			"click button": "optionSelected",
			"click select": "closeStuff"
		},
		optionSelected: function(e) {
			e.preventDefault();
			var x = $(e.currentTarget).siblings(".time-selector");
			if(!x.val() || x.val() == 0) {
				this.closeStuff();
			} else {
				var startTime = $(x).find(":selected").data("start");
				var endTime = $(x).find(":selected").data("end");
				// set variables of our temporary reservation object
				App.Reservation.NewReservation.startTime = startTime;
				App.Reservation.NewReservation.endTime = endTime;
				
				// show the submit button
				App.trigger("submit:options", "submit");
			}
		},
		closeStuff: function() {
			App.submitRegion.close();
		}
		
	});	
});;/*
	This is the Schedule module. It's pretty basic,
	and involves some basic Backbone and Marionette juggling.
*/
ptc.module("Schedule", function(Mod, App){

	App.on("schedule:listAppts", function() {
		API.showSchedule();
	});
	App.on("schedule:appt:delete", function(appt) {
		API.deleteAppt(appt);
	});
	
	App.on("schedule:append", function(data) {
		API.appendAppt(data);
	});
	
	// local API only availabl in this function
	// accessed by the triggers in this module.
	var API = {
		showSchedule: function() {
			Mod.Controller.showSchedule();
		},
		deleteAppt: function(appt) {
			Mod.Controller.deleteAppt(appt);
		},
		appendAppt: function(data) {
			// instantiate a new model of the passed appointment data
			var appt = new Mod.Appt(data);
			// trigger a collection.add() with this model
			App.trigger("schedule:collection:add", appt);
		}
	};
	
});;/*
	Again, a super basic piece of the Schedule module.
*/
ptc.module("Schedule", function(Mod, App){

	Mod.Controller = {
		showSchedule: function() {
			// instantiate a new collection from the stored schedule
			// and put it in a view.
			var data = new Mod.ApptCollection(App.Data.Config.schedule),
				scheduleView = new Mod.View.ApptList({
					collection: data
				});
			// when a model is added to the collection, add it to the collection
			App.on("schedule:collection:add", function(model) {
				data.add(model);
			});
			// show view in schedule region
			App.scheduleRegion.show(scheduleView);
		},
		deleteAppt: function(appt) {
			// just trigger the delete on the data module
			App.trigger("data:reservation:delete", appt);
		}
	};
	
});;/*
	Super basic model/collection of the Schedule module.
*/
ptc.module("Schedule", function(Mod, App, Backbone){

	// Model and Collection **********************************************
	Mod.Appt = Backbone.Model.extend({
		defaults: {
			studentName: "",
			teacher: "",
			time: "",
			room: ""
		}
	});
	
	Mod.ApptCollection = Backbone.Collection.extend({
		model: Mod.Appt,
		comparator: function (model) {
			// sorts our collection by its start time
            return model.get("StartTime");
        }
	});

});;/*
	This is the View submodule of the Schedule module.
	It handles just the appointment single view, and its
	list view. These views are instantiated in the controller.
*/
ptc.module("Schedule.View", function(Mod, App, Backbone, Marionette){
	
	Mod.ApptItem = Marionette.ItemView.extend({
		tagName: "li",
		className: "appt",
		template: "#scheduleApptSingle",
		
		events: {
			"click a.js-delete-appt": "deleteClicked"
		},
		
		deleteClicked: function(e) {
			e.preventDefault();
			// first, check if the deleter is also the reserver :)
			if(this.model.get("Reserver") === App.Data.Config.loggedInUser) {
				// trigger a delete on the server
				App.trigger("schedule:appt:delete", this.model);
				// then remove it from the list
				this.remove();
			} else {
				alert("Sorry, you cannot delete reservations you did not create");
			}
		}
	});
	Mod.ApptList = Marionette.CollectionView.extend({
		tagName: "ul",
		className: "appt-schedule",
		itemView: Mod.ApptItem,
		appendHtml: function(collectionView, itemView, index){
			// puts a new model into the collection view in sort order
			var childrenContainer = $(collectionView.childrenContainer || collectionView.el);
			var children = childrenContainer.children();
			if (children.size() === index) {
				childrenContainer.append(itemView.el);
			} else {
				childrenContainer.children().eq(index).before(itemView.el);
			}
		}
	});
	
});;// as simple as that...start the app
$(function() {
	ptc.start();
});