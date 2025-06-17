import { Request, Response, NextFunction } from "express";

// Middleware to ensure the user is authenticated and has admin role
export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  console.log("Admin middleware check:");
  console.log("- isAuthenticated():", req.isAuthenticated ? req.isAuthenticated() : "method not available");
  console.log("- req.user:", req.user);
  
  // Check if user is authenticated
  if (!req.isAuthenticated || !req.isAuthenticated()) {
    console.log("Authentication failed");
    return res.status(401).json({ error: "Authentication required" });
  }
  
  // Check if user has admin or super_admin role
  if (req.user?.role !== "admin" && req.user?.role !== "super_admin") {
    console.log("Admin role check failed, user role:", req.user?.role);
    return res.status(403).json({ error: "Admin access required" });
  }
  
  console.log("Admin access granted");
  // User is authenticated and has admin role
  next();
}