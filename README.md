Parent-Teacher Conference Scheduler
===================================
This is a scheduling solution for Parent-Teacher Conferences. This application consists of two sets of requirements, those for parents and those for teachers. The app itself is meant to function inside of SharePoint, but the data connection points have been decoupled enough that it shouldn't matter what system is being used. However, the data must be retrieved in certain formats, or must be converted once in the app to be usable by the app. So there is a layer of manipulating the data before it can interact with the app. The attempt has been made to keep this layer as abstracted as possible from the UI and interaction side, but in some cases it's just not feasible.

Parent Requirements
-------------------
ES, MS, and HS divisions should allow parents to book appointments with the teachers of their children. Each division differs in several ways:

* **ES** - Students book reservations for all of their teachers, but Homeroom teachers are "required"
* **MS** - Teachers hold "team" conferences where two homeroom teachers hold the conference together. In practice this means that the students in each of their respective homerooms are grouped under one teaching team for the conferences.
* **HS** - Student book reservations for all of their teachers

Either parent should be able to login, see their children, and make/delete appointments. Appointments may be reserved or deleted. They cannot be "modified". As soon as an appointment is deleted, it is available for another parent to take.

Teacher Requirements
--------------------
Teachers should be allowed to make reservations for themselves. Typically the group of teachers is given permission to do so a few days before parents are allowed to make reservations. This gives teachers a head start so they can block off lunch and coffee breaks, etc.

Teachers who are also parents are also typically given a small window of time ahead of everybody, as they must organize themselves, as well as their children. They are able to block times off as a teacher, and then go login as a parent and reserve times with their children's teacher(s).

Technology
----------
Part of the app will be built to source data from what SharePoint calls an **External Content Type**. This External Content Type produces a list that is (currently) sourced from *Education Edge* (EE). The content brought in from Education Edge will be data that connects parents, students, and teachers (3 lists). However, in SharePoint 2010, REST services are not available on external lists like this. Therefore, we will use Marc Anderson's [SPServices](http://spservices.codeplex.com), a library for jQuery and SharePoint Web Services to grab this data.

The app will also source data from SharePoint **Custom Lists**. These will be manually created and maintained to store things like **reservations** and **conference names** (TBD).

Because of some limitations of the amount of queryable SharePoint list items, the reservation app needs to be split into 3 sections, one for each division. All this means is that the app must pull and push data into division-specific lists in order to stay under the item limit imposed on SharePoint lists.

The app will be built in javascript and jQuery, using various plugins (like SPServices) where necessary. The framework will be built on [Backbone.js](http://backbonejs.org). This is a lightweight framework that allows great control of models, views, and collections of data. [Underscore.js](http://underscorejs.org), a requirement of Backbone, will be used for templating. [Marionette.js](http://marionettejs.com/) will be added to keep things a little more modular. Also, the app will be optimized using [Grunt.js](http://gruntjs.com/). 

App Structure
-------------
The app has three modules: *Data*, *Reservation*, and *Schedule*. Each module will be self-contained and will talk (when necessary) through a series of triggers on the app itself. The app will be known internally as **ptc**, which is short for *parent-teacher conferences*.

When the app loads, data should be fetched, showing the user what's being fetched. Once all data has been fetched, then the actual app is initiated.

The biggest and most intricate pieces of the app are in data/data-requests.js. This file attempts to hold almost all of the SharePoint queries. While it is a very large file, it has been siphoned off in order to be somewhat replaceable if the time ever came to use this system outside of SharePoint. This file also holds all of the trigger receivers for pieces of the app that need data.

The app can be mostly initiated using app-config.js. This file should be self-explanatory, but basically contains the times (generated dynamically), the SharePoint lists and locations, and the overrides of teacher names.

When the app initializes, we first check to see if a user is a parent or a student, based on whether or not a query for their LogonName returns with anything from the Conference List.

Once the data is loaded (depending on the user type), the app will then initiate the schedule, and begin listing data for creating a new reservation.

Managing the Schedule
---------------------
A user's schedule shows all the reservations retrieved that match the familyCode of the user (if a parent), or the logon name of the user (if a teacher). This query is done server-side via SharePoints CAMLQuery feature. They are filtered by Family Code (or teacher logon name) and then brought in to the app as JSON-formatted data.

When a user clicks **delete**, the model is destroyed. This is accomplished through Backbone's model.destroy() method. This removes it from SharePoint, and then removes it from view once SharePoint removal returns successful.

When a user creates a new reservation, it is added to the schedule on the server, and also to the schedule view in the UI.

Creating a new reservation
--------------------------
When a user logs into the app they are presented with a drop-down list of their students (if the user is a parent). When the user selects a student's name, they are presented with a drop-down menu of teachers of that student. When a teacher/conference is selected, the user is then presented with a list of available time slots as a drop-down menu. Selecting a time-slot enables the submit button. Each step of the way the reservation details are being saved to an object: **App.Reservation.NewReservation**.

Checking for duplication
------------------------
A big part of the scheduling application is to check for duplication. There are several different areas where duplication *can*, but *shouldn't*, occur.

1. When selecting a time slot for a specific teacher, only the **available** time slots should be shown in the drop-down menu. Any time slots already reserved should not show in this menu.
2. When reserving a time slot, the app should check to see if that time slot for that teacher is in fact still available. If it is not, the user should get an error saying it's not available, and that they should try another slot.
3. When reserving a time slot, the app should check to see if that teacher and that student already have a reservation. If so, the user should be alerted that they have already created a reservation for this teacher for their student.

Modifying the App
-----------------
This app has been built to be as flexible as possible. As such, the **app-config.js** file *should* be all you need to edit. This allows the admin to put the different types of dates and classifications of conferences in. Then the app itself generates the times.

When configuring the times for conferences, simply create a start and end date/time for each day of conferences. The time must be in Beijing (local) time, and be in 24hr time format. Each day should be a new object in the array of dates for each category. In this case, each division should exist as a category. Each category can have multiple dates, and the time slot length can be dictated here. There is also a "padding" feature that allows for gap time between each conference session.

The build process
-----------------
The build process is based on git. The scheduling solution lives in a git repo, and can be pulled, branched, pushed, etc. At the end of editing and modifying code, the codebase should be *grunted*. Grunting is basically an automated way of doing things like concatenating all of the javascript files into one, minifying them, and uglifying them. This will keep the app fast and avoid having to make too many calls to the server for source files. I've split the codebase up into scheduler-libs.min.js and scheduler.min.js. The libs file just contains all of the libraries used for the code, while the main file contains the actual app. These settings can all be adjusted in  Gruntfile.js.

Templates should be created in src/js/templates and then added to the js/templates.js file.

Basically, development should happen in the /src directory. The grunt process will do it's thing, and then produce a production version inside the /dist directory. Index.html is the main file, and will read the minified versions of everything. If development continues to expand, I would suggest using dev.html and pointing it to all of the /src files. This helps in testing.

One thing to keep in mind is that because this is a SharePoint-based solution, it will only work in a SharePoint environment (because you can't make calls to SharePoint web services from outside the environment). So the recommendation would be to run this code on a VM that is running SharePoint, or to continue to grunt the files and replace them on the SharePoint site. 


***

Setup
=====

Back-end Setup
-------------
1. Reservation List setup
  * Create "Reservation" Lists. These lists will hold all parent reservations. Because of the amount of reservations, create 3 lists of this type (one for each division).
  * The names of these lists are irrelevant, as they will be referenced in app-config.js. However, it is recommended to name them all similarly, appending the name of the division at the end (eg, ReservationsES, ReservationsMS, ReservationsHS)
  * This list contains the following columns:
    * Title
    * StudentName (text)
    * StudentID (text)
    * StartTime (text...not date field)
    * EndTime (text...not date field)
    * FamilyCode (text)
    * Teachers (Multiple select person picker field with "Account" format)
    * RoomNumber (text)
    * Reserver (text)

2. Conference List setup
  * Create a list to hold all of the conference name and details.
  * This list should hold one record for each reservable teacher.
  * This list is manually managed and updated. The secretaries for each division should have access to this list and be able to update it from conference to conference. This is the easiest way to maintain "who" is leading conferences, and what that conference should be called. In some cases a conference name may be altered to make the most sense (for example, some teachers teach multiple courses, so maybe the conference name should just include that teacher's name). It's best to have each secretary look over this list before each conference, so they can confirm that the conference names, room numbers, and divisions are correct.
  * This list contains the following columns:
    * Teachers (multiple select person picker field with "Account" format. it is multiple select to account for teachers who have team-teaching conferences)
    * Division (text)
    * Room (text)
	* Title (text - for name of conference. appears in drop-down menu for students)
	
3. Data setup
  * test

Front-end Setup
-------------
1. Where to put the files
  * There are two files/folders that are necessary to copy from this package into SharePoint for this to work.
    * /index.html
    * /dist (folder)
  * Put a copy of these two things into *any* SharePoint document library. You can create a blank Document Library specifically for this purpose. Then drop *index.html* and the *dist* folder into this document library (easiest to do with SharePoint Designer). The location of this document library is irrelevant. It is the call of the developer as to where it should sit. As long as the files are in the same site collection as the Reservation Lists, Conference List, and external Data lists, then it will work fine.
  * Point your browser to the document library you just created, and navigate to index.html. From there, the scheduler should run. See below for configuring the javascript to read your lists, time slots, etc.
  * Make sure all employees and parents have READ access to this Document Library so they can access index.html when the time comes. The easiest way to direct users to this index.html file is to put a direct link to it in the drop-down menu of My Gate, put it in an email, link from the home page, etc.

2. Setting Permissions
  * During development, and prior to opening up for reservations, nobody should have permissions to the Reservations List or Conference List besides those directly involved in development.
  * Typically one or two weeks before conferences begin, faculty are given "contribute" permissions to the Reservations Lists so they can book their own slots.
  * Usually either at the same time or right after, faculty parents are givent "contribute" permissions to the same lists. This allows those teachers who have kids to book slots first, which helps when arranging their own teaching schedule.
  * A few days after that parents of siblings (parents with more than one child) are given "contribute" permissions to the Reservations Lists in order to book slots for their children.
  * Finally, at a certain point all parents will be given "contribute" permissions to the Reservations Lists.
  * Usually a day before, or the day of the conferences, all parents and employees will need to have "contribute" permissions removed, and only have READ permissions on those lists. This way they can **see** their schedules, but cannot edit anything.
  * This staggered permission approach is to try and keep things fair for everybody.

Javascript setup/configuration
------------------------------
Assuming there are no changes to requirements, all modifications will happen in the **app-config.js** file. This should store everything you need to customize in order for the scheduler to function properly.

1. List Locations
  * There are 4 different javascript object that contain list URLs and names (for use in the ajax requests).
    * The first two (**FamilyList** and **studentTeacherList**) are the two external data lists that contain family information and student-teacher information. 
    * The conferenceList object stores the URL and name of the conference list you created above
    * The reservationLists store each of the reservation lists, categorized by the division they belong to.

2. Overrides
  * The overrides object is potentially the most confusing piece of the app. Basically, this object serves to manipulate the data retrieved from the external data sources. If the data retrieved from the external sources were perfect, this section would be unnecessary.
    * The **exclusions** array is used to filter **out** any teachers or courses that are connected to students that match any of the objects. Example: *exclusions: ["(ASA)", "(MSE)"]* will filter out any ASA or MSE courses that are linked to students.
    * The **inclusions** array simply overrides and takes precedence over anything in the **exclusions** array.
Ideally the data that comes in needs no manipulation, but due to the restrictions when this app was developed, this was a necessary evil to create an overrides setting.

3. Time Slots
  * In order to keep things flexible, the time slots are generated dynamically. Each time slot category (ES, MS, HS) has a "duration" (number), a "padding" (number), and a dates array. The dates array keeps things extremely flexible. It means you can have any amount of dates. However, pay attention to how dates should be formatted:
<pre>
	{
		startDateTime: "2013-10-21 12:00 +0800", // first conference START time
		endDateTime: "2013-10-21 19:30 +0800" // last conference START time
	}
</pre>
Date are formatted in 24hr time, and with the timezone offset after. This is critical. You can create as many date ranges as needed, but they must adhere to this pattern.

This will most definitely be altered for each conference.

***


Conclusion
----------
This readme file is by no means conclusive. The app is quite complex, but still relatively small. Before minification it clocks in at around 1,500 lines of code. So it's not unmanageable, but you should spend some time reading through the code to get how all of the relationships work between the modules.

Have fun!