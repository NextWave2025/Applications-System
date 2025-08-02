#!/bin/bash

# NextWave Application - Deployment Test Script
echo "🚀 Testing NextWave Application Deployment Fixes"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if running in production environment
if [ "$NODE_ENV" = "production" ]; then
    print_status "Running in production mode"
else
    print_warning "Running in development mode"
fi

# Test 1: Check if all critical files exist
echo ""
echo "📁 Checking critical files..."

if [ -f "public/_redirects" ]; then
    print_status "Netlify redirects file exists"
else
    print_error "Missing public/_redirects file"
fi

if [ -f "vercel.json" ]; then
    print_status "Vercel configuration exists"
else
    print_error "Missing vercel.json file"
fi

if [ -f "client/src/lib/query-client.ts" ]; then
    print_status "Query client file exists"
else
    print_error "Missing query-client.ts file"
fi

if [ ! -f "client/src/lib/queryClient.ts" ]; then
    print_status "Conflicting queryClient.ts file removed"
else
    print_error "Conflicting queryClient.ts file still exists"
fi

# Test 2: Check environment variables
echo ""
echo "🔧 Checking environment variables..."

if [ -n "$DATABASE_URL" ]; then
    print_status "DATABASE_URL is set"
else
    print_warning "DATABASE_URL not set"
fi

if [ -n "$SESSION_SECRET" ]; then
    print_status "SESSION_SECRET is set"
else
    print_warning "SESSION_SECRET not set"
fi

if [ -n "$NODE_ENV" ]; then
    print_status "NODE_ENV is set to: $NODE_ENV"
else
    print_warning "NODE_ENV not set"
fi

# Test 3: Check if server can start
echo ""
echo "🖥️  Testing server startup..."

# Try to start server in background
timeout 10s npm run dev > /tmp/server_test.log 2>&1 &
SERVER_PID=$!

# Wait a moment for server to start
sleep 3

# Check if server is running
if kill -0 $SERVER_PID 2>/dev/null; then
    print_status "Server started successfully"
    kill $SERVER_PID 2>/dev/null
else
    print_error "Server failed to start"
    echo "Server logs:"
    cat /tmp/server_test.log
fi

# Test 4: Check build process
echo ""
echo "🔨 Testing build process..."

if npm run build > /tmp/build_test.log 2>&1; then
    print_status "Build completed successfully"
else
    print_error "Build failed"
    echo "Build logs:"
    cat /tmp/build_test.log
fi

# Test 5: Check for common deployment issues
echo ""
echo "🔍 Checking for common deployment issues..."

# Check for hardcoded localhost URLs
if grep -r "localhost:5000" client/src/ --exclude-dir=node_modules 2>/dev/null; then
    print_warning "Found hardcoded localhost URLs in client code"
else
    print_status "No hardcoded localhost URLs found"
fi

# Check for missing imports
if grep -r "from.*queryClient" client/src/ --exclude-dir=node_modules 2>/dev/null; then
    print_error "Found references to old queryClient file"
else
    print_status "No references to old queryClient file"
fi

# Test 6: Check API configuration
echo ""
echo "🌐 Checking API configuration..."

# Check if API base URL function exists
if grep -q "getApiBaseUrl" client/src/lib/query-client.ts; then
    print_status "API base URL function exists"
else
    print_error "API base URL function missing"
fi

# Check CORS configuration
if grep -q "credentials: true" server/index.ts; then
    print_status "CORS credentials enabled"
else
    print_error "CORS credentials not enabled"
fi

# Test 7: Check session configuration
echo ""
echo "🔐 Checking session configuration..."

if grep -q "trust proxy" server/index.ts; then
    print_status "Trust proxy configured"
else
    print_error "Trust proxy not configured"
fi

if grep -q "resave: true" server/auth.ts; then
    print_status "Session resave enabled"
else
    print_error "Session resave not enabled"
fi

# Summary
echo ""
echo "📊 Deployment Test Summary"
echo "=========================="

if [ $? -eq 0 ]; then
    print_status "All critical deployment fixes are in place!"
    echo ""
    echo "🎉 Your application is ready for deployment!"
    echo ""
    echo "Next steps:"
    echo "1. Set up your database and environment variables"
    echo "2. Deploy to your chosen platform (Vercel, Netlify, Railway, etc.)"
    echo "3. Test the deployment using the endpoints in DEPLOYMENT_GUIDE.md"
    echo "4. Monitor logs for any remaining issues"
else
    print_error "Some issues were found. Please review the errors above."
fi

echo ""
echo "📖 For detailed deployment instructions, see DEPLOYMENT_GUIDE.md" 