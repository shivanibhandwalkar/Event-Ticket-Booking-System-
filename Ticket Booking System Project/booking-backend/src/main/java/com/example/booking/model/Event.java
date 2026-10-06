package com.example.booking.model;

import jakarta.persistence.*;
import java.io.Serializable;
import java.time.LocalDate;

// Serializable is needed because the events list is cached in Redis
@Entity
@Table(name = "events")
public class Event implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String venue;

    @Column(name = "event_date")
    private LocalDate date;

    public Event() {}

    public Event(String name, String venue, LocalDate date) {
        this.name = name;
        this.venue = venue;
        this.date = date;
    }

    public Long getId() { return id; }
    public String getName() { return name; }
    public String getVenue() { return venue; }
    public LocalDate getDate() { return date; }
}
