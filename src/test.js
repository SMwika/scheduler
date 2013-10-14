// get all conferences
var stuff = [];
$().SPServices({
	operation: "GetListItems",
	webURL: "https://g.isb.bj.edu.cn/test/conferencing",
	async:false,
	listName: "ReservationsES",
	completefunc: function (xData) {
		var x = $(xData.responseXML).SPFilterNode("z:row").SPXmlToJson({
			includeAllAttrs: true,
			removeOws: true
		});
		stuff = stuff.concat(x);
	}
});
$().SPServices({
	operation: "GetListItems",
	webURL: "https://g.isb.bj.edu.cn/test/conferencing",
	async:false,
	listName: "ReservationsMS",
	completefunc: function (xData) {
		var x = $(xData.responseXML).SPFilterNode("z:row").SPXmlToJson({
			includeAllAttrs: true,
			removeOws: true
		});
		stuff = stuff.concat(x);
	}
});
$().SPServices({
	operation: "GetListItems",
	webURL: "https://g.isb.bj.edu.cn/test/conferencing",
	async:false,
	listName: "ReservationsHS",
	completefunc: function (xData) {
		var x = $(xData.responseXML).SPFilterNode("z:row").SPXmlToJson({
			includeAllAttrs: true,
			removeOws: true
		});
		stuff = stuff.concat(x);
	}
});

//Group by StartTime
var bytime = _.groupBy(stuff, function(item){
	return item.Teachers;
});

// sort by time
_.each(bytime, function(time, i){
		$("body").append("<strong>" + i.split("\\")[1] + "</strong><br/>");
var sortedtimes = _.sortBy(time, function(t) {return t.StartTime});
		_.each(sortedtimes, function(reservation) {
			var x = moment.unix(reservation.StartTime).zone("+08:00").format("ddd D MMM H:mm");
			if(reservation.StudentName.length > 1) {
				$("body").append("&nbsp;&nbsp;" + reservation.StudentName + " at " + x + "<br/>");
			} else {
				$("body").append("&nbsp;&nbsp;<span style='color:#999;'>blocked (" + x + "</span><br/>");	
			}
		});
});


//Group by StartTime
var bytime = _.groupBy(stuff, function(item){
	return item.StartTime;
});

// sort by time
_.each(bytime, function(time, i){
				var x = moment.unix(i).zone("+08:00").format("ddd D MMM H:mm");
	$("body").append("<strong>" + x + "</strong><br/>");
var sortedtimes = _.sortBy(time, function(t) {return t.Teachers.split("\\")[1]});
		_.each(sortedtimes, function(reservation) {
				$("body").append(reservation.Teachers.split("\\")[1] + "<br/>");	
		});
});