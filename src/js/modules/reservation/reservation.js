/*
	This is the reservation module. It has 4 pieces:
	a controller, the models, the views, and this main
	file here.
*/
ptc.module("Reservation", function(Mod, App){
	
	// used when reserving/checking reservations
	// so that the app doesn't continually check while it's checking
	Mod.ReservingStatus = false;
	
	// a holder for the reservation. gets populated along the way.
	Mod.NewReservation = {
		studentID: "",
		studentName: "",
		teacherName: "",
		teacherLogon: "",
		startTime: "",
		endTime: "",
		familyCode: "",
		currGrade: "",
		roomNumber: ""
	};
	
	// triggers
	App.on("reservation:new", function() {
		API.newReservation();
	});
	App.on("reservation:create", function() {
		API.createReservation();
	});
	App.on("students:list", function() {
		API.listStudents();
	});
	App.on("teachers:list", function(studentID) {
		API.listTeachers(studentID);
	});
	App.on("times:list", function(teacherLogon) {
		API.listTimes(teacherLogon);
	});
	App.on("submit:options", function(option) {
		API.enableSubmit(option);
	});
	
	// request handlers
	App.reqres.setHandler("reservation:availability", function(res) {
		return API.checkAvailability(res);
	});
	
	// local API, not accessible outside of this function
	var API = {
		listStudents: function() {
			// close all the other regions
			App.teacherRegion.close();
			App.timeRegion.close();
			App.submitRegion.close();
			
			// then tell the controller to list the students
			Mod.Controller.listStudents();
		},
		listTeachers: function(studentID) {
			// close some of the other regions
			App.timeRegion.close();
			App.submitRegion.close();
			
			// then tell the controller to list the teachers
			Mod.Controller.listTeachers(studentID);
		},
		listTimes: function(teacherLogon) {
			// close the submit region
			App.submitRegion.close();
			
			// then tell the controller to list all the times
			Mod.Controller.listTimes(teacherLogon);
		},
		newReservation: function() {
			// tell the controller to start a new reservation
			Mod.Controller.startNewReservation();
		},
		createReservation: function() {
			// when a reservation is submitted, set the status to true
			// this just means that the app is currently in process of reserving
			Mod.ReservingStatus = true;

			// check if possible to create a reservation
			var checkAvailability = App.request("reservation:availability", Mod.NewReservation);
			$.when(checkAvailability).done(function(status) {
				if(status === true) {
					// if so, then tell the controller to create it
					Mod.Controller.createReservation();
				} else {
					// otherwise allow reserving to happen again
					Mod.ReservingStatus = false;
				}
			});
		},
		checkAvailability: function(res) {
			// this function is passed the reservation object
			
			var defer = $.Deferred();
			
			// not available by default
			var availability = false;
			
			// see if this slot is reserved for this teacher
			var checkTeacherAvailability = App.request("data:getTeacherAvailability", res);
			$.when(checkTeacherAvailability).done(function(teacherStatus) {
				if(teacherStatus === true) {
					// if the teacher is available during that time
					// see if this student and teacher already have a reservation together
					var checkStudentTeacherStatus = App.request("data:getStudentTeacherStatus", res);
					$.when(checkStudentTeacherStatus).done(function(studentStatus) {
						if(studentStatus === true) {
							// if the student and teacher are both available, then return true
							availability = true;
							defer.resolve(availability);
						} else {
							// otherwise return false and trigger a response to the user
							availability = false;
							App.trigger("submit:options", "unavailable");
							defer.resolve(availability);
						}
					});
				} else {
					// if the teacher already has a time, then tell the user it's already booked
					App.trigger("submit:options", "doublebooked");
					defer.resolve(availability);
				}
			});			
			
			return defer.promise();
		},
		
		enableSubmit: function(option) {
			// tell the controller to enable the submit button, passing options
			Mod.Controller.enableSubmit(option);
		}
	};
	
});