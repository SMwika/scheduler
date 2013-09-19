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
			App.trigger("reservation:create");
		}
	});
	
	Mod.StudentItem = Marionette.ItemView.extend({
		tagName: "option",
		className: "student",
		template: "#singleStudent",
		onRender: function() {
			$(this.el)
				.attr("data-studentid", this.model.get("StudentID"))
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
			$(this.el).attr("data-roomNumber", this.model.get("roomNumber"));
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
				var teacherName = $(e.target).find(":selected").val();
				App.Reservation.NewReservation.teacherName = teacherName;
				App.Reservation.NewReservation.teacherLogon = teacherLogon;
				App.Reservation.NewReservation.roomNumber = roomNumber;
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