import { storage } from "./server/storage";

async function fixUserAccounts() {
  try {
    console.log("Checking existing users...");
    
    // Get the user that tried to login
    const testUser = await storage.getUserByUsername("Yaabdul2882000@gmail.com");
    if (testUser) {
      console.log("Found user:", {
        id: testUser.id,
        username: testUser.username,
        firstName: testUser.firstName,
        lastName: testUser.lastName,
        role: testUser.role,
        active: testUser.active
      });
      
      // Activate the user if not active
      if (!testUser.active) {
        console.log("Activating user...");
        await storage.updateUser(testUser.id, { active: true });
        console.log("User activated successfully");
      }
    } else {
      console.log("User not found");
    }
    
    // Check admin user
    const adminUser = await storage.getUserByUsername("nextwaveadmission@gmail.com");
    if (adminUser) {
      console.log("Found admin user:", {
        id: adminUser.id,
        username: adminUser.username,
        role: adminUser.role,
        active: adminUser.active
      });
      
      // Activate admin if not active
      if (!adminUser.active) {
        console.log("Activating admin user...");
        await storage.updateUser(adminUser.id, { active: true });
        console.log("Admin user activated successfully");
      }
    } else {
      console.log("Admin user not found");
    }
    
    // List all users
    console.log("\nAll users in database:");
    const allUsers = await storage.getAllUsers();
    allUsers.forEach(user => {
      console.log(`- ${user.username} (${user.role}) - Active: ${user.active}`);
    });
    
  } catch (error) {
    console.error("Error fixing user accounts:", error);
  }
}

// Run the function
fixUserAccounts().then(() => {
  console.log("User account check completed");
  process.exit(0);
}).catch(error => {
  console.error("Failed to fix user accounts:", error);
  process.exit(1);
});