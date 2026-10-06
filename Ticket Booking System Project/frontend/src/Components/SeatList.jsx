function SeatList({ seats, selectedSeat, onSelectSeat }) {
  return (
    <div className="seat-list">
      {seats.map((seat) => {
        let className = "seat";
        if (seat.booked) {
          className += " booked";
        } else if (selectedSeat && selectedSeat.id === seat.id) {
          className += " selected";
        }
        return (
          <button
            key={seat.id}
            id={`seat-${seat.id}`}
            className={className}
            disabled={seat.booked}
            onClick={() => onSelectSeat(seat)}
          >
            {seat.seatNumber}
          </button>
        );
      })}
    </div>
  );
}
export default SeatList;
