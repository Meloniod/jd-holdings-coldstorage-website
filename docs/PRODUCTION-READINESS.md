# Production Readiness Plan

This document describes the work required to take the JD Holdings Cold Storage Management Portal from its current local-storage MVP to a secure, supportable production application.

> **Current status:** The portal is an interactive MVP. It stores records in the browser's local storage, uses fictional demo data, and includes a draft Supabase schema. It is **not production-ready**. Do not enter real deceased-person, family, identification, medical, payment, or other confidential information until the controls below are implemented and independently tested.

## 1. Confirm requirements and ownership

- [ ] Name the business owner, operational owner, technical owner, and person responsible for privacy/security.
- [ ] Confirm each facility, refrigeration unit, storage position, case lifecycle, admission/release procedure, and required approval.
- [ ] Define the roles and least-privilege permissions: administrator, mortuary staff, release officer, finance, and read-only/auditor if needed.
- [ ] Define which documents and data each role may view, upload, change, export, or delete.
- [ ] Confirm invoice rules, daily rates, inclusive/exclusive dates, deposits, taxes, payment methods, credits, and reconciliation process.
- [ ] Define retention and deletion periods, legal holds, incident response, backup recovery targets, and business continuity procedures.
- [ ] Review applicable South African laws and contractual obligations, including POPIA where applicable, with a qualified privacy/legal adviser.

**Exit criterion:** A signed-off workflow, data inventory, role/permission matrix, and acceptance criteria exist before production data is imported.

## 2. Replace browser storage with a real backend

- [ ] Provision separate development, staging, and production environments.
- [ ] Set up Supabase (or an approved equivalent) with managed PostgreSQL, authentication, private object storage, and backups.
- [ ] Review and test `supabase/migrations/202610260001_initial_schema.sql`; treat it as a draft, not an approved production migration.
- [ ] Apply migrations through a controlled deployment process; never make undocumented manual schema changes in production.
- [ ] Implement server-side API routes or server actions for all sensitive reads and writes.
- [ ] Move case, admission, allocation, transfer, release, document metadata, invoice, payment, and audit data out of localStorage.
- [ ] Implement transactions/locking for allocation and transfer operations so concurrent users cannot reserve the same position.
- [ ] Add server-side validation, clear error handling, idempotency for retryable operations, and consistent timestamps/time-zone rules.
- [ ] Add data migration/import tooling only after records have been cleaned, deduplicated, reconciled, and approved.

**Exit criterion:** Two different users on different devices see the same authoritative records, and conflicting concurrent actions are safely rejected.

## 3. Implement authentication and enforce authorization

- [ ] Add Supabase Auth or an approved identity provider; disable public sign-up if accounts should be invitation-only.
- [ ] Require verified accounts and secure password reset/session handling; consider MFA for privileged users.
- [ ] Create an administrative onboarding/offboarding process, including immediate access revocation for departing staff.
- [ ] Enforce permissions on the server and in database Row Level Security (RLS). Hiding or disabling UI controls is not authorization.
- [ ] Scope every data operation to the user's assigned facility and permitted role.
- [ ] Review every RLS policy, including documents, invoices, payments, cases, profiles, and audit events. Test both allowed and denied access.
- [ ] Never expose a Supabase service-role key or other privileged secret in browser code or public environment variables.
- [ ] Add automated negative tests for cross-facility access, role escalation, direct API calls, and unauthorized exports.

**Exit criterion:** A security test matrix demonstrates that users cannot bypass permissions by calling APIs directly or modifying browser state.

## 4. Secure document storage and personal information

- [ ] Use private object-storage buckets; do not make case documents publicly accessible.
- [ ] Authorize uploads/downloads on the server and issue short-lived signed URLs only after permission checks.
- [ ] Validate file size, allowed file types, content signatures, and filenames; use generated object keys rather than user-provided paths.
- [ ] Add malware scanning or a documented safe-review process before documents become available to staff.
- [ ] Store only document metadata in database records; never place file contents or sensitive personal data in browser logs.
- [ ] Define retention, correction, deletion, export, and legal-hold procedures.
- [ ] Mask sensitive identifiers in lists, reports, logs, and notifications unless a role needs to see the full value.
- [ ] Provide a privacy notice and establish a process for access requests and security incidents.

**Exit criterion:** Private documents cannot be retrieved without an authenticated, authorized request, and retention/deletion has been tested.

## 5. Make audit history trustworthy

- [ ] Generate audit events on the server or through tightly controlled database functions, not from arbitrary client-submitted event text.
- [ ] Record actor, action, timestamp, affected record, facility, outcome, and a minimal before/after summary where justified.
- [ ] Never log passwords, access tokens, full identity numbers, document contents, or unnecessary personal information.
- [ ] Restrict audit-log reads to approved roles and prevent normal users from modifying or deleting events.
- [ ] Audit sensitive actions: intake edits, allocation/transfer, release approval/rejection/completion, invoice changes, payments, exports, and permission changes.
- [ ] Alert on suspicious or high-impact events and define who reviews them.

**Exit criterion:** A test confirms audit records are generated for sensitive operations and cannot be forged or edited by ordinary users.

## 6. Validate business-critical workflows

- [ ] Intake: required fields, duplicate detection, case-reference uniqueness, correction history, and validation.
- [ ] Storage: capacity rules, unavailable/maintenance positions, conflict prevention, transfers, and allocation history.
- [ ] Release: required documents/checks, authorized approval, separation of duties where required, rejection/rework, and prevention of premature completion.
- [ ] Billing: date boundaries, rate changes, partial days if applicable, discounts, credits, payment allocation, overdue status, and reconciliation.
- [ ] Documents: correct case linkage, authorization, invalid file handling, and removal/retention rules.
- [ ] Reports: facility and date filters, totals reconciled against source records, and export permissions.
- [ ] Accessibility: keyboard navigation, visible focus, labels, contrast, and useful validation/error messages.
- [ ] Responsive behaviour: test supported desktop, tablet, and mobile screen sizes.
- [ ] Add automated unit/integration tests for billing calculations, allocation conflicts, release checks, authorization, and audit creation.
- [ ] Add end-to-end tests for the primary admission-to-release journey and finance reconciliation.

**Exit criterion:** Tests pass in CI and an operations representative signs off each workflow using synthetic data.

## 7. Production operations and reliability

- [ ] Configure automated database backups and point-in-time recovery if available; document restoration steps.
- [ ] Perform a restore rehearsal and record measured recovery time and data loss.
- [ ] Add application error monitoring, structured server logs, uptime checks, and actionable alerts.
- [ ] Define support ownership, escalation contacts, incident severity, and after-hours expectations.
- [ ] Configure rate limiting and abuse protection on authentication, upload, export, and public endpoints.
- [ ] Review database indexes and query performance using realistic volumes; set sensible pagination and export limits.
- [ ] Add health checks and a maintenance/incident communication process.
- [ ] Document deployment rollback and database migration rollback/forward-fix procedures.

**Exit criterion:** The team can detect a failure, investigate it without exposing personal data, restore service/data, and roll back a bad release.

## 8. Configure hosting, domain, and secrets

- [ ] Choose a supported hosting provider and deploy a staging environment first.
- [ ] Configure the production domain, HTTPS, security headers, and appropriate Content Security Policy.
- [ ] Store secrets in the hosting provider's secret manager; keep local environment files out of Git.
- [ ] Set production environment variables and restrict allowed origins/redirect URLs.
- [ ] Configure CI checks for linting, type checking, tests, and production builds.
- [ ] Pin and regularly update dependencies; run dependency and secret scanning.
- [ ] Confirm the favicon, page metadata, error states, and branding display correctly in supported browsers.
- [ ] Test production deployment and rollback using staging before the first release.

**Exit criterion:** A repeatable deployment pipeline can deploy a tested release without exposing secrets or relying on a developer's machine.

## 9. User acceptance and go-live

- [ ] Test the full workflow with fictional records in staging.
- [ ] Test permissions with one account per role and at least one account with no access.
- [ ] Reconcile sample invoices and reports independently.
- [ ] Verify backups, restoration, monitoring, incident contacts, and support documentation.
- [ ] Train staff on case entry, allocation, release approvals, billing, document handling, and reporting.
- [ ] Prepare a short user guide and a process for reporting errors or suspected privacy incidents.
- [ ] Approve a go-live checklist with named sign-offs.
- [ ] Import real data only through an approved, tested, access-controlled process.
- [ ] Monitor closely after launch and maintain a documented issue register.

**Exit criterion:** Business owner, operations lead, and technical/security owner explicitly approve go-live.

## Suggested implementation order

1. Requirements and permission matrix.
2. Backend, schema review, migrations, and concurrency-safe workflows.
3. Authentication, server-side authorization, and RLS tests.
4. Private document storage and server-generated audit events.
5. Automated tests and CI pipeline.
6. Monitoring, backups, restore rehearsal, and security review.
7. Staging acceptance, staff training, and controlled go-live.

## Current MVP limitations to close

- Browser localStorage is not shared, centrally backed up, or suitable as the authoritative production database.
- The role selector is a UI preview, not a security boundary.
- The included Supabase migration is an unverified starter and needs review and policy tests.
- Document records are metadata only; real private uploads are not implemented.
- Browser-generated audit entries are not tamper-proof.
- Build, automated tests, security testing, and production deployment must be run and verified before launch.

## Release decision

**Do not use with real sensitive records until the critical security, backend, backup, audit, and workflow requirements above are implemented and verified.** A working interface alone is not evidence of production readiness.

## 10. Publish the public lead-generation website

The public partnership and investor page is the homepage at `/`; the operations management interface is at `/portal`. The legacy `/opportunities` route redirects to the homepage. It introduces the service proposition and captures business enquiries. The form is deliberately transparent about its current preview-only behaviour.

- [ ] Configure `NEXT_PUBLIC_LEAD_ENDPOINT` in the deployment environment to point to an approved HTTPS endpoint that accepts the lead JSON payload and returns a 2xx response on success.
- [ ] Implement that endpoint on a trusted server or approved CRM/form provider. Validate all fields again on the server; client-side validation is not a security control.
- [ ] Store leads in a protected CRM/database with access limited to authorised business-development staff.
- [ ] Add spam protection, rate limiting, bot mitigation, monitoring, and safe failure/retry handling.
- [ ] Configure consent language, privacy notice, retention period, and a process to honour applicable data-subject requests.
- [ ] Notify the responsible team after a lead is successfully stored; do not send notifications containing unnecessary personal information.
- [ ] Test valid, invalid, duplicate, malicious, and failed submissions in staging.
- [ ] Verify the endpoint's CORS policy if it is hosted on a different domain; allow only the production site origin where practical.
- [ ] Configure social-sharing metadata and an accurate canonical domain once the production domain is confirmed.
- [ ] Add conversion analytics only after reviewing consent and privacy implications.

**Important:** Without `NEXT_PUBLIC_LEAD_ENDPOINT`, the form saves the enquiry in that visitor's browser local storage for preview purposes only. It does not deliver the lead to JD Holdings. Do not publish the form for real lead capture until the endpoint/CRM integration has been configured and tested.

