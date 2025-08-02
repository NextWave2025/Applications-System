# Vercel Database Setup Guide

## 🚨 **Critical: Database Connection Required**

Your NextWave application requires a Neon Database connection to function properly. The 500 error you're seeing is because Vercel doesn't have access to your database.

## 📋 **Step-by-Step Setup**

### 1. **Get Your Neon Database URL**

1. **Go to Neon Dashboard**: https://console.neon.tech
2. **Select your project**
3. **Go to Connection Details**
4. **Copy the connection string** (looks like: `postgresql://username:password@host/database`)

### 2. **Set Environment Variables in Vercel**

1. **Go to Vercel Dashboard**: https://vercel.com/dashboard
2. **Select your project** (system-eight-ivory)
3. **Go to Settings → Environment Variables**
4. **Add these variables:**

```
Name: DATABASE_URL
Value: postgresql://your-username:your-password@your-host/your-database
Environment: Production, Preview, Development

Name: SESSION_SECRET
Value: your-super-secret-session-key-here
Environment: Production, Preview, Development

Name: NODE_ENV
Value: production
Environment: Production, Preview, Development
```

### 3. **Redeploy Your Application**

1. **Go to Deployments tab** in Vercel
2. **Click "Redeploy"** on your latest deployment
3. **Wait for the build to complete**

### 4. **Test the Connection**

1. **Visit your health endpoint**: `https://system-eight-ivory.vercel.app/api/health`
2. **Check the database status** in the response
3. **Look for**: `"database": { "success": true, "message": "Database connected successfully" }`

## 🔧 **Troubleshooting**

### If Database Connection Fails:

1. **Check your DATABASE_URL**:
   - Make sure it's the correct connection string from Neon
   - Ensure it includes the database name at the end
   - Verify username and password are correct

2. **Check Neon Database**:
   - Ensure your Neon project is active
   - Check if you have any connection limits
   - Verify the database exists

3. **Check Vercel Environment Variables**:
   - Make sure variables are set for the correct environment
   - Ensure there are no extra spaces or characters
   - Try redeploying after setting variables

### Common Issues:

1. **"Database not available"**: DATABASE_URL not set
2. **"Connection refused"**: Wrong host or database down
3. **"Authentication failed"**: Wrong username/password
4. **"Database does not exist"**: Wrong database name

## 🧪 **Testing Commands**

Once deployed, test these endpoints:

```bash
# Health check with database status
curl https://system-eight-ivory.vercel.app/api/health

# Session status
curl https://system-eight-ivory.vercel.app/api/session-status

# Test universities endpoint
curl https://system-eight-ivory.vercel.app/api/universities
```

## 📊 **Expected Response**

When working correctly, `/api/health` should return:

```json
{
  "status": "OK",
  "environment": "production",
  "database": {
    "success": true,
    "message": "Database connected successfully"
  },
  "modulesLoaded": {
    "storage": true,
    "auth": true,
    "adminRouter": true,
    "subAdminRouter": true
  }
}
```

## 🆘 **Need Help?**

If you're still having issues:

1. **Check Vercel Function Logs** in the dashboard
2. **Verify your Neon database** is accessible
3. **Test the connection string** locally first
4. **Contact support** if the database connection works locally but not on Vercel

## 🔒 **Security Notes**

- **Never commit** your DATABASE_URL to version control
- **Use strong SESSION_SECRET** for production
- **Consider using** Vercel's environment variable encryption for sensitive data 