// Please add your country's public holidays here
// Example structure: 2025: [ { day: 17, month: 8, name: "Indonesia Independence Day" }, ... ]
// For recurring holidays every year, use the 'recurring' key

var publicHoliday = {
    2025: [
        { day: null, month: null, name: "EXAMPLE: Your Country Public Holiday" }
    ],
    2026: [
        { day: null, month: null, name: "EXAMPLE: Your Country Public Holiday" },
        { day: null, month: null, name: "EXAMPLE: Your Country Public Holiday" }
    ],
    // Recurring holidays every year
    recurring: [
        { day: 1, month: 1, name: "New Year's Day" },
        { day: 14, month: 2, name: "Valentine's Day" },
        { day: 25, month: 12, name: "Christmas" }
    ]
}
