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

});