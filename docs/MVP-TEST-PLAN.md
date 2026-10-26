# MVP verification checklist

Status: **not executed**. This is a manual test plan for the browser-local prototype. Do not interpret it as evidence of production security or a successful build.

## Local build and responsive UI
- [ ] `npm install` completes on Node.js 20 LTS.
- [ ] `npm run build` completes without TypeScript or prerender errors.
- [ ] Overview, case register, cold storage, release management, documents, billing, reports and audit history render.
- [ ] Layout remains usable at mobile, tablet and desktop widths.
- [ ] Keyboard focus, labels, empty states and status announcements are usable.

## Intake and storage allocation
- [ ] Register a case with required fields and confirm it appears in the case register.
- [ ] Try submitting without a case name/designation or referral institution; it should be blocked.
- [ ] Allocate an awaiting-allocation case to an available position.
- [ ] Try allocating to an occupied or maintenance position; it should be blocked.
- [ ] Allocate one case, then attempt to allocate the same case elsewhere and verify the prior position becomes available.
- [ ] Record a transfer with a reason and confirm the destination is occupied, source is freed and an audit event is added.
- [ ] Reload the browser and verify local demo changes persist.
- [ ] Reset demo data and confirm fictional seed records return.

## Release workflow
- [ ] Submit a release request with missing checks; it should remain pending and approval should be unavailable.
- [ ] Try approval while either required check is incomplete; completion must be blocked.
- [ ] Switch to Release Officer, mark demo checks complete, then approve.
- [ ] Confirm Mortuary Staff cannot approve/reject/complete a release through the UI.
- [ ] Complete an approved request and confirm the case is marked released and its storage position becomes available.
- [ ] Reject a request and confirm it is not completable.

## Billing and reports
- [ ] Create an invoice and verify inclusive calendar-day calculation multiplied by daily rate.
- [ ] Try an end date earlier than the start date; it should be blocked.
- [ ] Try a billing period overlapping an existing invoice for the same case; it should be blocked.
- [ ] Mark an invoice paid as Finance and confirm the outstanding total updates.
- [ ] Verify CSV exports include expected columns and only the intended records.

## Documents and audit
- [ ] Add a document metadata entry and confirm it links to the selected case.
- [ ] Verify the interface explicitly states that no file bytes are uploaded.
- [ ] Perform an operation and confirm an audit event includes action, actor, timestamp and target details.
- [ ] Confirm the interface states that browser-local audit history is not tamper-proof.

## Production blockers — not covered by the local prototype
- [ ] Real Supabase Auth, server-validated sessions and database-backed roles.
- [ ] RLS integration tests for each role and facility, including direct API requests.
- [ ] Database transactions/constraints for allocation, release and invoice overlap concurrency.
- [ ] Private Storage bucket policies, signed URL authorisation, file validation and malware scanning.
- [ ] Server-side, append-only audit event creation and protected retention.
- [ ] Rate limiting, backups, recovery tests, monitoring and accessibility review.
- [ ] Legal and operational validation for South African POPIA and mortuary procedures.
- [ ] Staging and production build/deployment verification.

**Important:** the role switch in the demo is a convenience for previewing workflows. It is not authentication or an enforceable permission boundary. Never use real records until the production blockers have been implemented and tested.
