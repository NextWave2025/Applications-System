# NextWave Application - Universal Deployment Guide

## 🚨 Critical Fixes Applied

### 1. Authentication & Session Management
- ✅ **Trust Proxy**: Added `app.set("trust proxy", 1)` at the top of server configuration
- ✅ **Session Store**: Enhanced memory store configuration for production reliability
- ✅ **Session Configuration**: Updated with proper `resave: true`, `rolling: true`, and production cookie settings
- ✅ **Login Flow**: Simplified session handling with timeout protection
- ✅ **Race Conditions**: Fixed client-side authentication state management

### 2. API Configuration
- ✅ **Unified Query Client**: Removed conflicting `queryClient.ts` file
- ✅ **Environment-Aware URLs**: Enhanced API base URL detection for all platforms
- ✅ **CORS Configuration**: Universal CORS setup for any hosting platform

### 3. Frontend Routing
- ✅ **Netlify Redirects**: Added `public/_redirects` file for SPA routing
- ✅ **Vercel Configuration**: Created `vercel.json` for full-stack deployment

## 🌐 Deployment Platforms

### Vercel Deployment

1. **Install Vercel CLI**:
   ```bash
   npm i -g vercel
   ```

2. **Set Environment Variables** in Vercel dashboard:
   ```
   DATABASE_URL=your-postgres-connection-string
   SESSION_SECRET=your-super-secret-key
   NODE_ENV=production
   ALLOWED_ORIGINS=https://your-domain.vercel.app
   ```

3. **Deploy**:
   ```bash
   vercel --prod
   ```

### Netlify Deployment

1. **Build Command**:
   ```bash
   npm run build
   ```

2. **Publish Directory**:
   ```
   dist/public
   ```

3. **Environment Variables** in Netlify dashboard:
   ```
   DATABASE_URL=your-postgres-connection-string
   SESSION_SECRET=your-super-secret-key
   NODE_ENV=production
   ALLOWED_ORIGINS=https://your-domain.netlify.app
   ```

4. **Functions Directory** (if using Netlify Functions):
   ```
   server/
   ```

### Railway Deployment

1. **Connect Repository** to Railway
2. **Set Environment Variables**:
   ```
   DATABASE_URL=your-postgres-connection-string
   SESSION_SECRET=your-super-secret-key
   NODE_ENV=production
   PORT=5000
   ```

3. **Deploy** automatically on git push

### Render Deployment

1. **Build Command**:
   ```bash
   npm run build
   ```

2. **Start Command**:
   ```bash
   npm start
   ```

3. **Environment Variables**:
   ```
   DATABASE_URL=your-postgres-connection-string
   SESSION_SECRET=your-super-secret-key
   NODE_ENV=production
   ```

## 🔧 Environment Variables

### Required Variables
```bash
# Database
DATABASE_URL=postgresql://username:password@host:port/database

# Session Security
SESSION_SECRET=your-super-secret-session-key-here

# Environment
NODE_ENV=production
```

### Optional Variables
```bash
# API Configuration
API_BASE_URL=https://your-domain.com/api
VITE_API_URL=https://your-domain.com/api

# CORS Configuration
ALLOWED_ORIGINS=https://your-domain.com,https://www.your-domain.com

# Email Configuration
SENDGRID_API_KEY=your-sendgrid-api-key
SENDGRID_FROM_EMAIL=noreply@your-domain.com

# Port
PORT=5000
```

## 🧪 Testing Deployment

### 1. Health Check
```bash
curl https://your-domain.com/api/health
```

### 2. Authentication Test
```bash
# Test login
curl -X POST https://your-domain.com/api/login \
  -H "Content-Type: application/json" \
  -d '{"username":"test@example.com","password":"password"}' \
  -c cookies.txt

# Test session
curl https://your-domain.com/api/user \
  -b cookies.txt
```

### 3. Session Status
```bash
curl https://your-domain.com/api/session-status
```

## 🐛 Troubleshooting

### Common Issues

1. **"Invalid credentials" after first login**
   - Check session store configuration
   - Verify trust proxy setting
   - Ensure CORS credentials are enabled

2. **Redirect loops in protected routes**
   - Clear browser cache and cookies
   - Check authentication state management
   - Verify API base URL configuration

3. **"Not authenticated" on program explore**
   - Check session persistence
   - Verify cookie settings for production
   - Test with incognito mode

4. **SPA routing issues (Netlify)**
   - Ensure `public/_redirects` file exists
   - Check build output directory

### Debug Endpoints

- `/api/health` - Server health and environment info
- `/api/session-status` - Session debugging information
- `/api/user` - Current user authentication status

## 📝 Post-Deployment Checklist

- [ ] Health check endpoint responds correctly
- [ ] User registration works
- [ ] User login works consistently
- [ ] Session persists across page refreshes
- [ ] Protected routes work correctly
- [ ] Program explore page loads data
- [ ] Admin dashboard is accessible
- [ ] File uploads work (if applicable)
- [ ] Email notifications work (if configured)

## 🔒 Security Considerations

1. **Session Secret**: Use a strong, unique session secret
2. **HTTPS**: Ensure all production deployments use HTTPS
3. **CORS**: Configure allowed origins properly
4. **Database**: Use connection pooling and SSL for database connections
5. **Environment Variables**: Never commit sensitive data to version control

## 📞 Support

If you encounter issues after implementing these fixes:

1. Check the browser console for errors
2. Review server logs for authentication issues
3. Test with the debug endpoints
4. Verify environment variables are set correctly
5. Test with incognito/private browsing mode 