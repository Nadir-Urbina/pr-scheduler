# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Project

**La Cresta Scheduler** — a bilingual (Spanish/English) session booking system for the "La Cresta de La Ola" conference. Attendees book 10-minute prophetic sessions across 6 rooms, 3 days (Thu/Fri/Sat), 3:30–6:00 PM Costa Rica time (270 total slots). No user accounts; admin access via hidden route.

Full requirements: [PRD.md](PRD.md)

## Commands

```bash
npm run dev      # Start dev server (Turbopack, outputs to .next/dev)
npm run build    # Production build (also Turbopack by default)
npm run start    # Start production server
npm run lint     # Lint (= eslint; next lint was removed in Next.js 16)
npx next typegen # Generate PageProps/LayoutProps/RouteContext type helpers
```

No test runner is configured yet.

Local env: copy `.env.local.example` → `.env.local` and fill in Firebase client + admin credentials, `RESEND_API_KEY`, and `CRON_SECRET`. `FIREBASE_PRIVATE_KEY` must keep its literal `\n` newlines and be wrapped in double quotes.

## Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16.2 (App Router) |
| UI | React 19.2, Tailwind CSS v4 |
| Backend/DB | Firebase (Firestore + Auth) |
| Email | Resend (confirmation + day-before reminders) |
| Hosting | Vercel (cron via `vercel.json`) |

## Architecture

App Router only — no `pages/` directory. Everything lives under `app/`, `components/`, and `lib/`.

### Routes
- `app/page.tsx` → `components/booking/BookingPage` — public booking flow (default Spanish): day select → `SlotGrid` → `BookingForm`, plus `CheckReservation` to look up an existing booking by email.
- `app/admin/login`, `app/admin/register` — Firebase email/password auth (client SDK). Hidden from public nav.
- `app/admin/(dashboard)/` — protected dashboard. The route-group `layout.tsx` is the auth gate: it subscribes to `onAuthStateChanged` and redirects to `/admin/login` if signed out. `page.tsx` lists/creates/edits/deletes bookings via `BookingModal`.

### API route handlers (`app/api/`)
- `bookings/` — **public**. `GET ?day=` returns taken `{room, slot}` pairs; `POST` creates a booking. The POST enforces **one session per person** via fuzzy name matching (`normalizeName` strips accents/case; `levenshtein` allows 1 edit for ≤6-char names, else 2) against the `nameNormalized` field, then sends a Resend confirmation email (awaited so the serverless fn doesn't exit early; errors swallowed so email failure never blocks the booking).
- `reservations/` — **public**. `GET ?email=` looks up a user's own bookings.
- `admin/bookings/` and `admin/bookings/[id]/` — **protected** (every handler calls `verifyAdminToken` first). Admin create/edit bypasses the name-duplicate check but enforces slot-uniqueness (`day`+`room`+`slot`).
- `email/reminders/` — **cron only**. Gated by `CRON_SECRET` (Vercel sends it as `Authorization: Bearer`; `?secret=` works for local testing). Maps the current UTC weekday → conference day and emails all that day's attendees. Scheduled in `vercel.json` (`0 1 9,10,11 7 *` = Thu/Fri/Sat 01:00 UTC during the conference).

### Firebase: two SDKs, two boundaries
- `lib/firebase/client.ts` — **client SDK**, browser-safe, `NEXT_PUBLIC_*` config. Used in client components for auth.
- `lib/firebase/admin.ts` — **admin SDK**, server-only, service-account credentials. Used exclusively in API route handlers for Firestore reads/writes.
- Admin requests from the dashboard go through `lib/admin-fetch.ts`, which attaches the current user's ID token as a Bearer header; `lib/admin-auth.ts` verifies it server-side.

### Data model & shared constants
- Single Firestore collection `bookings`. Shape in `lib/types.ts` (`Booking` / `NewBooking`). Each doc also stores a `nameNormalized` field used only for duplicate detection.
- `lib/schedule.ts` is the source of truth for `DAYS`, `ROOMS` (1–6), `SLOTS` (15 slots, 15:30–17:50 in 10-min steps, generated), `PROVINCES`, `DAY_LABELS`, and `formatSlot()`. All validation references these — keep new logic consistent with them.
- At max 270 bookings, several handlers deliberately fetch the whole collection and filter in memory rather than building composite Firestore indexes.

### i18n
- No i18n library. `lib/context/LanguageContext` holds `lang` (`'es' | 'en'`, default `es`, persisted to `localStorage`). Each component defines a local `t` object keyed by language; email templates (`lib/email/templates.ts`) take a `lang` param. When adding UI strings, follow the existing `{ es, en }` pattern.

## Next.js 16 Breaking Changes

**Before writing any code**, read the relevant guide in `node_modules/next/dist/docs/`. The most impactful changes:

### Async Request APIs (breaking)
`cookies()`, `headers()`, `draftMode()`, `params`, and `searchParams` are now fully async. Synchronous access is removed.

```ts
// ✅ Correct in Next.js 16
export default async function Page(props: PageProps<'/blog/[slug]'>) {
  const { slug } = await props.params
  const query = await props.searchParams
}

// Route handlers
export async function GET(_req: NextRequest, ctx: RouteContext<'/users/[id]'>) {
  const { id } = await ctx.params
}
```

Run `npx next typegen` to generate `PageProps`, `LayoutProps`, and `RouteContext` helpers.

### `middleware` renamed to `proxy`
The `middleware.ts` file and `middleware` export are deprecated. Use `proxy.ts` with a `proxy` named export. Note: `proxy` runs Node.js runtime only (no edge runtime).

### `next lint` removed
Use `npx eslint .` directly. `next build` no longer runs linting automatically.

### Turbopack is default
No `--turbopack` flag needed. Dev server outputs to `.next/dev` (separate from build output). Use `--webpack` flag to opt out.

### `revalidateTag` requires second argument
```ts
revalidateTag('posts', 'max') // second arg is a cacheLife profile
```
For immediate invalidation in Server Actions, use `updateTag` instead.

### Parallel routes require `default.js`
All parallel route slots (`@slot/`) must have a `default.js` file or builds will fail.

### Removed APIs
- `serverRuntimeConfig` / `publicRuntimeConfig` — use `process.env` and `NEXT_PUBLIC_` prefix
- `next/legacy/image` — use `next/image`
- `images.domains` — use `images.remotePatterns`
- AMP support fully removed
- `experimental.dynamicIO` renamed to `cacheComponents`

## Tailwind CSS v4

Configuration lives in CSS, not `tailwind.config.js`. Custom theme tokens are defined with `@theme inline {}` in `app/globals.css`. Import syntax:

```css
@import "tailwindcss"; /* replaces @tailwind base/components/utilities */
```

No tilde (`~`) prefix for Sass/node_modules imports (Turbopack doesn't support it).
