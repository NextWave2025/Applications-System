import { Request, Response, NextFunction } from "express";

// Middleware to ensure the user is authenticated and has admin role
export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  // Check if user is authenticated
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: "Authentication required" });
  }
  
  // Check if user has admin role
  if (req.user?.role !== "admin") {
    return res.status(403).json({ error: "Admin access required" });
  }
  
  // User is authenticated and has admin role
  next();
}