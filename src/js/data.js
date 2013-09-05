var app = app || {};

app.data.Controller = {
	
	getLoggedInUser: function() {
	
		// set the user as the global user
		var user = app.globalConfig.loggedInUser;
		
		// check if the user is, in fact, set
		if(!user || user == 0) {
		
			// function to get the logged in user
			
		}
	},
	
	getStudents: function() {
		var self = this,
			user = self.getLoggedInUser;
	}
	
};