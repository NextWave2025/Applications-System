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
  active: boolean("active").notNull().default(false), // New accounts are inactive by default until approved
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

// Study levels with user-friendly terms (sorted by education progression)
export const studyLevels = [
  "Foundation",
  "Diploma", 
  "Degree (Undergraduate)",
  "Postgraduate (Master's / PhD)"
];

// Study fields - core areas only (sorted by popularity)
export const studyFields = [
  "Business & Management",
  "Computer Science & IT", 
  "Engineering",
  "Medicine & Health",
  "Arts & Humanities",
  "Media & Design",
  "Law & Politics",
  "Education & Languages",
  "Social Sciences"
];

// UAE locations based on actual university cities (sorted alphabetically)
export const uaeLocations = [
  "Abu Dhabi",
  "Ajman",
  "Dubai", 
  "Ras Al Khaimah",
  "Sharjah"
];

// Intake options
export const intakeOptions = [
  "January",
  "May", 
  "September"
];

// Top universities in priority order
export const topUniversities = [
  "Middlesex University",
  "Amity University", 
  "Westford University",
  "Manipal University",
  "De Montfort University",
  "Curtin University",
  "Symbiosis University",
  "University of Bolton RAK"
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
  // Agent-controlled statuses
  "draft",
  "submitted",
  
  // Admin-only controlled statuses
  "submitted-to-university",
  "action-required",
  "accepted-conditional-offer",
  "accepted-payment-pending",
  "payment-clearing",
  "rejected"
] as const;

export type ApplicationStatus = typeof applicationStatuses[number];

// Group statuses by who can control them
export const agentControlledStatuses = ["draft", "submitted"] as const;
export const adminControlledStatuses = [
  "submitted-to-university",
  "action-required",
  "accepted-conditional-offer",
  "accepted-payment-pending",
  "payment-clearing",
  "rejected"
] as const;

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
  
  // Status management
  statusHistory: jsonb("status_history").default([]),  // Array of status changes with timestamps and notes
  adminNotes: text("admin_notes"),                     // Notes specifically from admins
  rejectionReason: text("rejection_reason"),           // Required for rejected applications
  paymentConfirmation: boolean("payment_confirmation").default(false), // For payment-clearing status
  submittedToUniversityDate: timestamp("submitted_to_university_date"), // When application was submitted to university
  lastActionBy: integer("last_action_by"),             // User ID of who last changed the status
  conditionalOfferTerms: text("conditional_offer_terms"), // For accepted-conditional-offer status
  
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
  studentName?: string; // Combined first and last name for compatibility
  program: {
    name: string;
    universityName: string;
    universityLogo: string;
    degree: string;
  },
  documents: Document[],
  agent?: {
    name: string;
    agencyName: string;
    email: string;
  }
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
export type TargetType = "user" | "application" | "document" | "program" | "university";
