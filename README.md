Scheduler
=========

Scheduling solution for SharePoint Parent-Teacher Conferences. Consists of two sets of requirements. Those for parents and those for teachers.

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

The app will be built in javascript and jQuery, using various plugins (like SPServices) where necessary. The framework will be built on [Backbone.js](http://backbonejs.org). This is a lightweight framework that allows great control of models, views, and collections of data. Also, the app will be optimized using [Grunt.js](http://gruntjs.com/). If necessary, [Marionette.js](http://marionettejs.com/) will be added to keep things a little more modular.
