# Sales Commission Tracker

**React · TypeScript · Zustand · Express · MongoDB · JWT**

A full-stack application for recording sales and reviewing commissions, bounty alerts and sales summaries. This project focuses on individual sales entry and tracking; [BoostCommissionTracker](https://github.com/he-cha/BoostCommissionTracker) focuses on reconciling imported commission payments by device identifier.

## Implemented components

- Frontend forms for adding and editing sales, sales tables, summary cards and bounty-related views.
- Zustand state connected to an Express sales API.
- JWT login and user-scoped create/read/update/delete sales endpoints.
- MongoDB models for users and sales, with a user-creation template for local setup.

## Run locally

1. Install frontend dependencies with `npm ci` at the repository root.
2. Copy `.env.example` to `.env` to configure `VITE_API_URL`.
3. In `backend`, run `npm ci`, copy `.env.example` to `.env`, and configure MongoDB plus a random `JWT_SECRET`.
4. Follow `backend/README.md` to create a local demo user with the provided template. Do not commit that user's credentials.
5. Start the API with `npm start` inside `backend`, then run `npm run dev` at the root.

Frontend environment variables are public browser configuration; only backend `.env` should hold database credentials and signing secrets. Use synthetic data in demonstrations.

## Review notes

The API scopes sales queries to the authenticated user's ID. Update operations should additionally validate allowed fields and enable schema validators; frontend/server behavior still needs end-to-end verification. This cleanup replaces the generic template README and supplies environment examples. It does not claim measured commission recovery, production readiness, or a completed deployment test.
