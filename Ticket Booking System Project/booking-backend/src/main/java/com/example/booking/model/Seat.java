package com.example.booking.model;

import jakarta.persistence.*;

@Entity
@Table(name = "seats")
public class Seat {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "event_id")
    private Long eventId;      // which event this seat belongs to

    private String seatNumber; // e.g. "A1"
    private boolean booked;    // JSON field name becomes "booked"

    public Seat() {}

    public Seat(Long eventId, String seatNumber) {
        this.eventId = eventId;
        this.seatNumber = seatNumber;
        this.booked = false;
    }

    public Long getId() { return id; }
    public Long getEventId() { return eventId; }
    public String getSeatNumber() { return seatNumber; }
    public boolean isBooked() { return booked; }
    public void setBooked(boolean booked) { this.booked = booked; }
}
