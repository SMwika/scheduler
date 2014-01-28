ptc.module("Config", function (Mod, App, Backbone, Marionette, $) {

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
		
		// only the students in the following grades will be shown
		gradeFilter: ["EC3", "EC4", "KG", "01", "02", "03", "04", "05"],

		overrides: {
			// exclusions are processed first
			exclusions: ["(ASA)", "(MSE)","hanichowski(Homeroom)", "mskinner(Homeroom)","fpanych(Homeroom)","scoe(Homeroom)","ehillmann(Homeroom)","GRussell(Homeroom)","bjogi(Homeroom)","jbinns(Homeroom)","breverman(Homeroom)","boreilly(Homeroom)","jkinsella(Homeroom)","DMonroe(Homeroom)","jmcroberts(Homeroom)","drussell(Homeroom)","mdawson(Homeroom)","gloynes(Homeroom)"],
			
			// then inclusions override any exclusions
			inclusions: ["aflores"]
		},
		
		timeSlots: [{
			category: "ES",
			duration: 20, // conference duration in minutes
			padding:10, // minutes after a conference where no bookings can be made
			override: true, // scripts will use the dates array as-is, no time generation
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
			override: false,
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
			override: false,
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

});