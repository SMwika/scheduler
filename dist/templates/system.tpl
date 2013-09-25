
<!-- loading -->
<script id="loading" type="text/template">
<li>&#10004; {{ message }}</li>
</script>

<!-- scheduleApptSingle -->
<script id="scheduleApptSingle" type="text/template">
{{ StartTime }} - {{ EndTime }}&nbsp;&nbsp;&nbsp;<strong>{{ StudentName }}</strong><br/>
{{ Title }} (room {{ RoomNumber }})<br/>
<a href="" class="js-delete-appt">delete</a>
</script>

<!-- singleStudent -->
<script id="singleStudent" type="text/template">
{{ StudentFullName }}
</script>

<!-- singleTeacher -->
<script id="singleTeacher" type="text/template">
{{ conferenceName }} - Room {{ roomNumber }}
</script>

<!-- singleTimeSlot -->
<script id="singleTimeSlot" type="text/template">
{{ startTime }}-{{ endTime }}
</script>

<!-- submitForm -->
<script id="submitForm" type="text/template">
<button id="submitRes" class="js-submit-form" value="submit">Submit Reservation</button>
</script>
