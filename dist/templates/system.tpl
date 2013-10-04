
<!-- loading -->
<script id="loading" type="text/template">
<li>&#10004; {{ message }}</li>
</script>

<!-- scheduleApptSingle -->
<script id="scheduleApptSingle" type="text/template">
{{ StartTime }} - {{ EndTime }}&nbsp;&nbsp;&nbsp;<strong>{{ StudentName }}</strong><br/>
{{ Title }}&nbsp;&nbsp;&nbsp;<em>Room: {{ RoomNumber }}</em><br/>
<a href="" class="js-delete-appt">delete</a>
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
Checking availability...
</script>

<!-- submitForm -->
<script id="submitForm" type="text/template">
<button id="submitRes" class="js-submit-form" value="submit">Submit Reservation</button>
</script>

<!-- submitSuccess -->
<script id="submitSuccess" type="text/template">
Success! Your reservation should appear to the right.
</script>

<!-- submitUnavailable -->
<script id="submitUnavailable" type="text/template">
That time slot is unavailable...please choose another and try again.
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
