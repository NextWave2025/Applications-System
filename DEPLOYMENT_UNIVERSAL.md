# Universal Deployment Guide - Works Anywhere

## 🌐 Supports ANY Production Environment

This application is configured to work seamlessly across:

- **Custom Domains** (yourapp.com, admin.yourcompany.com)
- **Replit** (.replit.app, .repl.co, .replit.dev)
- **Vercel** (.vercel.app)
- **Netlify** (.netlify.app)
- **Heroku** (.herokuapp.com)
- **Railway** (.railway.app)
- **Render** (.render.com)
- **AWS** (.amazonaws.com)
- **Any HTTPS domain** where frontend and API are served together

## 🔧 Automatic Configuration

The application automatically detects its environment and configures API URLs accordingly:

### Development
- Detects localhost, 127.0.0.1, 192.168.x.x, 10.x.x.x
- Uses: `http://localhost:5000/api`

### Production
- Detects any non-local hostname
- Uses: `{current-domain}/api`
- Example: `https://yourapp.com/api`

## 🚀 Deployment Instructions

### 1. Basic Deployment (No Configuration Needed)
Simply deploy your application to any platform. The system will automatically:
- Detect the production environment
- Use the correct API endpoints
- Configure CORS for your domain

### 2. Custom Configuration (Optional)
Set environment variables for additional control:

```bash
# Override API URL (optional)
VITE_API_URL=https://api.yourdomain.com

# Whitelist additional domains (optional)
ALLOWED_ORIGINS=https://yourdomain.com,https://admin.yourdomain.com

# Production mode
NODE_ENV=production
```

### 3. Platform-Specific Instructions

#### Custom Domain
1. Deploy normally
2. Point your domain to the deployment
3. Application automatically adapts to your domain

#### Replit
1. Use the Deploy button
2. No additional configuration needed

#### Vercel/Netlify
1. Connect your Git repository
2. Set environment variables if needed
3. Deploy normally

#### Heroku/Railway
1. Create new app
2. Set environment variables
3. Deploy from Git

## 🔒 Security Features

### CORS Protection
- Automatically allows your deployment domain
- Blocks unauthorized cross-origin requests
- Supports environment variable whitelist for additional domains

### Environment Detection
- Secure production settings
- Development conveniences in local environment
- No hardcoded URLs that break in production

## 🐛 Troubleshooting

### If Authentication Fails
1. Check browser console for API URL logs
2. Verify `/api/health` endpoint returns JSON
3. Ensure CORS allows your domain

### Health Check
Visit: `https://yourdomain.com/api/health`
Should return:
```json
{
  "status": "OK",
  "environment": "production",
  "timestamp": "2025-07-31T14:00:00.000Z",
  "hostname": "yourdomain.com"
}
```

### Console Debugging
Production console will show:
```
🌐 PRODUCTION API URL: https://yourdomain.com/api
✅ CORS: Origin https://yourdomain.com - allowed
```

## 📞 Support

If you encounter issues:
1. Check browser console for API URL detection
2. Test `/api/health` endpoint
3. Verify environment variables are set correctly

The universal configuration ensures your application works everywhere without code changes.