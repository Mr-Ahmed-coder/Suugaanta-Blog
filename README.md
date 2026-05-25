# Suugaanta Soomaliyeed

Production-style MERN cultural archive platform for Somali songs, poetry, history, and Abwaano profiles.

## Stack

- `client` - React, Vite, React Router, Axios, Tailwind CSS
- `server` - Node.js, Express, MongoDB/Mongoose, JWT, HTTP-only cookies, RBAC
- `database` - MongoDB Atlas
- `storage` - AWS S3 media uploads

## Project Structure

```text
Suugaanta-Blog/
├── client/
├── server/
├── package.json
├── package-lock.json
├── README.md
└── .gitignore
```

## Environment Setup

Copy the example file before running the backend:

```bash
cp server/.env.example server/.env
```

Required backend variables:

- `PORT`
- `NODE_ENV`
- `CLIENT_URL`
- `SERVER_URL`
- `MONGODB_URI`
- `JWT_SECRET`
- `JWT_EXPIRES_IN`
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_REGION`
- `AWS_BUCKET_NAME`

Never commit real `.env` files or credentials.

## Local Development

```bash
npm install
npm run dev
```

Frontend only:

```bash
npm run dev --workspace client
```

Backend only:

```bash
npm run dev --workspace server
```

## Production Checks

Build the frontend:

```bash
npm run build
```

Start the backend:

```bash
npm run start
```

Health check:

```bash
curl http://localhost:5000/api/health
```

## Admin Bootstrap

Create the first admin only in a trusted environment:

```bash
npm run seed:admin
```

Repair/promote the configured seed admin email if needed:

```bash
npm run repair:admin
```

Public registration always creates regular `user` accounts. Admin/editor roles must be managed through the protected admin system.

## Deployment Targets

Frontend: Vercel

- Root directory: `client`
- Build command: `npm run build`
- Output directory: `dist`
- Configure `VITE_API_URL` to point at the deployed backend API, for example `https://your-render-service.onrender.com/api`.

Backend: Render

- Root directory: repository root or `server`, depending on Render setup
- Build command: `npm install`
- Start command from repository root: `npm run start`
- Start command from `server`: `npm run start`
- Add all backend environment variables in Render dashboard.
- Set `NODE_ENV=production` so auth cookies use `Secure` and `SameSite=None` for Vercel-to-Render sessions.
- Set `CLIENT_URL` to the exact Vercel frontend URL. Multiple origins may be comma-separated for preview/staging. Trailing slashes are normalized, but the domain must still be correct.
- Set `SERVER_URL` to the Render backend URL so any fallback local upload URLs are public.

Database: MongoDB Atlas

- Add the Render outbound IP/network access rule.
- Use the Atlas connection string only in environment variables.

Storage: AWS S3

- Use IAM credentials with the minimum permissions needed for uploads.
- Store AWS keys only in deployment environment variables.
