package com.example.booking.config;

import com.example.booking.model.Event;
import com.example.booking.model.Seat;
import com.example.booking.repository.EventRepository;
import com.example.booking.repository.SeatRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import java.time.LocalDate;

// Runs once at startup and adds sample events + seats if the database is empty
@Component
public class DataLoader implements CommandLineRunner {

    private final EventRepository eventRepository;
    private final SeatRepository seatRepository;

    public DataLoader(EventRepository eventRepository, SeatRepository seatRepository) {
        this.eventRepository = eventRepository;
        this.seatRepository = seatRepository;
    }

    @Override
    public void run(String... args) {
        if (eventRepository.count() > 0) {
            return; // data already there
        }

        addEvent("Rock Night", "City Arena, Pune", LocalDate.now().plusDays(10));
        addEvent("Stand-up Comedy Show", "Town Hall, Mumbai", LocalDate.now().plusDays(20));
        addEvent("Classical Music Evening", "Cultural Hall, Pune", LocalDate.now().plusDays(30));
    }

    private void addEvent(String name, String venue, LocalDate date) {
        Event event = eventRepository.save(new Event(name, venue, date));

        // 2 rows (A, B) x 10 seats = A1..A10, B1..B10
        for (char row = (char) 65; row <= (char) 66; row++) {
            for (int number = 1; number <= 10; number++) {
                seatRepository.save(new Seat(event.getId(), "" + row + number));
            }
        }
    }
}
