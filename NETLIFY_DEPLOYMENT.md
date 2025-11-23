# Netlify Deployment Guide

## Overview

This project is configured for production deployment on Netlify with:

- **Frontend**: React SPA built to `dist/spa` with React Router 6
- **API**: Netlify Functions in `netlify/functions/` using Express
- **Runtime**: Node.js 18+ (Netlify default)

## Project Structure for Netlify

```
project/
├── netlify/
│   └── functions/
│       └── api.ts              # Main Netlify function handler
├── client/                      # React SPA source
│   ├── pages/                  # Route components
│   ├── components/             # React components
│   └── App.tsx                 # SPA routing
├── dist/
│   └── spa/                    # Built SPA (publish directory in netlify.toml)
├── netlify.toml                # Netlify configuration
├── package.json                # Dependencies
├── vite.config.ts              # Vite SPA build config
└── tsconfig.json               # TypeScript config
```

## Configuration Files

### netlify.toml

Netlify's configuration file with:

```toml
[build]
  command = "pnpm run build"
  functions = "netlify/functions"
  publish = "dist/spa"

[functions]
  node_bundler = "esbuild"

[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/api"
  status = 200

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

**Key Settings:**

- **command**: Build command (installs dependencies and builds SPA)
- **functions**: Directory containing Netlify functions
- **publish**: Output directory for the built SPA
- **redirects**: Routes API calls to serverless function and SPA routes to index.html

## Deployment Steps

### 1. Local Testing

```bash
pnpm install
pnpm build
pnpm dev
```

Test endpoints:

- SPA: `http://localhost:8080/`
- API: `http://localhost:8080/api/ping`

### 2. Connect to Netlify

**Option A: Via Netlify UI**

1. Push code to GitHub, GitLab, or Bitbucket
2. Go to [Netlify Dashboard](https://app.netlify.com)
3. Click "Add new site" → "Import an existing project"
4. Select your Git provider and repository
5. Netlify auto-detects `netlify.toml` configuration

**Option B: Via Builder.io MCP**

1. Click [Connect to Netlify](#open-mcp-popover) in Builder.io
2. Authorize Netlify access
3. Select project to deploy

### 3. Environment Variables

Set in Netlify Site Settings → Environment Variables:

```
JWT_SECRET=your-secret-key-here
CORS_ORIGIN=https://your-domain.com (optional)
PING_MESSAGE=custom-ping-message (optional)
```

### 4. Deploy

- **Automatic**: Push to main branch triggers deployment
- **Manual**: Deploy button in Netlify Dashboard
- **Rollback**: Use Netlify UI to revert to previous deploys

## API Routes

All routes are handled by `/netlify/functions/api.ts` Netlify function:

### Public Routes

- `GET /api/ping` - Health check
- `GET /api/demo` - Demo endpoint
- `GET /api/health` - Health status with timestamp
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
- `GET /admin-login` - Admin login page
- All non-API routes served to SPA (index.html)
- Client-side routing handles path navigation

## Build Output

### dist/spa/

Contains the built React SPA:

- `index.html` - SPA entry point (served for all non-API routes)
- `assets/` - JavaScript bundles, CSS, images
- Published to Netlify CDN

### netlify/functions/

- `api.ts` - Compiled serverless function handler
- Deployed as Netlify Functions

## Key Differences from Vercel

| Feature        | Vercel            | Netlify                 |
| -------------- | ----------------- | ----------------------- |
| Config File    | `vercel.json`     | `netlify.toml`          |
| Functions Path | `api/**/*.ts`     | `netlify/functions/`    |
| Bundler        | Webpack           | esbuild                 |
| Environment    | `vercel.json` env | Site Settings or `.env` |
| Cold Starts    | ~200-500ms        | ~100-300ms              |
| Routing        | `rewrites`        | `redirects`             |

## Troubleshooting

### Issue: API Routes Not Working

**Solution:**

- Verify `netlify.toml` redirect: `/api/*` → `/.netlify/functions/api`
- Check `netlify/functions/api.ts` exports proper handler
- Test: `curl https://your-site.netlify.app/api/ping`

### Issue: SPA Not Loading

**Solution:**

- Verify `publish` directory is `dist/spa`
- Check vite.config.ts has `outDir: "dist/spa"`
- Verify SPA fallback redirect: `/*` → `/index.html`

### Issue: CORS Errors

**Solution:**

- Set `CORS_ORIGIN` environment variable in Netlify
- Or use `*` for development (less secure)

### Issue: Build Fails

**Solution:**

- Check build logs in Netlify UI
- Verify `pnpm run build` works locally
- Ensure all environment variables are set

### Issue: Function Timeout

**Solution:**

- Default timeout is 10 seconds (Pro plan: 26 seconds)
- Optimize function code for serverless
- Use Netlify Pro for longer timeouts

## Production Considerations

1. **File Storage**: Currently uses memory storage (in-memory for multer)
   - Not suitable for persistent storage
   - Use: Cloudinary, Firebase Storage, S3, or Netlify Blobs

2. **Database**: Currently uses in-memory storage (resets on deploy)
   - Use: Supabase, Neon, MongoDB Atlas, or Firebase

3. **Secrets**: Store JWT_SECRET in Netlify Site Settings
   - Never commit secrets to repository
   - Use environment variables for all sensitive data

4. **Performance**:
   - Enable Netlify Caching for static assets
   - Use CDN for images and media
   - Implement database query caching

## Performance Optimization

### Netlify Cache

```toml
[[headers]]
  for = "/assets/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

[[headers]]
  for = "/"
  [headers.values]
    Cache-Control = "public, max-age=0, must-revalidate"
```

### Image Optimization

- Use next-gen formats (WebP, AVIF)
- Responsive images with srcset
- Lazy loading for below-fold images

## Deployment Verification

After deploying to Netlify:

1. **Test API Endpoints**:

   ```bash
   # Test public endpoint
   curl https://your-site.netlify.app/api/ping
   # Expected: {"message":"pong"}

   # Test protected endpoint (requires token)
   curl -H "Authorization: Bearer your-token" \
     https://your-site.netlify.app/api/admin/dashboard
   ```

2. **Test SPA Routes**:
   - Visit https://your-site.netlify.app/
   - Navigate to /admin-login
   - Check client-side routing works

3. **Monitor Logs**:
   - Netlify UI → Functions → Logs
   - Check for errors in function execution

4. **Performance**:
   - Netlify UI → Analytics
   - Monitor function execution time
   - Check request success rate

## Integration with Builder.io

You can manage deployments directly from Builder.io:

1. [Connect to Netlify](#open-mcp-popover)
2. Authorize and select project
3. Deployments are managed through Builder.io MCP
4. View deployment status and logs

## Migrating from Vercel

Files to remove (Netlify uses different config):

- ❌ `vercel.json` (use `netlify.toml` instead)
- ❌ `.vercelignore` (use `.netlifyignore` instead)
- ❌ `api/index.ts` (moved to `netlify/functions/api.ts`)

Files added for Netlify:

- ✅ `netlify.toml` - Netlify configuration
- ✅ `.netlifyignore` - Files to exclude from build
- ✅ `netlify/functions/api.ts` - Netlify function handler

## Support Resources

- Netlify Docs: https://docs.netlify.com/
- Netlify Functions: https://docs.netlify.com/functions/overview/
- React Router: https://reactrouter.com/
- Vite: https://vitejs.dev/

## Next Steps

1. **Test Locally**:

   ```bash
   pnpm install && pnpm build && pnpm dev
   ```

2. **Push to Git**:

   ```bash
   git add .
   git commit -m "Migrate from Vercel to Netlify"
   git push origin main
   ```

3. **Deploy to Netlify**:
   - Use Netlify Dashboard or Builder.io MCP
   - Set environment variables
   - Monitor build and deployment

4. **Verify Production**:
   - Test API endpoints
   - Check SPA routing
   - Monitor analytics
