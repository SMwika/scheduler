/*!
 scheduler Build version 0.0.1, 09-18-2013
*/
$(function () {
    
    var i, z, 
        rawTmpls = [
			"loading",
			"scheduleApptSingle",
			"singleStudent",
			"singleTeacher",
			"singleTimeSlot",
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


// create app
var ptc = new Marionette.Application();

// add regions to app for displaying data
ptc.addRegions({
    studentRegion: "#studentRegion",
    teacherRegion: "#teacherRegion",
    timeRegion: "#timeRegion",
	submitRegion: "#submitRegion",
	
    scheduleRegion: "#scheduleRegion",
    extraRegion: "#extraRegion"
});

ptc.on("initialize:after", function () {
	ptc.trigger("times:generate");
	var datafetch = ptc.request("data:getinitial");
	$.when(datafetch).done(function(){
		ptc.trigger("user:message", "successfully retrieved all data");
		ptc.trigger("schedule:listAppts");
		ptc.trigger("reservation:new");
	});
});
;ptc.module("Config", function (Mod, App, Backbone, Marionette, $) {

	// set these settings on a per-conference basis
	Mod.Settings = {
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
		timeSlots: [{
			category: "ES",
			duration: 20, // conference duration in minutes
			padding:10, // minutes after a conference where no bookings can be made
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
			padding: 0, // minutes after a conference where no bookings can be made
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
			padding: 0, // minutes after a conference where no bookings can be made
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
	}

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
			
			var defer = $.Deferred();
			
			var user = App.request("user:getloggedin");
			$.when(user).done(function(userLogon) {
				
				App.trigger("user:message", "get logged in user");
				
				Mod.Config.loggedInUser = userLogon;

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
							
							var times = App.request("teacher:gettimes", conferenceList);
							$.when(times).done(function(timeList) {
								App.trigger("user:message", "get available time slots");
								
								Mod.Config.times = timeList;
								
								defer.resolve();
							});
						});

					});
				});
			});
			return defer.promise();
		}
	};
});;ptc.module("Data", function (Mod, App, Backbone, Marionette, $) {

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
				i, inQuery,
				listLength = studentList.length,
				studentList = [], teacherList = [];

			// for each teacher that we have
			for(i = 0; i < listLength; i++) {
				inQuery += "<Value Type='Text'>" + studentList[i].studentID + "</Value>";
			}
			
			$().SPServices({
				operation: "GetListItems",
				webURL: App.Config.Settings.studentTeacherList.webURL,
				async:true,
				listName: App.Config.Settings.studentTeacherList.listName,
				CAMLQuery:"<Query><Where><In><FieldRef Name='StudentID' /><Values>" + inQuery +"</Values></In></Where></Query>",
				completefunc: function (xData, Status) {
					var studentArray = $(xData.responseXML).SPFilterNode("z:row").SPXmlToJson({
						includeAllAttrs: true,
						removeOws: true
					});
					
					if(studentArray) {
						_.each(studentArray, function(student) {
							studentList.push({
								studentID: student.StudentID,
								teachers: student.NameValues,
							});
						});
						
						_.each(studentList, function(record) {
							var teachers = record.teachers.split(";");
							_.each(teachers, function(teacher) {
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
			}
			return defer.promise();
		},
		
		getConferences: function(teacherList) {
			var defer = $.Deferred(),
				i, list = teacherList, listLength = list.length,
				counter = 0, conferenceList = [], student,
				inQuery = "";

			// for each teacher that we have
			for(i = 0; i < listLength; i++) {
				inQuery += "<Value Type='Text'>" + list[i].teacherLogon + "</Value>";
			}
			$().SPServices({
				operation: "GetListItems",
				webURL: App.Config.Settings.conferenceList.webURL,
				async:true,
				listName: App.Config.Settings.conferenceList.listName,
				CAMLQuery:"<Query><Where><In><FieldRef Name='TeacherLogon' /><Values>" + inQuery +"</Values></In></Where></Query>",
				completefunc: function (xData, Status) {
					var conferenceArray = $(xData.responseXML).SPFilterNode("z:row").SPXmlToJson({
						includeAllAttrs: true,
						removeOws: true
					});
					
					_.each(conferenceArray, function(conference) {
						conferenceList.push({
							conferenceName: conference.Title,
							division: conference.Division,
							room: conference.Room,
							teacherLogon: conference.TeacherLogon
						});
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
});;ptc.module("Reservation", function(Mod, App){
	
	Mod.NewReservation = {
		studentID: "",
		studentName: "",
		teacherName: "",
		teacherLogon: "",
		startTime: "",
		endTime: "",
		familyCode: ""
	};
	
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
	App.on("submit:enable", function() {
		API.enableSubmit();
	});
	
	var API = {
		listStudents: function() {
			App.teacherRegion.close();
			App.timeRegion.close();
			App.submitRegion.close();
			Mod.Controller.listStudents();
		},
		listTeachers: function(studentID) {
			App.timeRegion.close();
			App.submitRegion.close();
			Mod.Controller.listTeachers(studentID);
		},
		listTimes: function(teacherLogon) {
			App.submitRegion.close();
			Mod.Controller.listTimes(teacherLogon);
		},
		newReservation: function() {
			Mod.Controller.startNewReservation();
		},
		createReservation: function() {
			Mod.Controller.createReservation();
		},
		enableSubmit: function() {
			Mod.Controller.enableSubmit();
		}
	};
	
});;ptc.module("Reservation", function(Mod, App, Backbone, Marionette, $, _){

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
	
});;ptc.module("Reservation", function(Mod, App, Backbone){

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

});;ptc.module("Reservation.Views", function(Mod, App, Backbone, Marionette, $){
	
	Mod.Layout = Marionette.Layout.extend({
		template: "#reservationLayout",
		
		regions: {
			studentRegion: "#resStudents",
			teacherRegion: "#resTeachers",
			timeRegion: "#resTimes",
		},
		
		events: {
			"click button": "buttonClicked"
		},
		
		buttonClicked: function(e) {
			e.preventDefault();
			console.log("clicked!");
		}
	});
	
	Mod.StudentItem = Marionette.ItemView.extend({
		tagName: "option",
		className: "student",
		template: "#singleStudent",
		onRender: function() {
			$(this.el)
				.attr("data-studentid", "ID" + this.model.get("StudentID"))
				.attr("data-fullname", this.model.get("StudentFullName"));
		}

	});
	Mod.StudentList = Marionette.CollectionView.extend({
		tagName: "select",
		className: "student-list",
		itemView: Mod.StudentItem,
		onRender: function() {
			this.$el.prepend("<option></option>");
		},
		events: {
			"change": "optionSelected"
		},
		optionSelected: function(e) {
			if(!e.target.value || e.target.value == 0) {
				console.log("no name selected");
				App.teacherRegion.close();
				App.timeRegion.close();
				App.submitRegion.close();
			} else {
				var studentID = $(e.target).find(":selected").data("studentid");
				var studentName = $(e.target).find(":selected").data("fullname");
				studentID = studentID.substr(2);
				App.Reservation.NewReservation.studentID = studentID;
				App.Reservation.NewReservation.studentName = studentName;
				App.trigger("teachers:list", studentID);
			}
		}
	});
	
	Mod.TeacherItem = Marionette.ItemView.extend({
		tagName: "option",
		className: "teacher",
		template: "#singleTeacher",
				
		onRender: function() {
			$(this.el).attr("data-teacherlogon", this.model.get("teacherLogon"));
		}

	});
	Mod.TeacherList = Marionette.CollectionView.extend({
		tagName: "select",
		className: "teacher-list",
		itemView: Mod.TeacherItem,
		onRender: function() {
			this.$el.prepend("<option></option>");
		},
		events: {
			"change": "optionSelected"
		},
		optionSelected: function(e) {
			if(!e.target.value || e.target.value == 0) {
				console.log("no name selected");
				App.timeRegion.close();
				App.submitRegion.close();
			} else {
				var teacherLogon = $(e.target).find(":selected").data("teacherlogon");
				var teacherName = $(e.target).find(":selected").val();
				App.Reservation.NewReservation.teacherName = teacherName;
				App.Reservation.NewReservation.teacherLogon = teacherLogon;
				App.trigger("times:list", teacherLogon);
			}
		}
		
	});	
	
	
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
	Mod.TimeList = Marionette.CollectionView.extend({
		tagName: "select",
		className: "time-list",
		itemView: Mod.TimeItem,
		onRender: function() {
			this.$el.prepend("<option></option>");
		},
		events: {
			"change": "optionSelected"
		},
		optionSelected: function(e) {
			if(!e.target.value || e.target.value == 0) {
				console.log("no name selected");
				App.submitRegion.close();
			} else {
				var startTime = $(e.target).find(":selected").data("start");
				var endTime = $(e.target).find(":selected").data("end");
				App.Reservation.NewReservation.startTime = startTime;
				App.Reservation.NewReservation.endTime = endTime;
				
				App.trigger("submit:enable");
			}
		}
		
	});	
});;ptc.module("Schedule", function(Mod, App){

	App.on("schedule:listAppts", function() {
		API.showSchedule();
	});
	App.on("schedule:appt:delete", function(appt) {
		API.deleteAppt(appt);
	});
	
	
	var API = {
		showSchedule: function() {
			Mod.Controller.showSchedule();
		},
		deleteAppt: function(appt) {
			Mod.Controller.deleteAppt(appt);
		}
	};
	
});;ptc.module("Schedule", function(Mod, App){

	Mod.Controller = {
		showSchedule: function() {
			var data = new Mod.ApptCollection(App.Data.Config.schedule);
			var scheduleView = new Mod.View.ApptList({
				collection: data
			});
			// show view in schedule region
			App.scheduleRegion.show(scheduleView);
		},
		deleteAppt: function(appt) {
			appt.destroy({
				success: function() {
					console.log("deleted");
				},
				error: function() {
					console.log("error destroying the event");
				}
			});
		}
	};
	
});;ptc.module("Schedule", function(Mod, App, Backbone){

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
		model: Mod.Appt
	});

});;ptc.module("Schedule.View", function(Mod, App, Backbone, Marionette){
	
	Mod.ApptItem = Marionette.ItemView.extend({
		tagName: "li",
		className: "appt",
		template: "#scheduleApptSingle",
		
		events: {
			"click a.js-delete-appt": "deleteClicked"
		},
		
		deleteClicked: function(e) {
			e.preventDefault();
			App.trigger("schedule:appt:delete", this.model);
		}
	});
	Mod.ApptList = Marionette.CollectionView.extend({
		tagName: "ul",
		className: "appt-schedule",
		itemView: Mod.ApptItem
	});
	
});;$(function() {
	ptc.start();
});