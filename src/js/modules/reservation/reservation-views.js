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
	
	
});