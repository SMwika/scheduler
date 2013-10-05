
<!-- loading -->
<script id="loading" type="text/template">
<li>&#10004; {{ message }}</li>
</script>

<!-- scheduleApptSingle -->
<script id="scheduleApptSingle" type="text/template">
<strong>{{ StartTime }} - {{ EndTime }}</strong><br/>
({{ StudentName }}) {{ Title }}<br/>
<em>Room: {{ RoomNumber }}</em><br/>
<a href="" class="js-delete-appt">delete reservation</a>
</script>

<!-- singleStudent -->
<script id="singleStudent" type="text/template">
{{ StudentFullName }}
</script>

<!-- singleTeacher -->
<script id="singleTeacher" type="text/template">
{{ conferenceName }}
</script>

<!-- singleTimeSlot -->
<script id="singleTimeSlot" type="text/template">
{{ startTime }}-{{ endTime }}
</script>

<!-- studentListContainer -->
<script id="studentListContainer" type="text/template">
<div>
	Select a student:
	<select class="student-selector"></select>
	<button class="select-student">Select</button>
</div>
</script>

<!-- submitChecking -->
<script id="submitChecking" type="text/template">
<h2>Checking</h2>
<span>Please wait...checking your reservation</span>
</script>

<!-- submitDoubleBooked -->
<script id="submitDoubleBooked" type="text/template">
<h2>Oops!</h2>
<span>Double booking...please try again!</span>
</script>

<!-- submitForm -->
<script id="submitForm" type="text/template">
<button id="submitRes" class="js-submit-form" value="submit">Submit Reservation</button>
</script>

<!-- submitSuccess -->
<script id="submitSuccess" type="text/template">
<h2>Success!</h2>
<span>Your reservation should appear in your schedule...</span>
</script>

<!-- submitUnavailable -->
<script id="submitUnavailable" type="text/template">
<h2>Unavailable</h2>
<span>I'm sorry, that time slot is no longer available...please try again.</span>
</script>

<!-- teacherListContainer -->
<script id="teacherListContainer" type="text/template">
<div>
	Select a teacher:
	<select class="teacher-selector"></select>
	<button class="select-teacher">Select</button>
</div>
</script>

<!-- timeListContainer -->
<script id="timeListContainer" type="text/template">
<div>
	Select a time:
	<select class="time-selector"></select>
	<button class="select-time">Select</button>
</div>
</script>
