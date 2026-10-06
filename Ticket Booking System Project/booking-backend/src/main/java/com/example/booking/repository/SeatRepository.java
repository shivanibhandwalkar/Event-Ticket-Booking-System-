package com.example.booking.repository;

import com.example.booking.model.Seat;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface SeatRepository extends JpaRepository<Seat, Long> {
    // Spring builds the SQL from the method name
    List<Seat> findByEventIdOrderById(Long eventId);
}
