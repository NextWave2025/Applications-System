
import { storage } from "./storage";
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function createSuperAdmin() {
  console.log("Creating super admin user...");
  
  try {
    // Check if admin user already exists
    const existingAdmin = await storage.getUserByUsername("nextwaveadmission@gmail.com");
    
    if (existingAdmin) {
      console.log("Super admin user already exists!");
      console.log("Login credentials:");
      console.log("Username: nextwaveadmission@gmail.com");
      console.log("Password: NEXT2025");
      return;
    }
    
    // Create super admin user with full admin privileges
    const adminUser = await storage.createUser({
      username: "nextwaveadmission@gmail.com",
      password: await hashPassword("NEXT2025"),
      firstName: "NextWave",
      lastName: "Super Admin",
      role: "admin",
      active: true,
      agencyName: "NextWave Administration",
      country: "UAE",
      phoneNumber: "+971527142527",
      website: "https://nextwave.com"
    });
    
    console.log("Super admin user created successfully:", {
      id: adminUser.id,
      username: adminUser.username,
      role: adminUser.role
    });
    
    console.log("\nLogin credentials:");
    console.log("Username: nextwaveadmission@gmail.com");
    console.log("Password: NEXT2025");
    
  } catch (error) {
    console.error("Error creating super admin user:", error);
  }
}

// Run the function
createSuperAdmin()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Unhandled error:", error);
    process.exit(1);
  });
