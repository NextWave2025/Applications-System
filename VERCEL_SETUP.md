# Vercel Deployment Setup Guide

## 🚨 **Critical: Environment Variables Required**

Your NextWave application requires environment variables to be set in Vercel for proper functionality.

## 📋 **Required Environment Variables**

Set these in your Vercel Dashboard → Settings → Environment Variables:

### Database Configuration
```
DATABASE_URL=your-neon-database-connection-string
```

### Session Security
```
SESSION_SECRET=your-super-secret-session-key
```

### Environment
```
NODE_ENV=production
```

### Email Service (SendGrid)
```
SENDGRID_API_KEY=your-sendgrid-api-key
```

### Firebase Configuration (Client-side)
```
VITE_FIREBASE_API_KEY=your-firebase-api-key
VITE_FIREBASE_APP_ID=your-firebase-app-id
VITE_FIREBASE_PROJECT=your-firebase-project-id
```

## 🔧 **Setup Instructions**

1. **Go to Vercel Dashboard**: https://vercel.com/dashboard
2. **Select your project**: system-eight-ivory
3. **Go to Settings → Environment Variables**
4. **Add each variable** with these settings:
   - **Environment**: Production, Preview, Development
   - **Encrypt**: Yes (for sensitive data)

## ✅ **Verification**

After setting up environment variables:

1. **Redeploy your application** in Vercel
2. **Test the health endpoint**: `https://system-eight-ivory.vercel.app/api/health`
3. **Check for**: `"database": { "success": true }`

## 🔒 **Security Notes**

- ✅ Never commit environment variables to version control
- ✅ Use Vercel's environment variable encryption
- ✅ Keep your keys secure and private
- ✅ Rotate keys regularly

## 🆘 **Need Help?**

If you need the actual values for your environment variables, check your:
- Neon Database dashboard for DATABASE_URL
- SendGrid dashboard for API key
- Firebase console for Firebase keys 