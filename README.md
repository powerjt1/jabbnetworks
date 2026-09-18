# JABB Networks

A freelance marketplace for enterprise automation work — Power Platform, RPA,
UiPath, Nintex migration, SharePoint, ShareGate, MSM tooling, AI solutions and
custom web applications.

## Stack

- **Next.js 16** (App Router, React 19)
- **Tailwind CSS 4**
- **Supabase** — Postgres, auth and storage (optional; see below)
- **TypeScript** throughout

## Running it

```bash
npm install
npm run dev
```

Open http://localhost:3000.

The app ships with seed data, so **every screen works before you connect a
database**. The sidebar shows a "Demo data" badge while that is the case.

## Connecting Supabase

1. Create a free project at [supabase.com](https://supabase.com/dashboard).
2. Run `supabase/schema.sql` in the SQL editor. It creates the tables, the
   enums and the row-level-security policies.
3. Copy `.env.example` to `.env.local` and fill in:

   ```
   NEXT_PUBLIC_SUPABASE_URL=...
   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
   ```

`lib/data.ts` is the single seam between the UI and its data source, so wiring
the queries up happens in one file rather than across every page.

## What's in it

**Marketplace**
- Landing page with skill taxonomy and open contracts
- Job board with full-text search and filtering by discipline
- Job detail — scope, milestone plan, budget, attachments, environments,
  client profile, competing proposals
- Job posting form with a milestone builder and file attachments
- Proposal submission, pre-filled from the client's milestone plan

**Client portal**
- Dashboard summarising contract value, outstanding budget and milestones
  needing attention
- Contracts list and detail with per-milestone status, deliverables, due dates
  and released budget
- Private notes, pinnable, on jobs and contracts

**Communication**
- Message inbox with threads attached to their job
- Chat room with attachments and ⌘↵ to send

**Accounts**
- Signup with role selection (hiring vs. available for work)
- Three-step onboarding, branching on role
- Settings — profile, stack and rates, notifications, payouts

## Layout

```
app/
  (auth)/          signup, login, onboarding
  (app)/           the portal: dashboard, jobs, proposals,
                   contracts, messages, talent, settings
components/        UI primitives and feature components
lib/
  types.ts         domain model
  seed.ts          demo data
  data.ts          data access — the Supabase seam
  skills.ts        the ten disciplines
supabase/
  schema.sql       tables, enums, RLS policies
```

## Power Platform skills

The Microsoft Power Platform skills installer is still wired up:

```bash
npm run install:power-platform-skills
```

See [POWER_PLATFORM_SETUP.md](./POWER_PLATFORM_SETUP.md).

## legacy-svelte/

The original Svelte + Vite scaffold this repo started from, kept intact rather
than deleted. Nothing in the Next.js app depends on it.
