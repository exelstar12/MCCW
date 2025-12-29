var calendar_widget = {
    draw: drawWidgetCalendar,
    fill: fillWidgetCalendar
};

var calendarCells = [];

function drawWidgetCalendar(){
    document.getElementById("calendar").innerHTML = "<tr><th>SU</th><th>MO</th><th>TU</th><th>WE</th><th>TH</th><th>FR</th><th>SA</th></tr>";

    let month = MCCW.date.initial.getMonth();
    let year = MCCW.date.initial.getFullYear();
    let days = new Date(year, month + 1, 0).getDate();
    calendarCells = [];
    let elem = document.createElement("tr");
    let auxiliary = new Date(year, month, 1).getDay();

    for (let i = 0; i < auxiliary; i++){
        loadCell("");
    };

    for (let i = 1; i <= days; i++){
        auxiliary = new Date(year, month, i).getDay();
        if (MCCW.variables.weekday[auxiliary] == MCCW.variables.weekday[0]){
            document.getElementById("calendar").appendChild(elem);
            elem = document.createElement("tr");
            loadCell(i);
        } else {
            loadCell(i);
        }
    };

    function loadCell(data){
        const td = document.createElement("td");
        const dayVal = data !== "" ? Number(data) : null;
        td.textContent = data;
        elem.appendChild(td);
        calendarCells.push({ td, day: dayVal, month, year });
    }

    document.getElementById("calendar").appendChild(elem);
}


function fillWidgetCalendar(){
    const { currentDay, currentMonth, currentYear } = MCCW.helpers.getCurrentDateInfo();
    let pastDayFlag = true; // Past day flag
    const holidays = collectHolidays(currentYear);

    for (let i = 0; i < calendarCells.length; i++){
        const cell = calendarCells[i];
        const td = cell.td;
        const d = cell.day;
        if (d === null) continue; // skip empty leading/trailing cells
        const m = cell.month;
        const y = cell.year;

        if (pastDayFlag){
            td.classList.add("past"); // Add past day class
        }
        if (d === currentDay && m === currentMonth && y === currentYear){
            td.classList.add("today"); // Add today's class
            pastDayFlag = false;
        }

        const holiday = findHolidayForDay(holidays, d, m, y);
        if (holiday) applyHolidayToTd(td, holiday);
    }
}

function findHolidayForDay(holidaysByMonth, day, month, year){
    // holidaysByMonth is expected to be an array of 12 objects mapping day->holiday or day->array of holidays
    if (!Array.isArray(holidaysByMonth) || holidaysByMonth.length !== 12) return null;
    const monthMap = holidaysByMonth[month];
    if (!monthMap) return null;
    const entry = monthMap[day];
    if (!entry) return null;
    if (Array.isArray(entry)){
        // prefer a holiday that explicitly matches the year if available
        for (let h of entry){
            const hy = h.year ? Number(h.year) : undefined;
            if (hy === undefined || hy === year) return h;
        }
        return entry[0];
    }
    return entry;
}

function applyHolidayToTd(td, h){
    td.classList.add("holiday");
    if (h.name){
        const tip = document.createElement('span');
        tip.className = 'holiday-tooltip';
        tip.textContent = h.name;
        td.appendChild(tip);
    }
}



function collectHolidays(year){
    // If the user disabled public holidays in properties, return empty mapping
    if (MCCW.properties && MCCW.properties.calendar && MCCW.properties.calendar.showHolidays === false){
        return Array.from({length: 12}, () => ({}));
    }

    // Build a month-indexed lookup: array of 12 objects mapping day -> holiday or day -> [holidays]
    const holidaysByMonth = Array.from({length: 12}, () => ({}));
    if (typeof publicHoliday === "object" && publicHoliday !== null){
        const list = Array.isArray(publicHoliday[year]) ? publicHoliday[year] : [];
        for (let h of list){
            // Normalize fields (accept numbers or numeric strings and return integers)
            const normalized = normalizeHoliday(h);
            const hm = normalized.month;
            const hd = normalized.day;
            const hy = normalized.year;

            // Validate normalized month and day range (month 0-11, day 1-31)
            if (!Number.isInteger(hm) || hm < 0 || hm > 11 || !Number.isInteger(hd) || hd < 1 || hd > 31) 
                continue;
            if (hy !== undefined && hy !== year) continue; // skip holidays for different years

            // if month/day valid, add to mapping
            if (!holidaysByMonth[hm][hd]) 
                holidaysByMonth[hm][hd] = h;
            else { // else already exists, convert to array or append
                if (!Array.isArray(holidaysByMonth[hm][hd])) 
                    holidaysByMonth[hm][hd] = [holidaysByMonth[hm][hd]];
                
                // Append holiday
                holidaysByMonth[hm][hd].push(h);
            }
        }
    }
    return holidaysByMonth;
}

function normalizeHoliday(h){
    // Accept numbers or numeric strings and return normalized integers:
    const result = { month: undefined, day: undefined, year: undefined };

    // Month
    if (h.month !== undefined && h.month !== null && h.month !== ''){
        let m = h.month;
        if (typeof m === 'string'){
            if (m.trim() === '') { 
                result.month = undefined;
            }
            else m = Number(m);
        }

        if (m >= 1 && m <= 12)
            result.month = m - 1;
        else 
            result.month = m;
    }

    // Day
    if (h.day !== undefined && h.day !== null && h.day !== ''){
        let d = h.day;
        if (typeof d === 'string'){
            if (d.trim() === '') { 
                result.day = undefined;
            }
            else d = Number(d);
        }
        result.day = d;
    }

    // Year
    if (h.year !== undefined && h.year !== null && h.year !== ''){
        let y = h.year;
        if (typeof y === 'string'){
            if (y.trim() === '') {
                result.year = undefined; 
            }
            else y = Number(y);
        }
        result.year = y;
    }

    return result;
}