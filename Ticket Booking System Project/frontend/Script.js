
let currentEvent = null;
let currentSeat = null;  // seat the user clicked
let lastSeats = [];      // latest seats from the server
let busy = false;        // true while a booking request is running

const $ = (id) => document.getElementById(id);
const ZONE_NAME = { left: "Left side", mid: "Middle", right: "Right side" };

function showMessage(box, text, isSuccess) {
    box.textContent = text;
    box.className = "msg " + (isSuccess ? "success" : "error");
    box.hidden = false;
}

// Work out the zone of a seat from its number.
// About 30% of each row is "left", 30% is "right", the rest is "middle".
function zoneOf(num, perRow) {
    const edge = Math.round(perRow * 0.3);
    if (num <= edge) return "left";
    if (num > perRow - edge) return "right";
    return "mid";
}

// "A1" -> { row: "A", num: 1 }
function parseSeat(seatNumber) {
    const m = /^([A-Za-z]+)(\d+)$/.exec(seatNumber);
    return m ? { row: m[1], num: Number(m[2]) } : { row: "?", num: 0 };
}

function post(seatId, name) {
    return fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ seatId: seatId, customerName: name }),
    });
}
async function loadEvents() {
    try {
        const res = await fetch("/api/events");
        if (!res.ok) throw new Error("Could not load events");
        drawEvents(await res.json());
    } catch (err) {
        showMessage($("page-error"), err.message, false);
    }
}
function drawEvents(events) {
    const box = $("event-list");
    box.innerHTML = "";
    if (events.length === 0) {
        box.textContent = "No events available.";
        return;
    }
    events.forEach(function (event) {
        const card = document.createElement("div");
        card.className = "card";
        const title = document.createElement("h3");
        title.textContent = event.name;
        const venue = document.createElement("p");
        venue.textContent = event.venue;
        const date = document.createElement("p");
        date.textContent = event.date;
        const btn = document.createElement("button");
        btn.id = "view-seats-" + event.id; // Selenium uses this id
        btn.textContent = "View Seats";
        btn.addEventListener("click", () => openEvent(event));
        card.append(title, venue, date, btn);
        box.appendChild(card);
    });
}
async function openEvent(event) {
    currentEvent = event;
    currentSeat = null;
    $("booking-section").hidden = true;
    $("ticket").hidden = true;
    $("message").hidden = true;
    $("race-results").innerHTML = "";
    $("race-summary").hidden = true;
    $("seat-title").textContent = "Seats for " + event.name;
    $("seat-section").hidden = false;
    await loadSeats();
}

async function loadSeats(quiet) {
    try {
        const res = await fetch("/api/events/" + currentEvent.id + "/seats");
        if (!res.ok) throw new Error("Could not load seats");
        drawSeats(await res.json());
    } catch (err) {
        if (!quiet) showMessage($("page-error"), err.message, false);
    }
}

function drawSeats(seats) {
    lastSeats = seats;

    // Group seats by row letter, keeping the order from the server
    const rows = {};
    let perRow = 0;
    seats.forEach(function (seat) {
        const p = parseSeat(seat.seatNumber);
        if (!rows[p.row]) rows[p.row] = [];
        rows[p.row].push({ seat: seat, num: p.num });
        perRow = Math.max(perRow, p.num);
    });
    const rowNames = Object.keys(rows);

    const map = $("seat-map");
    map.innerHTML = "";

    const counts = { left: 0, mid: 0, right: 0 };
    for (let n = 1; n <= perRow; n++) counts[zoneOf(n, perRow)]++;
    const header = document.createElement("div");
    header.className = "row";
    header.appendChild(document.createElement("span")).className = "row-label";
    ["left", "mid", "right"].forEach(function (z) {
        const g = document.createElement("div");
        g.className = "zone-name";
        g.style.width = counts[z] * 44 + (counts[z] - 1) * 6 + "px"; //seats map logic
        g.textContent = ZONE_NAME[z].toUpperCase();
        header.appendChild(g);
    });
    map.appendChild(header);


    rowNames.forEach(function (rowName, rowIndex) {
        const line = document.createElement("div");
        line.className = "row";
        const label = document.createElement("span");
        label.className = "row-label";
        label.textContent = rowName;
        line.appendChild(label);

        const groups = {};
        ["left", "mid", "right"].forEach(function (z) {
            groups[z] = document.createElement("div");
            groups[z].className = "group";
            line.appendChild(groups[z]);
        });

        rows[rowName].forEach(function (item) {
            const seat = item.seat;
            const zone = zoneOf(item.num, perRow);
            // corner = first or last seat of the front row or the back row
            const isCorner =
                (rowIndex === 0 || rowIndex === rowNames.length - 1) &&
                (item.num === 1 || item.num === perRow);

            const btn = document.createElement("button");
            btn.id = "seat-" + seat.id;
            btn.className = "seat z-" + zone + (isCorner ? " corner" : "");
            btn.textContent = seat.seatNumber;
            btn.title =
                seat.seatNumber + " - " + ZONE_NAME[zone] +
                (rowIndex === 0 ? ", front row" : "") +
                (isCorner ? ", corner seat" : "");

            if (seat.booked) {
                btn.classList.add("booked");
                btn.disabled = true;
            } else if (currentSeat && currentSeat.id === seat.id) {
                btn.classList.add("selected");
            }
            btn.addEventListener("click", () => pickSeat(seat));
            groups[zone].appendChild(btn);
        });
        map.appendChild(line);
    });

    // if seat booked ,then warning
    if (currentSeat) {
        const mine = seats.find((s) => s.id === currentSeat.id);
        const taken = !mine || mine.booked;
        $("book-btn").disabled = busy || taken;
        if (taken && $("message").hidden) {
            showMessage($("message"), "Someone just took this seat. Pick another one.", false);
        }
    }
}

// Zone text for a seat, used on the form and the ticket
function describeSeat(seat) {
    const p = parseSeat(seat.seatNumber);
    let perRow = 0;
    lastSeats.forEach((s) => (perRow = Math.max(perRow, parseSeat(s.seatNumber).num)));
    return ZONE_NAME[zoneOf(p.num, perRow)];
}

// booking seat
function pickSeat(seat) {
    currentSeat = seat;
    $("booking-title").textContent = "Book seat " + seat.seatNumber + " (" + describeSeat(seat) + ")";
    $("booking-section").hidden = false;
    $("ticket").hidden = true;
    $("message").hidden = true;
    $("book-btn").disabled = false;
    drawSeats(lastSeats); // redraw so the chosen seat turns blue
}

async function bookSelectedSeat() {
    const name = $("customer-name").value.trim();
    if (name === "") {
        showMessage($("message"), "Please enter your name.", false);
        return;
    }
    busy = true;
    $("book-btn").disabled = true;
    $("book-btn").textContent = "Booking...";
    const bookedSeat = currentSeat;
    try {
        const res = await post(bookedSeat.id, name);
        if (res.status === 409) {
            showMessage($("message"), "Sorry, this seat was just taken!", false);
        } else if (!res.ok) {
            showMessage($("message"), "Booking failed. Please try again.", false);
        } else {
            const booking = await res.json();
            showMessage($("message"), "Booking successful!", true);
            showTicket(booking, bookedSeat, name);
        }
    } catch (err) {
        showMessage($("message"), "Cannot reach the server.", false);
    }
    busy = false;
    $("book-btn").textContent = "Book";
    await loadSeats(); // refresh so the booked seat turns grey
}
function showTicket(booking, seat, name) {
    $("t-event").textContent = currentEvent.name;
    $("t-venue").textContent = currentEvent.venue;
    $("t-date").textContent = currentEvent.date;
    $("t-name").textContent = name;
    $("t-seat").textContent = seat.seatNumber;
    $("t-zone").textContent = describeSeat(seat);
    $("t-id").textContent = "#" + String(booking.id).padStart(6, "0");
    $("ticket").hidden = false;
    $("ticket").scrollIntoView({ behavior: "smooth", block: "center" });
}
// Sends 10 requests at once for one seat. The Redis lock lets only one win.
async function runRace() {
    const target = currentSeat
        ? lastSeats.find((s) => s.id === currentSeat.id)
        : lastSeats.find((s) => !s.booked);

    if (!target || target.booked) {
        showMessage($("race-summary"), "No free seat available for the demo.", false);
        return;
    }
    $("race-btn").disabled = true;
    $("race-results").innerHTML = "";
    showMessage($("race-summary"), "Firing 10 requests at seat " + target.seatNumber + "...", true);

    // Start all 10 requests together, then wait for every answer
    const calls = [];
    for (let i = 1; i <= 10; i++) {
        calls.push(post(target.id, "Racer " + i).then((r) => r.status).catch(() => 0));
    }
    const codes = await Promise.all(calls);

    let wins = 0;
    codes.forEach(function (code, i) {
        const li = document.createElement("li");
        if (code === 201) {
            wins++;
            li.className = "won";
            li.textContent = "Racer " + (i + 1) + ": WON the seat";
        } else {
            li.textContent = "Racer " + (i + 1) + ": rejected (" + (code || "error") + ")";
        }
        $("race-results").appendChild(li);
    });

    showMessage(
        $("race-summary"),
        wins + " won, " + (10 - wins) + " rejected. Double booking prevented!",
        wins === 1
    );

    // the race used up that seat, so close the form
    currentSeat = null;
    $("booking-section").hidden = true;
    $("race-btn").disabled = false;
    await loadSeats();
}
$("book-btn").addEventListener("click", bookSelectedSeat);
$("race-btn").addEventListener("click", runRace);
$("print-btn").addEventListener("click", () => window.print());

// Live updates: re-read the seats every 3 seconds while an event is open
setInterval(function () {
    if (currentEvent && !busy && !document.hidden) void loadSeats(true);
}, 3000);

void loadEvents();