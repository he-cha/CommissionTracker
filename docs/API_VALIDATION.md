# Sales API validation and ownership

The API preserves its per-user ownership model. Reads, updates and deletes filter on the verified token's user ID. New records receive that ID on the server. Requests cannot replace ownership through `userId`, `$set`, dotted fields or other undeclared input.

Login accepts only bounded strings. JWT verification checks HS256 signatures, expiration and an ID claim, returning 401 for invalid sessions. Missing/placeholder signing secrets fail closed; startup requires a non-placeholder `JWT_SECRET` with at least 32 characters and a MongoDB URI.

Sale requests validate enums, required strings, email syntax and real calendar dates. Nested bounty data permits unique months 1–6, boolean paid status, finite payment amounts and validated date fields. `dateChecked` remains supported and now persists through the schema. Negative payments are not prohibited because commission adjustments can be negative.

Update queries use `$set` and `runValidators: true`; server-controlled timestamps and identity metadata are not writable. The backend waits for its database connection before listening.

## Verification

- Frontend production build passed.
- `cd backend && npm test`: seven passing HTTP/middleware/schema tests. Query methods are mocked to assert ownership filters, validator options and rejection before writes; this does not establish live database behavior.
- `npm run test:integration` is a separate suite using only disposable `mongodb-memory-server` data. It checks two-user isolation, real CRUD and validation. MongoDB could not launch in this execution environment (`open: Operation not permitted`), so this suite remains unverified. It must pass in a MongoDB-capable environment before merging/deployment. The initial run downloads the test binary.

Use Node.js 24 for the recorded test commands. Set signing secrets outside source control and use synthetic users and sales for smoke testing. Existing sessions may need login again after configuration changes.

This update does not implement password reset, token revocation, login rate limiting, encryption of existing customer PIN fields, or a migration of historical data. Those require separate design and deployment work; the project is not represented as production-certified.
