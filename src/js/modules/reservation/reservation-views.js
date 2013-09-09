ptc.module('Reservation.Views', function(Mod, App, Backbone, Marionette, $, _){
	
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
		tagName: "li",
		className: "student",
		template: "#singleStudent",
		
		events: {
			"click a.js-show-teachers": "showTeachersClicked"
		},
		
		showTeachersClicked: function(e) {
			e.preventDefault();
			App.trigger("teachers:list", this.model.get("studentID"));
		}
	});
	Mod.StudentList = Marionette.CollectionView.extend({
		tagName: "ul",
		className: "student-list",
		itemView: Mod.StudentItem
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
			var teacherLogon = $(e.target).find(":selected").data("teacherlogon");
			var teacherName = $(e.target).find(":selected").val();
			App.Reservation.NewReservation.teacherName = teacherName;
			App.trigger("times:list", teacherLogon);
		}
		
	});	
	
	
	Mod.TimeItem = Marionette.ItemView.extend({
		tagName: "option",
		className: "time",
		template: "#singleTimeSlot",
		
		onRender: function() {
			$(this.el)
				.attr("data-start", this.model.get("startTime"))
				.attr("data-end", this.model.get("endTime"));
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
			var startTime = $(e.target).find(":selected").data("start");
			var endTime = $(e.target).find(":selected").data("end");
			console.log(startTime, endTime);
			App.Reservation.NewReservation.startTime = startTime;
			App.Reservation.NewReservation.endTime = endTime;
			
			App.trigger("submit:enable");
		}
		
	});	
});