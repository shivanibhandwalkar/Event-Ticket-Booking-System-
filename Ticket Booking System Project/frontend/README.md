# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and Oxlint's TypeScript related rules in your project.
# Ticket Booking System

This is a small ticket booking website I made to learn how backend, database and testing work together. You can see events, pick a seat and book it.

The main thing I wanted to solve was **double booking**. If two people click the same seat at the same time, only one of them should get it. I used Redis for this.

## What it does

- Shows a list of events
- Shows the seats of an event (left, middle and right side, corner seats have a star)
- You pick a seat, type your name and book it
- After booking you get a ticket that you can print
- Seats refresh automatically every 3 seconds, so if someone books in another tab it turns grey
- There is a "Race demo" button that sends 10 booking requests for one seat at once. Only 1 wins and the other 9 get rejected

## Technologies used

- Frontend: HTML, CSS, JavaScript (run with Vite)
- Backend: Java 17, Spring Boot, Spring Data JPA
- Database: PostgreSQL
- Redis: for caching the events list and for the seat lock
- Testing: JUnit 5, REST Assured, Selenium
- Docker: to run PostgreSQL and Redis

## How double booking is stopped

1. User clicks Book and the request goes to `BookingController` and then `BookingService`.
2. The service tries to create a lock in Redis for that seat using `setIfAbsent`. Only one request can create it.
3. Everyone else gets a `409 Conflict` straight away.
4. The request that got the lock checks the seat in the database, marks it booked, saves the booking and then removes the lock.
5. The lock expires after 10 seconds, so the seat is not stuck forever if something crashes.

I did not use `@Transactional` on the booking method on purpose. The seat should be saved in the database before the lock is removed, otherwise another request could slip in.

## Testing

`BookingApiTest` starts 10 threads at the same time (using `ExecutorService` and `CountDownLatch`) and all of them try to book the same seat. The test checks that exactly 1 request succeeds and 9 get a 409.

`SeatBookingUITest` uses Selenium to open the site in Chrome, click a seat, enter a name and check the success message.

## How to run

You need JDK 17, Node.js, Docker Desktop and Google Chrome.

1. Start the database and Redis (in the project folder):

   docker compose up -d

2. Run the backend. Open the backend folder in IntelliJ and run `BookingApplication`, or:

   cd backend
   mvn spring-boot:run

   It runs on http://localhost:8080

3. Run the frontend:

   cd frontend
   npm install
   npm run dev

   Open http://localhost:3000

Some sample events and seats are added automatically the first time the backend starts.

To delete all data and start fresh: `docker compose down -v` and start again.

## API

- GET /api/events - list of events
- GET /api/events/{id}/seats - seats of one event
- POST /api/bookings - book a seat, body is `{ "seatId": 1, "customerName": "Asha" }`

## Folder structure

- backend: Spring Boot project
- frontend: index.html, index.css, script.js
- docker-compose.yml: PostgreSQL and Redis

## What I learned

- Why checking a seat and then saving it is not safe when many users book together
- How a Redis lock solves this
- How to write a test that sends many requests at the same time
- How the frontend, backend, database and Redis connect with each other

## Screenshots

(add your screenshots here)