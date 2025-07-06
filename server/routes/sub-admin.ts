import { Router } from "express";
import { z } from "zod";
import bcrypt from "bcrypt";
import { storage } from "../storage";
import { notificationService } from "../services/notification-service";

const router = Router();

// Validation schema for creating sub-admin
const createSubAdminSchema = z.object({
  username: z.string().email("Please enter a valid email"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  password: z.string().min(8, "Password must be at least 8 characters")
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, "Password must contain uppercase, lowercase, and number"),
});

// Helper function to generate secure password
function generateSecurePassword(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  let password = '';
  // Ensure at least one of each required character type
  password += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)]; // uppercase
  password += 'abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 26)]; // lowercase
  password += '0123456789'[Math.floor(Math.random() * 10)]; // number
  password += '!@#$%^&*'[Math.floor(Math.random() * 8)]; // special char
  
  // Fill the rest with random characters
  for (let i = 4; i < 12; i++) {
    password += chars[Math.floor(Math.random() * chars.length)];
  }
  
  // Shuffle the password
  return password.split('').sort(() => 0.5 - Math.random()).join('');
}

// Middleware to check if user is super admin
function requireSuperAdmin(req: any, res: any, next: any) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: "Access denied. Super admin privileges required." });
  }
  next();
}

// Create sub-admin
router.post("/create", requireSuperAdmin, async (req, res) => {
  try {
    const validatedData = createSubAdminSchema.parse(req.body);
    
    // Check if email already exists
    const existingUser = await storage.getUserByUsername(validatedData.username);
    if (existingUser) {
      return res.status(400).json({ error: "Email already exists in the system" });
    }

    // Generate secure password if not provided
    const tempPassword = validatedData.password || generateSecurePassword();
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    // Create sub-admin user
    const subAdmin = await storage.createUser({
      username: validatedData.username,
      password: hashedPassword,
      firstName: validatedData.firstName,
      lastName: validatedData.lastName,
      role: "sub-admin",
      active: true, // Sub-admins are active by default
    });

    // Send welcome email with credentials
    try {
      await notificationService.sendSubAdminWelcomeEmail({
        name: `${validatedData.firstName} ${validatedData.lastName}`,
        email: validatedData.username,
        password: tempPassword,
      });
      console.log(`Welcome email sent to sub-admin: ${validatedData.username}`);
    } catch (emailError) {
      console.error("Failed to send welcome email to sub-admin:", emailError);
    }

    // Return success response (don't include password in response)
    const { password, ...subAdminResponse } = subAdmin;
    res.status(201).json({
      message: "Sub-admin created successfully",
      subAdmin: subAdminResponse,
      tempPassword: tempPassword // Return temp password for super admin reference
    });

  } catch (error) {
    console.error("Error creating sub-admin:", error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: "Validation failed", 
        details: error.errors 
      });
    }
    res.status(500).json({ error: "Failed to create sub-admin" });
  }
});

// Get all sub-admins
router.get("/list", requireSuperAdmin, async (req, res) => {
  try {
    const users = await storage.getAllUsers();
    const subAdmins = users
      .filter(user => user.role === 'sub-admin')
      .map(({ password, ...user }) => user); // Remove password from response

    res.json(subAdmins);
  } catch (error) {
    console.error("Error fetching sub-admins:", error);
    res.status(500).json({ error: "Failed to fetch sub-admins" });
  }
});

// Deactivate sub-admin
router.patch("/:id/deactivate", requireSuperAdmin, async (req, res) => {
  try {
    const subAdminId = parseInt(req.params.id);
    const subAdmin = await storage.getUser(subAdminId);

    if (!subAdmin || subAdmin.role !== 'sub-admin') {
      return res.status(404).json({ error: "Sub-admin not found" });
    }

    await storage.updateUser(subAdminId, { active: false });
    
    res.json({ 
      message: "Sub-admin deactivated successfully",
      subAdminId: subAdminId 
    });
  } catch (error) {
    console.error("Error deactivating sub-admin:", error);
    res.status(500).json({ error: "Failed to deactivate sub-admin" });
  }
});

// Activate sub-admin
router.patch("/:id/activate", requireSuperAdmin, async (req, res) => {
  try {
    const subAdminId = parseInt(req.params.id);
    const subAdmin = await storage.getUser(subAdminId);

    if (!subAdmin || subAdmin.role !== 'sub-admin') {
      return res.status(404).json({ error: "Sub-admin not found" });
    }

    await storage.updateUser(subAdminId, { active: true });
    
    res.json({ 
      message: "Sub-admin activated successfully",
      subAdminId: subAdminId 
    });
  } catch (error) {
    console.error("Error activating sub-admin:", error);
    res.status(500).json({ error: "Failed to activate sub-admin" });
  }
});

// Delete sub-admin
router.delete("/:id", requireSuperAdmin, async (req, res) => {
  try {
    const subAdminId = parseInt(req.params.id);
    const subAdmin = await storage.getUser(subAdminId);

    if (!subAdmin || subAdmin.role !== 'sub-admin') {
      return res.status(404).json({ error: "Sub-admin not found" });
    }

    await storage.deleteUser(subAdminId);
    
    res.json({ 
      message: "Sub-admin deleted successfully",
      subAdminId: subAdminId 
    });
  } catch (error) {
    console.error("Error deleting sub-admin:", error);
    res.status(500).json({ error: "Failed to delete sub-admin" });
  }
});

// Reset sub-admin password
router.post("/:id/reset-password", requireSuperAdmin, async (req, res) => {
  try {
    const subAdminId = parseInt(req.params.id);
    const subAdmin = await storage.getUser(subAdminId);

    if (!subAdmin || subAdmin.role !== 'sub-admin') {
      return res.status(404).json({ error: "Sub-admin not found" });
    }

    // Generate new secure password
    const newPassword = generateSecurePassword();
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await storage.updateUser(subAdminId, { password: hashedPassword });

    // Send email with new password
    try {
      await notificationService.sendSubAdminWelcomeEmail({
        name: `${subAdmin.firstName} ${subAdmin.lastName}`,
        email: subAdmin.username,
        password: newPassword,
      });
      console.log(`Password reset email sent to sub-admin: ${subAdmin.username}`);
    } catch (emailError) {
      console.error("Failed to send password reset email:", emailError);
    }

    res.json({ 
      message: "Password reset successfully",
      newPassword: newPassword // Return new password for super admin reference
    });
  } catch (error) {
    console.error("Error resetting sub-admin password:", error);
    res.status(500).json({ error: "Failed to reset password" });
  }
});

export default router;