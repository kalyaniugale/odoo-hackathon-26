# AI Context — AssetFlow Server

Purpose: provide a machine-friendly, developer-focused summary of the server API, data models, file layout, and UI-building guidance so an AI or frontend developer can automatically generate UI pages, forms and data adapters.

Base URL: http://localhost:<PORT>/api

Auth
- Token: JWT returned on `POST /api/auth/login` and `POST /api/auth/signup`.
- Send header: `Authorization: Bearer <token>` for protected endpoints.
- Token generation: `src/utils/generateToken.js` signs tokens with `JWT_SECRET` and 7d expiry.

Required environment variables (server): `MONGO_URI`, `JWT_SECRET`, optional: `EMAIL_USER`, `EMAIL_PASS`, `PORT`.

File layout (important files)
- `src/app.js` — express app, route mounting
- `src/server.js` — entrypoint, loads env and starts server
- `src/config/db.js` — mongoose connection
- `src/routes/*` — route groups mounted under `/api/*`
- `src/controllers/*` — controller logic; each controller returns JSON with `{ success, ... }`
- `src/models/*` — Mongoose models and enums (source of truth for fields and status values)
- `src/middleware/*` — `auth`, `role`, `errorHandler`, `notFound`, `upload` (file handling)
- `src/utils/*` — helpers: token generation, email, QR and asset tag generation
- `src/seed/seedAdmin.js` — create initial admin user
- `uploads/` — local storage for uploaded images/documents

Model field highlights and enums (useful for UI validation)
- `User` (src/models/User.js)
  - fields: `name`, `email`, `password`, `role`, `department`, `status`
  - role enum: `Admin`, `Asset Manager`, `Department Head`, `Employee`
  - status enum: `Active`, `Inactive`
- `Department` (src/models/department.js)
  - fields: `name`, `departmentHead`, `parentDepartment`, `status`
  - status enum: `Active`, `Inactive`
- `Category` (src/models/Category.js)
  - fields: `name`, `description`, `warrantyPeriod`, `status`
  - status enum: `Active`, `Inactive`
- `Asset` (src/models/Asset.js)
  - fields: `assetTag`, `name`, `category`, `serialNumber`, `department`, `location`, `acquisitionDate`, `acquisitionCost`, `condition`, `status`, `shared`, `image`, `documents`, `createdBy`
  - condition enum: `Excellent`, `Good`, `Fair`, `Poor`, `Damaged`
  - status enum: `Available`, `Allocated`, `Reserved`, `Under Maintenance`, `Lost`, `Retired`, `Disposed`
- `Allocation` (src/models/Allocation.js)
  - fields: `asset`, `allocatedTo`, `allocatedBy`, `expectedReturnDate`, `actualReturnDate`, `transferRequested`, `transferTo`, `approvedBy`, `status`, `returnCondition`, `notes`
  - status enum: `Allocated`, `Transfer Requested`, `Transferred`, `Returned`
- `Booking` (src/models/Booking.js)
  - fields: `asset`, `bookedBy`, `startTime`, `endTime`, `purpose`, `status`
  - status enum: `Upcoming`, `Ongoing`, `Completed`, `Cancelled`
- `Maintenance` (src/models/Maintenance.js)
  - fields: `asset`, `raisedBy`, `approvedBy`, `technician`, `issue`, `priority`, `image`, `status`, `resolution`, `notes`
  - priority enum: `Low`, `Medium`, `High`
  - status enum: `Pending`, `Approved`, `Rejected`, `In Progress`, `Resolved`
- `Audit` (src/models/Audit.js)
  - fields: `department`, `location`, `auditors`, `assets` (with per-asset `status` and `remarks`), `startDate`, `endDate`, `status`, `discrepancies`, `createdBy`
  - asset verification enum: `Verified`, `Missing`, `Damaged`
  - audit status: `Open`, `Closed`

API Endpoints (concise, derived from `src/routes/*` — include method, path, auth, roles, body fields)

- Auth
  - POST `/api/auth/signup` — public. Body: `{ name, email, password }`. Response: `{ token, user }`.
  - POST `/api/auth/login` — public. Body: `{ email, password }`. Response: `{ token, user }`.
  - POST `/api/auth/forgot-password` — public. Body: `{ email }`. Sends reset email.
  - PUT `/api/auth/reset-password/:token` — public. Body: `{ password }`.
  - GET `/api/auth/me` — auth required. Returns profile.

- Departments (`/api/departments`) — auth + role `Admin` (router uses `auth` and `role('Admin')`)
  - GET `/api/departments` — optional query: `?status=Active|Inactive|All`. Response: `{ count, departments[] }`.
  - POST `/api/departments` — body: `{ name, parentDepartment }`.
  - GET `/api/departments/:id` — get by id.
  - PUT `/api/departments/:id` — body: `{ name?, departmentHead?, parentDepartment?, status? }`.
  - DELETE `/api/departments/:id` — soft-deactivates (sets `status` to `Inactive`).

- Categories (`/api/categories`) — auth + role `Admin`
  - GET `/api/categories` — list, optional `?status=`.
  - POST `/api/categories` — body: `{ name, description?, warrantyPeriod? }`.
  - GET `/api/categories/:id`
  - PUT `/api/categories/:id` — update fields, can set `status`.
  - DELETE `/api/categories/:id` — soft-delete (sets `status` to `Inactive`).

- Employees (`/api/employees`) — auth + role `Admin`
  - GET `/api/employees` — list employees.
  - GET `/api/employees/:id` — get employee profile.
  - PUT `/api/employees/:id` — update employee fields (e.g., department, name).
  - PUT `/api/employees/promote/:id` — promote user (controller handles role change).
  - DELETE `/api/employees/:id` — soft-delete (set `status` to `Inactive`).

- Assets (`/api/assets`)
  - GET `/api/assets` — auth required (any role). Query filters: `status, category, department, location, assetTag, serialNumber`.
  - GET `/api/assets/:id` — asset details + allocation & maintenance history.
  - POST `/api/assets` — auth + `role('Asset Manager')` only. multipart/form-data with fields: `name`, `category`, `serialNumber?`, `department?`, `location`, `acquisitionDate?`, `acquisitionCost?`, `condition?`, `shared?` and files: `image` (single) and `documents` (array). Response: created asset.
  - PUT `/api/assets/:id` — auth + `role('Asset Manager')`. multipart/form-data allowed for image/documents; body fields to update.
  - DELETE `/api/assets/:id` — auth + `role('Asset Manager')`. Soft-disposes asset (`status='Disposed'`).

- Allocations (`/api/allocations`)
  - GET `/api/allocations` — auth + roles `Admin`, `Asset Manager`. Optional `?status=`.
  - GET `/api/allocations/:id` — auth + roles `Admin`, `Asset Manager`.
  - POST `/api/allocations` — auth + `Asset Manager`. Body: `{ asset, allocatedTo, expectedReturnDate?, notes? }`.
  - PUT `/api/allocations/return/:id` — auth + `Asset Manager`. Body: `{ returnCondition?, notes? }`.
  - PUT `/api/allocations/request-transfer/:id` — auth + `Employee`. Body: `{ transferTo }`.
  - PUT `/api/allocations/approve-transfer/:id` — auth + roles `Asset Manager`, `Department Head`.

- Bookings (`/api/bookings`)
  - GET `/api/bookings` — auth + roles `Admin, Asset Manager, Department Head, Employee`. Optional `?status=`.
  - GET `/api/bookings/:id` — auth + roles above.
  - POST `/api/bookings` — auth + roles `Department Head, Employee`. Body: `{ asset, startTime (ISO), endTime (ISO), purpose? }`.
  - PUT `/api/bookings/cancel/:id` — auth + roles `Department Head, Employee`.
  - PUT `/api/bookings/reschedule/:id` — auth + roles `Department Head, Employee`. Body: `{ startTime, endTime }`.

- Maintenance (`/api/maintenances`)
  - GET `/api/maintenances` — auth + roles `Admin, Asset Manager, Department Head`.
  - GET `/api/maintenances/:id` — auth (many roles allowed).
  - POST `/api/maintenances` — auth + roles `Employee, Department Head, Asset Manager`. multipart/form-data: fields `{ asset, issue, priority?, notes? }`, optional `image` file.
  - PUT `/api/maintenances/approve/:id` — auth + `Asset Manager`.
  - PUT `/api/maintenances/reject/:id` — auth + `Asset Manager`.
  - PUT `/api/maintenances/start/:id` — auth + `Asset Manager`. Body: `{ technician? }`.
  - PUT `/api/maintenances/resolve/:id` — auth + `Asset Manager`. Body: `{ resolution?, notes? }`.

- Audits (`/api/audits`)
  - GET `/api/audits` — auth + roles `Admin, Asset Manager`.
  - GET `/api/audits/:id` — auth + roles `Admin, Asset Manager`.
  - POST `/api/audits` — auth + `Admin`. Body: `{ department, location?, auditors[], startDate, endDate }`. The server pre-populates `assets` for the department and location.
  - PUT `/api/audits/verify/:id` — auth + assigned auditors. Body: `{ assetId, status: Verified|Missing|Damaged, remarks? }`.
  - PUT `/api/audits/close/:id` — auth + `Admin` — closes cycle and marks `Lost` assets.

- Reports, Notifications, Dashboard routes
  - `src/routes/reportRoutes.js`, `notificationRoutes.js`, `dashboardRoutes.js` exist but appear empty in repository; implement as needed.

Notes about responses
- Controllers consistently return JSON with `{ success: boolean, message?: string, <resource(s)> }`.
- Errors use thrown Error and `errorHandler` middleware; typical error response is JSON with message and status code.

UI Design Guidance (how to build the frontend from this context)

1) Authentication flow
  - Screens: `Login`, `SignUp`, `ForgotPassword`, `ResetPassword`.
  - On successful login/signup store token in `localStorage` or `httpOnly` cookie (recommended secure approach: server-set cookie). For quick dev use `localStorage.setItem('token', token)`.
  - After login, fetch profile from `GET /api/auth/me` to populate user metadata (role, department).

2) Pages and components mapping
  - Dashboard: aggregate counts from server (if `dashboardRoutes` implemented) or compute client-side using multiple endpoints (`/assets?status=...`, `/allocations?status=...`, `/maintenances?status=...`).
  - Assets list page: GET `/api/assets` with filters. Columns: assetTag, name, category.name, department.name, location, status, condition, shared.
  - Asset detail page: GET `/api/assets/:id` — show allocationHistory and maintenanceHistory arrays.
  - Asset form (create/edit): form fields match `Asset` model; for create use multipart/form-data to upload image/documents.
  - Departments, Categories, Employees pages — CRUD driven by respective routes; admin-only for create/update/delete.
  - Allocations page: list and detail view; allocation create modal (Asset Manager) — POST `/api/allocations`.
  - Bookings page: calendar/time-slot UI — implement conflict check client-side using `startTime`/`endTime` and server-side validation when POSTing to `/api/bookings`.
  - Maintenance page: raise request (with photo), approve/reject flows for Asset Manager.
  - Audits page: create audit (admin) and auditor workflows for verifying assets per audit. Use server-provided `assets` in created audit record.

3) Forms & validation rules (derived from models & controllers)
  - Required fields enforced by controllers: asset `name, category, location`; allocation `asset, allocatedTo`; booking `asset, startTime, endTime`; maintenance `asset, issue`; audit `department, startDate, endDate`; auth `name, email, password`.
  - Use enums from models to render selects (status, role, condition, priority).

4) File uploads
  - Use `multipart/form-data` for endpoints that accept files: POST/PUT `/api/assets` (image, documents[]), POST `/api/maintenances` (image).
  - Field names must match upload middleware config: `image` (single) and `documents` (array of files) for assets; `image` for maintenance.

5) Pagination & filtering
  - Controllers return full lists and `count`. They don't implement paginated pages; if the UI needs pagination implement client-side paging or extend server to accept `page`/`limit` query params.
  - Filtering supported on many list endpoints via query parameters (examples: `?status=Active`, `?department=<id>`, `?category=<id>`).

6) Role-based UI
  - Use `user.role` from login/profile to control UI: hide admin-only actions (department/category management), show Asset Manager actions for asset creation and allocation approval, show Department Head capabilities accordingly.

7) Error handling
  - For errors, server uses standard status codes and message in the thrown Error; UI should display returned `message` to users. Implement form-level and global error banners.

8) Example API calls (curl)
  - Login:

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@assetflow.com","password":"admin123"}'
```

  - Create Asset (example using `curl` with files):

```bash
curl -X POST http://localhost:5000/api/assets \
  -H "Authorization: Bearer <token>" \
  -F "name=Projector" \
  -F "category=<categoryId>" \
  -F "location=Main Hall" \
  -F "image=@/path/to/photo.jpg" \
  -F "documents=@/path/to/manual.pdf"
```

Notes and next steps for automation
- `reportRoutes`, `notificationRoutes`, and `dashboardRoutes` are present but empty and should be implemented to provide structured dashboard and reporting APIs (useful for UI analytics widgets).
- If you want a fully machine-usable OpenAPI/Swagger spec, I can scaffold a `swagger.yaml` (or `openapi.json`) by parsing the controllers and models to produce explicit request/response schemas.

File created: `server/AI_CONTEXT.md`
