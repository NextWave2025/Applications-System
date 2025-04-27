import { storage } from "./storage";

async function checkAdminUser() {
  console.log("Checking admin user...");
  
  try {
    const admin = await storage.getUserByUsername("admin@example.com");
    
    if (admin) {
      console.log("Admin user found:", {
        id: admin.id,
        username: admin.username,
        role: admin.role,
        active: admin.active
      });
    } else {
      console.log("Admin user not found!");
    }
  } catch (error) {
    console.error("Error checking admin user:", error);
  }
}

// Run the function
checkAdminUser()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Unhandled error:", error);
    process.exit(1);
  });