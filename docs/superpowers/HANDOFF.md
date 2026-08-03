# REVAMP HANDOFF — resume here

**Last updated:** 2026-08-03 (end of Phase 3)
**Branch:** `revamp/full-site` (pushed to origin). Do all revamp work here.
**Full spec:** `docs/superpowers/specs/2026-08-03-full-site-revamp-design.md` — read it first.

## What this project is
Eleventh Hour (eleventhhour-site): Next.js 15 App Router + Tailwind v4 (CSS-first, no JS config) + Supabase + Stripe. Cleaning-services business site: public marketing pages, customer booking wizard (`/book`) with Stripe Checkout, admin panel (`/admin/*`). Deployed on Vercel, **no real traffic yet**. User asked for: full revamp — fix all bugs, full visual rebrand ("modern sleek minimal, not AI slop"), preserve every piece of functionality. User delegated all design decisions.

## Progress

| Phase | Status | Commit |
|---|---|---|
| 1. Foundation fixes (security, pricing, dead code) | ✅ DONE | `5b58e20` |
| 2. Design system (fonts, tokens, ui/, Navbar/Footer) | ✅ DONE | `f06a6a6` |
| 3. Public pages redesign | ✅ DONE | see git log |
| 4. Booking flow redesign + refactor | ⬜ NEXT | — |
| 5. Admin panel redesign | ⬜ | — |
| 6. Browser QA sweep + build gate | ⬜ | — |

## What Phases 1–2 established (do not undo)

**Security/correctness (Phase 1):**
- Every `/api/admin/*` handler starts with `getAdminUser(req)` guard (`src/lib/supabase/admin-auth.ts`); admin UI calls them via `adminFetch` (`src/lib/admin-fetch.ts`) which attaches the Supabase JWT.
- `src/lib/pricing.ts` is the ONLY place price math lives. Regular Cleaning = hours × rate × cleaners. Used by `/book`, CreateBookingTab, `/api/public/booking`, `/api/create-checkout-session`.
- `/api/create-checkout-session` accepts `{ bookingId, customerEmail?, customerName?, adminTotalOverride? }` and loads booking+items from DB — never send items/totals from the client.
- booking-success uses `GET /api/public/booking/[id]?session_id=...` (validated against `stripe_session_id`), NOT the admin API.
- Stripe webhook requires `STRIPE_WEBHOOK_SECRET` — no unsigned fallback.
- Env: server reads `SUPABASE_SERVICE_ROLE_KEY` (falls back to `SUPABASE_SERVICE_ROLE`).

**Design system (Phase 2) — "Crisp Editorial":**
- Tokens in `src/app/globals.css` `@theme`: `paper #FAFAF7`, `surface #FFF`, `ink #1B1917`, `ink-soft`, `ink-faint`, `line #E8E6E1`, `accent #1A5C4A` (deep evergreen, the ONLY accent), `accent-dark`, `accent-tint`. Radius: `--radius-ctl` 10px (controls), `--radius-card` 16px. One `shadow-soft` for floating elements only; hairline borders otherwise.
- Fonts via next/font in `src/app/layout.tsx`: Archivo (variable, `axes:['wdth']`) = display (`font-display`, headings get `font-variation-settings:'wdth' 118`), Instrument Sans = body/UI (`font-sans`). NO Google Fonts @import, NO Fraunces/Playfair/Lora/Montserrat.
- Components in `src/components/ui/`: Button, Field/Input/Select/Textarea, Card, Badge, Toast (`useToast()` — ToastProvider mounted in layout), Modal, Spinner. `cx()` helper in `src/lib/cx.ts`.
- Signature motif: `.tick-rule` class (fine clock-tick ruler, plays on "Eleventh Hour") — used on Footer top; use sparingly as section divider on public pages.
- `.eyebrow` class for section labels. Copy style: sentence case ("Book now", not "BOOK NOW"), plain verbs, no uppercase tracking on buttons.
- Design stance: no gradient text, no hover translate-y lifts, no blue/purple/emerald/amber accents anywhere, motion 150–200ms color/opacity only. Aesthetic must not read as AI-template (that's why display font is Archivo expanded, NOT a serif on cream).

## Phase 3 (DONE): Public pages redesign
All public pages rebuilt on the design system: homepage (mode context + TopSelectorBar preserved, memo()/getServiceImage()/gradients removed), `about`, `services/[slug]` (+ `generateMetadata`/`generateStaticParams`; SERVICES `images` arrays reference non-existent `/svc-*.jpg` files so the page is text-led), `household-services` + `commercial-services` (now linked from the homepage services section per mode), `contact` (Formspree endpoint + FormData field names preserved), `careers` (all fields/validation/Formspark endpoint preserved; console.logs removed), `privacy`/`terms` (contact details corrected to hello@eleventhhourcleaning.co.uk / 020 3355 1526; static last-updated), new `not-found.tsx`.
Also fixed: Navbar linked to dead `/services/pest-control` — now `/services/pet-care` (PawPrint icon). Deleted `src/app/layout.tsx.backup`. LEGACY token block trimmed to only what `/book` + `/admin` still use (brand-amber(+dark)/charcoal/cream/stone/sage, font-playfair/lora, shadow-soft-lg); legacy component classes (`.gradient-bg`, `.glass`, `.text-gradient`, `.focus-ring`) deleted. Verified: `npx tsc --noEmit` clean; all routes 200 via curl; rendered HTML of every public page free of brand-* classes. Chrome extension still disconnected — visual QA deferred to Phase 6.

## Phase 4 notes
Split `src/app/book/page.tsx` (864 lines now) into step components; restyle with ui/ components; replace its 5 `alert()`s with `useToast()`; **wire `has('service_date')`** so the admin form-builder toggle controls the date field (currently inert — the datetime input renders unconditionally ~line 889 pre-refactor); keep: silent Formspree capture on step advance, discount validation, terms checkbox, payload shapes.

## Phase 5 notes
Admin: sidebar shell replacing pill tabs (`admin/dashboard/page.tsx`), restyle all tabs + booking editor + invoice page + login. Replace remaining `alert()`s (CreateBookingTab ×5, DiscountCodesTab ×6, booking editor ×3, invoice ×1, FormBuilderTab ×1) with `useToast()`. Admin pages use `useAdminGuard` (`src/lib/use-admin-guard.ts`).

## Phase 6 notes (the gate)
- Browser QA every route (Claude in Chrome — extension was disconnected at Phase-2 pause; user must have it connected), both household/commercial modes, mobile width; exercise booking E2E with Stripe test card + admin flows.
- Remove `eslint.ignoreDuringBuilds` and `typescript.ignoreBuildErrors` from `next.config.ts`; `npm run build` must pass clean. `npx tsc --noEmit` already passes as of Phase 2.
- Delete LEGACY token block + legacy component classes (`.gradient-bg`, `.glass`, `.text-gradient`, old `.input/.btn-*/.card/.step` if fully migrated) from globals.css once nothing references them.
- Known cosmetic-behavior notes: dev server warns about a stray `C:\Users\Baqir\package-lock.json` (harmless); `npm audit` reports 16 vulns (mostly transitive; user was told).

## How to verify while working
- Dev server: `npm run dev` (Turbopack) → http://localhost:3000. Env in `.env.local` (Supabase + Stripe test keys present).
- `npx tsc --noEmit` must stay at zero errors.
- Booking flow test: pick a service on `/book`, fill step 1–2, submit → should redirect to Stripe Checkout (test mode). Admin: `/admin/login` (Supabase auth user with `app_metadata.role === 'admin'`).

## Process expectations (user's standing instructions)
- Work autonomously; user delegated design choices ("pick the best design and get started").
- Commit per phase on `revamp/full-site` with descriptive messages; push after each phase.
- The multi-agent Flutter rule in the user's global CLAUDE.md does NOT apply (this is Next.js), but parallel subagents with disjoint file ownership worked well for Phase 1 — reports from those agents are in this session's history, key outcomes folded into this doc.
