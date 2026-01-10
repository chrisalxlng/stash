# 🗂️ Stash

A lightweight Node.js + Express service for uploading, retrieving, and deleting user-specific files.
Each file is stored under a user- and client-specific directory, along with metadata (e.g. original name, upload date, MIME type).
Authentication is handled via Keycloak (JWT token required for all requests).

## 🚀 Features

- Upload files with metadata using Multer
- Retrieve or preview files
- Delete files and metadata safely
- JWT authentication via Keycloak
- Simple directory structure:

```bash
files/{userId}/{clientId}/{fileId}
files/{userId}/{clientId}/{fileId}.json
```

## ⚙️ Development Setup

```bash
git clone https://github.com/chrisalxlng/stash.git

cd stash

npm install
```

Adjust environment variables in [.env.development](./.env.development).

Run the server:

```bash
npm run dev
```

Server runs by default on <http://localhost:3000>

## 🐳 Deployment with Docker

Specify environment variables, e.g.:

```bash
KEYCLOAK_REALM=apps
KEYCLOAK_ISSUER_URL=https://auth.example.com
KEYCLOAK_JWKS_URL=https://auth.example.com
KEYCLOAK_AUDIENCE=example-audience
ALLOWED_ORIGINS=https://demo1.example.com,https://demo2.example.com
FILE_ACCESS_SECRET=secret
```

Use the provided [Dockerfile](./Dockerfile).

## 🧪 Testing

The project uses Vitest and Supertest for end-to-end (e2e) tests.

```bash
npm test
```

## 📄 Docs

Swagger docs are availabe at `/docs/<VERSION>`, e.g. `/docs/v1`.
