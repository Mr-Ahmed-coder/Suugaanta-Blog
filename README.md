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

Copy the example file before running locally:

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

Start the production server:

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

## Single-Service Render Deployment

Use one Render Web Service for both the frontend and backend.

- Root Directory: leave blank at repository root
- Build Command: `npm install && npm run build`
- Start Command: `npm run start`
- Health Check Path: `/api/health`
- Frontend is served by Express from `client/dist`
- API routes remain under `/api`
- Set `VITE_API_URL=/api` or omit it so the frontend uses same-origin API requests
- Do not set the Render root directory to `server` for this deployment mode

Required Render environment variables:

```env
NODE_ENV=production
PORT=5000
CLIENT_URL=https://suugaanta-blog.onrender.com
SERVER_URL=https://suugaanta-blog.onrender.com
VITE_API_URL=/api
MONGODB_URI=your-atlas-uri
JWT_SECRET=your-long-random-production-secret
JWT_EXPIRES_IN=7d
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_REGION=eu-north-1
AWS_BUCKET_NAME=suugaanta-media-bucket
```

## Database

- Use MongoDB Atlas.
- Add the Render outbound IP/network access rule if your Atlas project is not open to all trusted deployment IPs.
- Store the Atlas connection string only in Render environment variables.

## Storage

- Use AWS S3 for uploaded media.
- Use IAM credentials with the minimum permissions needed for uploads.
- Store AWS keys only in Render environment variables.
