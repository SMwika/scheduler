// change underscore to use {{ }}
_.templateSettings = {
    interpolate: /\{\{([\s\S]+?)\}\}/g
};

Marionette.Region.prototype.open = function(view){
	this.$el.hide();
	this.$el.html(view.el);
	this.$el.slideDown("fast");
};

// create app
var ptc = new Marionette.Application();

// add regions to app for displaying data
ptc.addRegions({
    studentRegion: "#studentRegion",
    teacherRegion: "#teacherRegion",
    timeRegion: "#timeRegion",
	submitRegion: "#submitRegion",
	
    scheduleRegion: "#scheduleRegion"
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
