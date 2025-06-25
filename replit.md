# NextWave Study Abroad Platform

## Project Overview
UAE-focused university program listing application with comprehensive filtering, application management, and automated email notifications via SendGrid.

## Current Status
- 31 universities mapped to UAE cities (Dubai: 23, Ras Al Khaimah: 4, Ajman: 2, Abu Dhabi: 1, Sharjah: 1)
- 1,001 programs across 9 study fields with proper degree level categorization
- Random program display implemented to show diverse results from all universities
- SendGrid integration configured with enhanced debugging capabilities

## User Preferences
- Non-technical communication preferred
- Focus on UAE market specifically
- Random program display over ranking-based results
- Comprehensive email notification system required

## Project Architecture
- Frontend: React with TypeScript, Tailwind CSS, shadcn/ui components
- Backend: Express.js with TypeScript
- Database: PostgreSQL with Drizzle ORM
- Email: SendGrid for automated notifications
- Routing: wouter for client-side navigation

## Recent Changes
- **Dec 25, 2025**: Enhanced SendGrid email service with comprehensive error logging, disabled sandbox mode, and proper sender domain configuration
- **Dec 25, 2025**: Implemented random program ordering using ORDER BY RANDOM() to ensure equal visibility across all universities
- **Dec 24, 2025**: Updated filter system with UAE city categorization and semantic color coding

## SendGrid Configuration
- API key configured and verified
- Sandbox mode explicitly disabled
- Verified sender domain: noreply@nextwave.ae
- Enhanced error logging and debugging implemented
- Tracking settings enabled for email analytics

## Technical Notes
- Random program display prevents ranking bias
- Comprehensive filter system with proper categorization
- Email notifications for application status changes
- Responsive design with mobile-first approach