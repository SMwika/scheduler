ptc.module("Data", function (Mod, App, Backbone, Marionette, $, _) {

    // generated below
    Mod.TimeSlots = [];

    App.on("times:generate", function () {
        API.generateTimeSlots();
    });

    App.reqres.setHandler("user:getloggedin", function () {
        return API.getLoggedInUser();
    });


    App.reqres.setHandler("user:getstudents", function (userLogon) {
        return API.getStudents(userLogon);
    });

    App.reqres.setHandler("student:getteachers", function (studentList) {
        return API.getTeachers(studentList);
    });

    App.reqres.setHandler("teacher:gettimes", function (conferenceList) {
        return API.getTimes(conferenceList);
    });

    App.reqres.setHandler("teacher:getschedule", function (teacher) {
        return API.getTeacherSchedule(teacher);
    });

    App.reqres.setHandler("teacher:getconf", function (teacherLogon) {
        return API.getTeacherConf(teacherLogon);
    });

    App.reqres.setHandler("teacher:getconferences", function (teacherList) {
        return API.getConferences(teacherList);
    });

    App.reqres.setHandler("teacher:getmyteacherschedule", function (conference) {
        return API.getMyTeacherSchedule(conference);
    });

    App.reqres.setHandler("schedule:getmy", function (familyCode) {
        return API.getSchedule(familyCode);
    });

    App.reqres.setHandler("data:getTeacherAvailability", function (res) {
        return API.getTeacherAvailability(res);
    });

    App.reqres.setHandler("data:getStudentTeacherStatus", function (res) {
        return API.getStudentTeacherStatus(res);
    });

    App.reqres.setHandler("times:getavailable", function () {
        return API.getAvailableTimes();
    });

    App.on("data:reservation:save", function () {
        API.saveReservation();
    });

    App.on("data:reservation:delete", function (appt) {
        API.deleteReservation(appt);
    });


    var API = {
        generateTimeSlots: function () {

            var i, j, k,
                times = App.Config.Settings.timeSlots,
                timesLength = times.length,
                appts = [],
                start, end, diff, slotCount,
                minuteCount, newStart, newEnd, niceStart, unixStart, niceEnd, unixEnd;

            // iterate through each timeslot object
            for (i = 0; i < timesLength; i++) {

                // store number of days as a length
                var dates = times[i].dates,
                    datesLength = dates.length;


                // if override is true, then use specific dates
                if (times[i].override === true) {

                    // iterate through the dates, and create a timeslot for each one
                    for (j = 0; j < datesLength; j++) {

                        // store start date, end date
                        start = moment(dates[j].startDateTime, "YYYY-MM-DD HH:mm Z");
                        end = moment(dates[j].endDateTime, "YYYY-MM-DD HH:mm Z");

                        // format the dates to look nice and have UNIX versions
                        niceStart = start.zone("+08:00").format("ddd D MMM h:mm");
                        unixStart = start.format("X");
                        niceEnd = end.zone("+08:00").format("h:mm a");
                        unixEnd = end.format("X");

                        // push each created appt to the appts array
                        appts.push({
                            category: times[i].category,
                            startTime: niceStart,
                            endTime: niceEnd,
                            unixStart: unixStart,
                            unixEnd: unixEnd
                        });
                    }

                } else {

                    // iterate through each "day"
                    for (j = 0; j < datesLength; j++) {
                        // store start date, end date, the difference in days, and the amount of slots that result
                        start = moment(dates[j].startDateTime, "YYYY-MM-DD HH:mm Z");
                        end = moment(dates[j].endDateTime, "YYYY-MM-DD HH:mm Z");
                        diff = end.diff(start, "m", true);
                        slotCount = diff / (times[i].duration + times[i].padding);

                        // iterate through the slot count and create a time slot for each one
                        for (k = 0; k <= slotCount; k++) {

                            // store length of slot, and create back-to-back slots by adding the amount
                            minuteCount = (times[i].duration + times[i].padding) * k;
                            newStart = moment(start).add(minuteCount, "m");
                            newEnd = moment(start).add(minuteCount + times[i].duration, "m");

                            // format the dates to look nice and have UNIX versions
                            niceStart = newStart.zone("+08:00").format("ddd D MMM h:mm");
                            unixStart = newStart.format("X");
                            niceEnd = newEnd.zone("+08:00").format("h:mm a");
                            unixEnd = newEnd.format("X");

                            // push each created appt to the appts array
                            appts.push({
                                category: times[i].category,
                                startTime: niceStart,
                                endTime: niceEnd,
                                unixStart: unixStart,
                                unixEnd: unixEnd
                            });

                        }
                    }
                }
            }
            App.trigger("user:message", "generate time slots");
            Mod.TimeSlots = appts;
        },

        getLoggedInUser: function () {
            var defer = $.Deferred();
            var parentLogon = $().SPServices.SPGetCurrentUser({
                fieldName: "Name",
                debug: false,
                async: true
            });
            parentLogon = parentLogon.split("\\")[1];

            //	var parentLogon = "rebecca.lei";

            defer.resolve(parentLogon);

            return defer.promise();
        },

        getStudents: function (userLogon) {
            // this should just get a list of all students of the user
            // the list should be formatted as an array of objects
            // each student should have an ID, name, and familyCode
            var defer = $.Deferred(),
                familyJSON = [],
                self = this;

            $().SPServices({
                operation: "GetListItems",
                webURL: App.Config.Settings.familyList.webURL,
                async: true,
                listName: App.Config.Settings.familyList.listName,
                CAMLQuery: "<Query><Where><Eq><FieldRef Name='ParentLogonName' /><Value Type='Text'>" + userLogon + "</Value></Eq></Where></Query>",
                completefunc: function (xData) {
                    familyJSON = $(xData.responseXML).SPFilterNode("z:row").SPXmlToJson({
                        includeAllAttrs: true,
                        removeOws: true
                    });

                    // filter through and only return students in the gradeFilter in the config file
                    var filteredFamily = self.gradeFilter(familyJSON);

                    defer.resolve(filteredFamily);
                }
            });

            return defer.promise();
        },

        gradeFilter: function(familyJSON) {

        	var grades = App.Config.Settings.gradeFilter,
        		filteredFamily = [];

        	// make sure grades have been provided
        	if(grades.length > 0) {
               	// iterate through each student
               	_.each(familyJSON, function(student) {
               		var studentInGrade = _.contains(grades, student.CurrentGrade);

               		if(studentInGrade) {
               			filteredFamily.push(student);
               		}
               		
        		});
        	} else {
                filteredFamily = familyJSON;
            }
        	return filteredFamily;

        },

        getSchedule: function (familyCode) {
            var defer = $.Deferred(),
                self = this,
                fullSchedule = [],
                counter = 0,
                divisions = _.keys(App.Config.Settings.reservationLists);

            _.each(divisions, function (division) {
                $().SPServices({
                    operation: "GetListItems",
                    webURL: App.Config.Settings.reservationLists[division].webURL,
                    async: true,
                    listName: App.Config.Settings.reservationLists[division].listName,
                    CAMLQuery: "<Query><Where><Eq><FieldRef Name='FamilyCode' /><Value Type='Text'>" + familyCode + "</Value></Eq></Where></Query>",
                    completefunc: function (xData) {
                        var schedule = $(xData.responseXML).SPFilterNode("z:row").SPXmlToJson({
                            includeAllAttrs: true,
                            removeOws: true
                        });

                        _.each(schedule, function (appt) {
                            var x = self.formatScheduleDates(appt);
                            x.Division = division;
                            fullSchedule.push(x);
                        });

                        counter++;

                        if (counter === 3) {
                            defer.resolve(fullSchedule);
                        }
                    }
                });
            });

            return defer.promise();
        },

        formatScheduleDates: function (appt) {
            appt.StartTime = moment.unix(parseInt(appt.StartTime, 10)).zone("+08:00").format("ddd D MMM h:mm");
            appt.EndTime = moment.unix(parseInt(appt.EndTime, 10)).zone("+08:00").format("h:mm a");
            return appt;
        },

        getTeachers: function (studentList) {
            var defer = $.Deferred(),
                self = this,
                students = [],
                teacherList = [];
            $().SPServices({
                operation: "GetListItems",
                webURL: App.Config.Settings.studentTeacherList.webURL,
                async: true,
                listName: App.Config.Settings.studentTeacherList.listName,
                CAMLQuery: "<Query><Where><Eq><FieldRef Name='FamilyCode' /><Value Type='Text'>" + studentList[0].FamilyCode + "</Value></Eq></Where></Query>",
                completefunc: function (xData) {
                    var studentArray = $(xData.responseXML).SPFilterNode("z:row").SPXmlToJson({
                        includeAllAttrs: true,
                        removeOws: true
                    });
                    if (studentArray) {

                        // iterate through each returned query result
                        _.each(studentArray, function (student) {
                            students.push({
                                studentID: student.StudentID,
                                teachers: student.NameValues.toLowerCase()
                            });
                        });

                        // now, iterate and filter through each of the student's teachers
                        _.each(students, function (record) {

                            // split up the teacher column by semicolon
                            var teacherArray = record.teachers.split(";");

                            // process overrides from the teacher list
                            var newTeacherArray = self.processOverrides(teacherArray);

                            // remove everything after parentheses and change to lowercase
                            newTeacherArray = _.map(newTeacherArray, function (teacher) {
                                return teacher.replace(/\(.+/g, "");
                            });

                            // trim out any duplicates
                            newTeacherArray = _.uniq(newTeacherArray);

                            // then iterate through each of the teachers
                            _.each(newTeacherArray, function (teacher) {

                                // and push the individual teacher, with the record's student
                                teacherList.push({
                                    teacherLogon: teacher,
                                    studentID: record.studentID
                                });

                            });
                        });
                    }
                    defer.resolve(teacherList);
                }
            });

            return defer.promise();
        },

        processOverrides: function (teacherArray) {

            // set the newTeacherArray with the passed variable
            var excluded = [];
            var finalExclusions = [];

            // first, let's get a list of excluded teachers
            _.each(App.Config.Settings.overrides.exclusions, function (exclusion) {
                exclusion = exclusion.toLowerCase();
                var eachExclusion = _.filter(teacherArray, function (teacher) {
                    // return anything that is excluded
                    return teacher.indexOf(exclusion) >= 0;
                });
                excluded = excluded.concat(eachExclusion);
            });

            // then, let's take out any of the exclusions that are in the "inclusions"
            _.each(App.Config.Settings.overrides.inclusions, function (inclusion) {
                inclusion = inclusion.toLowerCase();
                var eachInclusion = _.filter(excluded, function (teacher) {
                    // return all teachers who AREN'T included by override
                    return teacher.indexOf(inclusion) === -1;
                });
                finalExclusions = finalExclusions.concat(eachInclusion);
            });

            // iterate through each of the exclusions (strings)
            _.each(finalExclusions, function (exclusion) {
                // set the new array to be a filtered version of itself each time
                teacherArray = _.filter(teacherArray, function (teacher) {
                    // return anything that doesn't have an index of the exclusion
                    return teacher.indexOf(exclusion) === -1;
                });
            });

            return teacherArray;
        },

        getConferences: function (teacherList) {
            var defer = $.Deferred(),
                self = this,
                i, list = teacherList,
                listLength = list.length,
                conferenceList = [],
                inQuery = "";

            // for each teacher that we have
            for (i = 0; i < listLength; i++) {
                inQuery += "<Value Type='Text'>ISB\\" + list[i] + "</Value>";
            }
            $().SPServices({
                operation: "GetListItems",
                webURL: App.Config.Settings.conferenceList.webURL,
                async: true,
                listName: App.Config.Settings.conferenceList.listName,
                CAMLQuery: "<Query><Where><In><FieldRef Name='Teachers' /><Values>" + inQuery + "</Values></In></Where></Query>",
                completefunc: function (xData) {
                    var conferenceArray = $(xData.responseXML).SPFilterNode("z:row").SPXmlToJson({
                        includeAllAttrs: true,
                        removeOws: true
                    });

                    var conferenceList = self.niceifyConferences(conferenceArray);

                    defer.resolve(conferenceList);
                }
            });

            return defer.promise();
        },
        niceifyConferences: function (conferenceArray) {
            var conferenceList = [];
            _.each(conferenceArray, function (conference) {
                var teachers = conference.Teachers.split(";");

                if (teachers.length > 2) {
                    conferenceList.push({
                        conferenceName: conference.Title,
                        division: conference.Division,
                        roomNumber: conference.Room,
                        teacher1: teachers[1].split("\\")[1].toLowerCase(),
                        teacher2: teachers[3].split("\\")[1].toLowerCase()
                    });
                } else {
                    conferenceList.push({
                        conferenceName: conference.Title,
                        division: conference.Division,
                        roomNumber: conference.Room,
                        teacher1: teachers[1].split("\\")[1].toLowerCase()
                    });
                }
            });
            return conferenceList;
        },
        getTimes: function (conferenceList) {
            var defer = $.Deferred(),
                i, j,
                counter = 0,
                list = conferenceList,
                total = list.length,
                timeList = [],
                teacher = "",
                appts = Mod.TimeSlots;
            // iterate through each teacher
            for (i = 0; i < total; i++) {
                if (list[i].teacher2) {
                    teacher = list[i].teacher1 + "-" + list[i].teacher2;
                } else {
                    teacher = list[i].teacher1;
                }
                // then iterate through all time slots
                for (j = 0; j < appts.length; j++) {
                    if (appts[j].category === list[i].division) {
                        timeList.push({
                            teacherLogon: teacher,
                            startTime: appts[j].startTime,
                            endTime: appts[j].endTime,
                            unixStart: appts[j].unixStart,
                            unixEnd: appts[j].unixEnd
                        });
                    }
                }
                // with each iteration, iterate counter, so we can resolve once counter is done
                counter++;

                // SPServices query for times of teacherList[i].teacherLogon
                // timeList.push(["teacherLogon", "startTime", "endTime"]);
                if (counter == total) {
                    defer.resolve(timeList);
                }
            }
            return defer.promise();
        },
        getAvailableTimes: function () {
            // we're trying to get filter the 'times' list and
            // remove anything from the 'teacherSchedules' list that matches
            var defer = $.Deferred(),
                oldTimes = App.Data.Config.times,
                blockedTimes = App.Data.Config.teacherSchedules,
                matchingBlockedTimes = [],
                newTimes = [];

            // first, filter through all the blockedTimes
            _.each(blockedTimes, function (time) {
                var teacherBits = time.Teachers.split(";"),
                    teacherName = "";

                if (teacherBits.length > 2) {
                    // if > 2, then there are two teachers in the field
                    teacherName = teacherBits[1].split("\\")[1] + "-" + teacherBits[3].split("\\")[1];
                } else {
                    // otherwise, there's only one teacher
                    teacherName = teacherBits[1].split("\\")[1];
                }
                // convert to lowercase so we can compare to the times array
                teacherName = teacherName.toLowerCase();

                // now we have the teacherName (eg 'bweir' or 'jbinns-aflores')
                matchingBlockedTimes.push({
                    teacherLogon: teacherName,
                    unixStart: time.StartTime
                });
            });

            newTimes = _.reject(oldTimes, function (oldtime) {
                var output = false;

                _.each(matchingBlockedTimes, function (blockedtime) {
                    var sameTime = (blockedtime.unixStart === oldtime.unixStart);
                    var sameTeacher = (blockedtime.teacherLogon === oldtime.teacherLogon);
                    // if the new time matches the old time
                    if (sameTime && sameTeacher) {
                        output = true;
                    }
                });

                return output;
            });

            defer.resolve(newTimes);

            return defer.promise();
        },
        getTeacherConf: function (teacherLogon) {
            // get the conference for this teacher from SharePoint
            var defer = $.Deferred(),
                self = this;
            $().SPServices({
                operation: "GetListItems",
                webURL: App.Config.Settings.conferenceList.webURL,
                async: true,
                listName: App.Config.Settings.conferenceList.listName,
                CAMLRowLimit: 1,
                CAMLQuery: "<Query><Where><In><FieldRef Name='Teachers' /><Values><Value Type='Text'>ISB\\" + teacherLogon + "</Value></Values></In></Where></Query>",
                completefunc: function (xData) {
                    var conferenceArray = $(xData.responseXML).SPFilterNode("z:row").SPXmlToJson({
                        includeAllAttrs: true,
                        removeOws: true
                    });
                    if (conferenceArray.length > 0) {
                        var conferenceList = self.niceifyConferences(conferenceArray);

                        defer.resolve(conferenceList);
                    } else {
                        defer.resolve(false);
                    }

                }
            });

            return defer.promise();
        },
        getMyTeacherSchedule: function (conference) {
            var defer = $.Deferred(),
                self = this,
                fullSchedule = [];

            $().SPServices({
                operation: "GetListItems",
                webURL: App.Config.Settings.reservationLists[conference.division].webURL,
                async: true,
                listName: App.Config.Settings.reservationLists[conference.division].listName,
                CAMLQuery: "<Query><Where><In><FieldRef Name='Teachers' /><Values><Value Type='Text'>ISB\\" + Mod.Config.loggedInUser + "</Value></Values></In></Where></Query>",
                completefunc: function (xData) {
                    var teacherSchedule = $(xData.responseXML).SPFilterNode("z:row").SPXmlToJson({
                        includeAllAttrs: true,
                        removeOws: true
                    });

                    if (teacherSchedule.length > 0) {
                        _.each(teacherSchedule, function (appt) {
                            var x = self.formatScheduleDates(appt);
                            x.Division = conference.division;
                            fullSchedule.push(x);
                        });

                        // if this teacher has reservations, add them to the master list
                        defer.resolve(fullSchedule);
                    } else {
                        defer.resolve(false);
                    }
                }
            });
            return defer.promise();
        },
        getTeacherSchedule: function (teachers) {
            // get all of the reservations for this/these teacher(s) in their list
            var defer = $.Deferred(),
                counter = 0,
                scheduleList = [];

            _.each(teachers, function (teacher) {
                // should have access to teacher.teacher1 and teacher.division				
                // query SharePoint for any reservations for this teacher
                $().SPServices({
                    operation: "GetListItems",
                    webURL: App.Config.Settings.reservationLists[teacher.division].webURL,
                    async: true,
                    listName: App.Config.Settings.reservationLists[teacher.division].listName,
                    CAMLQuery: "<Query><Where><In><FieldRef Name='Teachers' /><Values><Value Type='Text'>ISB\\" + teacher.teacher1 + "</Value></Values></In></Where></Query>",
                    completefunc: function (xData) {
                        var teacherSchedule = $(xData.responseXML).SPFilterNode("z:row").SPXmlToJson({
                            includeAllAttrs: true,
                            removeOws: true
                        });

                        if (teacherSchedule.length > 0) {
                            // if this teacher has reservations, add them to the master list
                            scheduleList = scheduleList.concat(teacherSchedule);
                        }

                        counter++;

                        if (counter === teachers.length) {
                            // once we've iterated through all teachers,
                            // resolve the full list
                            defer.resolve(scheduleList);
                        }
                    }
                });
            });

            return defer.promise();
        },
        getTeacherList: function (x) {
            var teachers;
            // check if the teacher is actually a team teaching thing
            if (x.teacherLogon.indexOf("-") > 0) {
                teachers = "-1;#ISB\\" + x.teacherLogon.split("-")[0] + ";#-1;#ISB\\" + x.teacherLogon.split("-")[1] + ";#";
            } else {
                teachers = "-1;#ISB\\" + x.teacherLogon;
            }
            return teachers;
        },
        setDivision: function (x) {
            var division;
            // set the correct list to save to, depending on student's grade level
            if (x.currGrade > 5 && x.currGrade < 9) {
                division = "MS";
            } else if (x.currGrade > 8 && x.currGrade <= 12) {
                division = "HS";
            } else {
                division = "ES";
            }
            return division;
        },
        saveReservation: function () {
            // for ease, set the reservation to a small variable
            var x = App.Reservation.NewReservation,
                self = this;
            // get formatted teacher list
            var teachers = self.getTeacherList(x);

            var reservationValues = [
                ["Title", x.teacherName],
                ["StudentID", x.studentID],
                ["StudentName", x.studentName],
                ["RoomNumber", x.roomNumber],
                ["StartTime", x.startTime],
                ["EndTime", x.endTime],
                ["FamilyCode", x.familyCode],
                ["Reserver", x.reserver],
                ["Teachers", teachers]
            ];

            $().SPServices({
                operation: "UpdateListItems",
                async: false,
                webURL: App.Config.Settings.reservationLists[x.division].webURL,
                batchCmd: "New",
                listName: App.Config.Settings.reservationLists[x.division].listName,
                valuepairs: reservationValues,
                completefunc: function (xData) {
                    if (xData.statusText == "OK") {
                        var schedule = $(xData.responseXML).SPFilterNode("z:row").SPXmlToJson({
                            includeAllAttrs: true,
                            removeOws: true
                        });
                        var y = self.formatScheduleDates(schedule[0]);
                        y.Division = x.division;
                        App.Reservation.ReservingStatus = false;
                        App.trigger("submit:options", "success");
                        App.trigger("schedule:append", y);
                        App.trigger("user:message", "successfully reserved");
                    } else {
                        App.trigger("submit:options", "error");
                        App.trigger("user:message", "error saving your reservation");
                    }
                }
            });
        },

        getTeacherAvailability: function (res) {
            // check if teacher has this time slot available

            // set teacher and startTime from passed reservation
            var teacher = res.teacherLogon,
                startTime = res.startTime;

            if (teacher.indexOf("-") > 0) {
                teacher = teacher.split("-")[0];
            }

            // query SP division 
            var defer = $.Deferred(),
                available = true,
                counter = 0,
                divisions = _.keys(App.Config.Settings.reservationLists);

            _.each(divisions, function (division) {
                $().SPServices({
                    operation: "GetListItems",
                    webURL: App.Config.Settings.reservationLists[division].webURL,
                    async: true,
                    listName: App.Config.Settings.reservationLists[division].listName,
                    CAMLQuery: "<Query><Where><And><In><FieldRef Name='Teachers' /><Values><Value Type='Text'>ISB\\" + teacher + "</Value></Values></In><Eq><FieldRef Name='StartTime' /><Value Type='Text'>" + startTime + "</Value></Eq></And></Where></Query>",
                    completefunc: function (xData) {
                        var schedule = $(xData.responseXML).SPFilterNode("z:row").SPXmlToJson({
                            includeAllAttrs: true,
                            removeOws: true
                        });

                        if (schedule.length > 0) {
                            available = false;
                            defer.resolve(available);
                        }

                        counter++;

                        if (counter === divisions.length) {
                            defer.resolve(available);
                        }
                    }
                });
            });

            return defer.promise();
            // return true for available, or false
        },
        getStudentTeacherStatus: function (res) {
            // make sure teacher and student are not already reserved together

            // student and teacher from passed reservation
            var teacher = res.teacherLogon,
                student = res.studentID;

            if (teacher.indexOf("-") > 0) {
                teacher = teacher.split("-")[0];
            }

            // query SP division 
            var defer = $.Deferred(),
                available = true,
                counter = 0,
                divisions = _.keys(App.Config.Settings.reservationLists);

            _.each(divisions, function (division) {
                $().SPServices({
                    operation: "GetListItems",
                    webURL: App.Config.Settings.reservationLists[division].webURL,
                    async: true,
                    listName: App.Config.Settings.reservationLists[division].listName,
                    CAMLQuery: "<Query><Where><And><In><FieldRef Name='Teachers' /><Values><Value Type='Text'>ISB\\" + teacher + "</Value></Values></In><Eq><FieldRef Name='StudentID' /><Value Type='Text'>" + student + "</Value></Eq></And></Where></Query>",
                    completefunc: function (xData) {
                        var schedule = $(xData.responseXML).SPFilterNode("z:row").SPXmlToJson({
                            includeAllAttrs: true,
                            removeOws: true
                        });

                        if (schedule.length > 0) {
                            available = false;
                            defer.resolve(available);
                        }

                        counter++;

                        if (counter === divisions.length) {
                            defer.resolve(available);
                        }
                    }
                });
            });

            return defer.promise();
            // return true for available, or false
        },

        deleteReservation: function (appt) {
            var reservationID = appt.get("ID"),
                division = appt.get("Division");
            $().SPServices({
                operation: "UpdateListItems",
                async: true,
                webURL: App.Config.Settings.reservationLists[division].webURL,
                listName: App.Config.Settings.reservationLists[division].listName,
                batchCmd: "Delete",
                ID: reservationID,
                completefunc: function () {
                    App.trigger("user:message", "reservation deleted");
                }
            });
        }
    };
});