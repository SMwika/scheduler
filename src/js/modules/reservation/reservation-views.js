/*
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
});