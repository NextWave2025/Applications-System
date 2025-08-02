import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import bcrypt from "bcrypt";
import { storage } from "./storage";
import { User } from "@shared/schema";
import { sendWelcomeEmail } from "./email-service";

declare global {
  namespace Express {
    // Define the User interface for passport
    interface User {
      id: number;
      username: string;
      firstName?: string | null;
      lastName?: string | null;
      agencyName?: string | null;
      country?: string | null;
      phoneNumber?: string | null;
      website?: string | null;
      role?: string;
      active?: boolean;
      createdAt?: Date;
    }
  }
}

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  try {
    // Check if it's a bcrypt hash (starts with $2 or similar)
    if (stored.startsWith('$2') || stored.startsWith('$2a') || stored.startsWith('$2b') || stored.startsWith('$2y')) {
      return await bcrypt.compare(supplied, stored);
    }
    
    // Otherwise, use scrypt format
    const [hashed, salt] = stored.split(".");
    if (!hashed || !salt) {
      console.log('Invalid scrypt hash format:', stored);
      return false;
    }
    
    const hashedBuf = Buffer.from(hashed, "hex");
    const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
    return timingSafeEqual(hashedBuf, suppliedBuf);
  } catch (error) {
    console.log('Error comparing passwords:', error);
    return false;
  }
}

export function setupAuth(app: Express) {
  // 🚨 CRITICAL FIX: Enhanced session configuration for production
  const isProduction = process.env.NODE_ENV === 'production' || 
                      process.env.REPLIT_ENVIRONMENT === 'production' ||
                      (typeof process !== 'undefined' && process.env.REPL_ID);
  
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || "default-secret-replace-in-production",
    resave: true, // 🚨 CRITICAL: Enable resave for production reliability
    saveUninitialized: false,
    rolling: true as boolean, // 🚨 CRITICAL: Refresh session on each request
    name: 'connect.sid', // 🚨 CRITICAL: Consistent session name
    cookie: {
      secure: isProduction, // 🚨 CRITICAL: Use HTTPS in production
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      sameSite: isProduction ? 'none' as const : 'lax' as const, // 🚨 CRITICAL: Handle cross-origin in production
      domain: isProduction ? undefined : undefined, // Let browser handle domain
    },
    store: storage.sessionStore,
  };

  console.log('Session configuration:', {
    isProduction,
    cookieSecure: sessionSettings.cookie?.secure,
    cookieSameSite: sessionSettings.cookie?.sameSite,
    rolling: sessionSettings.rolling
  });

  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        
        // Check if user exists and password is correct
        if (!user || !(await comparePasswords(password, user.password))) {
          return done(null, false, { message: "Invalid credentials" });
        }
        
        // Check if user account is active
        if (!user.active) {
          return done(null, false, { message: "Your account is inactive. Please contact an administrator." });
        }
        
        // Convert database user to passport user format
        const passportUser = {
          id: user.id,
          username: user.username,
          firstName: user.firstName || undefined,
          lastName: user.lastName || undefined,
          agencyName: user.agencyName || undefined,
          country: user.country || undefined,
          phoneNumber: user.phoneNumber || undefined,
          website: user.website || undefined,
          role: user.role,
          active: user.active,
          createdAt: user.createdAt
        };
        return done(null, passportUser);
      } catch (err) {
        return done(err);
      }
    }),
  );

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      if (user) {
        // Convert database user to passport user format
        const passportUser = {
          id: user.id,
          username: user.username,
          firstName: user.firstName || undefined,
          lastName: user.lastName || undefined,
          agencyName: user.agencyName || undefined,
          country: user.country || undefined,
          phoneNumber: user.phoneNumber || undefined,
          website: user.website || undefined,
          role: user.role,
          active: user.active,
          createdAt: user.createdAt
        };
        done(null, passportUser);
      } else {
        done(null, null);
      }
    } catch (err) {
      done(err);
    }
  });

  app.post("/api/register", async (req, res, next) => {
    try {
      const existingUser = await storage.getUserByUsername(req.body.username);
      if (existingUser) {
        return res.status(400).json({ error: "Username already exists" });
      }

      const user = await storage.createUser({
        ...req.body,
        password: await hashPassword(req.body.password),
      });

      // Convert database user to passport user format
      const passportUser = {
        id: user.id,
        username: user.username,
        firstName: user.firstName || undefined,
        lastName: user.lastName || undefined,
        agencyName: user.agencyName || undefined,
        country: user.country || undefined,
        phoneNumber: user.phoneNumber || undefined,
        website: user.website || undefined,
        role: user.role,
        active: user.active,
        createdAt: user.createdAt
      };
      
      req.login(passportUser, async (err) => {
        if (err) return next(err);
        
        // Send welcome email after successful registration
        try {
          const userName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username;
          await sendWelcomeEmail(user.username, userName);
          console.log(`Welcome email sent to ${user.username}`);
        } catch (emailError) {
          console.error('Failed to send welcome email:', emailError);
          // Don't fail registration if email fails
        }

        // Send notification to admins about new user registration
        try {
          const { notificationService } = await import('./services/notification-service');
          await notificationService.sendUserCreatedNotification({
            userName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username,
            userEmail: user.username,
            userRole: user.role,
            dateCreated: new Date().toLocaleDateString()
          });
          console.log(`Admin notification sent for new user: ${user.username}`);
        } catch (notificationError) {
          console.error('Failed to send admin notification:', notificationError);
          // Don't fail registration if notification fails
        }
        
        res.status(201).json(passportUser);
      });
    } catch (err) {
      next(err);
    }
  });

  app.post("/api/login", (req, res, next) => {
    console.log('=== LOGIN DEBUG START ===');
    console.log('Environment:', process.env.NODE_ENV);
    console.log('REPL_ID:', process.env.REPL_ID);
    console.log('Session ID before auth:', req.sessionID);
    console.log('Existing session data:', req.session);
    console.log('Request headers cookie:', req.headers.cookie);
    console.log('Trust proxy setting:', req.app.get('trust proxy'));
    console.log("Request content-type:", req.headers['content-type']);
    console.log("Request body:", req.body);
    console.log("Request body type:", typeof req.body);
    console.log("Request body keys:", req.body ? Object.keys(req.body) : 'NO BODY');
    console.log("Login attempt for user:", req.body?.email || req.body?.username);
    console.log("Email field:", req.body?.email);
    console.log("Username field:", req.body?.username);
    console.log("Password field:", req.body?.password ? '[PRESENT]' : '[MISSING]');
    
    // Map email to username for passport compatibility
    if (req.body.email && !req.body.username) {
      req.body.username = req.body.email;
    }
    
    passport.authenticate("local", (err: Error | null, user: User | false, info: any) => {
      if (err) {
        console.error("❌ Authentication error:", err);
        return next(err);
      }
      if (!user) {
        console.log("❌ Authentication failed for user:", req.body.email || req.body.username, "Info:", info);
        return res.status(401).json({ error: "Invalid credentials" });
      }

      console.log("✅ Authentication successful for user:", user.username, "Role:", user.role);
      
      // 🚨 CRITICAL FIX: Simplified session handling for production reliability
      req.login(user, (loginErr: Error | null) => {
        if (loginErr) {
          console.error("❌ Login session error:", loginErr);
          return next(loginErr);
        }
        
        // 🚨 CRITICAL FIX: Force session save with timeout
        const saveTimeout = setTimeout(() => {
          console.error('❌ Session save timeout');
          return res.status(500).json({ error: 'Session save timeout' });
        }, 5000);
        
        req.session.save((saveErr) => {
          clearTimeout(saveTimeout);
          if (saveErr) {
            console.error('❌ Session save error:', saveErr);
            return res.status(500).json({ error: 'Session save failed' });
          }
          
          console.log("✅ Session created and saved successfully");
          console.log('Session ID:', req.sessionID);
          console.log('User in session:', !!(req.session as any).passport?.user);
          console.log('=== LOGIN DEBUG END ===');
          
          return res.status(200).json(user);
        });
      });
    })(req, res, next);
  });

  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });

  // 🚨 CRITICAL FIX: Enhanced session debugging for authentication
  app.get("/api/user", (req, res) => {
    console.log("=== USER SESSION DEBUG ===");
    console.log("Session ID:", req.sessionID);
    console.log("Session data:", req.session);
    console.log("Passport authenticated:", req.isAuthenticated());
    console.log("User in session:", req.user);
    console.log("Cookie header:", req.headers.cookie);
    console.log("Trust proxy:", req.app.get('trust proxy'));
    
    if (!req.isAuthenticated()) {
      console.log("❌ User not authenticated, returning 401");
      return res.status(401).json({ error: "Not authenticated" });
    }
    console.log("✅ Returning user data:", req.user);
    res.json(req.user);
  });

  // 🚨 CRITICAL FIX: Session diagnostic endpoint
  app.get("/api/session-status", (req, res) => {
    res.json({
      hasSession: !!req.session,
      sessionId: req.sessionID,
      isAuthenticated: req.isAuthenticated(),
      userId: req.user?.id,
      userEmail: req.user?.username,
      cookieHeader: req.headers.cookie,
      trustProxy: req.app.get('trust proxy'),
      sessionStore: !!req.sessionStore,
      environment: process.env.NODE_ENV,
      replId: process.env.REPL_ID
    });
  });
}