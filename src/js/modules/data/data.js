ptc.module("Data", function(Mod, App, Backbone, Marionette, $, _){
	
	// global config area to store 'session'-level data
	Mod.Config = {
		loggedInUser: "Rhonda.Norris",
		students: [
			{firstName: "Ben", lastName: "Tedder"},
			{firstName: "Daniel", lastName: "Tedder"}
		]
	};
	

	// data endpoints/requests
	App.reqres.setHandler("user:getloggedin", function() {
		return API.getLoggedInUser();
	});
	App.reqres.setHandler("user:getstudents", function() {
		return API.getStudents();
	});
	App.reqres.setHandler("student:getteachers", function(student) {
		return API.getTeachers(student);
	});
	App.reqres.setHandler("teacher:gettimes", function(teacher) {
		return API.getTimes(teacher);
	});

	
	// local controller that manages data requests
	var API = {
		getLoggedInUser: function() {
			var user = Mod.Config.loggedInUser;
			
			// check if the user is, in fact, set
			if(!user || user == 0) {
				// function to get the logged in user
				user = ""
			}
			return user;
		},
		
		getStudents: function() {
			var self = this,
				studentList = [],
				user = App.request("user:getloggedin");
				
			studentList = ["ben", "daniel"];
			Mod.Config.students = studentList;
		},
		
		getTeachers: function(student) {
			console.log("teachers of " + student);
		},
		
		getTimes: function(teacher) {
			console.log("times for " + teacher);
		}
	}
	
});