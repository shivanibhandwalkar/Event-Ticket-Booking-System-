// Fetches the list of all events from Spring Boot
export async function getEvents() {
  const response = await fetch("/api/events");
  if (!response.ok) {
    throw new Error("Could not load events");
  }
  return response.json();
}

// Fetches all seats associated with a specific event ID
export async function getSeats(eventId) {
  const response = await fetch(`/api/events/${eventId}/seats`);
  if (!response.ok) {
    throw new Error("Could not load seats");
  }
  return response.json();
}

// Attempts to book a seat. Returns success/failure message.
export async function bookSeat(seatId, customerName) {
  const response = await fetch("/api/bookings", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ seatId, customerName }),
  });

  // 409 Conflict: Redis lock prevents double-booking
  if (response.status === 409) {
    return { success: false, message: "Sorry, this seat was just taken!" };
  }
  if (!response.ok) {
    return { success: false, message: "Booking failed. Please try again." };
  }
  return { success: true, message: "Booking successful!" };
}