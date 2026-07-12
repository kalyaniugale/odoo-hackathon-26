# AI Context - AssetFlow Server

Use this file as a short orientation for AI/frontend work. The canonical frontend contract is:

- Human-readable spec: `server/API_SPEC.md`
- Machine-readable spec: `server/openapi.yaml`

## Server Summary

AssetFlow is a Node.js, Express, MongoDB, and Mongoose backend for asset management workflows.

Important files:

- `src/server.js` - loads environment variables, connects to MongoDB, starts the app.
- `src/app.js` - configures middleware and mounts every route group.
- `src/routes/*` - endpoint registration.
- `src/controllers/*` - request handlers and response shapes.
- `src/models/*` - Mongoose schemas, fields, and enum values.
- `src/middleware/auth.js` - JWT bearer authentication.
- `src/middleware/role.js` - role-based authorization.
- `src/middleware/upload.js` - Multer upload handling.
- `src/middleware/errorHandler.js` - standard error response format.

Base API URL in development: `http://localhost:5000/api`

Authentication header: `Authorization: Bearer <token>`

Roles:

- `Admin`
- `Asset Manager`
- `Department Head`
- `Employee`

Route groups mounted in `src/app.js`:

- `/api/auth`
- `/api/departments`
- `/api/categories`
- `/api/employees`
- `/api/assets`
- `/api/allocations`
- `/api/bookings`
- `/api/maintenances`
- `/api/audits`
- `/api/dashboard`
- `/api/reports`
- `/api/notifications`
- `/api/activity-logs`

## Frontend Guidance

Build the frontend around resource services that mirror route groups:

- `authApi`
- `departmentApi`
- `categoryApi`
- `employeeApi`
- `assetApi`
- `allocationApi`
- `bookingApi`
- `maintenanceApi`
- `auditApi`
- `dashboardApi`
- `reportApi`
- `notificationApi`
- `activityLogApi`

Use `API_SPEC.md` for role rules, request bodies, multipart field names, response keys, enum lists, dashboard payloads, and known backend caveats.

Use `openapi.yaml` for API client generation, endpoint inspection, mock servers, or Swagger/Postman import.
