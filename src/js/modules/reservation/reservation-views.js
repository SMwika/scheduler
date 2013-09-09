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
		
		events: {
		//	"click a.js-show-teachers": "showTeachersClicked"
		},
		
		showTeachersClicked: function(e) {
			e.preventDefault();
		}
	});
	Mod.TeacherList = Marionette.CollectionView.extend({
		tagName: "select",
		className: "teacher-list",
		itemView: Mod.TeacherItem,
		onRender: function() {
			this.$el.prepend("<option></option>");
		}
	});	
});