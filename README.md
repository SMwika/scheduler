Parent-Teacher Conference Scheduler
===================================

Scheduling solution for SharePoint Parent-Teacher Conferences. This application consists of two sets of requirements. Those for parents and those for teachers.

Parent Requirements
-------------------
ES, MS, and HS divisions should allow parents to book appointments with the teachers of their children. Each division differs in several ways:

* **ES** - only Homeroom teachers should be reservable online
* **MS** - Teachers hold "team" conferences where two homeroom teachers hold the conference together. In practice this means that the students in each of their respective homerooms are grouped under one teaching team for the conferences.
* **HS** - Student book reservations for all of their teachers

Either parent should be able to login, see their children, and make/delete appointments. Appointments may be reserved or deleted. They cannot be "modified". As soon as an appointment is deleted, it is available for another parent to take.

Teacher Requirements
--------------------
Teachers should be allowed to make reservations for themselves. Typically the group of teachers is given permission to do so a few days before parents are allowed to make reservations. This gives teachers a head start so they can block off breaks and times to eat lunch.

Teachers who are also parents are also typically given a small window of time ahead of everybody, as they must organize themselves, as well as their children. They are able to block times off as a teacher, and then go login as a parent and reserve times with their children's teacher(s).

Technology
----------
Part of the app will be built to source data from what SharePoint calls an **External Content Type**. This External Content Type produces a list that is sourced from *Education Edge* (EE). The content brought in from Education Edge will be data that connects parents, students, and teachers (3 lists). However, in SharePoint 2010, REST services are not available on external lists like this. Therefore, we will use Marc Anderson's [SPServices](http://spservices.codeplex.com), a library for jQuery and SharePoint Web Services to grab this data.

The app will also source data from SharePoint **Custom Lists**. These will be manually created and maintained to store things like **time slots**, **reservations**, and **conference names** (TBD).

Because of some limitations of the amount of queryable SharePoint list items, the reservation app needs to be split into 3 sections, one for each division. All this means is that the app must pull and push data into division-specific lists in order to stay under the item limit imposed on SharePoint lists.

The app will be built in javascript and jQuery, using various plugins (like SPServices) where necessary. The framework will be built on [Backbone.js](http://backbonejs.org). This is a lightweight framework that allows great control of models, views, and collections of data. [Underscore.js](http://underscorejs.org), a requirement of Backbone, will be used for templating. [Marionette.js](http://marionettejs.com/) will be added to keep things a little more modular. Also, the app will be optimized using [Grunt.js](http://gruntjs.com/). 

App Structure
-------------
The app has three modules: *Data*, *Reservation*, and *Schedule*. Each module will be self-contained and will talk (when necessary) through a series of triggers on the app itself. The app will be known internally as **ptc**, which is short for *parent-teacher conferences*.

When the app loads, data should go and be fetched, showing the user what's being fetched. Once all data has been fetched, then the actual app is initiated.

Data to be fetched before the app initiates:
* logged in user
* students of logged in user
* schedule (if any) of students
* teachers of students
* times of teachers

These 5 items should display loading statuses as they are brought in, so the user knows why they are waiting.

Once the data is loaded, the app will then initiate the schedule, and begin listing data for creating a new reservation.

Managing the Schedule
---------------------
A user's schedule shows all the reservations retrieved that match the familyCode of the user. This query is done server-side before reservations are brought in. They are filtered by Family Code and then brought in to the app as JSON-formatted data.

When a user clicks **delete**, the model is destroyed. This is accomplished through Backbone's model.destroy() method. This removes it from SharePoint, and removes it from view once server-side removal is successful.

When a user creates a new reservation, it is added to the schedule on the server, and also to the schedule view.

Creating a new reservation
--------------------------
When a user logs into the app they are presented with a drop-down list of their students (if the user is a parent). When the user selects a student's name, they are presented with a drop-down menu of teachers of that student. When a teacher/conference is selected, the user is then presented with a list of available time slots as a drop-down menu. Selecting a time-slot enables the submit button. Each step of the way the reservation details are being saved to an object: **App.Reservation.NewReservation**.

Checking for duplication
------------------------
A big part of the scheduling application is to check for duplication. There are several different areas where duplication *can*, but *shouldn't*, occur.

1. When selecting a time slot for a specific teacher, only the **available** time slots should be shown in the drop-down menu. Any time slots already reserved should not show in this menu.
2. When reserving a time slot, the app should check to see if that time slot for that teacher is in fact still available. If it is not, the user should get an error saying it's not available, and that they should try another slot.
3. When reserving a time slot, the app should check to see if that teacher and that student already have a reservation. If so, the user should be alerted that they have already created a reservation for this teacher for their student.
4. When reserving a time slot, the app should check to see if there is already a time slot reserved for that familyCode. If there is, the user should be presented with a warning, but not prohibited from completing the reservation. There are cases where parents may "double book" themselves so one parent can visit one teacher, and the other parent can visit another, for example.