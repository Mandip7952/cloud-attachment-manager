# Cloud Storage — Replit-Native

A personal cloud file storage system ported from AWS to Replit's native services.

## Architecture

```
Browser (React + Vite)
  |
  | Session cookie auth (express-session)
  |
  v
Express API Server (/api)
  ├── /auth/register, /login, /logout, /me   — session auth
  ├── /files                                 — list + request upload URL
  ├── /files/:fileId                         — get download URL / delete
  ├── /files/:fileId/confirm                 — mark upload confirmed
  └── /storage/uploads/request-url           — GCS presigned URL
  |
  ├── PostgreSQL (Drizzle ORM)
  |     ├── users (id, username, password_hash)
  |     └── files (fileId, userId, name, size, type, objectPath, status, description, tags)
  |
  └── Google Cloud Storage (Replit Object Storage)
        └── Private objects for uploaded files
```

## Key Design Choices (vs original AWS project)

| Original (AWS) | Replit version |
|---|---|
| Amazon S3 | Replit Object Storage (GCS-backed) |
| DynamoDB | PostgreSQL via Drizzle ORM |
| API Gateway | Express 5 on the api-server artifact |
| Cognito JWT auth | Session-based auth (express-session + bcrypt) |
| Lambda functions | Express route handlers |
| Terraform infra | No infra — runs on Replit |

## Upload Flow

1. Client calls `POST /api/files` → server generates GCS presigned PUT URL, saves `pending` record in DB
2. Client PUTs file bytes directly to GCS (with XHR for progress tracking)
3. Client calls `POST /api/files/:fileId/confirm` → server marks record as `confirmed`
4. Client invalidates file list cache

## Project Structure

```
artifacts/
  api-server/          — Express API server
    src/
      app.ts           — Express app with sessions + CORS
      routes/
        auth.ts        — register, login, logout, me
        files.ts       — file CRUD + upload URL generation
        storage.ts     — GCS presigned URL + object serving
      middlewares/
        auth.ts        — requireAuth middleware
      lib/
        objectStorage.ts  — GCS client wrapper
        objectAcl.ts      — ACL framework
  cloud-storage-ui/    — React + Vite frontend (at /)
    src/
      pages/
        login.tsx      — split-screen login
        register.tsx   — register form
        files.tsx      — main file manager page
      components/
        file-list.tsx  — file table with download/delete
        file-uploader.tsx — drag-and-drop upload zone
        layout.tsx     — app shell with nav
      hooks/
        use-auth.tsx   — auth state + ProtectedRoute
        use-upload.ts  — 3-step upload with progress

lib/
  api-spec/openapi.yaml   — OpenAPI contract (source of truth)
  api-zod/                — Generated Zod schemas (server validation)
  api-client-react/       — Generated React Query hooks (frontend)
  db/src/schema/
    files.ts             — users + files tables

## Environment Secrets Required

- SESSION_SECRET — for express-session
- DATABASE_URL — PostgreSQL (auto-set by Replit DB)
- DEFAULT_OBJECT_STORAGE_BUCKET_ID — GCS bucket (auto-set by Object Storage setup)
- PRIVATE_OBJECT_DIR — GCS private dir (auto-set)
- PUBLIC_OBJECT_SEARCH_PATHS — GCS public paths (auto-set)
