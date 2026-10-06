package com.example.booking.dto;

// The JSON body sent by the frontend: { "seatId": 1, "customerName": "Asha" }
public record BookingRequest(Long seatId, String customerName) {
}
