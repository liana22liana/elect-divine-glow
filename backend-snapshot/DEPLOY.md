# ELECT Platform — Deployment Guide

## Architecture

```
electplatform.dariaavilova.com
        │
    Nginx (SSL via Let's Encrypt)
        │
    Express.js :3000 (pm2: elect-api)
        │
    ├── /api/*  → REST API
    └── /*      → SPA (React from elect-frontend/dist)
        │
    PostgreSQL 18 @ 91.210.169.167:5432
```

## Server: 83.147.247.183

- **OS:** Ubuntu 24.04
- **SSH:** `root@83.147.247.183` (password: see .env.production)
- **Domain:** `electplatform.dariaavilova.com`

## Directory Structure on Server

```
/root/elect-api/          — Backend (Express.js + API)
  ├── src/index.js        — Entry point
  ├── src/routes/         — API routes
  ├── src/db/             — Database pool + init
  ├── src/middleware/      — Auth middleware (JWT)
  ├── .env                — Config (DB creds, JWT secret)
  └── package.json

/root/elect-frontend/     — Frontend (built React SPA)
  └── dist/               — Static files served by Express
```

## Database (PostgreSQL 18)

- **Host:** 91.210.169.167
- **Port:** 5432
- **DB:** default_db
- **User:** gen_user
- **Password:** AvilovaProject22

Schema is in `schema.sql` (column listing).

## How to Redeploy

### Frontend only (after code changes):

```bash
# On your machine:
cd club-platform
npm run build

# Copy to server:
sshpass -p 'PASSWORD' rsync -az --delete dist/ root@83.147.247.183:/root/elect-frontend/dist/
```

### Backend (after API changes):

```bash
# Copy updated files:
sshpass -p 'PASSWORD' scp -r backend-snapshot/src/* root@83.147.247.183:/root/elect-api/src/

# Restart:
sshpass -p 'PASSWORD' ssh root@83.147.247.183 "cd /root/elect-api && pm2 restart elect-api"
```

### Full redeploy from scratch:

```bash
ssh root@83.147.247.183

# Backend
cd /root/elect-api
npm install
cp .env.example .env  # fill in DB creds + JWT secret
npm run db:init       # creates tables
pm2 start src/index.js --name elect-api
pm2 save

# Frontend
mkdir -p /root/elect-frontend/dist
# rsync dist/ from build machine

# Nginx
# See nginx-full.conf for config
# SSL via certbot for electplatform.dariaavilova.com
systemctl restart nginx
```

## PM2 Management

```bash
pm2 list              # status
pm2 restart elect-api # restart
pm2 logs elect-api    # view logs
pm2 save              # save for auto-restart
```

## Environment Variables (.env)

```
DB_HOST=91.210.169.167
DB_PORT=5432
DB_NAME=default_db
DB_USER=gen_user
DB_PASSWORD=<password>
PORT=3000
JWT_SECRET=<secret>
ADMIN_EMAIL=admin@electclub.ru
```

## Git Repos

- **Frontend:** https://github.com/liana22liana/elect-divine-glow.git (branch: main)
- **Backend:** Snapshot in this directory (`backend-snapshot/`)

## Key URLs

- **Site:** https://electplatform.dariaavilova.com
- **API Health:** https://electplatform.dariaavilova.com/health
- **API Base:** https://electplatform.dariaavilova.com/api/
