// change underscore to use {{ }}
_.templateSettings = {
    interpolate: /\{\{([\s\S]+?)\}\}/g
};


// create app
var ptc = new Marionette.Application();

// add regions to app for displaying data
ptc.addRegions({
    studentRegion: "#studentRegion",
    teacherRegion: "#teacherRegion",
    timeRegion: "#timeRegion",
	submitRegion: "#submitRegion",
	
    scheduleRegion: "#scheduleRegion",
    extraRegion: "#extraRegion"
});

ptc.on("initialize:after", function () {
	ptc.trigger("times:generate");
	var datafetch = ptc.request("data:getinitial");
	$.when(datafetch).done(function(){
		ptc.trigger("user:message", "successfully retrieved all data");
		ptc.trigger("schedule:listAppts");
		ptc.trigger("reservation:new");
	});
});
