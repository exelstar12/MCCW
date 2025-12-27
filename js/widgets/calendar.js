var calendar_widget = {
    draw: drawWidgetCalendar,
    fill: fillWidgetCalendar
};

function drawWidgetCalendar(){
    document.getElementById("calendar").innerHTML = "<tr><th>SU</th><th>MO</th><th>TU</th><th>WE</th><th>TH</th><th>FR</th><th>SA</th></tr>";

    let month = MCCW.date.initial.getMonth();
    let year = MCCW.date.initial.getFullYear();
    let days = new Date(year, month + 1, 0).getDate();
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
        // create td and attach dataset info so we can recognise today/holidays later
        let td = document.createElement("td");
        if (data !== ""){
            td.dataset.day = data;
            td.dataset.month = month; // zero-based month to match Date.getMonth()
            td.dataset.year = year;
            td.appendChild(document.createTextNode(data));
        } else {
            td.appendChild(document.createTextNode(""));
        }
        elem.appendChild(td);
    };

    document.getElementById("calendar").appendChild(elem);
}


function fillWidgetCalendar(){
    const { currentDay, currentMonth, currentYear } = getCurrentDateInfo();
    let pastDayFlag = true; // Past day flag
    const days = document.getElementById("calendar").getElementsByTagName("td");
    const holidays = collectHolidays(currentYear);

    for (let i = 0; i < days.length; i++){
        const td = days[i];
        const dStr = td.dataset.day;
        if (!dStr){ // skip empty leading/trailing cells
            continue;
        }
        const d = Number(dStr);
        const m = Number(td.dataset.month);
        const y = Number(td.dataset.year);

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

function findHolidayForDay(holidays, day, month, year){
    for (let h of holidays){
        const hd = Number(h.day);
        const hm = normalizeHolidayMonth(h.month);
        const hy = h.year ? Number(h.year) : undefined;

        if (hd === day && hm === month && (hy === undefined || hy === year)){
            return h;
        }
    }
    return null;
}

function applyHolidayToTd(td, h){
    td.classList.add("holiday");
    if (h.name) td.dataset.tooltip = h.name;  // used by custom CSS tooltip
}

function getCurrentDateInfo(){
    return {
        currentDay: Number(MCCW.date.time && MCCW.date.time[2] ? MCCW.date.time[2] : MCCW.date.initial.getDate()),
        currentMonth: MCCW.date.initial.getMonth(),
        currentYear: MCCW.date.initial.getFullYear()
    };
}

function collectHolidays(year){
    let holidays = [];
    if (typeof publicHoliday === "object" && publicHoliday !== null){
        if (Array.isArray(publicHoliday[year])) holidays = holidays.concat(publicHoliday[year]);
        if (Array.isArray(publicHoliday.recurring)) holidays = holidays.concat(publicHoliday.recurring);
    }
    return holidays;
}

function normalizeHolidayMonth(month){
    let hm = typeof month === "number" ? Number(month) : NaN;
    // Validate month range
    if (isNaN(hm) || hm < 1 || hm > 12) 
        return NaN;
    // Convert 1-12 to 0-11, because Date.getMonth() is zero-based
    if (hm >= 1 && hm <= 12) 
        hm = hm - 1;
    return hm;
}