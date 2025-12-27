function checkScheduleIntegrity(weekdays, schedule) {
    let flag = 0;
    let entries = Object.keys(schedule);

    for (let i = 0; i < entries.length; i++) {
        if (weekdays.includes(entries[i])) {
            flag++;
        }
    };

    if (flag === 7) {
        return true;
    };

    return false;
}

// Interval used to refresh schedule highlighting every minute
var scheduleHighlightInterval = null;

/** Utility: parse a time string like "9:00", "09:00", "09:00 AM" or "9:00 pm".
 * Returns minutes since midnight (0..1439) or null for invalid input.
 */
function parseTimeToMinutes(timeStr, ampmOverride) {
    if (!timeStr) return null;
    let s = String(timeStr).trim();
    let m = s.match(/^(\d{1,2}):(\d{2})(?:\s*([AaPp][Mm]))?$/);
    if (!m) return null;
    let hh = parseInt(m[1], 10);
    let mm = parseInt(m[2], 10);
    let ampm = (m[3] || ampmOverride || '').toUpperCase();
    if (ampm === 'AM') {
        if (hh === 12) hh = 0;
    } else if (ampm === 'PM') {
        if (hh !== 12) hh = (hh % 12) + 12;
    }
    hh = hh % 24;
    if (isNaN(hh) || isNaN(mm) || mm < 0 || mm > 59) return null;
    return hh * 60 + mm;
}

/**
 * Determine if current minute is within the interval defined by start and end
 * for entries that belong to the same calendar day. This avoids matching
 * future-day starts when we're before the start time.
 */
function isInRangeForDay(startMin, endMin, currMin) {
    let s = startMin;
    let e = endMin;
    if (e <= s) e += 24 * 60; // overnight range

    if (e <= 24 * 60) {
        // simple same-day range [s, e)
        return (currMin >= s && currMin < e);
    } else {
        // range wraps into next day. For entries belonging to this day, only consider
        // the portion from start until midnight; the next-day portion belongs to the next day
        return (currMin >= s && currMin < 24 * 60);
    }
}

/** Utility: extract the start minute from an entry like "HH:MM" or "HH:MM AM". */
function extractStartFromEntry(entry) {
    if (!entry) return null;
    let m = entry.match(/^\s*(\d{1,2}:\d{2})(?:\s*([AaPp][Mm]))?/);
    if (m) return parseTimeToMinutes(m[1], m[2]);
    return null;
}

/** Find the next scheduled start time after index idx in the day's array or subsequent days.
 * Returns minutes since current day's midnight (may be >= 24*60 when wrapping to next day) or null.
 */
function findNextStart(arr, idx, schedule, weekdays, today) {
    // search remaining entries in same day
    for (let j = idx + 1; j < arr.length; j++) {
        let s = extractStartFromEntry(arr[j].hour);
        if (s !== null) return s;
    }
    // search next days up to one week
    for (let offset = 1; offset < 7; offset++) {
        let nextDayIndex = (today + offset) % 7;
        let nextArr = schedule[weekdays[nextDayIndex]] || [];
        for (let k = 0; k < nextArr.length; k++) {
            let s = extractStartFromEntry(nextArr[k].hour);
            if (s !== null) return s + offset * 24 * 60;
        }
    }
    return null;
}

/** Build a DOM row for the schedule entry. */
function buildScheduleRow(hourText, activityText, isActive) {
    let tr = document.createElement('tr');
    if (isActive) tr.classList.add('schedule-current');
    let tdHour = document.createElement('td');
    tdHour.appendChild(document.createTextNode(hourText));
    tr.appendChild(tdHour);
    let tdActivity = document.createElement('td');
    tdActivity.appendChild(document.createTextNode('/ ' + activityText));
    tr.appendChild(tdActivity);
    return tr;
}

/** Determine whether a given entry is active at currMinutes. */
function isEntryActive(entry, idx, arr, schedule, weekdays, today, currMinutes) {
    // range: start - end
    let range = entry.hour.match(/^\s*(\d{1,2}:\d{2})(?:\s*([AaPp][Mm]))?\s*(?:[-–—]|to|until)\s*(\d{1,2}:\d{2})(?:\s*([AaPp][Mm]))?\s*$/i);
    if (range) {
        let startMin = parseTimeToMinutes(range[1], range[2]);
        let endMin = parseTimeToMinutes(range[3], range[4]);
        if (startMin === null || endMin === null) return false;
        return isInRangeForDay(startMin, endMin, currMinutes);
    }

    // single time: acts as 'start until next start'
    let single = entry.hour.match(/^\s*(\d{1,2}:\d{2})(?:\s*([AaPp][Mm]))?\s*$/i);
    if (single) {
        let startMin = parseTimeToMinutes(single[1], single[2]);
        if (startMin === null) return false;
        let endMin = findNextStart(arr, idx, schedule, weekdays, today);
        if (endMin !== null) {
            // if end is within same day, just check normally
            if (endMin <= 24 * 60) {
                return (currMinutes >= startMin && currMinutes < endMin);
            }
            // end wraps to next day: only consider the portion from start to midnight for today's entry
            return (currMinutes >= startMin && currMinutes < 24 * 60);
        }
        // fallback: only active at exact minute if we couldn't determine an end
        return currMinutes === startMin;
    }

    return false;
}

function processSchedule(file, schedule) {
    let today = new Date().getDay();
    let weekdays = MCCW.variables.weekday.map((day) => day.toLowerCase());

    if (!checkScheduleIntegrity(weekdays, schedule)) {
        alerts('Schedule Error:', 'Cannot load schedule, there must be an error in there.');
        return;
    }

    let table = document.getElementById('schedule');
    table.innerHTML = '';

    try {
        let now = new Date();
        let currMinutes = now.getHours() * 60 + now.getMinutes();
        let entries = schedule[weekdays[today]] || [];

        entries.forEach(function (entry, idx, arr) {
            let active = isEntryActive(entry, idx, arr, schedule, weekdays, today, currMinutes);
            let row = buildScheduleRow(entry.hour, entry.activity, active);
            table.appendChild(row);
        });
    } catch (err) {
        alerts('Schedule Error:', `Cannot load schedule, there is an error here.\n\n${err}`);
    }
}

async function drawScheduleWidget() {
    try {
        if (!schedule) return;

        processSchedule(true, schedule);

        if (scheduleHighlightInterval) clearInterval(scheduleHighlightInterval);
        scheduleHighlightInterval = setInterval(
            function () { 
                processSchedule(true, schedule); 
            }, 60 * 1000
        );
    } catch (error) {
        alerts('Schedule Error:', `Cannot load schedule, there must be an error in there.\n\n${error}`);
    }
}

var schedule_widget = {
    draw: drawScheduleWidget,
    properties: {
        active: true,
        readFile: true,
    }
}