import { useState, useEffect } from "react";
import { getEvents, getSeats } from "./api";
import EventList from "./components/EventList";
import SeatList from "./components/SeatList";
import BookingForm from "./components/BookingForm";
import "./App.css";

function App() {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [seats, setSeats] = useState([]);
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    loadEvents();
  }, []);

  async function loadEvents() {
    try {
      const data = await getEvents();
      setEvents(data);
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleViewSeats(event) {
    try {
      setSelectedEvent(event);
      setSelectedSeat(null);
      const data = await getSeats(event.id);
      setSeats(data);
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleBookingDone() {
    const data = await getSeats(selectedEvent.id);
    setSeats(data);
  }

  return (
    <div className="container">
      <h1>Ticket Booking System</h1>
      {error && <p className="error">{error}</p>}
      <EventList events={events} onViewSeats={handleViewSeats} />

      {selectedEvent && (
        <>
          <h2>Seats for {selectedEvent.name}</h2>
          <SeatList seats={seats} selectedSeat={selectedSeat} onSelectSeat={setSelectedSeat} />
        </>
      )}

      {selectedSeat && (
        <BookingForm seat={selectedSeat} onBookingDone={handleBookingDone} />
      )}
    </div>
  );
}

export default App;