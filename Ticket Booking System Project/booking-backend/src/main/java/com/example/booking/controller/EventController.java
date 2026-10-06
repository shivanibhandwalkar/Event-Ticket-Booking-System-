package com.example.booking.controller;

import com.example.booking.model.Event;
import com.example.booking.model.Seat;
import com.example.booking.repository.SeatRepository;
import com.example.booking.service.EventService;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/events")
public class EventController {

    private final EventService eventService;
    private final SeatRepository seatRepository;

    public EventController(EventService eventService, SeatRepository seatRepository) {
        this.eventService = eventService;
        this.seatRepository = seatRepository;
    }

    // GET /api/events
    @GetMapping
    public List<Event> getEvents() {
        return eventService.getAllEvents();
    }

    // GET /api/events/1/seats
    @GetMapping("/{eventId}/seats")
    public List<Seat> getSeats(@PathVariable Long eventId) {
        return seatRepository.findByEventIdOrderById(eventId);
    }
}
