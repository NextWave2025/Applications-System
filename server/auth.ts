import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
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
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

export function setupAuth(app: Express) {
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || "default-secret-replace-in-production",
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    },
    store: storage.sessionStore,
  };

  app.set("trust proxy", 1);
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
    console.log("Login attempt for user:", req.body.username);
    passport.authenticate("local", (err: Error | null, user: User | false, info: any) => {
      if (err) {
        console.error("Authentication error:", err);
        return next(err);
      }
      if (!user) {
        console.log("Authentication failed for user:", req.body.username, "Info:", info);
        return res.status(401).json({ error: "Invalid credentials" });
      }

      console.log("Authentication successful for user:", user.username, "Role:", user.role);
      req.login(user, (err: Error | null) => {
        if (err) {
          console.error("Login session error:", err);
          return next(err);
        }
        console.log("Session created successfully for user:", user.username);
        return res.status(200).json(user);
      });
    })(req, res, next);
  });

  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });

  app.get("/api/user", (req, res) => {
    console.log("User session check - isAuthenticated:", req.isAuthenticated());
    console.log("User session check - user:", req.user);
    if (!req.isAuthenticated()) {
      console.log("User not authenticated, returning 401");
      return res.status(401).json({ error: "Not authenticated" });
    }
    console.log("Returning user data:", req.user);
    res.json(req.user);
  });
}