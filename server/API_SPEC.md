# AssetFlow Frontend API And Architecture Spec

This file is the frontend contract for the Express/Mongoose server in this folder. It is derived from `src/app.js`, `src/routes/*`, `src/controllers/*`, `src/models/*`, and `src/middleware/*`.

Base URL: `http://localhost:<PORT>`

API prefix: `/api`

Default local API URL: `http://localhost:5000/api`

## Backend Architecture

- Runtime: Node.js with Express ES modules.
- Entrypoint: `src/server.js` loads `.env`, connects to MongoDB, then starts the Express app.
- App setup: `src/app.js` registers CORS, JSON parsing, URL encoded parsing, request logging, routes, `notFound`, and `errorHandler`.
- Database: MongoDB through Mongoose models in `src/models`.
- Authentication: JWT bearer token in `Authorization: Bearer <token>`.
- Authorization: route-level role middleware in `src/middleware/role.js`.
- Uploads: Multer stores files in local `uploads/`; accepted extensions are `jpg`, `jpeg`, `png`, `webp`, `pdf`, `doc`, `docx`.
- Error format: controllers throw errors and `errorHandler` returns `{ success: false, message, stack? }`.
- Success format: controllers generally return `{ success: true, message?, count?, <resource> }`.

## Frontend API Client Rules

- Store the JWT returned by `POST /api/auth/login` or `POST /api/auth/signup`.
- Add `Authorization: Bearer <token>` to every protected endpoint.
- Use `application/json` for normal bodies.
- Use `multipart/form-data` for asset create/update and maintenance create.
- Use Mongo `_id` strings for all path `:id` params and reference fields.
- Display `error.response.data.message` when the server returns an error.
- List endpoints return full collections plus `count`; pagination is not currently implemented server-side.

## Roles

- `Admin`
- `Asset Manager`
- `Department Head`
- `Employee`

Use `user.role` from login/signup/profile responses to gate UI actions.

## Data Models And Enums

### User

Fields: `_id`, `name`, `email`, `role`, `department`, `status`, `createdAt`, `updatedAt`

Enums:
- `role`: `Admin`, `Asset Manager`, `Department Head`, `Employee`
- `status`: `Active`, `Inactive`

### Department

Fields: `_id`, `name`, `departmentHead`, `parentDepartment`, `status`, `createdAt`, `updatedAt`

Enums:
- `status`: `Active`, `Inactive`

### Category

Fields: `_id`, `name`, `description`, `warrantyPeriod`, `status`, `createdAt`, `updatedAt`

Enums:
- `status`: `Active`, `Inactive`

### Asset

Fields: `_id`, `assetTag`, `name`, `category`, `serialNumber`, `department`, `location`, `acquisitionDate`, `nextMaintenanceDate`, `retirementDate`, `acquisitionCost`, `condition`, `status`, `shared`, `image`, `documents`, `createdBy`, `createdAt`, `updatedAt`

Enums:
- `condition`: `Excellent`, `Good`, `Fair`, `Poor`, `Damaged`
- `status`: `Available`, `Allocated`, `Reserved`, `Under Maintenance`, `Lost`, `Retired`, `Disposed`

### Allocation

Fields: `_id`, `asset`, `allocatedTo`, `allocatedBy`, `expectedReturnDate`, `actualReturnDate`, `transferRequested`, `transferTo`, `approvedBy`, `status`, `returnCondition`, `notes`, `createdAt`, `updatedAt`

Enums:
- `status`: `Allocated`, `Transfer Requested`, `Transferred`, `Returned`

### Booking

Fields: `_id`, `asset`, `bookedBy`, `startTime`, `endTime`, `purpose`, `status`, `createdAt`, `updatedAt`

Enums:
- `status`: `Upcoming`, `Ongoing`, `Completed`, `Cancelled`

### Maintenance

Fields: `_id`, `asset`, `raisedBy`, `approvedBy`, `technician`, `issue`, `priority`, `image`, `status`, `resolution`, `notes`, `createdAt`, `updatedAt`

Enums:
- `priority`: `Low`, `Medium`, `High`
- `status`: `Pending`, `Approved`, `Rejected`, `In Progress`, `Resolved`

### Audit

Fields: `_id`, `department`, `location`, `auditors`, `assets`, `startDate`, `endDate`, `status`, `discrepancies`, `createdBy`, `createdAt`, `updatedAt`

Audit asset fields: `asset`, `status`, `remarks`

Enums:
- audit `status`: `Open`, `Closed`
- audit asset `status`: `Verified`, `Missing`, `Damaged`

### Notification

Fields: `_id`, `user`, `title`, `message`, `type`, `link`, `isRead`, `createdAt`, `updatedAt`

Enums:
- `type`: `Allocation`, `Transfer`, `Booking`, `Maintenance`, `Audit`, `Reminder`

### ActivityLog

Fields: `_id`, `user`, `action`, `module`, `description`, `ipAddress`, `createdAt`, `updatedAt`

Enums:
- `module`: `Authentication`, `Department`, `Category`, `Employee`, `Asset`, `Allocation`, `Booking`, `Maintenance`, `Audit`

## Endpoint Index

### Root

| Method | Path | Auth | Roles | Purpose |
| --- | --- | --- | --- | --- |
| GET | `/` | No | Public | Health message: `AssetFlow API Running` |

### Auth

| Method | Path | Auth | Roles | Body | Response |
| --- | --- | --- | --- | --- | --- |
| POST | `/api/auth/signup` | No | Public | `{ name, email, password }` | `{ success, message, token, user }` |
| POST | `/api/auth/login` | No | Public | `{ email, password }` | `{ success, message, token, user }` |
| POST | `/api/auth/forgot-password` | No | Public | `{ email }` | `{ success, message }` |
| PUT | `/api/auth/reset-password/:token` | No | Public | `{ password }` | `{ success, message }` |
| GET | `/api/auth/me` | Yes | Any logged-in user | None | `{ success, user }` |

### Departments

All department routes require `Admin`.

| Method | Path | Query | Body | Response |
| --- | --- | --- | --- | --- |
| GET | `/api/departments` | `status=Active|Inactive|All` | None | `{ success, count, departments }` |
| POST | `/api/departments` | None | `{ name, parentDepartment? }` | `{ success, message, department }` |
| GET | `/api/departments/:id` | None | None | `{ success, department }` |
| PUT | `/api/departments/:id` | None | `{ name?, departmentHead?, parentDepartment?, status? }` | `{ success, message, department }` |
| DELETE | `/api/departments/:id` | None | None | `{ success, message }` |

Notes:
- Delete is a soft delete; it sets `status` to `Inactive`.
- `departmentHead` must reference a user whose role is `Department Head`.
- Default list excludes inactive records unless `status=All`.

### Categories

All category routes require `Admin`.

| Method | Path | Query | Body | Response |
| --- | --- | --- | --- | --- |
| GET | `/api/categories` | `status=Active|Inactive|All` | None | `{ success, count, categories }` |
| POST | `/api/categories` | None | `{ name, description?, warrantyPeriod? }` | `{ success, message, category }` |
| GET | `/api/categories/:id` | None | None | `{ success, category }` |
| PUT | `/api/categories/:id` | None | `{ name?, description?, warrantyPeriod?, status? }` | `{ success, message, category }` |
| DELETE | `/api/categories/:id` | None | None | `{ success, message }` |

Notes:
- Delete is a soft delete; it sets `status` to `Inactive`.
- Default list excludes inactive records unless `status=All`.

### Employees

All employee routes require `Admin`.

| Method | Path | Query | Body | Response |
| --- | --- | --- | --- | --- |
| GET | `/api/employees` | `status=Active|Inactive|All` | None | `{ success, count, employees }` |
| GET | `/api/employees/:id` | None | None | `{ success, employee }` |
| PUT | `/api/employees/:id` | None | `{ name?, email?, department?, status? }` | `{ success, message, employee }` |
| PUT | `/api/employees/promote/:id` | None | `{ role, departmentId? }` | `{ success, message, employee }` |
| DELETE | `/api/employees/:id` | None | None | `{ success, message }` |

Notes:
- `promote` accepts `role` values `Department Head` or `Asset Manager`.
- Delete is a soft delete; it sets `status` to `Inactive`.

### Assets

| Method | Path | Auth | Roles | Query | Body | Response |
| --- | --- | --- | --- | --- | --- | --- |
| GET | `/api/assets` | Yes | Any logged-in user | `status`, `category`, `department`, `location`, `assetTag`, `serialNumber` | None | `{ success, count, assets }` |
| GET | `/api/assets/:id` | Yes | Any logged-in user | None | None | `{ success, asset, allocationHistory, maintenanceHistory }` |
| POST | `/api/assets` | Yes | `Asset Manager` | None | Multipart fields below | `{ success, message, asset }` |
| PUT | `/api/assets/:id` | Yes | `Asset Manager` | None | Multipart fields below | `{ success, message, asset }` |
| DELETE | `/api/assets/:id` | Yes | `Asset Manager` | None | None | `{ success, message }` |

Asset multipart fields:
- Text fields: `name`, `category`, `serialNumber?`, `department?`, `location`, `acquisitionDate?`, `acquisitionCost?`, `condition?`, `shared?`
- Files: `image` max 1, `documents` max 10

Notes:
- `name`, `category`, and `location` are required on create.
- `serialNumber` must be unique when provided.
- Asset tag is generated server-side.
- Delete is a soft dispose; it sets `status` to `Disposed`.
- Current update controller checks `req.file`, while the route uses `upload.fields`; image/document replacement may need controller adjustment if the frontend depends on update uploads.

### Allocations

| Method | Path | Auth | Roles | Query | Body | Response |
| --- | --- | --- | --- | --- | --- | --- |
| GET | `/api/allocations` | Yes | `Admin`, `Asset Manager` | `status=Allocated|Transfer Requested|Transferred|Returned|All` | None | `{ success, count, allocations }` |
| GET | `/api/allocations/:id` | Yes | `Admin`, `Asset Manager` | None | None | `{ success, allocation }` |
| POST | `/api/allocations` | Yes | `Asset Manager` | None | `{ asset, allocatedTo, expectedReturnDate?, notes? }` | `{ success, message, allocation }` |
| PUT | `/api/allocations/return/:id` | Yes | `Asset Manager` | None | `{ returnCondition?, notes? }` | `{ success, message, allocation }` |
| PUT | `/api/allocations/request-transfer/:id` | Yes | `Employee` | None | `{ transferTo }` | `{ success, message, allocation }` |
| PUT | `/api/allocations/approve-transfer/:id` | Yes | `Asset Manager`, `Department Head` | None | None | `{ success, message, allocation }` |

Notes:
- Creating an allocation requires the asset status to be `Available`; the asset becomes `Allocated`.
- Returning an asset sets allocation to `Returned` and asset to `Available`.
- Transfer request moves allocation to `Transfer Requested`; approval changes `allocatedTo` and status to `Transferred`.

### Bookings

| Method | Path | Auth | Roles | Query | Body | Response |
| --- | --- | --- | --- | --- | --- | --- |
| GET | `/api/bookings` | Yes | `Admin`, `Asset Manager`, `Department Head`, `Employee` | `status=Upcoming|Ongoing|Completed|Cancelled|All` | None | `{ success, count, bookings }` |
| GET | `/api/bookings/:id` | Yes | `Admin`, `Asset Manager`, `Department Head`, `Employee` | None | None | `{ success, booking }` |
| POST | `/api/bookings` | Yes | `Department Head`, `Employee` | None | `{ asset, startTime, endTime, purpose? }` | `{ success, message, booking }` |
| PUT | `/api/bookings/cancel/:id` | Yes | `Department Head`, `Employee` | None | None | `{ success, message, booking }` |
| PUT | `/api/bookings/reschedule/:id` | Yes | `Department Head`, `Employee` | None | `{ startTime, endTime }` | `{ success, message, booking }` |

Notes:
- Only shared assets can be booked.
- Server rejects overlapping bookings for the same asset unless the existing booking is `Cancelled`.
- Reschedule recalculates status as `Completed`, `Ongoing`, or `Upcoming`.

### Maintenances

| Method | Path | Auth | Roles | Query | Body | Response |
| --- | --- | --- | --- | --- | --- | --- |
| GET | `/api/maintenances` | Yes | `Admin`, `Asset Manager`, `Department Head` | `status=Pending|Approved|Rejected|In Progress|Resolved|All` | None | `{ success, count, maintenances }` |
| GET | `/api/maintenances/:id` | Yes | `Admin`, `Asset Manager`, `Department Head`, `Employee` | None | None | `{ success, maintenance }` |
| POST | `/api/maintenances` | Yes | `Employee`, `Department Head`, `Asset Manager` | None | Multipart fields below | `{ success, message, maintenance }` |
| PUT | `/api/maintenances/approve/:id` | Yes | `Asset Manager` | None | None | `{ success, message, maintenance }` |
| PUT | `/api/maintenances/reject/:id` | Yes | `Asset Manager` | None | None | `{ success, message, maintenance }` |
| PUT | `/api/maintenances/start/:id` | Yes | `Asset Manager` | None | `{ technician? }` | `{ success, message, maintenance }` |
| PUT | `/api/maintenances/resolve/:id` | Yes | `Asset Manager` | None | `{ resolution?, notes? }` | `{ success, message, maintenance }` |

Maintenance multipart fields:
- Text fields: `asset`, `issue`, `priority?`, `notes?`
- Files: `image` max 1

Notes:
- Create is blocked for assets with status `Under Maintenance`, `Lost`, `Retired`, or `Disposed`.
- Approval moves the asset to `Under Maintenance`.
- Resolve moves the asset back to `Available`.

### Audits

| Method | Path | Auth | Roles | Query | Body | Response |
| --- | --- | --- | --- | --- | --- | --- |
| GET | `/api/audits` | Yes | `Admin`, `Asset Manager` | `status=Open|Closed|All` | None | `{ success, count, audits }` |
| GET | `/api/audits/:id` | Yes | `Admin`, `Asset Manager` | None | None | `{ success, audit }` |
| POST | `/api/audits` | Yes | `Admin` | None | `{ department, location?, auditors?, startDate, endDate }` | `{ success, message, audit }` |
| PUT | `/api/audits/verify/:id` | Yes | `Admin`, `Asset Manager` route roles; controller also requires current user to be assigned auditor | None | `{ assetId, status, remarks? }` | `{ success, message, audit }` |
| PUT | `/api/audits/close/:id` | Yes | `Admin` | None | None | `{ success, message, audit }` |

Notes:
- Create pre-populates the audit's `assets` from assets in the selected department and optional location.
- Verification status must be `Verified`, `Missing`, or `Damaged`.
- Closing an audit marks assets with audit status `Missing` as asset status `Lost`.

### Dashboard

| Method | Path | Auth | Roles | Response |
| --- | --- | --- | --- | --- |
| GET | `/api/dashboard` | Yes | Any logged-in user | `{ success, role, dashboard }` |

Dashboard response keys depend on the current user's role:
- `Admin`: `availableAssets`, `allocatedAssets`, `maintenanceToday`, `activeBookings`, `pendingTransfers`, `upcomingReturns`, `overdueReturns`, `departments`, `employees`, `categories`, `openAudits`
- `Asset Manager`: `availableAssets`, `allocatedAssets`, `maintenanceRequests`, `assetsUnderMaintenance`, `pendingTransfers`, `upcomingReturns`, `overdueReturns`
- `Department Head`: `departmentAssets`, `departmentEmployees`, `departmentBookings`, `pendingTransfers`, `upcomingReturns`, `maintenanceRequests`
- `Employee`: `allocatedAssets`, `myBookings`, `myMaintenanceRequests`, `upcomingReturns`

### Reports

All report routes require `Admin`.

| Method | Path | Auth | Roles | Response |
| --- | --- | --- | --- | --- |
| GET | `/api/reports/dashboard` | Yes | `Admin` | `{ success, summary, mostUsedAssets, idleAssets, maintenanceFrequency, dueMaintenance, nearingRetirement, departmentSummary, bookingHeatmap }` |
| GET | `/api/reports/export` | Yes | `Admin` | CSV file download named `assets-report.csv` |

### Notifications

All notification routes require a logged-in user and operate on the current user's notifications.

| Method | Path | Auth | Roles | Response |
| --- | --- | --- | --- | --- |
| GET | `/api/notifications` | Yes | Any logged-in user | `{ success, count, notifications }` |
| PUT | `/api/notifications/:id/read` | Yes | Notification owner | `{ success, message, notification }` |
| DELETE | `/api/notifications/:id` | Yes | Notification owner | `{ success, message }` |

### Activity Logs

| Method | Path | Auth | Roles | Response |
| --- | --- | --- | --- | --- |
| GET | `/api/activity-logs` | Yes | `Admin` | `{ success, count, logs }` |

## Suggested Frontend Architecture

### App Layers

- `api/client`: Axios or fetch wrapper with base URL, token injection, and error normalization.
- `api/services`: one service per route group: `authApi`, `assetApi`, `departmentApi`, etc.
- `auth/store`: persisted token, current user, logout, role helpers.
- `routes`: protected route wrapper and role-based route guard.
- `pages`: page-level screens mapped to backend resources.
- `components/forms`: reusable forms using model enums from this spec.
- `components/tables`: list views with query filters and client-side pagination.
- `components/status`: shared status badges for asset/allocation/booking/maintenance/audit statuses.

### Recommended Pages

- Public: Login, Signup, Forgot Password, Reset Password.
- Shared: Dashboard, Assets, Asset Detail, Bookings, Maintenance, Notifications.
- Admin: Departments, Categories, Employees, Audits, Reports, Activity Logs.
- Asset Manager: Asset Create/Edit, Allocations, Transfer Approvals, Maintenance Workflow.
- Department Head: Department Overview, Booking, Transfer Approval where allowed, Maintenance Requests.
- Employee: My Assets, My Bookings, Raise Maintenance, Request Transfer.

### Service Method Map

- `authApi.signup(data)` -> `POST /auth/signup`
- `authApi.login(data)` -> `POST /auth/login`
- `authApi.forgotPassword(data)` -> `POST /auth/forgot-password`
- `authApi.resetPassword(token, data)` -> `PUT /auth/reset-password/:token`
- `authApi.me()` -> `GET /auth/me`
- `departmentApi.list(params)` -> `GET /departments`
- `categoryApi.list(params)` -> `GET /categories`
- `employeeApi.list(params)` -> `GET /employees`
- `assetApi.list(params)` -> `GET /assets`
- `assetApi.create(formData)` -> `POST /assets`
- `allocationApi.create(data)` -> `POST /allocations`
- `bookingApi.create(data)` -> `POST /bookings`
- `maintenanceApi.create(formData)` -> `POST /maintenances`
- `auditApi.verify(id, data)` -> `PUT /audits/verify/:id`
- `dashboardApi.get()` -> `GET /dashboard`
- `reportApi.dashboard()` -> `GET /reports/dashboard`
- `reportApi.exportCsv()` -> `GET /reports/export`
- `notificationApi.list()` -> `GET /notifications`
- `activityLogApi.list()` -> `GET /activity-logs`

## Known Backend Notes For Frontend

- The API currently has no server-side pagination.
- No static route is registered for `/uploads`, so uploaded file names may require a static file route before images/documents can be opened directly in the frontend.
- `src/controllers/reportController.js` depends on `asyncHandler`, `Asset`, `Allocation`, `Booking`, and `Maintenance` imports. Verify this file stays intact before using reports in production.
- Asset update upload handling may need adjustment because the route uses `upload.fields(...)`, while the controller checks `req.file`.
