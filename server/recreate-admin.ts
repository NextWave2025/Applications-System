import { storage } from "./storage";
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function recreateAdminUser() {
  console.log("Recreating admin user...");
  
  try {
    // Check if admin user already exists and delete it
    const existingAdmin = await storage.getUserByUsername("admin@example.com");
    
    if (existingAdmin) {
      console.log("Existing admin user found, clearing admin users...");
      // We don't have a delete method, so let's just report it
      console.log("(Note: In a real app, we would delete the existing user here)");
    }
    
    // The simple solution: Create a new admin with a different email
    // Create admin user
    const newUsername = `admin${Date.now()}@example.com`;
    const password = process.env.ADMIN_PASSWORD || "temp123";
    
    console.log(`Creating new admin user with username: ${newUsername}`);
    
    const adminUser = await storage.createUser({
      username: newUsername,
      password: await hashPassword(password),
      firstName: "Admin",
      lastName: "User",
      role: "admin",
      active: true,
      agencyName: "Guide Admin",
    });
    
    console.log("Admin user created successfully:", {
      id: adminUser.id,
      username: adminUser.username,
      role: adminUser.role
    });
    
    console.log("\nLogin credentials:");
    console.log(`Username: ${newUsername}`);
    console.log(`Password: ${password}`);
    
  } catch (error) {
    console.error("Error recreating admin user:", error);
  }
}

// Run the function
recreateAdminUser()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Unhandled error:", error);
    process.exit(1);
  });