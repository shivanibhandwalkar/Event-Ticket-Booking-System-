package com.example.booking.controller;

import com.example.booking.dto.BookingRequest;
import com.example.booking.model.Booking;
import com.example.booking.service.BookingService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    private final BookingService bookingService;

    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    // POST /api/bookings   body: { "seatId": 1, "customerName": "Asha" }
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Booking book(@RequestBody BookingRequest request) {
        if (request.seatId() == null
                || request.customerName() == null
                || request.customerName().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "seatId and customerName are required");
        }
        return bookingService.bookSeat(request.seatId(), request.customerName().trim());
    }
}
