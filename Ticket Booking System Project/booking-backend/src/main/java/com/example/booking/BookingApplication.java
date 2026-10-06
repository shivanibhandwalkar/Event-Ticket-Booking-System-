package com.example.booking;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;

@SpringBootApplication
@EnableCaching // turns on @Cacheable (stored in Redis)
public class BookingApplication {
    // This runs before Spring starts (also before tests) and sets the modern name.
    static {
        java.util.TimeZone.setDefault(java.util.TimeZone.getTimeZone("Asia/Kolkata"));
    }

    public static void main(String[] args) {
        SpringApplication.run(BookingApplication.class, args);
    }
}
