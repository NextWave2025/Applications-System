import { sql } from "drizzle-orm";
import { db, pool } from "./db";

/**
 * Script to update the applications table schema with new status management columns
 */
async function updateApplicationsSchema() {
  console.log("Updating applications table schema...");

  try {
    // Check if status_history column already exists
    const checkResult = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'applications' AND column_name = 'status_history'
    `);

    if (checkResult.rows.length === 0) {
      console.log("Adding new status management columns...");
      
      // Add all new columns in a single transaction
      await pool.query(`
        ALTER TABLE applications
        ADD COLUMN IF NOT EXISTS status_history JSONB DEFAULT '[]',
        ADD COLUMN IF NOT EXISTS admin_notes TEXT,
        ADD COLUMN IF NOT EXISTS rejection_reason TEXT,
        ADD COLUMN IF NOT EXISTS payment_confirmation BOOLEAN DEFAULT FALSE,
        ADD COLUMN IF NOT EXISTS submitted_to_university_date TIMESTAMP,
        ADD COLUMN IF NOT EXISTS last_action_by INTEGER,
        ADD COLUMN IF NOT EXISTS conditional_offer_terms TEXT
      `);
      
      console.log("Schema updated successfully!");
    } else {
      console.log("Schema already up to date.");
    }
  } catch (error) {
    console.error("Error updating schema:", error);
    throw error;
  } finally {
    console.log("Schema update process completed.");
  }
}

// Run the function
updateApplicationsSchema()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Failed to update schema:", error);
    process.exit(1);
  });