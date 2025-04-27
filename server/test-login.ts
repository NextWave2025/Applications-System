import { scrypt, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";

const scryptAsync = promisify(scrypt);

async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

async function testLogin(username: string, password: string) {
  console.log(`Testing login for user: ${username}`);
  
  try {
    // Get the user from the database
    const user = await storage.getUserByUsername(username);
    
    if (!user) {
      console.log("User not found!");
      return;
    }
    
    // Check the password
    const passwordMatches = await comparePasswords(password, user.password);
    
    if (passwordMatches) {
      console.log("Password is correct! Login would succeed.");
      console.log("User details:", {
        id: user.id,
        username: user.username,
        role: user.role,
        active: user.active
      });
    } else {
      console.log("Password is incorrect! Login would fail.");
    }
  } catch (error) {
    console.error("Error testing login:", error);
  }
}

// Test the admin login
testLogin("admin1745763847603@example.com", "admin123")
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Unhandled error:", error);
    process.exit(1);
  });