# Radio Togotane FM 88.3 — Full-Stack Radio Management Platform

A complete radio station website and administration system for Radio Togotane FM, broadcasting from Kehancha, Migori County, Kenya.

## Tech Stack

**Frontend:** React 19, TypeScript, Vite, Tailwind CSS, React Router, Lucide Icons
**Backend:** Node.js, Express.js, TypeScript, Prisma ORM
**Database:** PostgreSQL 16
**Auth:** JWT with bcrypt password hashing
**Security:** Helmet, CORS, rate limiting, Zod validation

## Project Structure

```
radio-togotane/
├── frontend/          # React + Vite frontend
├── backend/           # Express + TypeScript backend
├── docker-compose.yml # Docker setup
├── .env.example       # Environment variables template
└── README.md
```

## Quick Start

### Prerequisites

- Node.js 20+
- PostgreSQL 16+
- npm 10+

### 1. Clone and Install

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Database Setup

```bash
# Create database
psql -U postgres -c "CREATE DATABASE radio_togotane;"

# Copy environment file
cp .env.example backend/.env
# Edit backend/.env with your database credentials

# Push schema
cd backend
npx prisma db push

# Seed data
npm run seed
```

### 3. Run Development Servers

```bash
# Terminal 1 - Backend (port 4000)
cd backend
npm run dev

# Terminal 2 - Frontend (port 5173)
cd frontend
npm run dev
```

### 4. Access

- **Public Website:** http://localhost:5173
- **Admin Dashboard:** http://localhost:5173/admin/login
- **API:** http://localhost:4000/api/health
- **Prisma Studio:** `cd backend && npx prisma studio`

### Default Admin Credentials

- Email: admin@radiotogotane.co.ke
- Password: ChangeMe123!

**⚠️ Change these in production!**

## Environment Variables

See `.env.example` for all required environment variables.

## API Documentation

### Public Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/public/settings | Station settings |
| GET | /api/public/programs | Active programs |
| GET | /api/public/programs/:slug | Program detail |
| GET | /api/public/schedule | Weekly schedule |
| GET | /api/public/presenters | Active presenters |
| GET | /api/public/presenters/:slug | Presenter detail |
| GET | /api/public/news | Published articles |
| GET | /api/public/news/:slug | Article detail |
| GET | /api/public/news-categories | News categories |
| GET | /api/public/podcasts | Published episodes |
| GET | /api/public/podcasts/:slug | Episode detail |
| GET | /api/public/podcast-categories | Podcast categories |
| GET | /api/public/advertising-packages | Active ad packages |
| POST | /api/public/contact | Submit contact message |
| POST | /api/public/advertising-inquiry | Submit ad inquiry |

### Auth Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/login | Admin login |
| POST | /api/auth/logout | Admin logout |
| GET | /api/auth/me | Current user |
| POST | /api/auth/change-password | Change password |

### Admin Endpoints (require authentication)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/admin/dashboard | Dashboard stats |
| CRUD | /api/admin/programs | Program management |
| CRUD | /api/admin/schedules | Schedule management |
| CRUD | /api/admin/presenters | Presenter management |
| CRUD | /api/admin/news | Article management |
| CRUD | /api/admin/news-categories | News category management |
| CRUD | /api/admin/podcasts | Podcast management |
| CRUD | /api/admin/podcast-categories | Podcast category management |
| GET/PATCH/DELETE | /api/admin/contact-messages | Contact message management |
| GET/PATCH/DELETE | /api/admin/advertising-inquiries | Inquiry management |
| CRUD | /api/admin/advertising-packages | Ad package management |
| GET/PUT | /api/admin/settings | Station settings |
| CRUD | /api/admin/users | User management (Super Admin only) |
| GET | /api/admin/audit-logs | Audit logs (Super Admin only) |
| POST | /api/upload | File upload |

## Features

### Public Website
- Home page with hero, schedule, presenters, news
- Listen Live with HTML5 audio player
- Programs & weekly schedule
- Presenter profiles
- News articles with search/pagination
- Podcast episodes with audio player
- About, Contact, Advertise pages
- SEO-friendly URLs

### Admin Dashboard
- Dashboard with real statistics
- Program & schedule management
- Presenter management
- News article CMS (draft/publish)
- Podcast management
- Contact message management
- Advertising inquiry management
- Station settings (stream URL, social links, etc.)
- User management with roles
- Audit logging

### Security
- JWT authentication with httpOnly cookies
- Role-based access control (Super Admin, Editor, Contributor)
- Rate limiting
- Helmet security headers
- CORS protection
- Input validation (Zod)
- Password hashing (bcrypt)
- File upload validation

## Streaming Configuration

The platform supports configurable streaming:

1. **Direct stream:** Set `streamType` to "direct" and provide a direct audio URL in `streamUrl`
2. **Zeno.fm embed:** Set `streamType` to "zeno_embed" and provide the Zeno.fm embed URL
3. **External:** Set `streamType` to "external" for externally hosted streams

Configure via Admin Dashboard → Settings, or directly in the database.

**Note:** Do not invent stream URLs. Use only authorized Zeno.fm stream/embed URLs provided by the station.

## Deployment

### Docker

```bash
docker-compose up -d
```

### Manual

1. Set up PostgreSQL database
2. Configure environment variables
3. Run `npm run build` in both frontend and backend
4. Start backend: `cd backend && npm start`
5. Serve frontend dist/ with nginx or similar

## Testing

```bash
cd backend
npm test
```

## License

Private - Radio Togotane FM 88.3
