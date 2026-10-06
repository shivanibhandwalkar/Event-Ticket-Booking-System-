package com.example.booking.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "bookings")
public class Booking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "seat_id")
    private Long seatId;

    private String customerName;
    private LocalDateTime bookedAt;

    public Booking() {}

    public Booking(Long seatId, String customerName, LocalDateTime bookedAt) {
        this.seatId = seatId;
        this.customerName = customerName;
        this.bookedAt = bookedAt;
    }

    public Long getId() { return id; }
    public Long getSeatId() { return seatId; }
    public String getCustomerName() { return customerName; }
    public LocalDateTime getBookedAt() { return bookedAt; }
}
