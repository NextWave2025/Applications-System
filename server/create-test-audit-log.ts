import { storage } from "./storage";

async function createTestAuditLog() {
  console.log("Creating test audit log...");

  try {
    const auditLog = await storage.createAuditLog({
      userId: 10, // Admin user ID 
      action: "test_action",
      resourceType: "test",
      resourceId: 1,
      previousData: { status: "old" },
      newData: { status: "new" },
      ipAddress: "127.0.0.1",
      userAgent: "test-script"
    });
    
    console.log("Test audit log created successfully:", auditLog);
    
    // Verify by retrieving all audit logs
    const allLogs = await storage.getAuditLogs();
    console.log(`Found ${allLogs.length} audit logs in total`);
    
  } catch (error) {
    console.error("Error creating test audit log:", error);
  }
}

// Run the function
createTestAuditLog()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Unhandled error:", error);
    process.exit(1);
  });