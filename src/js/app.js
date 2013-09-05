// instantiate app

// when app runs, get ID of logged in person and store in global config

// when logged in person is retrieved, check if that person is a parent (A) or teacher (B)

// (A) if person is a parent, get students and store in global config

	// begin fetching the list of teachers for that student asynchronously, store in config

	// display the list of students

	// as each student displays, show a drop-down menu to the right of the name with a list of teachers
	// -- make first selection in drop-down menu empty

	// when a teacher is selected, trigger the app to show a
	// list of available times next to the selected teacher's name

	// when a time is selected, enable the "Submit Reservation" button


// (B) if person is a teacher, get times of potential conferences

	// display list of times of potential conferences in a drop-down menu

	// upon selecting a time, enable the "Submit Reservation" button

//** Submission

// upon submitting the form, double check the reservation table for 2 things:
// -- the student cannot have two reservations with the same teacher
// -- the reservation time must be available (no double booking)
// -- the parent should be warned if there is an overlap in time

// if the reservation is a success, tell the user, and display the reservation in the schedule region