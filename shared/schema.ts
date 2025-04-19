import { pgTable, text, serial, integer, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema (keeping the original schema)
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
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
