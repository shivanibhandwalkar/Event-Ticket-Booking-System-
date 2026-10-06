import { useState } from "react";
import { bookSeat } from "../api";

function BookingForm({ seat, onBookingDone }) {
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleBook() {
    if (name.trim() === "") {
      setSuccess(false);
      setMessage("Please enter your name.");
      return;
    }
    setLoading(true);
    const result = await bookSeat(seat.id, name.trim());
    setLoading(false);
    setSuccess(result.success);
    setMessage(result.message);
    onBookingDone();
  }

  return (
    <div className="booking-form">
      <h3>Book seat {seat.seatNumber}</h3>
      <input
        id="customer-name"
        type="text"
        placeholder="Your name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <button id="book-btn" onClick={handleBook} disabled={loading}>
        {loading ? "Booking..." : "Book"}
      </button>
      {message && (
        <p id="message" className={success ? "success" : "error"}>
          {message}
        </p>
      )}
    </div>
  );
}
export default BookingForm;