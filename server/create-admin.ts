import { storage } from "./storage";
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function createAdminUser() {
  console.log("Creating admin user...");
  
  try {
    // Check if admin user already exists
    const existingAdmin = await storage.getUserByUsername("admin");
    
    if (existingAdmin) {
      console.log("Admin user already exists!");
      return;
    }
    
    // Create admin user
    const adminUser = await storage.createUser({
      username: "admin@example.com", // Username must be a valid email format
      password: await hashPassword("admin123"), // Use a strong password in production
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
    
  } catch (error) {
    console.error("Error creating admin user:", error);
  }
}

// Run the function
createAdminUser()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Unhandled error:", error);
    process.exit(1);
  });