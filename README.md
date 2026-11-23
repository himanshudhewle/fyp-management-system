# FYP Management System

A React + Vite portfolio demo with student, teacher, and admin dashboards. Accounts and dashboard records are stored in MongoDB Atlas through the Node.js API; each account can access its own records from different devices.

## Run locally

1. Install frontend dependencies from the project root:

   ```sh
   npm ci
   ```

2. Install API dependencies and create its local environment file:

   ```sh
   cd server
   npm ci
   ```

   Copy `server/.env.example` to `server/.env`, then set `MONGODB_URI`, `MONGODB_DB`, and a random `JWT_SECRET` of at least 32 characters. Keep `.env` private.

   If startup reports `querySrv ECONNREFUSED`, your DNS resolver may be blocking Atlas SRV lookups. Set `MONGODB_DNS_SERVERS=8.8.8.8,1.1.1.1` in `server/.env` as a local workaround; omit it on Render unless needed.

3. Start the API and frontend in separate terminals from the project root:

   ```sh
   npm run dev:api
   npm run dev
   ```

The API listens on `http://localhost:4000`; the Vite app uses `http://localhost:5173`.

## MongoDB Atlas setup

Create an Atlas free cluster, a database user, and a database named `fyp_management`. Put the Atlas connection string in `server/.env` as `MONGODB_URI`. The API creates its `users`, `records`, and `passwordresets` collections as needed.

The API stores password hashes (not plaintext passwords), issues expiring sign-in tokens, and scopes dashboard records to the signed-in account. File uploads are limited to 2 MB and stored with the corresponding record.

This is a resume/demo implementation, not production authentication: account sign-up allows choosing a role, and password reset displays a reset link in the app rather than sending email. Do not use it for real student or institutional data.

## Deploy to Render

The root `render.yaml` defines both the static frontend and Node API. Before deployment:

1. Push the project to a GitHub repository.
2. Create an Atlas cluster and database user. Configure Atlas Network Access to allow the Render API service to connect. Prefer restricting access to the API's outbound addresses; broad IP access is only a demo workaround and should not be used with sensitive data.
3. In Render, choose **New → Blueprint** and connect the repository.
4. Enter the Atlas connection string when prompted for `MONGODB_URI`. Render generates the API's `JWT_SECRET`.
5. Confirm the API's `FRONTEND_ORIGIN` and frontend's `VITE_API_URL` match the actual Render service URLs if the service names or URLs differ from those in `render.yaml`.
6. Wait for both services to deploy, then sign up and create a record. Sign in on another browser/device to confirm accounts and records are online.

The Atlas free tier has storage and feature limits. Check Atlas's current [pricing](https://www.mongodb.com/pricing) and [free-cluster documentation](https://www.mongodb.com/docs/atlas/tutorial/deploy-free-tier-cluster/) before creating the cluster.
