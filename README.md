# Apartment Treasury Management System

A modern web application for managing apartment finances, payments, and resident dues tracking.

## Tech Stack

- **Frontend**: React 18 + TypeScript + Tailwind CSS + Vite
- **Backend**: Node.js + Express.js
- **Database**: MongoDB (future integration)
- **Hosting**: Vercel (serverless)
- **Authentication**: JWT-based

## Features

- 📤 Digital payment proof submissions
- 📊 Automated monthly reports
- 👥 Resident management & tracking
- 🔐 Secure admin dashboard
- 📱 Fully responsive & PWA-ready
- ⚡ Serverless deployment

## Development

### Prerequisites

- Node.js 18+
- pnpm (package manager)

### Installation

```bash
pnpm install
```

### Development Server

```bash
pnpm dev
```

Server runs on `http://localhost:8080`

### Build

```bash
pnpm build
```

### Testing

```bash
pnpm test
```

## Deployment to Vercel

### Prerequisites

1. A [Vercel account](https://vercel.com)
2. Vercel CLI installed: `npm i -g vercel`

### Deployment Steps

1. **Push to Git Repository**

   ```bash
   git add .
   git commit -m "Ready for Vercel deployment"
   git push origin main
   ```

2. **Deploy with Vercel Dashboard**
   - Go to [vercel.com](https://vercel.com)
   - Click "Add New Project"
   - Select your repository
   - Click "Deploy"

3. **Or Deploy with CLI**
   ```bash
   vercel
   ```

### Environment Variables

Set these in your Vercel project settings:

- `JWT_SECRET` - Secret key for JWT token generation (required)

Go to: Project Settings → Environment Variables → Add Variable

### Configuration

The `vercel.json` file contains all deployment configuration:

- Build command: `pnpm run build`
- Output directory: `dist/spa`
- API routes: Serverless function at `/api`
- Rewrites for SPA routing

## Project Structure

```
client/                          # React frontend
├── pages/                        # Route pages
├── components/                   # Reusable components
│   └── ui/                      # UI component library
└── global.css                   # Global styles

server/                          # Express backend
├── routes/                      # API endpoints
├── middleware/                  # Auth & middleware
└── index.ts                     # Server entry

api/                             # Vercel serverless functions
└── index.ts                     # API handler

shared/                          # Shared types & utilities
└── api.ts                       # API interfaces
```

## API Endpoints

### Public Endpoints

- `POST /api/payments/submit` - Submit payment proof
- `POST /api/admin/login` - Admin login

### Protected Endpoints (require JWT token)

- `GET /api/admin/dashboard?month=YYYY-MM` - Dashboard data

## Admin Credentials (Demo)

- **Email**: `admin@apartment.local`
- **Password**: `admin123`

> ⚠️ Change these in production!

## Database Schema

Ready to integrate MongoDB with these collections:

- `flats` - Apartment records
- `payments` - Payment submissions
- `pending_dues` - Outstanding dues tracking
- `admin` - Admin credentials

## Future Enhancements

- [ ] MongoDB integration
- [ ] Cloud file uploads (Cloudinary/Firebase)
- [ ] Monthly PDF/Excel export
- [ ] Email/SMS notifications
- [ ] PWA offline support
- [ ] Real-time payment sync

## Support

For issues or questions, contact the development team.

## License

Private - Apartment Treasury Management System
