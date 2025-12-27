# Commission Tracker Backend

This is the backend for the Commission Tracker application, built with Node.js, Express, and MongoDB.

## Setup

1. Install dependencies:
   ```
   npm install
   ```

2. Make sure MongoDB is running locally on port 27017.

3. Create a `.env` file with:
   ```
   MONGODB_URI=mongodb://localhost:27017/commissiontracker
   JWT_SECRET=your_jwt_secret_here
   PORT=5000
   ```

4. Start the server:
   ```
   npm start
   ```
   or for development:
   ```
   npm run dev
   ```

## API Endpoints

### Auth
- POST /api/auth/login - Login and get JWT token

### Sales
- GET /api/sales - Get all sales for authenticated user
- POST /api/sales - Create a new sale
- PUT /api/sales/:id - Update a sale
- DELETE /api/sales/:id - Delete a sale

All sales endpoints require Bearer token in Authorization header.

## Notes
- Users need to be created manually in the MongoDB database (no registration endpoint).
- Use the `createUser.template.js` file to create users with hashed passwords.
- Copy `createUser.template.js` to `createUser.js`, edit the credentials, and run `node createUser.js`.
- The actual `createUser.js` file is ignored by git for security.