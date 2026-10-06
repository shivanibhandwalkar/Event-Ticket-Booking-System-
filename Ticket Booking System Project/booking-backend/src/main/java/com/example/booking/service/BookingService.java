package com.example.booking.service;

import com.example.booking.model.Booking;
import com.example.booking.model.Seat;
import com.example.booking.repository.BookingRepository;
import com.example.booking.repository.SeatRepository;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class BookingService {

    private final SeatRepository seatRepository;
    private final BookingRepository bookingRepository;
    private final StringRedisTemplate redis;

    public BookingService(SeatRepository seatRepository,
                          BookingRepository bookingRepository,
                          StringRedisTemplate redis) {
        this.seatRepository = seatRepository;
        this.bookingRepository = bookingRepository;
        this.redis = redis;
    }

    // NOTE: no @Transactional here on purpose. Each save() commits by itself,
    // so the seat is already marked booked in the DB BEFORE we release the lock.
    public Booking bookSeat(Long seatId, String customerName) {

        String lockKey = "lock:seat:" + seatId;
        String myToken = UUID.randomUUID().toString(); // proves the lock is mine

        // setIfAbsent = "set only if the key does not exist yet".
        // Redis handles this atomically, so only ONE request can win.
        // The 10 second expiry stops a crashed request from locking forever.
        Boolean gotLock = redis.opsForValue().setIfAbsent(lockKey, myToken, Duration.ofSeconds(10));

        if (!Boolean.TRUE.equals(gotLock)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Seat is being booked by someone else");
        }

        try {
            Seat seat = seatRepository.findById(seatId)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Seat not found"));

            // A request that arrives after the winner finished sees booked = true
            if (seat.isBooked()) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "Seat already booked");
            }

            seat.setBooked(true);
            seatRepository.save(seat);

            return bookingRepository.save(new Booking(seatId, customerName, LocalDateTime.now()));

        } finally {
            // Release the lock, but only if it is still ours
            if (myToken.equals(redis.opsForValue().get(lockKey))) {
                redis.delete(lockKey);
            }
        }
    }
}
