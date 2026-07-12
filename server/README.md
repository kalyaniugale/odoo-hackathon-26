# Server — AssetFlow API

> Backend server for the AssetFlow application (Asset management REST API)

## Overview

This repository contains the Node.js + Express backend for the AssetFlow application used in the Odoo Hackathon project. It provides REST APIs for authentication, departments, categories, employees, assets, allocations, bookings, maintenances and audits. The server uses MongoDB via Mongoose and JWT for authentication.

## Key Features

- REST API endpoints for core asset management workflows
- JWT-based authentication and role-based access control
- File upload helpers and email notifications (nodemailer)
- Seed script to create an initial admin user

## Prerequisites

- Node.js (recommended v18+)
- npm (or yarn)
- MongoDB URI (Atlas or local)
- (Optional) Gmail account for sending emails (used by `nodemailer` in dev)

## Repository layout (server)

- `src/` — application source
  - `app.js` — express app and routes registration
  - `server.js` — entry point (loads env and starts server)
  - `config/` — database connection
  - `controllers/` — route handlers
  - `models/` — Mongoose models
  - `routes/` — express routers (mounted under `/api/*`)
  - `middleware/` — custom middleware (auth, error handler, etc.)
  - `utils/` — helpers (token generation, file upload, QR generation, etc.)
  - `seed/seedAdmin.js` — script to create the initial Admin user
- `uploads/` — runtime uploaded files (ensure this folder is writable)

## Environment variables

Create a `.env` file in the `server/` folder (or set env variables in your environment). Example:

```
PORT=5000
MONGO_URI=mongodb+srv://<user>:<pass>@cluster0.mongodb.net/assetflow?retryWrites=true&w=majority
JWT_SECRET=your_jwt_secret_here
EMAIL_USER=youremail@gmail.com
EMAIL_PASS=your_email_app_password_or_app_specific_password
```

Notes:
- `MONGO_URI` is required — the server will exit if it is not set.
- `JWT_SECRET` is required for signing/verifying tokens used by authentication.
- `EMAIL_USER` and `EMAIL_PASS` are used by the built-in mail helper (nodemailer). If you don't need email in development you can omit them, but features that send email will fail.

## Install dependencies

From the `server/` folder run:

```bash
npm install
```

## Running the server

- Development (auto-restart):

```bash
npm run dev
```

- Production:

```bash
npm start
```

The app listens on the port defined by `PORT` (default `5000`). The server entrypoint is `src/server.js` which calls `connectDB()` using `MONGO_URI`, then starts the express app exported from `src/app.js`.

## Seed initial admin user

To create the default admin (the seed script is `src/seed/seedAdmin.js`):

```bash
node src/seed/seedAdmin.js
```

This creates a user with email `admin@assetflow.com` and password `admin123` (hashed). Run this once on a fresh database.

## API overview

Base URL: `http://localhost:<PORT>/api`

Mounted route groups (see `src/app.js`):

- `/api/auth` — authentication (login/register/token)
- `/api/departments` — department CRUD
- `/api/categories` — category CRUD
- `/api/employees` — employee CRUD
- `/api/assets` — asset CRUD and related operations
- `/api/allocations` — allocation/transfer endpoints
- `/api/bookings` — resource booking endpoints
- `/api/maintenances` — maintenance workflows
- `/api/audits` — audit records

Authentication: send `Authorization: Bearer <token>` for protected routes.

For exact route names and payloads, consult the files under `src/routes/` and `src/controllers/`.

## Uploads and file storage

- The project uses a local `uploads/` directory for files. Ensure the directory exists and is writable by the server process.
- In production you may wish to swap to cloud storage (S3, GCS) and update the helper in `src/utils/uploadFile.js` accordingly.

## Common troubleshooting

- Error: `MONGO_URI is not defined in the environment` — ensure `.env` contains `MONGO_URI` or set the env var before starting the server.
- Error: `Cannot find module '.../server/src/models/Department.js'` — Node/OS is case-sensitive. Verify that the filename in `src/models` matches the import path in `src/controllers/departmentController.js` (exact case).
- `MaxListenersExceededWarning` from `nodemon` — this is an informational warning when many listeners are added, typically harmless during development.

## Tests

No automated tests are included in this repo. For manual testing use Postman, Insomnia or curl against the endpoints listed above.

## Contributing

- Follow the existing code style (ES modules, async/await and express-async-handler).
- When adding models or route files, keep naming consistent and remember file system case sensitivity.

## License

This project does not include an explicit license file. Add a license if needed.

---

If you want, I can also:

- add a `npm run seed` script to `package.json` that runs the seed script
- add a `README` section listing every route with method + sample request/response by parsing `src/routes` and `src/controllers`

Created: `server/README.md`
