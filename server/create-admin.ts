import { storage } from "./storage";
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function createAdmin() {
  try {
    console.log("Creating admin user...");
    
    // Check if admin already exists
    const existingAdmin = await storage.getUserByUsername("admin@guide.com");
    if (existingAdmin) {
      console.log("Admin user already exists:", existingAdmin.username);
      return;
    }
    
    // Create new admin user
    const adminUser = await storage.createUser({
      username: "admin@guide.com",
      password: await hashPassword("admin123"),
      firstName: "Admin",
      lastName: "User",
      role: "admin",
      active: true,
      agencyName: "Guide Platform",
      country: "UAE",
      phoneNumber: "+971-50-123-4567"
    });
    
    console.log("Admin user created successfully:", {
      id: adminUser.id,
      username: adminUser.username,
      role: adminUser.role,
      active: adminUser.active
    });
    
  } catch (error) {
    console.error("Error creating admin user:", error);
  }
}

// Run the function
createAdmin().then(() => {
  console.log("Admin creation process completed");
  process.exit(0);
}).catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});