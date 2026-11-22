# FlashTicket delivery TODO

## Customer discovery and event browsing
- [ ] Deliver a responsive dark-mode customer interface with responsive navigation, featured events, search, event categories, upcoming events, event cards, event listing filters for search/category/date, and pagination or incremental loading.
- [ ] Show event details including event title, description, location, date and time, ticket categories, prices, available quantities, and a reserve action.

## Authentication and session handling
- [ ] Provide sign-in and sign-up pages, session handling, and protected routes.
- [ ] Use the existing IAM backend for real authentication once endpoints are available; do not add an authentication server.

## Reservation and checkout presentation
- [ ] Provide selected event, ticket quantity, price summary, reservation status, reservation expiration countdown, simulated payment confirmation, and payment failure feedback.
- [ ] Treat the reservation timer as a visual representation of the expiration timestamp supplied by the backend; the frontend must never decide whether a reservation remains valid.

## Tickets and notifications
- [ ] Provide purchased tickets, ticket details, ticket status, and QR-code display when supported by the backend.
- [ ] Provide a notification list with read/unread status, notification categories, pagination, and mark-as-read behavior.

## Organizer workspace
- [ ] Create a protected organizer area with organizer events, basic backend-returned metrics, and shortcuts to event management.
- [ ] Provide manage-events views for listing events, creating events, editing permitted details, publishing, and canceling only when authorized.
- [ ] Provide ticket configuration for ticket categories, lot quantities, prices, and sales periods.
- [ ] Provide read-only reservation and sales summaries using statuses and data supplied by backend APIs; do not invent financial reports, analytics data, or business rules.

## API boundary and mock mode
- [ ] Route all backend requests through a configurable public API Gateway base URL using a reusable HTTP client, typed request/response models, typed API errors, loading/error/empty states, authentication integration, unauthorized/forbidden handling, and cancellation where appropriate.
- [ ] Do not communicate directly with RabbitMQ, Redis, PostgreSQL, MongoDB, or internal services from the browser.
- [ ] Do not invent backend endpoints and present them as implemented; if no OpenAPI specification is available, keep clearly labeled integration interfaces that can be adapted when real endpoints become available.
- [ ] Make mock mode explicitly configurable and isolate mock adapters so switching to real APIs requires minimal changes; do not create a persistent database or fake backend.
- [ ] Keep the backend authoritative for user permissions, event states, ticket prices, available inventory, reservation validity/expiration, payment status, ticket issuance, and notification ownership.

## Code quality and handoff
- [ ] Use reusable components, feature-oriented organization, strict TypeScript, accessible forms, responsive pages, error boundaries where appropriate, basic component tests, and meaningful loading/empty states.
- [ ] Include a README explaining setup and backend integration, an environment variable example, and clear TODOs for pending gateway integration.
