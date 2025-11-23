# Vercel Deployment Guide

## Overview
This project is configured for production deployment on Vercel with:
- **Frontend**: React SPA built to `dist/spa` with React Router 6
- **API**: Serverless functions in `/api` directory using Express + serverless-http
- **Runtime**: Node.js 20.x

## Project Structure for Vercel

```
project/
├── api/
│   └── index.ts              # Main serverless function handler (catch-all API routes)
├── client/                   # React SPA source
│   ├── pages/               # Route components
│   ├── components/          # React components
│   └── App.tsx              # SPA routing
├── dist/
│   └── spa/                 # Built SPA (outputDirectory in vercel.json)
├── vercel.json              # Vercel configuration
├── package.json             # Dependencies
├── vite.config.ts           # Vite SPA build config
└── tsconfig.json            # TypeScript config
```

## Configuration Files

### vercel.json
- **buildCommand**: `pnpm run build` (builds SPA to dist/spa)
- **outputDirectory**: `dist/spa` (serves the built SPA)
- **functions**: Configures serverless functions for `/api/**/*.ts`
- **rewrites**: Routes `/api/*` requests to serverless handler and SPA routes to index.html

### Key Settings
```json
{
  "version": 2,
  "buildCommand": "pnpm run build",
  "outputDirectory": "dist/spa",
  "functions": {
    "api/**/*.ts": {
      "runtime": "nodejs20.x"
    }
  }
}
```

## Deployment Steps

### 1. Local Testing
```bash
pnpm install
pnpm build
pnpm dev
```

### 2. Connect to Vercel
- Push code to GitHub, GitLab, or Bitbucket
- Import project to Vercel dashboard
- Vercel automatically detects `vercel.json` configuration

### 3. Environment Variables
Set in Vercel Project Settings → Environment Variables:
- `JWT_SECRET`: Secret key for JWT token generation
- `CORS_ORIGIN`: CORS allowed origin (default: *)
- `PING_MESSAGE`: Custom ping message (optional)

### 4. Deploy
- Automatic: Push to main branch triggers deployment
- Manual: Deploy button in Vercel dashboard

## API Routes

All routes are handled by `/api/index.ts` serverless function:

### Public Routes
- `GET /api/ping` - Health check
- `GET /api/demo` - Demo endpoint
- `POST /api/admin/login` - Admin login

### Protected Routes (require Authorization header with JWT token)
- `GET /api/admin/dashboard` - Dashboard data
- `GET /api/admin/monthly-payments` - Monthly payment data
- `GET /api/admin/recent-payments` - Recent payment records
- `GET /api/admin/export-report` - Export CSV report
- `POST /api/payments/submit` - Submit payment with screenshot

## SPA Routes

React Router 6 SPA configured in `client/App.tsx`:
- `GET /` - Home page
- All non-API routes served to SPA (index.html)
- Client-side routing handles path navigation

## Build Output

### dist/spa/
Contains the built React SPA:
- `index.html` - SPA entry point (served for all non-API routes)
- `assets/` - JavaScript bundles, CSS, images

### Do NOT Include in Vercel
- Server build artifacts (handled by serverless)
- Node modules (installed during build)
- Development files

## Troubleshooting

### Error: "Function Runtimes must have a valid version"
**Fixed in vercel.json**:
- Runtime format is `nodejs20.x` (correct format)
- Functions path is `api/**/*.ts` (glob pattern for auto-detection)

### API Routes Not Working
- Verify `/api/index.ts` exports default handler
- Check rewrites in vercel.json point to `/api/index`
- Ensure environment variables are set

### SPA Not Serving
- Verify `outputDirectory` is `dist/spa` in vercel.json
- Check vite.config.ts has `outDir: "dist/spa"`
- Ensure index.html fallback rewrite is configured

### CORS Issues
- Set `CORS_ORIGIN` environment variable
- Check Express CORS middleware configuration

## Local Development

The development server uses Express middleware integrated with Vite:
```bash
pnpm dev
```

Both SPA and API routes available at `http://localhost:8080`

## Production Considerations

1. **File Storage**: Uses memory storage for multer (serverless compatible)
2. **Database**: Currently uses in-memory storage (use Supabase, Neon, or similar)
3. **Secrets**: Store JWT_SECRET in Vercel environment variables
4. **Uploads**: Consider cloud storage (Cloudinary, Firebase) instead of filesystem
5. **CORS**: Configure properly for production domain

## Performance Tips

1. Deploy only SPA build to Vercel
2. Use CDN for static assets
3. Implement database caching
4. Monitor serverless function duration
5. Use Vercel Analytics for insights
