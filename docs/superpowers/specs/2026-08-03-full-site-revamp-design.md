# Eleventh Hour — Full Site Revamp Design Spec

**Date:** 2026-08-03
**Status:** Approved (user delegated design direction: "pick the best design and get started")
**Scope:** Everything — public pages, booking flow, admin panel. Full visual rebrand + bug fixes. Site is deployed (Vercel) but has no real traffic yet. **Hard constraint: no functionality may break.**

---

## 1. Design direction — "Crisp Editorial"

A warm-minimal, editorial look that reads as a premium service brand, not a template.

### Palette (full rebrand — replaces amber/cream)
| Token | Value | Use |
|---|---|---|
| `paper` | `#FAFAF7` | Page background (warm off-white) |
| `surface` | `#FFFFFF` | Cards, panels |
| `ink` | `#171512` | Headings, primary text (warm near-black) |
| `ink-soft` | `#57534E` | Secondary text (stone-600) |
| `line` | `#E7E5E1` | Hairline borders |
| `accent` | `#1A5C4A` | Deep evergreen — primary CTAs, links, active states |
| `accent-dark` | `#124638` | Hover |
| `accent-tint` | `#EDF4F1` | Subtle tinted backgrounds, badges |

One accent only. All blue/purple/emerald/indigo/amber accents purged. Neutrals consolidated to the stone ramp (no gray/slate mixing).

### Typography
- **Display / headings:** Fraunces (variable, optical sizing) via `next/font/google`. Editorial character without looking AI-generic. No global `text-transform: capitalize` (removed).
- **Body / UI:** Instrument Sans via `next/font/google`. Clean grotesque, not Inter.
- Render-blocking Google Fonts `@import` removed; fonts self-hosted via `next/font`.
- Type scale: h1 clamp(2.5rem→3.5rem)/1.05 tight; h2 ~2rem; body 16px/1.6. Tracking-tight on display sizes.

### Surfaces, radius, shadow, motion
- Radius scale: **10px** (buttons, inputs), **16px** (cards), full (pills/badges only). No more mixed rounded-lg/xl/2xl/full chaos.
- Hairline borders (`line`) over drop shadows. One soft shadow (`shadow-soft`) reserved for floating elements (dropdowns, modals, sticky receipt).
- Motion: 150–200ms ease-out color/opacity transitions. No hover translate-y "lift" gimmicks, no gradient text.

### Component system (new `src/components/ui/`)
`Button` (primary = evergreen, secondary = outline ink, ghost), `Input`/`Select`/`Textarea`, `Card`, `Badge`, `Toast` (replaces all 21 `alert()` calls), `Modal`, `Tabs`, `Table` (admin), `Skeleton`. Styled with Tailwind v4 tokens in `@theme`.

### Layout language
- Public pages: generous whitespace, max-w-6xl containers, editorial hero (large Fraunces headline, no gradient backgrounds), real photography kept but consistently treated (rounded-2xl, aspect ratios enforced).
- Navbar: white/paper with hairline bottom border, slim; mega-menu restyled; mobile menu shows **all** services (fixes `.slice(0,6)` bug).
- Footer: ink background, restrained columns.
- Admin: left **sidebar** layout (replaces pill tabs), light stone UI, clean data tables.

---

## 2. Bug fixes (from codebase scan — all must land)

### Critical
1. **Auth on all `/api/admin/*`** — shared `requireAdmin` helper verifying the Supabase JWT (Bearer token from the browser client session); admin fetches send the token. Public `/booking-success` stops calling admin API — new `/api/public/booking/[id]` scoped by `session_id`/booking id.
2. **Env var mismatch** — server reads `SUPABASE_SERVICE_ROLE_KEY` (with fallback to `SUPABASE_SERVICE_ROLE`).
3. **Stripe pricing bug** — shared `src/lib/pricing.ts` (`calculateTotals`) used by `/book`, `CreateBookingTab`, `/api/public/booking`, `/api/create-checkout-session`. Regular Cleaning charged as `hours × rate × cleaners` everywhere; Stripe line items must sum to the displayed total (single computed line item for regular cleaning).
4. **Webhook signature required** — no `JSON.parse` fallback; missing `STRIPE_WEBHOOK_SECRET` → 500, never trust unsigned events.
5. **Delete `tailwind.config.ts`** — dead v3 config; needed tokens/animations move into `@theme` (fixes invisible Commercial-mode styling).
6. **FormBuilderTab** — point at `form_config` (singular, `id='public'`), snake_case field keys matching `/book`; fix in-place state mutation.
7. **Re-save `NestedServiceSelector.tsx` as UTF-8** (corrupted `£`/`·` glyphs).

### Cleanup
- Delete dead code: `api/booking/route.ts`, `CategoryCard.tsx`, `lib/validators.ts`, `admin/debug`, unreachable Step-3 + jsPDF quote generator in `/book` (~310 lines), empty Navbar div, stale comments.
- Remove 21 production `console.log`s; replace 21 `alert()`s with Toasts.
- Fix contact-detail inconsistencies (email `hello@eleventhhourcleaning.co.uk` everywhere; tel format unified).
- Unify service-name matching (one constant/matcher for "Number of Hours"/"Number of Cleaner(s)").
- `services/[slug]` params → Promise (Next 15); fix Navbar `useRef` type; remove unused imports.
- Consolidate Supabase clients (login/debug pages use shared browser client).
- Stripe: stop creating throwaway coupons per checkout where a `discounts`-array amount-off coupon can be created then… (keep behavior identical from user perspective; at minimum, coupon gets a name and the flow is preserved).
- Turn OFF `ignoreBuildErrors`/`ignoreDuringBuilds` once the codebase compiles clean.

---

## 3. Architecture decisions
- Keep App Router structure and all API contracts (except additive auth + new public booking-read endpoint).
- Split `book/page.tsx` (1258 lines) into step components under `src/app/book/components/`; shared `Service` type imported from `src/lib/types.ts`.
- Split `CreateBookingTab` to reuse the same pricing module and service-selector pieces where practical.
- Images: keep current sources; enforce consistent treatment (upgrade to `next/image` only where trivially safe — remote patterns configured; not a hard requirement).
- No new dependencies except none anticipated (toast built in-house, ~60 lines).

## 4. Verification
- Every page visited in Chrome (household + commercial modes) after redesign; booking flow exercised end-to-end with Stripe test mode; admin flows exercised (login, services CRUD, bookings, calendar, discount codes, form builder, invoices).
- `npm run build` must pass with error-ignoring flags removed.
- No automated test suite exists; browser QA is the gate.

## 5. Phases
1. **Foundation fixes** — critical bugs 1–7 + dead-code deletion (no visual change).
2. **Design system** — fonts, `@theme` tokens, `ui/` components, Navbar/Footer restyle.
3. **Public pages** — home, about, services/[slug], household/commercial, contact, careers, privacy/terms, 404.
4. **Booking flow** — split + restyle wizard, receipt, success page.
5. **Admin** — sidebar shell + restyle all tabs, booking editor, invoice page.
6. **Browser QA sweep** — every route, both modes, mobile widths; fix everything found.
