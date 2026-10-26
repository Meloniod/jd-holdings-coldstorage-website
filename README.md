# JD Holdings Cold Storage Portal

A responsive MVP prototype for mortuary cold-storage operations: case intake, storage allocation and transfers, release approvals, document metadata, invoicing, reports and an audit-event view.

## Public website and management portal

- Public business-development website (homepage): `/`
- Internal operations management portal: `/portal`
- Legacy `/opportunities` route redirects to the public homepage.
- Portal metadata requests that search engines do not index the management interface. This is **not** access control; authentication and server-side authorization are still required before real operational data is used.

## Lead capture setup

The homepage includes partnership, investor, and business enquiry messaging plus an enquiry form.

- Main page: `app/page.tsx`
- Portal: `app/portal/page.tsx`
- Form integration: set `NEXT_PUBLIC_LEAD_ENDPOINT` to an approved HTTPS endpoint that validates and securely stores leads in a CRM/database.
- **Preview warning:** without that environment variable, form submissions are saved only in the visitor's browser local storage and are not delivered to JD Holdings. Configure and test the endpoint before using the form for real lead capture.
- Production setup checklist: `docs/PRODUCTION-READINESS.md`

Confirm all business claims, contact details, privacy wording, service coverage, and investment disclosures with the business owner before launch.

## Current status

**This is a browser-local demonstration, not a production mortuary system.** The interface uses fictional seed records and persists changes in `localStorage` in the current browser. No Supabase project, authentication provider, server API, private file storage, email, payment gateway, hardware temperature feed or Vercel deployment has been connected. A draft Supabase schema and starter RLS policies are included under `supabase/migrations/`; they have not been applied or security-tested.

Do not enter real deceased-person, next-of-kin, identity, health, legal or operational information. Browser local storage is not an appropriate repository for sensitive records.

## Stack

- Next.js App Router / React / TypeScript
- Tailwind CSS and Lucide icons
- Browser-local data store for the demo
- Zod and React Hook Form dependencies included for future validated forms

## Run locally

Requires Node.js 18.17+ (Node.js 20 LTS recommended).

```bash
npm install
npm run dev
```

Open http://localhost:3000.

Production compilation check:

```bash
npm run build
```

The repository changes have not been run in a local build environment yet. Run the build and resolve any environment-specific issues before deploying.

## Demo workflows

- Switch between demo roles from the top bar: Administrator, Mortuary Staff, Release Officer and Finance. This is a workflow preview only; role selection is not authentication or a security boundary.
- Register a fictional case and allocate an available position.
- Record a transfer to an available position, with a reason.
- Submit release requests, mark demo checks complete, approve/reject as a release role, and complete an approved release.
- Add document metadata to a case. File bytes are **not** uploaded or securely stored.
- Create invoices using inclusive calendar days × daily storage rate. Overlapping periods for the same case are blocked in the browser.
- Record payment status, review reports, export CSV and inspect the browser-local event history.
- Reset browser-local data to the fictional seed records.

## Known limitations

- No real authentication, session management, server-side authorisation or enforceable role-based access.
- Local storage is per browser/profile, user-editable, can be cleared and has no central backup or concurrent-user protection.
- Demo audit events are not tamper-proof or append-only.
- Document entries store metadata only; there are no file uploads or signed URLs.
- Temperature data is not connected to refrigeration hardware.
- Invoice status is manually maintained; no payment gateway or accounting integration is connected.
- Demo dates and amounts are illustrative and should not be treated as operational facts.
- No legal compliance is asserted. The business must validate applicable South African POPIA obligations, mortuary requirements, release procedures, retention and billing policies with qualified advisers.

## Production architecture before real records

1. **Identity and roles:** Supabase Auth, server-validated sessions, profiles linked to auth user IDs and roles granted by an administrator. Never accept a role from client-controlled form data.
2. **Application layer:** server actions or route handlers validate input with Zod, resolve the current authenticated user, check permissions and call typed data-access functions. Keep policy decisions out of presentation components.
3. **PostgreSQL:** migrations for profiles, facilities, refrigeration units, positions, cases, intake records, allocation/transfer history, release requests and approvals, documents, invoices/items, payments and audit events. Use UUID keys, foreign keys, check constraints, indexes, timestamps and transactional allocation/release/billing operations.
4. **RLS and least privilege:** enable RLS on all exposed tables; policies should check the authenticated user’s database-backed role and facility scope. Test cross-role and cross-facility reads/writes, including direct API attempts. UI role toggles must be removed.
5. **Private files:** private Supabase Storage buckets; short-lived signed URLs issued only after server-side authorisation; file size and MIME/signature validation, safe filenames, malware scanning and a documented retention policy.
6. **Audit:** append-only server-side events with actor, action, target, timestamp and relevant change metadata. Restrict update/delete access.
7. **Reliability:** rate limiting, monitoring, backups, recovery drills, accessibility checks and automated tests for allocation conflicts, release gating, duplicate billing, RLS and authorisation.
8. **Deployment:** configure environment variables in Vercel; never commit service-role keys. Run migrations in a controlled deployment step, use separate development/staging/production Supabase projects and verify a production build before handling any real records.

## Suggested database entities

- `profiles` (auth user ID, role, facility scope)
- `facilities`, `refrigeration_units`, `storage_positions`
- `cases`, `intake_records`, `storage_allocations`, `storage_transfers`
- `release_requests`, `release_approvals`
- `documents` (metadata only; binary in private Storage)
- `invoices`, `invoice_items`, `payments`
- `audit_events`

The database must enforce that a position cannot be occupied by more than one active case. Release completion and invoice period validation should be transactional and server-enforced.

## Environment variables for the future Supabase integration

Create a local `.env.local` only when connecting a Supabase project:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

The service-role key is privileged and must only be used in trusted server-side code. It is not currently read by this demo. Prefer user-scoped server clients and RLS for routine access.

## Repository

https://github.com/Meloniod/jd-holdings-coldstorage-website
