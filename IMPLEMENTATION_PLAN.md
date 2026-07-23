# Baby Shower RSVP & Gift Registry — MVP Implementation Plan

## Implementation status — July 23, 2026

- [x] Initialized the React/TypeScript site foundation.
- [x] Added the cream, sage, peach, Playfair Display, and Inter design system.
- [x] Built the responsive public invitation, event detail, RSVP, and gift
  browsing/reservation interfaces.
- [x] Added category filters, mobile navigation, share fallback, confirmations,
  responsive layouts, keyboard focus, and reduced-motion support.
- [x] Installed Convex and added the initial schema and validated RSVP mutation.
- [x] Added a project-specific social preview image and metadata.
- [x] Created a local Convex development deployment and generated typed API
  bindings.
- [x] Connected RSVP submission and real-time gift availability to live Convex
  queries and mutations.
- [x] Implemented atomic gift reservation validation and backend-generated
  reservation codes.
- [x] Seeded the local development deployment with starter event and gift data.
- [x] Added Convex Auth password sessions with enforced password requirements.
- [x] Added one-time first-admin activation backed by a Convex deployment
  secret.
- [x] Implemented server-authorized admin functions for statistics, event
  settings, RSVP deletion, gift CRUD/visibility, file upload URLs, and
  reservation cancellation.
- [x] Built the responsive organizer dashboard, live statistics, RSVP search
  and CSV export, gift controls, reservation management, and event editor.
- [x] Connected the public invitation to reactive event settings, including the
  title, parent names, date, time, venue, dress code, parking, contact details,
  announcement, RSVP deadline, and Google Maps link.
- [x] Added a live event countdown and downloadable `.ics` calendar event.
- [x] Added the protected QR center with production-URL configuration, PNG and
  SVG downloads, and a print-friendly invitation layout.
- [x] Added protected Convex File Storage uploads for gift images, including
  file-type/size checks, public image rendering, gift editing, and cleanup when
  stored images are replaced or deleted.
- [x] Added hidden honeypot fields and backend-enforced ten-minute submission
  limits for RSVP and gift-reservation attempts.
- [x] Replaced the starter tests with a Vitest and `convex-test` suite covering
  concurrent gift reservations, RSVP normalization and throttling, bot
  honeypots, admin authorization, calendar generation, CSV escaping, public
  rendering, and the protected admin route.
- [x] Extracted calendar and CSV generation into focused, independently tested
  utilities.
- [x] Replaced starter documentation and package metadata with production
  setup, verification, and launch guidance for this product.
- [x] Re-ran the production build, lint checks, and complete automated test
  suite after the release-readiness updates.
- [ ] Connect this workspace to a cloud Convex project. The current deployment
  is anonymous and local-only, so a hosted frontend would not be able to accept
  live RSVPs or reservations.
- [ ] Add the production organizer account and replace the local-only admin
  activation code before publishing.
- [ ] Replace placeholder event details with organizer-approved content.

## 1. MVP outcome

Deliver a mobile-first invitation website where guests can:

- View the baby shower invitation and event details.
- Submit an RSVP in under two minutes.
- Browse and filter gifts.
- Reserve an available gift without duplicate reservations.
- Receive an RSVP confirmation or gift reservation code.
- Add the event to their calendar and share the website.

Deliver a protected admin area where organizers can:

- Manage event settings.
- View, search, filter, delete, and export RSVPs.
- Add, edit, hide, and delete gifts.
- View, search, and cancel gift reservations.
- Generate and download the event QR code.

Convex is the source of truth for event data, RSVPs, gifts, and reservations.
RSVP and gift availability changes must appear in real time.

## 2. Explicit MVP boundaries

### Included

- Public invitation and event details.
- RSVP submission and confirmation.
- Gift browsing, filters, reservation, conflict handling, and confirmation code.
- Real-time gift availability and admin RSVP updates.
- Protected admin dashboard.
- Event, RSVP, gift, and reservation administration.
- CSV export.
- QR generation with PNG and SVG downloads and a print-friendly layout.
- Add-to-calendar and share actions.
- Responsive and accessible UI.
- Server-side validation, authorization, reservation locking, and basic abuse protection.

### Deferred

- Email and WhatsApp notifications.
- Automated thank-you messages.
- Photo gallery and digital guestbook.
- Multiple languages.
- Advanced event analytics.
- UAE retailer purchase links.

## 3. Decisions to confirm early

These do not prevent initial scaffolding, but must be resolved before their
related features are finalized:

1. **Admin authentication:** Prefer Convex Auth unless there is a specific
   requirement for username/password authentication. Do not build custom
   password storage without a strong reason.
2. **QR visibility:** Section 10 places QR generation in the admin area, while
   the acceptance criteria says guests can download it. Recommended MVP:
   admins generate/download PNG and SVG; guests may share the site URL.
3. **Deployment target:** Choose Vercel or Lovable before deployment setup.
   Recommended default: Vercel for the React frontend, with Convex hosted
   separately.
4. **Gift images:** Confirm whether admins upload files to Convex File Storage
   or enter image URLs. The PRD names Convex File Storage, so upload is the
   recommended MVP behavior.
5. **Event content:** Obtain final parent names, event details, contact
   information, and desired public domain before production launch.

## 4. Recommended architecture

### Frontend

- React + TypeScript.
- Vite for a small, focused single-page application.
- React Router with public and admin route groups.
- Tailwind CSS and shadcn/ui for accessible primitives.
- React Hook Form + Zod for form state and client validation.
- Convex React hooks for queries, mutations, and real-time updates.

### Backend

- Convex schema and server functions grouped by domain:
  `eventSettings`, `rsvps`, `gifts`, `reservations`, and `auth`.
- Public queries expose only event and visible gift data.
- Admin queries and mutations verify identity and role server-side.
- Gift reservation is one atomic Convex mutation that checks availability,
  creates the reservation, and marks the gift reserved.
- Reservation cancellation is one atomic admin mutation that cancels the
  reservation and restores gift availability.

### Route map

- `/` — invitation hero, countdown, event details, RSVP call to action.
- `/rsvp` — RSVP form and confirmation.
- `/gifts` — gift list, filters, reservation dialog, confirmation.
- `/admin/login` — admin sign-in.
- `/admin` — overview and attendance statistics.
- `/admin/event` — event settings.
- `/admin/rsvps` — RSVP management and CSV export.
- `/admin/gifts` — gift and image management.
- `/admin/reservations` — reservation management.
- `/admin/qr` — QR preview, PNG/SVG download, print view.

### Suggested source structure

```text
src/
  app/
    router.tsx
    providers.tsx
  components/
    layout/
    ui/
  features/
    event/
    rsvp/
    gifts/
    admin/
    qr/
  lib/
    calendar.ts
    csv.ts
    format.ts
    validation.ts
  pages/
    public/
    admin/
convex/
  schema.ts
  auth.ts
  eventSettings.ts
  rsvps.ts
  gifts.ts
  reservations.ts
  files.ts
  seed.ts
public/
```

Each feature should own its UI, hooks, and feature-specific validation.
Authorization and consistency rules belong in Convex, not in UI components.

## 5. Data model refinements

Use Convex document IDs and validators for every argument and return shape.
Add indexes for the queries the UI needs.

### `eventSettings`

- Store a single active record.
- Add `title`, which is required by the admin requirements but absent from the
  proposed collection.
- Store the event date/time in an unambiguous format with the event time zone.

### `gifts`

- Replace the duplicated `reserved` and `reservationId` state with a single
  authoritative reservation relationship where practical.
- If denormalization is retained for fast reads, update both values only inside
  the same atomic mutation.
- Add indexes for visibility and category.

### `reservations`

- Define statuses such as `active` and `cancelled`.
- Make reservation codes unique and non-sequential.
- Index by gift, code, status, and reservation time.

### `rsvps`

- Define attendance as a validated enum.
- Validate guest count based on attendance.
- Index by submission time, attendance, and normalized guest name where useful.

### `adminUsers`

- If Convex Auth is selected, use the auth provider's user identity and keep
  only application role data rather than storing passwords in this table.

## 6. Implementation phases

### Phase 0 — Foundation and decisions

1. Confirm the five decisions in section 3.
2. Initialize React, TypeScript, Vite, Tailwind, shadcn/ui, and Convex.
3. Add routing, providers, environment-variable examples, formatting, and
   baseline test/build scripts.
4. Establish the design tokens from the PRD palette and typography.
5. Create a responsive application shell and placeholder routes.

**Exit condition:** The app builds, connects to a development Convex deployment,
and all public/admin routes render.

### Phase 1 — Convex domain foundation

1. Define the schema, validators, indexes, and shared authorization helpers.
2. Implement event settings queries and admin mutation.
3. Implement gift queries and admin CRUD.
4. Add a development seed script using the PRD gift list.
5. Establish file upload flow if Convex File Storage is confirmed.

**Exit condition:** Seeded event and gift data can be queried, and protected
mutations reject non-admin callers.

### Phase 2 — Public invitation

1. Build the invitation hero, countdown, and primary actions.
2. Build event details, map link/embed, parking, dress code, and contact blocks.
3. Add calendar-file generation and native share/copy-link fallback.
4. Verify small-screen layout, keyboard access, semantics, and loading states.

**Exit condition:** A guest can understand the event and reach RSVP or gifts
from the first viewport.

### Phase 3 — RSVP vertical slice

1. Define shared RSVP Zod and Convex validation rules.
2. Implement the RSVP mutation.
3. Build the form with accessible errors and conditional guest-count rules.
4. Add submission, error, duplicate-click protection, and confirmation states.
5. Add the real-time RSVP query required by the admin area.

**Exit condition:** A guest can submit an RSVP and the stored record appears
reactively in a temporary admin/dev view.

### Phase 4 — Gift reservation vertical slice

1. Build visible-gift queries and filters.
2. Build responsive gift cards and reservation dialog.
3. Implement the atomic reservation mutation and unique code generation.
4. Handle a reservation race with the specified “already reserved” response.
5. Add real-time availability changes and success confirmation.

**Exit condition:** Two simultaneous attempts cannot reserve the same gift, and
all connected clients see the resulting status without refreshing.

### Phase 5 — Authentication and admin dashboard

1. Add admin authentication and route protection.
2. Build overview statistics.
3. Build event settings editing.
4. Build RSVP search, filters, delete, and CSV export.
5. Build gift CRUD, visibility controls, pricing, category, and image upload.
6. Build reservation search and atomic cancellation/restore.
7. Confirm that no guest personal data appears in public queries.

**Exit condition:** An authenticated organizer can complete every admin workflow
in the PRD; an unauthenticated user cannot access admin data or mutations.

### Phase 6 — QR, security, and production readiness

1. Generate QR codes from the configured production URL.
2. Add PNG, SVG, and print-friendly outputs.
3. Add server validation, input normalization, request throttling, honeypot or
   equivalent spam controls, and safe error messages.
4. Check loading performance, accessibility, and responsive behavior.
5. Test primary flows on narrow mobile, tablet, and desktop viewports.
6. Configure the chosen deployment target, production Convex deployment,
   environment variables, HTTPS domain, and initial admin.

**Exit condition:** Every acceptance criterion has a recorded passing check in
the production-like environment.

## 7. Recommended execution flow

Start with **one thin end-to-end RSVP slice**, not with the complete visual
homepage or complete dashboard:

1. Scaffold the app and Convex.
2. Define the schema and authorization boundary.
3. Implement event retrieval.
4. Implement RSVP mutation and a minimal form.
5. Display new RSVPs reactively in a protected minimal admin screen.
6. Then implement the gift reservation slice, including its concurrency test.
7. Expand both public presentation and admin management after the two core data
   flows are proven.

This order validates the largest architectural risks early: Convex connectivity,
real-time updates, authorization, form validation, and atomic reservation
behavior. Visual polish can then build on stable workflows.

## 8. Testing strategy

### Automated

- Unit tests for validation, price filtering, calendar generation, CSV export,
  and formatting.
- Convex function tests for authorization and data validation.
- Concurrency test proving only one of two competing gift reservations succeeds.
- Integration tests for RSVP submission and reservation cancellation/restore.
- End-to-end smoke tests for the guest and admin journeys.

### Manual acceptance

- RSVP completion in under two minutes.
- Real-time update in two open browser sessions.
- iPhone/Android-sized viewport, tablet, and desktop checks.
- Keyboard-only navigation and visible focus.
- Screen-reader labels and meaningful error messages.
- QR scan from a printed test page.
- CSV opens correctly with expected columns and Unicode content.
- No personal guest data is exposed on public routes or responses.

## 9. Milestone checklist

1. Foundation builds and connects to Convex.
2. RSVP vertical slice is complete.
3. Gift reservation vertical slice is race-safe.
4. Public invitation is complete.
5. Admin workflows are complete and protected.
6. QR and calendar flows work against the production URL.
7. Security, accessibility, responsive, and performance checks pass.
8. Production deployment and final acceptance pass.

## 10. Skills and tools by implementation stage

- **Sites building/hosting:** Use for a Sites-hosted implementation and
  production publishing. Because the PRD currently names Vercel or Lovable,
  confirm the hosting choice before adopting Sites-specific project structure.
- **Image generation:** Use only if original baby-shower artwork or a social
  preview is required and suitable licensed imagery is unavailable.
- **Browser control:** Use when explicitly performing interactive browser
  testing of public and admin flows.
- **Spreadsheet tooling:** Use only if CSV/XLSX reporting expands beyond the
  simple MVP CSV export.

No image-generation or spreadsheet skill is required to begin the foundation
and RSVP implementation.

## 11. Local browser acceptance status

Completed on July 23, 2026 against the local Vinext application and local
Convex deployment:

- Public invitation loaded live event settings and all six visible gifts.
- Guest RSVP submission succeeded and appeared in the protected dashboard.
- Gift reservation succeeded, updated availability in real time, and produced
  a reservation code.
- Admin sign-up, first-admin activation, authentication, dashboard statistics,
  RSVP management, reservation management, and QR generation all worked.
- Cancelling the test reservation restored the gift to `Available`.
- Synthetic RSVP data was deleted after testing; the cancelled reservation is
  retained as expected audit history.

The remaining production-readiness work is environment-specific: create or
select the cloud Convex deployment, configure the production domain and
environment variables, replace placeholder event content, create the real
organizer account, and repeat the acceptance checks against the deployed URL.
