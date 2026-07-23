# Baby Shower RSVP & Gift Registry

A mobile-first digital invitation, RSVP system, and real-time gift registry.
Guests can RSVP, browse and reserve gifts, add the event to their calendar, and
share the invitation. Organizers can manage event details, RSVPs, gifts,
reservations, uploads, exports, and invitation QR codes from `/admin`.

## Technology

- React, TypeScript, and Vinext
- Convex database, real-time queries, file storage, and Convex Auth
- React Hook Form and Zod validation
- QR code generation and calendar/CSV downloads
- Vitest and `convex-test`

## Local development

Requires Node.js 22.13 or newer.

```bash
npm install
npx convex dev
npm run dev
```

Copy `.env.example` to `.env.local` and populate the public Convex URL. Convex
development writes the deployment-specific values automatically when connected.

## Verification

```bash
npm run lint
npm test
```

`npm test` performs a production build and runs the unit and Convex function
test suite.

## Production launch

1. Create or select the production Convex deployment.
2. Set `ADMIN_BOOTSTRAP_CODE` in the Convex production environment to a unique,
   temporary high-entropy value.
3. Deploy the Convex functions and record its public client URL.
4. Configure `NEXT_PUBLIC_CONVEX_URL` and `NEXT_PUBLIC_SITE_URL` for the
   frontend deployment.
5. Deploy the frontend over HTTPS.
6. Create the organizer account at `/admin`, activate it once with the
   bootstrap code, then rotate or remove `ADMIN_BOOTSTRAP_CODE`.
7. Enter the approved event details and gifts in the organizer dashboard.
8. Generate and scan-test the production QR code, then run the guest RSVP and
   gift-reservation acceptance flows once against the deployed URL.

Do not publish invitations while the placeholder event content or placeholder
site URL is still active.
