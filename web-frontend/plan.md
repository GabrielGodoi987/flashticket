# FlashTicket implementation plan

## Scope and integration posture

FlashTicket will be a frontend-only React + TypeScript + Vite application. It will consume an existing public API Gateway through one centralized, typed client boundary. No backend framework, persistence layer, authentication server, event broker, payment infrastructure, or internal service integration will be added. Until gateway contracts are supplied, the application runs in an explicitly labeled mock mode controlled by `VITE_USE_MOCKS`; mock adapters are isolated behind the same interfaces used by the real client.

The first deliverable covers customer discovery and event detail, reservation/checkout simulation, ticket and notification views, sign-in/sign-up presentation, plus an organizer workspace with event management, ticket configuration, and read-only operations. All mock interactions are demonstrative and visibly marked so they are not confused with production data. Frontend validation is limited to usability; event state, inventory, permission, reservation validity, payment status, and ticket issuance remain backend-owned.

## Design direction

Three possible styles:

- **Neon Afterglow** — 0.06
- **Editorial Nightlife** — 0.04
- **Venue Blueprint** — 0.08

Chosen style: **Neon Afterglow**.

### Design movement
A dark, cinematic concert-platform aesthetic with editorial typography, luminous orange accents, and oversized event imagery that feels like a premium night-out guide rather than a generic marketplace.

### Core principles
1. Lead with atmosphere: every major surface should feel like the start of an evening.
2. Keep operational UI calm: dashboards use quiet panels, compact metrics, and precise status treatments.
3. Make the primary action obvious: reservation and discovery CTAs use one unmistakable ember-orange signal color.
4. Show system authority clearly: mock mode, backend-owned status, and integration TODOs are transparent.

### Color philosophy
The canvas is near-black navy so image and orange light carry the emotional weight. Ember orange is the ownable signal color for action, focus, and energy. Cool slate text and translucent blue panels keep dense ticketing information legible without flattening the cinematic mood. Lime is reserved for success, never decoration.

### Layout paradigm
A left-rail shell frames a wide, asymmetrical content canvas. The customer home uses a split hero with an editorial feature on the left and an offset event stack on the right. Listing, detail, checkout, and dashboard pages share the same rail but switch to practical two-column compositions instead of centered cards.

### Signature elements
- Ember-orange “signal line” and filled pill buttons for primary actions.
- Small uppercase metadata labels with tracked lettering, inspired by venue signage.
- Glassy navy panels with 1px cool borders and occasional glow gradients.

### Interaction philosophy and animation
Interactions should feel immediate and physical: cards lift 2px and brighten their border on hover; primary buttons translate 1px and deepen their shadow; filters and tabs use a 160ms ease-out. Keep motion subtle, never block content, and respect reduced-motion preferences. The reservation countdown is presentation-only and reads the expiration timestamp returned by the adapter.

### Typography system
Use `Plus Jakarta Sans` for all interface copy and headings, with strong weight contrast rather than a separate display face. Large headlines use tight tracking and a 0.96 line-height; metadata uses 11px uppercase labels with 0.12em letter spacing; body copy stays at 14–16px with generous line-height.

### Brand essence and voice
FlashTicket is the fast, clear way to find a good night out and keep every ticket in one place. Personality: electric, considered, dependable.

Headlines sound like: “Your next night starts here.” CTAs sound like: “Hold your spot.”

### Wordmark and logo
The wordmark uses a compact lightning-bolt ticket mark: a rounded ticket outline with a diagonal ember slash, paired with the `FlashTicket` name. The mark is reused in the app rail and favicon treatment.

### Signature brand color
**Ember orange** `#ff6b35` — a warm, ownable orange that reads as stage light against the midnight canvas.

## Implementation structure

- `src/app/App.tsx` — router, app shell, shared session context, and page composition.
- `src/app/routes.tsx` — route declarations mirrored by `public/manus-routes.json`.
- `src/components/` — navigation, buttons, cards, badges, field primitives, empty/error states, and data display components.
- `src/features/customer/` — home, event listing, detail, checkout, tickets, notifications, and auth page components.
- `src/features/organizer/` — overview, manage events, ticket configuration, and reservations/sales views.
- `src/lib/api/` — typed domain models, API errors, request client, real adapter boundary, and isolated mock adapter.
- `src/lib/format.ts` — date, money, and timer presentation helpers.
- `src/styles/` — tokens, reset, shell, component, page, and responsive styles.
- `public/manus-routes.json` — complete route manifest required by the managed preview.
- `README.md` and `.env.example` — setup, mock/real mode, and backend integration TODOs.

## Build and delivery workflow

1. Install the pinned Vite/React/TypeScript dependencies and add scripts for development, typecheck, and production build.
2. Implement the typed API layer and mock data before page components so mock and real adapters share contracts.
3. Implement the responsive shell and customer flows, then the organizer workspace.
4. Keep route manifest, README, and environment example synchronized as routes/configuration change.
5. Run TypeScript diagnostics, production build, and HTTP checks against the managed dev command.
6. Capture desktop and mobile preview evidence only where it helps verify the visual result, then fix confirmed issues.
7. Commit the deliverable to the canonical `main` branch for the managed checkpoint; do not publish automatically.

## Backend integration contracts

The real adapter is intentionally unimplemented until an OpenAPI specification or gateway endpoint contract is available. It will expose typed methods for events, reservations, auth/session, tickets, notifications, organizer events, ticket categories, and operational summaries. The UI must not call internal services directly, infer permissions, or manufacture production inventory and payment states.
