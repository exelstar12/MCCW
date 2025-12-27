var schedule = {
    sunday: [
        {hour: "EMPTY", activity: "EMPTY"},
        {hour: "EMPTY", activity: "EMPTY"},
        {hour: "EMPTY", activity: "EMPTY"},
        {hour: "EMPTY", activity: "EMPTY"},
        {hour: "EMPTY", activity: "EMPTY"}
    ],
    monday: [
        {hour: "EMPTY", activity: "EMPTY"},
        {hour: "EMPTY", activity: "EMPTY"},
        {hour: "EMPTY", activity: "EMPTY"},
        {hour: "EMPTY", activity: "EMPTY"},
        {hour: "EMPTY", activity: "EMPTY"}
    ],
    tuesday: [
        {hour: "EMPTY", activity: "EMPTY"},
        {hour: "EMPTY", activity: "EMPTY"},
        {hour: "EMPTY", activity: "EMPTY"},
        {hour: "EMPTY", activity: "EMPTY"},
        {hour: "EMPTY", activity: "EMPTY"}
    ],
    wednesday: [
        {hour: "EMPTY", activity: "EMPTY"},
        {hour: "EMPTY", activity: "EMPTY"},
        {hour: "EMPTY", activity: "EMPTY"},
        {hour: "EMPTY", activity: "EMPTY"},
        {hour: "EMPTY", activity: "EMPTY"}
    ],
    thursday: [
        {hour: "EMPTY", activity: "EMPTY"},
        {hour: "EMPTY", activity: "EMPTY"},
        {hour: "EMPTY", activity: "EMPTY"},
        {hour: "EMPTY", activity: "EMPTY"},
        {hour: "EMPTY", activity: "EMPTY"}
    ],
    friday: [
        {hour: "EMPTY", activity: "EMPTY"},
        {hour: "EMPTY", activity: "EMPTY"},
        {hour: "EMPTY", activity: "EMPTY"},
        {hour: "EMPTY", activity: "EMPTY"},
        {hour: "EMPTY", activity: "EMPTY"}
    ],
    saturday: [
        {hour: "EMPTY", activity: "EMPTY"},
        {hour: "EMPTY", activity: "EMPTY"},
        {hour: "EMPTY", activity: "EMPTY"},
        {hour: "EMPTY", activity: "EMPTY"},
        {hour: "EMPTY", activity: "EMPTY"}
    ]
}

/* 
---------- Notes for schedule ----------
There is 2 structure of time in hour field:
   1. Single time: "HH:MM" or "HH:MM AM/PM"
   2. Time range: "HH:MM-HH:MM" or "HH:MM AM/PM - HH:MM AM/PM"


Examples Time range:
    "9:00-10:30"            -> 9:00 AM to 10:30 AM
    "09:00 AM - 10:30 AM"   -> 9:00 AM to 10:30 AM  
    "14:00-15:30"           -> 2:00 PM to 3:30 PM
    "22:00-23:30"           -> 10:00 PM to 11:30 PM
    "11:00 PM - 12:30 AM"   -> 11:00 PM to 12:30 AM (next day)


Examples Single time:
    "09:00" -> 9:00 AM
    "09:00 AM" -> 9:00 AM
    "14:00" -> 2:00 PM
    "2:00 PM" -> 2:00 PM

It's up to you how to utilize the time structure in your schedule.
*/