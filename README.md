# 🗂️ clhub-storage

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

## ⚙️ Setup

```bash
git clone https://github.com/chrisalxlng/clhub-storage.git

cd clhub-storage

npm install
```

Specify environment variables, e.g.:

```bash
KEYCLOAK_DOMAIN=https://auth.example.com
KEYCLOAK_APPS_REALM=apps
KEYCLOAK_AUDIENCE=example-audience
ALLOWED_ORIGINS=https://demo1.example.com,https://demo2.example.com
```

Run the server:

```bash
npm run dev
```

Server runs by default on <http://localhost:3000>

## 🧪 Testing

The project uses Vitest and Supertest for end-to-end (e2e) tests.

```bash
npm test
```
