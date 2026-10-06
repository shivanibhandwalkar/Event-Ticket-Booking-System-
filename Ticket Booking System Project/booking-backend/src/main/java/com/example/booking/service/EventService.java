package com.example.booking.service;

import com.example.booking.model.Event;
import com.example.booking.repository.EventRepository;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class EventService {

    private final EventRepository eventRepository;

    public EventService(EventRepository eventRepository) {
        this.eventRepository = eventRepository;
    }

    // First call reads PostgreSQL and stores the result in Redis.
    // Next calls come straight from Redis.
    @Cacheable("events")
    public List<Event> getAllEvents() {
        return eventRepository.findAll();
    }
}
