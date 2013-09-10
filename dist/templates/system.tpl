
<!-- loading -->
<script id="loading" type="text/template">
<li>&#10004; {{ message }}</li>
</script>

<!-- scheduleApptSingle -->
<script id="scheduleApptSingle" type="text/template">
{{ startTime }}&nbsp;&nbsp;&nbsp;<strong>{{ studentName }}</strong><br/>
{{ teacherName }} (room {{ roomNumber }})<br/>
<a href="" class="js-delete-appt">delete</a>
</script>

<!-- singleStudent -->
<script id="singleStudent" type="text/template">
{{ fullName }}
</script>

<!-- singleTeacher -->
<script id="singleTeacher" type="text/template">
{{ teacherName }}
</script>

<!-- singleTimeSlot -->
<script id="singleTimeSlot" type="text/template">
{{ startTime }}-{{ endTime }}
</script>

<!-- submitForm -->
<script id="submitForm" type="text/template">
<button id="submitRes" class="js-submit-form" value="submit">Submit Reservation</button>
</script>
