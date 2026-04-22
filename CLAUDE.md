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
npx eslint .     # Lint — next lint has been removed in Next.js 16, use eslint directly
npx next typegen # Generate PageProps/LayoutProps/RouteContext type helpers
```

No test runner is configured yet.

## Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16.2 (App Router) |
| UI | React 19.2, Tailwind CSS v4 |
| Backend/DB | Firebase (Firestore + Auth) — **not yet wired up** |
| Email | SendGrid or Resend — **not yet wired up** |
| Hosting | Vercel |

## Architecture

App Router only — no `pages/` directory. All routes live under `app/`. The project is a fresh scaffold; no features are implemented yet.

Planned route structure (based on PRD):
- `app/` — public booking interface (default language: Spanish)
- `app/admin/` — protected dashboard (hidden from public nav)
- `app/api/` — route handlers for bookings, auth, email batch jobs

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
