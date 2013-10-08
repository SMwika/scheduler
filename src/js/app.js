// change underscore to use {{ }}
_.templateSettings = {
    interpolate: /\{\{([\s\S]+?)\}\}/g
};

// make the regions slide down as they open - fancy fancy!
Marionette.Region.prototype.open = function(view){
	this.$el.hide();
	this.$el.html(view.el);
	this.$el.slideDown("medium");
};

// just a method to check if an object has a property
Object.prototype.hasOwnProperty = function(property) {
	return this[property] !== undefined;
};

// create the marionette app
var ptc = new Marionette.Application();

// add regions to the app for displaying data
ptc.addRegions({
    studentRegion: "#studentRegion",
    teacherRegion: "#teacherRegion",
    timeRegion: "#timeRegion",
	submitRegion: "#submitRegion",
	
    scheduleRegion: "#scheduleRegion"
});

// when the app runs for the first time, do this stuff
ptc.on("initialize:after", function () {
	
	// generate the time stored in app-config.js
	ptc.trigger("times:generate");
	
	// get the initial set of data (a big function)
	var datafetch = ptc.request("data:getinitial");
	$.when(datafetch).done(function(data){
		console.log(data);
		// when all data has been fetched, tell the user
		ptc.trigger("user:message", "successfully retrieved all data");
		
		// then begin to list the schedule and show the reservation form
		ptc.trigger("schedule:listAppts");
		ptc.trigger("reservation:new");
	});
});
