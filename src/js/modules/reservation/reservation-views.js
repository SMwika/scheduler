ptc.module("Reservation.Views", function(Mod, App, Backbone, Marionette, $){
	
	Mod.Layout = Marionette.Layout.extend({
		template: "#reservationLayout",
		
		regions: {
			studentRegion: "#resStudents",
			teacherRegion: "#resTeachers",
			timeRegion: "#resTimes"
		}
	});
	
	Mod.SubmitView = Marionette.ItemView.extend({
		template: "#submitForm",
		events: {
			"click .js-submit-form": "submitFormClicked"
		},
		submitFormClicked: function(e) {
			e.preventDefault();
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
			if(App.Data.Config.userRole === "parent") {
				App.timeRegion.close();
			}
		}
	});
	Mod.SubmitSuccess = Marionette.ItemView.extend({
		template: "#submitSuccess",
		className: "status-res",
		initialize: function() {
			if(App.Data.Config.userRole === "parent") {
				App.teacherRegion.close();
				App.timeRegion.close();
			}
		}
	});
	
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
				App.Reservation.NewReservation.reserver = App.Data.Config.loggedInUser;
				App.Reservation.NewReservation.currGrade = currGrade;
				App.Reservation.NewReservation.studentID = studentID;
				App.Reservation.NewReservation.studentName = studentName;
				App.trigger("teachers:list", studentID);
			}
		},
		closeStuff: function() {
			App.teacherRegion.close();
			App.timeRegion.close();
			App.submitRegion.close();
		}
	});
	
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
				App.Reservation.NewReservation.teacherName = teacherName;
				App.Reservation.NewReservation.teacherLogon = teacherLogon;
				App.Reservation.NewReservation.roomNumber = roomNumber;
				App.Reservation.NewReservation.division = division;
				App.trigger("times:list", teacherLogon);
			}
		},
		closeStuff: function() {
			App.timeRegion.close();
			App.submitRegion.close();
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
				App.Reservation.NewReservation.startTime = startTime;
				App.Reservation.NewReservation.endTime = endTime;
				
				App.trigger("submit:options", "submit");
			}
		},
		closeStuff: function() {
			App.submitRegion.close();
		}
		
	});	
});