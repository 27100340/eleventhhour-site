# eleventhhour-site

Next.js 15 (App Router) + Tailwind v4 CSS-first + Supabase + Stripe. Cleaning-services business site: public pages, `/book` wizard → Stripe Checkout, `/admin` panel.

## ⚠️ ACTIVE WORK: full-site revamp in progress

A phased revamp (bug fixes + full visual rebrand) is underway on branch **`revamp/full-site`**.
**If asked to resume/continue the revamp: read `docs/superpowers/HANDOFF.md` first** — it has current phase status, established contracts, and next steps. The design spec is `docs/superpowers/specs/2026-08-03-full-site-revamp-design.md`.

## Hard rules (post-Phase-1)
- All price math goes through `src/lib/pricing.ts` — never hand-roll totals.
- `/api/admin/*` requires the `getAdminUser` guard; admin UI must call via `adminFetch` (`src/lib/admin-fetch.ts`).
- `/api/create-checkout-session` takes `{ bookingId, ... }` only; it loads amounts from the DB.
- Design tokens/components: `src/app/globals.css` `@theme` + `src/components/ui/`. Single accent color (evergreen). No new hardcoded hex/blue/purple utilities.
- Keep `npx tsc --noEmit` at zero errors.

## Commands
- `npm run dev` — dev server (Turbopack), http://localhost:3000
- `npx tsc --noEmit` — typecheck (must stay clean)
- `npm run build` — production build (error-ignoring flags in next.config.ts are slated for removal in the final phase)
