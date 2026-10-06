package com.example.booking;

import io.restassured.RestAssured;
import io.restassured.http.ContentType;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.*;

import static io.restassured.RestAssured.given;
import static org.junit.jupiter.api.Assertions.assertEquals;

// Docker (PostgreSQL + Redis)
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class BookingApiTest {

    @LocalServerPort
    private int port;

    @BeforeEach
    void setUp() {
        RestAssured.port = port;
    }

    @Test
    void bookingConcurrentRequests_onlyOneSucceeds() throws Exception {
        // 1. Find a seat that is still free
        int eventId = given().get("/api/events").then().extract().path("[0].id");
        int seatId = given().get("/api/events/" + eventId + "/seats")
                .then().extract().path("find { it.booked == false }.id");

        int users = 10;
        ExecutorService pool = Executors.newFixedThreadPool(users);
        CountDownLatch ready = new CountDownLatch(users); //threads 2 set
        CountDownLatch go = new CountDownLatch(1);        //start

        List<Future<Integer>> results = new ArrayList<>();
        for (int i = 0; i < users; i++) {
            final int userNumber = i;
            results.add(pool.submit(() -> {
                ready.countDown();
                go.await(); // wait for others

                // Using a Map prevents raw string quoting and syntax errors
                Map<String, Object> bodyMap = new HashMap<>();
                bodyMap.put("seatId", seatId);
                bodyMap.put("customerName", "user" + userNumber);

                return given()
                        .contentType(ContentType.JSON)
                        .body(bodyMap)
                        .when()
                        .post("/api/bookings")
                        .then()
                        .extract()
                        .statusCode();
            }));
        }

        ready.await();  // 6- 10 threads waiting
        go.countDown(); // fire all upto 10 requests at the same moment

        int success = 0;
        int conflict = 0;
        for (Future<Integer> result : results) {
            int status = result.get(30, TimeUnit.SECONDS);
            if (status == 201) success++;
            if (status == 409) conflict++;
        }
        pool.shutdown();

        assertEquals(1, success, "exactly one request should win the seat");
        assertEquals(users - 1, conflict, "everyone else should get 409");
    }
}
//for package com.example.booking;
//
//import org.junit.jupiter.api.AfterEach;
//import org.junit.jupiter.api.BeforeEach;
//import org.junit.jupiter.api.Test;
//import org.openqa.selenium.By;
//import org.openqa.selenium.WebDriver;
//import org.openqa.selenium.chrome.ChromeDriver;
//import org.openqa.selenium.support.ui.ExpectedConditions;
//import org.openqa.selenium.support.ui.WebDriverWait;
//
//import java.time.Duration;
//
//import static org.junit.jupiter.api.Assertions.assertEquals;
//
/// / UI test: opens the real site in Chrome and clicks like a user.
/// / Before running: Docker, the backend (8080) and the frontend (npm run dev, 3000) must all be running.
//class SeatBookingUITest {
//
//    private WebDriver driver;
//    private WebDriverWait wait;
//
//    @BeforeEach
//    void openBrowser() {
//        driver = new ChromeDriver(); // Selenium Manager downloads chromedriver automatically
//        wait = new WebDriverWait(driver, Duration.ofSeconds(10)); // waits up to 10s for elements
//    }
//
//    @AfterEach
//    void closeBrowser() {
//        driver.quit();
//    }
//
//    @Test
//    void userCanBookAFreeSeat() {
//        driver.get("http://localhost:3000");
//
//        // 1. Click "View Seats" on the first event (ids look like view-seats-1, view-seats-2...)
//        wait.until(ExpectedConditions.elementToBeClickable(
//                By.cssSelector("button[id^='view-seats-']"))).click();
//
//        // 2. Click the first seat that is not disabled (not booked)
//        wait.until(ExpectedConditions.elementToBeClickable(
//                By.cssSelector("button.seat:not([disabled])"))).click();
//
//        // 3. Type a name and press Book
//        wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("customer-name")))
//                .sendKeys("Selenium User");
//        driver.findElement(By.id("book-btn")).click();
//
//        // 4. Check the success message
//        String message = wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("message"))).getText();
//        assertEquals("Booking successful!", message);
//    }
//}