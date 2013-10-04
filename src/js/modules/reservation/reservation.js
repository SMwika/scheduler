ptc.module("Reservation", function(Mod, App){
	
	// used when reserving/checking reservations
	// so that the app doesn't continually check
	Mod.ReservingStatus = false;
	
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
	
	App.reqres.setHandler("reservation:availability", function(res) {
		return API.checkAvailability(res);
	});
	
	var API = {
		listStudents: function() {
			App.teacherRegion.close();
			App.timeRegion.close();
			App.submitRegion.close();
			Mod.Controller.listStudents();
		},
		listTeachers: function(studentID) {
			App.timeRegion.close();
			App.submitRegion.close();
			Mod.Controller.listTeachers(studentID);
		},
		listTimes: function(teacherLogon) {
			App.submitRegion.close();
			Mod.Controller.listTimes(teacherLogon);
		},
		newReservation: function() {
			Mod.Controller.startNewReservation();
		},
		createReservation: function() {
			Mod.ReservingStatus = true;

			// check if possible to create a reservation
			var checkAvailability = App.request("reservation:availability", Mod.NewReservation);
			$.when(checkAvailability).done(function(status) {
				// if so, then create it
				if(status === true) {
					Mod.Controller.createReservation();
				} else {
					Mod.ReservingStatus = false;
				}
			});
		},
		checkAvailability: function(res) {
		
			
			var defer = $.Deferred();
			
			// not available by default
			var availability = false;
			
			// see if this slot is reserved for this teacher
			var checkTeacherAvailability = App.request("data:getTeacherAvailability", res);
			
			$.when(checkTeacherAvailability).done(function(teacherStatus) {
				if(teacherStatus === true) {
					// then see if this student and teacher already have a reservation together
					var checkStudentTeacherStatus = App.request("data:getStudentTeacherStatus", res);
					$.when(checkStudentTeacherStatus).done(function(studentStatus) {
						if(studentStatus === true) {
							availability = true;
							defer.resolve(availability);
						} else {
							availability = false;
							App.trigger("submit:options", "unavailable");
							defer.resolve(availability);
						}
					});
				} else {
					App.trigger("submit:options", "doublebooked");
					defer.resolve(availability);
				}
			});			
			
			return defer.promise();
		},
		
		
		enableSubmit: function(option) {
			Mod.Controller.enableSubmit(option);
		}
	};
	
});