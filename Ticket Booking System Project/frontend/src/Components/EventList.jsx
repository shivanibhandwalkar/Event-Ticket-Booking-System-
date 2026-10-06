function EventList({ events, onViewSeats }) {
  if (events.length === 0) {
    return <p>No events available.</p>;
  }
  return (
    <div className="event-list">
      {events.map((event) => (
        <div className="card" key={event.id}>
          <h3>{event.name}</h3>
          <p>{event.venue}</p>
          <p>{event.date}</p>
          <button id={`view-seats-${event.id}`} onClick={() => onViewSeats(event)}>
            View Seats
          </button>
        </div>
      ))}
    </div>
  );
}
export default EventList;