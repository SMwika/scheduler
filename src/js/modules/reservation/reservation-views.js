ptc.module("Reservation.Views", function(Mod, App, Backbone, Marionette, $){
	
	Mod.Layout = Marionette.Layout.extend({
		template: "#reservationLayout",
		
		regions: {
			studentRegion: "#resStudents",
			teacherRegion: "#resTeachers",
			timeRegion: "#resTimes",
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
			} else {
				console.log("checking");
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
				var currGrade = $(e.target).find(":selected").data("currgrade");
				App.Reservation.NewReservation.currGrade = currGrade;
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
				var roomNumber = $(e.target).find(":selected").data("roomnumber");
				var division = $(e.target).find(":selected").data("division");
				var teacherName = $(e.target).find(":selected").val();
				App.Reservation.NewReservation.teacherName = teacherName;
				App.Reservation.NewReservation.teacherLogon = teacherLogon;
				App.Reservation.NewReservation.roomNumber = roomNumber;
				App.Reservation.NewReservation.division = division;
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
});