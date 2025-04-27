import { pgTable, text, serial, integer, boolean, jsonb, timestamp, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User roles enum
export const userRoles = ["agent", "admin"] as const;
export type UserRole = typeof userRoles[number];

// User schema with extended fields for agent registration
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  agencyName: text("agency_name"),
  country: text("country"),
  phoneNumber: text("phone_number"),
  website: text("website"),
  role: text("role").notNull().default("agent"), // Default role is agent
  active: boolean("active").notNull().default(true), // For account deactivation
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).extend({
  // Add validation rules
  username: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(userRoles).default("agent"),
}).omit({
  id: true,
  createdAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Programs schema
export const programs = pgTable("programs", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  universityId: integer("university_id").notNull(),
  tuition: text("tuition").notNull(),
  duration: text("duration").notNull(),
  intake: text("intake").notNull(),
  degree: text("degree").notNull(),
  studyField: text("study_field").notNull(),
  requirements: jsonb("requirements").notNull(),
  hasScholarship: boolean("has_scholarship").notNull().default(false),
  imageUrl: text("image_url").notNull(),
});

export const insertProgramSchema = createInsertSchema(programs).omit({
  id: true,
});

export type InsertProgram = z.infer<typeof insertProgramSchema>;
export type Program = typeof programs.$inferSelect;

// Universities schema
export const universities = pgTable("universities", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  location: text("location").notNull(),
  imageUrl: text("image_url").notNull(),
});

export const insertUniversitySchema = createInsertSchema(universities).omit({
  id: true,
});

export type InsertUniversity = z.infer<typeof insertUniversitySchema>;
export type University = typeof universities.$inferSelect;

// Study levels
export const studyLevels = [
  "Bachelor's Degree",
  "Master's Degree",
  "PhD",
  "Diploma"
];

// Study fields
export const studyFields = [
  "Business & Management",
  "Engineering",
  "Computer Science & IT",
  "Medicine & Health",
  "Arts & Humanities"
];

// Duration options
export const durationOptions = [
  "1 year",
  "2 years",
  "3 years",
  "4 years",
  "4+ years"
];

// Program with university info (for queries)
export type ProgramWithUniversity = Program & { 
  university: {
    name: string;
    location: string;
    imageUrl: string;
  }
};

// Application status enum
export const applicationStatuses = [
  "draft",
  "submitted",
  "under-review",
  "approved",
  "rejected",
  "incomplete"
] as const;

export type ApplicationStatus = typeof applicationStatuses[number];

// Applications schema
export const applications = pgTable("applications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(), // Agent ID
  programId: integer("program_id").notNull(),
  
  // Student information
  studentFirstName: text("student_first_name").notNull(),
  studentLastName: text("student_last_name").notNull(),
  studentEmail: text("student_email").notNull(),
  studentPhone: text("student_phone").notNull(),
  studentDateOfBirth: date("student_date_of_birth").notNull(),
  studentNationality: text("student_nationality").notNull(),
  studentGender: text("student_gender").notNull(),
  
  // Academic information
  highestQualification: text("highest_qualification").notNull(),
  qualificationName: text("qualification_name").notNull(),
  institutionName: text("institution_name").notNull(),
  graduationYear: text("graduation_year").notNull(),
  cgpa: text("cgpa"),
  
  // Application details
  intakeDate: text("intake_date").notNull(),
  notes: text("notes"),
  status: text("status").notNull().default("draft"),
  
  // Timestamps
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertApplicationSchema = createInsertSchema(applications).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  studentEmail: z.string().email("Please enter a valid email address"),
  studentDateOfBirth: z.coerce.date(),
  studentGender: z.enum(["male", "female", "other", "prefer-not-to-say"]),
});

export type InsertApplication = z.infer<typeof insertApplicationSchema>;
export type Application = typeof applications.$inferSelect;

// Documents schema
export const documents = pgTable("documents", {
  id: serial("id").primaryKey(),
  applicationId: integer("application_id").notNull(),
  documentType: text("document_type").notNull(),
  filename: text("filename").notNull(),
  originalFilename: text("original_filename").notNull(),
  fileSize: integer("file_size").notNull(),
  mimeType: text("mime_type").notNull(),
  fileData: text("file_data"), // Base64 encoded file data
  uploadedAt: timestamp("uploaded_at").defaultNow().notNull(),
});

export const insertDocumentSchema = createInsertSchema(documents).omit({
  id: true,
  uploadedAt: true,
});

export type InsertDocument = z.infer<typeof insertDocumentSchema>;
export type Document = typeof documents.$inferSelect;

// Valid document types for applications
export const documentTypes = [
  "passport",
  "resume",
  "transcript",
  "recommendation-letter",
  "statement-of-purpose",
  "english-proficiency",
  "other"
] as const;

export type DocumentType = typeof documentTypes[number];

// Application with related info (for queries)
export type ApplicationWithDetails = Application & { 
  program: {
    name: string;
    universityName: string;
    universityLogo: string;
    degree: string;
  },
  documents: Document[]
};

// Audit logs for admin actions
export const auditLogs = pgTable("audit_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(), // Admin ID
  action: text("action").notNull(), // Type of action performed
  resourceType: text("resource_type").notNull(), // Type of resource affected (e.g., 'application', 'user')
  resourceId: integer("resource_id").notNull(), // ID of the resource
  previousData: jsonb("previous_data"), // Previous state of the resource
  newData: jsonb("new_data"), // New state of the resource
  createdAt: timestamp("created_at").defaultNow().notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
});

export const insertAuditLogSchema = createInsertSchema(auditLogs).omit({
  id: true,
  createdAt: true,
});

export type InsertAuditLog = z.infer<typeof insertAuditLogSchema>;
export type AuditLog = typeof auditLogs.$inferSelect;
