import { storage } from "./server/storage";
import bcrypt from "bcrypt";

async function resetAdminPassword() {
  try {
    const adminEmail = "nextwaveadmission@gmail.com";
    const newPassword = "admin123";
    
    console.log("Resetting admin password...");
    
    const adminUser = await storage.getUserByUsername(adminEmail);
    if (!adminUser) {
      console.log("Admin user not found");
      return;
    }
    
    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Update the password
    await storage.updateUser(adminUser.id, { 
      password: hashedPassword,
      active: true 
    });
    
    console.log(`Admin password reset successfully!`);
    console.log(`Email: ${adminEmail}`);
    console.log(`Password: ${newPassword}`);
    console.log(`Role: ${adminUser.role}`);
    
  } catch (error) {
    console.error("Error resetting admin password:", error);
  }
}

resetAdminPassword().then(() => {
  console.log("Password reset completed");
  process.exit(0);
}).catch(error => {
  console.error("Failed to reset password:", error);
  process.exit(1);
});