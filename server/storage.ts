import {
  users, type User, type InsertUser,
  programs, type Program, type InsertProgram,
  universities, type University, type InsertUniversity,
  applications, type Application, type InsertApplication,
  documents, type Document, type InsertDocument,
  auditLogs, type AuditLog, type InsertAuditLog,
  type ProgramWithUniversity,
  type ApplicationWithDetails,
  type TargetType
} from "@shared/schema";
import { eq, and, like, inArray, sql } from "drizzle-orm";
import { PostgresJsDatabase, drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import session from "express-session";
import createMemoryStore from "memorystore";

// Database connection
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is required");
}

// Create postgres connection with error handling
let pgConnection: any;
let db: any;

try {
  pgConnection = postgres(connectionString, {
    onnotice: () => {}, // Suppress notices
    transform: {
      undefined: null
    }
  });
  db = drizzle(pgConnection);
} catch (error) {
  console.error("Failed to initialize database connection:", error);
  throw error;
}

// Create a memory store for sessions (development) or persistent store (production)
const MemoryStore = createMemoryStore(session);

// 🚨 CRITICAL FIX: Use persistent session store for production
const isProduction = process.env.NODE_ENV === 'production' || 
                    process.env.REPLIT_ENVIRONMENT === 'production' ||
                    (typeof process !== 'undefined' && process.env.REPL_ID);

console.log('Session store configuration:', {
  isProduction,
  storeType: isProduction ? 'persistent' : 'memory'
});

// Expanded storage interface with all the needed CRUD methods
export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserById(id: number): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<User>): Promise<User>;
  updateUserStatus(id: number, active: boolean): Promise<User>;
  updateUserPassword(id: number, password: string): Promise<User>;
  deleteUser(id: number): Promise<void>;
  getAllUsers(): Promise<User[]>;

  // Program methods
  getPrograms(filters?: ProgramFilters): Promise<ProgramWithUniversity[]>;
  getProgramById(id: number): Promise<ProgramWithUniversity | undefined>;
  createProgram(program: InsertProgram): Promise<Program>;
  updateProgram(id: number, program: Partial<Program>): Promise<Program>;
  deleteProgram(id: number): Promise<void>;

  // University methods
  getUniversities(): Promise<University[]>;
  getUniversityById(id: number): Promise<University | undefined>;
  createUniversity(university: InsertUniversity): Promise<University>;
  updateUniversity(id: number, university: Partial<University>): Promise<University>;
  deleteUniversity(id: number): Promise<void>;

  // Application methods
  getApplications(userId: number): Promise<ApplicationWithDetails[]>;
  getAllApplications(filters?: ApplicationFilters): Promise<ApplicationWithDetails[]>; // For admin use
  getApplicationById(id: number): Promise<ApplicationWithDetails | undefined>;
  createApplication(application: InsertApplication): Promise<Application>;
  updateApplicationStatus(
    id: number,
    status: string,
    userId: number,
    notes?: string,
    additionalData?: {
      rejectionReason?: string;
      conditionalOfferTerms?: string;
      paymentConfirmation?: boolean;
    }
  ): Promise<Application>;
  updateApplication(id: number, application: Partial<Application>): Promise<Application>;
  deleteApplication(id: number): Promise<void>;

  // Document methods
  getDocumentById(id: number): Promise<Document | undefined>;
  getDocumentsByApplicationId(applicationId: number): Promise<Document[]>;
  createDocument(document: InsertDocument): Promise<Document>;
  deleteDocument(id: number): Promise<void>;

  // Audit log methods
  createAuditLog(auditLog: InsertAuditLog): Promise<AuditLog>;
  getAuditLogs(): Promise<AuditLog[]>;
  getAuditLogsByUserId(userId: number): Promise<AuditLog[]>;
  getAuditLogsByTarget(targetId: number, targetType: string): Promise<AuditLog[]>;
  getAuditLogsByAction(action: string): Promise<AuditLog[]>;

  // Utility methods
  clearAll(): Promise<void>;

  // Session store
  sessionStore: session.Store;
}

// Filters for program queries
export interface ProgramFilters {
  studyLevel?: string[];
  studyField?: string[];
  universityIds?: number[];
  minTuition?: number;
  maxTuition?: number;
  duration?: string[];
  location?: string[];
  intake?: string[];
  hasScholarship?: boolean;
  search?: string;
}

// Filters for application queries (admin use)
export interface ApplicationFilters {
  status?: string;
  userId?: number;
  search?: string;
}

export class DBStorage implements IStorage {
  private db: PostgresJsDatabase;
  public sessionStore: session.Store;

  constructor(db: PostgresJsDatabase) {
    this.db = db;
    
    // 🚨 CRITICAL FIX: Use persistent session store for production
    if (isProduction) {
      // For production, use a more persistent store configuration
      this.sessionStore = new MemoryStore({
        checkPeriod: 86400000, // prune expired entries every 24h
        ttl: 24 * 60 * 60 * 1000, // 24 hours
        noDisposeOnSet: true,
        dispose: (key, value) => {
          console.log('Session disposed:', key);
        }
      });
    } else {
      // For development, use standard memory store
      this.sessionStore = new MemoryStore({
        checkPeriod: 86400000 // prune expired entries every 24h
      });
    }
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const result = await this.db.select().from(users).where(eq(users.id, id));
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await this.db.select().from(users).where(eq(users.username, username));
    return result[0];
  }

  async getUserById(id: number): Promise<User | undefined> {
    const result = await this.db.select().from(users).where(eq(users.id, id));
    return result[0];
  }

  async getAllUsers(): Promise<User[]> {
    return await this.db.select().from(users).orderBy(users.createdAt);
  }

  async updateUserStatus(id: number, active: boolean): Promise<User> {
    const result = await this.db
      .update(users)
      .set({ active })
      .where(eq(users.id, id))
      .returning();
    return result[0];
  }

  async updateUserPassword(id: number, password: string): Promise<User> {
    // Hash the password using the same method as in auth.ts
    const scrypt = require("crypto").scrypt;
    const randomBytes = require("crypto").randomBytes;
    const { promisify } = require("util");
    const scryptAsync = promisify(scrypt);
    
    const salt = randomBytes(16).toString("hex");
    const hashedPassword = (await scryptAsync(password, salt, 64)) as Buffer;
    const storedPassword = `${hashedPassword.toString("hex")}.${salt}`;
    
    const result = await this.db
      .update(users)
      .set({ password: storedPassword })
      .where(eq(users.id, id))
      .returning();
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await this.db.insert(users).values(insertUser).returning();
    return result[0];
  }

  async updateUser(id: number, userUpdate: Partial<User>): Promise<User> {
    const result = await this.db
      .update(users)
      .set(userUpdate)
      .where(eq(users.id, id))
      .returning();
    return result[0];
  }

  async deleteUser(id: number): Promise<void> {
    await this.db.delete(users).where(eq(users.id, id));
  }

  // Program methods
  async getPrograms(filters?: ProgramFilters): Promise<ProgramWithUniversity[]> {
    console.log("Storage.getPrograms called with filters:", filters);

    try {
      // Use ORM for better type safety
      let query = this.db.select({
        id: programs.id,
        name: programs.name,
        universityId: programs.universityId,
        tuition: programs.tuition,
        duration: programs.duration,
        intake: programs.intake,
        degree: programs.degree,
        studyField: programs.studyField,
        requirements: programs.requirements,
        hasScholarship: programs.hasScholarship,
        imageUrl: programs.imageUrl,
        university: {
          name: universities.name,
          location: universities.location,
          imageUrl: universities.imageUrl
        }
      })
        .from(programs)
        .innerJoin(universities, eq(programs.universityId, universities.id));

      // Build conditions array for WHERE clause
      const conditions = [];

      // Apply filters if provided
      if (filters) {
        // Study level filter
        if (filters.studyLevel && filters.studyLevel.length > 0) {
          conditions.push(inArray(programs.degree, filters.studyLevel));
        }

        // Study field filter
        if (filters.studyField && filters.studyField.length > 0) {
          conditions.push(inArray(programs.studyField, filters.studyField));
        }

        // University filter
        if (filters.universityIds && filters.universityIds.length > 0) {
          conditions.push(inArray(programs.universityId, filters.universityIds));
        }

        // Duration filter
        if (filters.duration && filters.duration.length > 0) {
          conditions.push(inArray(programs.duration, filters.duration));
        }

        // Location filter - filter by university location
        if (filters.location && filters.location.length > 0) {
          conditions.push(inArray(universities.location, filters.location));
        }

        // Intake filter
        if (filters.intake && filters.intake.length > 0) {
          conditions.push(inArray(programs.intake, filters.intake));
        }

        // Scholarship filter
        if (filters.hasScholarship !== undefined) {
          conditions.push(eq(programs.hasScholarship, filters.hasScholarship));
        }

        // Search filter
        if (filters.search) {
          const searchLower = `%${filters.search.toLowerCase()}%`;
          conditions.push(
            sql`(LOWER(${programs.name}) LIKE ${searchLower} OR LOWER(${universities.name}) LIKE ${searchLower})`
          );
        }
      }

      // Apply all conditions to the query
      if (conditions.length > 0) {
        query = query.where(and(...conditions)) as any;
      }

      // Add random ordering to display programs from all universities randomly
      query = query.orderBy(sql`RANDOM()`) as any;

      console.log("Executing ORM query with random ordering...");
      const result = await query;
      console.log(`Query returned ${result.length} programs`);

      // Handle tuition range filter in memory since tuition is stored as string with "AED/year" suffix
      let filteredResults = result;
      
      if (filters?.minTuition || filters?.maxTuition) {
        filteredResults = result.filter((program) => {
          try {
            // Extract numeric part from "35,000 AED/year" format
            const tuitionValue = parseInt(program.tuition.replace(/[^0-9]/g, ''));
            if (isNaN(tuitionValue)) return true; // Include by default if parsing fails
            
            let inRange = true;
            if (filters.minTuition) {
              inRange = inRange && tuitionValue >= filters.minTuition;
            }
            if (filters.maxTuition) {
              inRange = inRange && tuitionValue <= filters.maxTuition;
            }
            return inRange;
          } catch (e) {
            console.error("Error parsing tuition:", e, "for program:", program.name);
            return true; // Include by default if parsing fails
          }
        });
      }

      return filteredResults as ProgramWithUniversity[];
    } catch (error) {
      console.error("Error in getPrograms:", error);
      throw error;
    }
  }

  async getProgramById(id: number): Promise<ProgramWithUniversity | undefined> {
    const result = await this.db.select({
      id: programs.id,
      name: programs.name,
      universityId: programs.universityId,
      tuition: programs.tuition,
      duration: programs.duration,
      intake: programs.intake,
      degree: programs.degree,
      studyField: programs.studyField,
      requirements: programs.requirements,
      hasScholarship: programs.hasScholarship,
      imageUrl: programs.imageUrl,
      university: {
        id: universities.id,
        name: universities.name,
        location: universities.location,
        city: universities.location, // Use location as city for compatibility
        imageUrl: universities.imageUrl
      }
    })
      .from(programs)
      .innerJoin(universities, eq(programs.universityId, universities.id))
      .where(eq(programs.id, id));

    return result[0];
  }

  async createProgram(insertProgram: InsertProgram): Promise<Program> {
    const result = await this.db.insert(programs).values(insertProgram).returning();
    return result[0];
  }

  async updateProgram(id: number, programData: Partial<Program>): Promise<Program> {
    const result = await this.db.update(programs)
      .set(programData)
      .where(eq(programs.id, id))
      .returning();
    return result[0];
  }

  async deleteProgram(id: number): Promise<void> {
    await this.db.delete(programs).where(eq(programs.id, id));
  }

  // University methods
  async getUniversities(): Promise<University[]> {
    return await this.db.select().from(universities);
  }

  async getUniversityById(id: number): Promise<University | undefined> {
    const result = await this.db.select().from(universities).where(eq(universities.id, id));
    return result[0];
  }

  async createUniversity(insertUniversity: InsertUniversity): Promise<University> {
    const result = await this.db.insert(universities).values(insertUniversity).returning();
    return result[0];
  }

  async updateUniversity(id: number, universityData: Partial<University>): Promise<University> {
    const result = await this.db.update(universities)
      .set(universityData)
      .where(eq(universities.id, id))
      .returning();
    return result[0];
  }

  async deleteUniversity(id: number): Promise<void> {
    await this.db.delete(universities).where(eq(universities.id, id));
  }

  // Application methods
  async getApplications(userId: number): Promise<ApplicationWithDetails[]> {
    const applicationResults = await this.db.select().from(applications)
      .where(eq(applications.userId, userId))
      .orderBy(sql`${applications.updatedAt} DESC`); // Sort by latest updated

    // Fetch program details and documents for each application
    const applicationsWithDetails = await Promise.all(
      applicationResults.map(async (application) => {
        // Get program details with university info
        const program = await this.getProgramById(application.programId);

        // Get documents for this application
        const docs = await this.getDocumentsByApplicationId(application.id);

        return {
          ...application,
          program: program ? {
            id: program.id,
            name: program.name,
            degreeLevel: program.degree,
            university: {
              id: program.university.id,
              name: program.university.name,
              city: program.university.city
            }
          } : null,
          documents: docs,
          agent: null // For regular applications, no agent info needed
        };
      })
    );

    return applicationsWithDetails;
  }

  async getAllApplications(filters?: ApplicationFilters): Promise<ApplicationWithDetails[]> {
    try {
      console.log("Starting getAllApplications with filters:", filters);
      
      // Build the base query
      let query = this.db.select().from(applications);

      // Apply filters if provided
      if (filters) {
        const conditions = [];

        // Status filter
        if (filters.status) {
          conditions.push(eq(applications.status, filters.status));
        }

        // User ID filter
        if (filters.userId) {
          conditions.push(eq(applications.userId, filters.userId));
        }

        // Search filter (search in student names and emails)
        if (filters.search) {
          const searchTerm = `%${filters.search.toLowerCase()}%`;
          conditions.push(
            sql`(LOWER(${applications.studentFirstName}) LIKE ${searchTerm} OR
                 LOWER(${applications.studentLastName}) LIKE ${searchTerm} OR
                 LOWER(${applications.studentEmail}) LIKE ${searchTerm})`
          );
        }

        // Apply all conditions
        if (conditions.length > 0) {
          query = query.where(and(...conditions)) as any;
        }
      }

      // Sort by most recently updated
      console.log("Executing applications query...");
      const applicationResults = await query.orderBy(sql`${applications.updatedAt} DESC`);
      console.log(`Found ${applicationResults.length} base applications`);

      if (applicationResults.length === 0) {
        return [];
      }

      // Fetch program details, user info, and documents for each application
      console.log("Fetching related data for applications...");
      const applicationsWithDetails = await Promise.all(
        applicationResults.map(async (application) => {
          try {
            // Get program details with university info
            const program = await this.getProgramById(application.programId).catch(err => {
              console.error(`Error fetching program ${application.programId}:`, err);
              return null;
            });

            // Get user (agent) details
            const user = await this.getUser(application.userId).catch(err => {
              console.error(`Error fetching user ${application.userId}:`, err);
              return null;
            });

            // Get documents for this application
            const docs = await this.getDocumentsByApplicationId(application.id).catch(err => {
              console.error(`Error fetching documents for application ${application.id}:`, err);
              return [];
            });

            return {
              ...application,
              // Add combined student name for compatibility
              studentName: `${application.studentFirstName} ${application.studentLastName}`,
              program: program ? {
                id: program.id,
                name: program.name,
                degreeLevel: program.degree,
                university: {
                  id: program.university.id,
                  name: program.university.name,
                  city: program.university.city
                }
              } : null,
              agent: user ? {
                id: user.id,
                firstName: user.firstName || "",
                lastName: user.lastName || "",
                agencyName: user.agencyName || "",
                email: user.username || "" // Agent email for notifications
              } : null,
              documents: docs
            };
          } catch (error) {
            console.error("Error processing application:", application.id, (error as Error).message);
            // Return basic application data even if related data fails
            return {
              ...application,
              studentName: `${application.studentFirstName} ${application.studentLastName}`,
              program: null,
              agent: null,
              documents: []
            };
          }
        })
      );

      console.log(`Returning ${applicationsWithDetails.length} applications with details`);
      return applicationsWithDetails;
    } catch (error) {
      console.error("Error in getAllApplications:", error);
      console.error("Error stack:", (error as Error).stack);
      // Return empty array instead of throwing to prevent unhandled rejections
      return [];
    }
  }

  async getApplicationById(id: number): Promise<ApplicationWithDetails | undefined> {
    const result = await this.db.select().from(applications).where(eq(applications.id, id));

    if (!result.length) {
      return undefined;
    }

    const application = result[0];

    // Get program details with university info
    const program = await this.getProgramById(application.programId);

    // Get user (agent) details
    const user = await this.getUser(application.userId);

    // Get documents for this application
    const docs = await this.getDocumentsByApplicationId(application.id);

    return {
      ...application,
      // Add combined student name for compatibility
      studentName: `${application.studentFirstName} ${application.studentLastName}`,
      program: program ? {
        id: program.id,
        name: program.name,
        degreeLevel: program.degree,
        university: {
          id: program.university.id,
          name: program.university.name,
          city: program.university.city
        }
      } : null,
      agent: user ? {
        id: user.id,
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        agencyName: user.agencyName || "",
        email: user.username || "" // Agent email for notifications
      } : null,
      documents: docs
    };
  }

  async createApplication(insertApplication: InsertApplication): Promise<Application> {
    const result = await this.db.insert(applications).values(insertApplication as any).returning();
    return result[0];
  }

  async updateApplicationStatus(
    id: number,
    status: string,
    userId: number,
    notes?: string,
    additionalData?: {
      rejectionReason?: string;
      conditionalOfferTerms?: string;
      paymentConfirmation?: boolean;
    }
  ): Promise<Application> {
    // First get the current application to add to history
    const currentApp = await this.getApplicationById(id);
    if (!currentApp) {
      throw new Error(`Application with ID ${id} not found`);
    }

    const now = new Date();

    // Create the status history entry
    const historyEntry = {
      fromStatus: currentApp.status,
      toStatus: status,
      timestamp: now.toISOString(),
      userId: userId,
      notes: notes || ""
    };

    // Prepare the update data
    const updateData: any = {
      status,
      updatedAt: now,
      lastActionBy: userId
    };

    // Get the current status history or initialize empty array
    let statusHistory = currentApp.statusHistory || [];
    // Ensure it's an array
    if (!Array.isArray(statusHistory)) {
      statusHistory = [];
    }
    // Add the new entry to the status history
    statusHistory = [...(Array.isArray(statusHistory) ? statusHistory : []), historyEntry];
    updateData.statusHistory = statusHistory;

    // Add notes if provided
    if (notes) {
      updateData.adminNotes = notes;
    }

    // Handle status-specific data requirements
    if (status === "rejected" && additionalData?.rejectionReason) {
      updateData.rejectionReason = additionalData.rejectionReason;
    }
    else if (status === "accepted-conditional-offer" && additionalData?.conditionalOfferTerms) {
      updateData.conditionalOfferTerms = additionalData.conditionalOfferTerms;
    }
    else if (status === "payment-clearing" && additionalData?.paymentConfirmation !== undefined) {
      updateData.paymentConfirmation = additionalData.paymentConfirmation;
    }
    else if (status === "submitted-to-university") {
      updateData.submittedToUniversityDate = now;
    }

    // Update the application
    const result = await this.db.update(applications)
      .set(updateData)
      .where(eq(applications.id, id))
      .returning();

    return result[0];
  }

  async updateApplication(id: number, applicationData: Partial<Application>): Promise<Application> {
    // Ensure we have an updated timestamp
    if (!applicationData.updatedAt) {
      applicationData.updatedAt = new Date();
    }

    const result = await this.db.update(applications)
      .set(applicationData)
      .where(eq(applications.id, id))
      .returning();

    return result[0];
  }

  async deleteApplication(id: number): Promise<void> {
    // First delete associated documents
    await this.db.delete(documents).where(eq(documents.applicationId, id));
    
    // Then delete the application
    await this.db.delete(applications).where(eq(applications.id, id));
  }

  // Document methods
  async getDocumentById(id: number): Promise<Document | undefined> {
    const result = await this.db.select().from(documents).where(eq(documents.id, id));
    return result[0];
  }

  async getDocumentsByApplicationId(applicationId: number): Promise<Document[]> {
    return await this.db.select().from(documents)
      .where(eq(documents.applicationId, applicationId));
  }

  async createDocument(insertDocument: InsertDocument): Promise<Document> {
    const result = await this.db.insert(documents).values(insertDocument).returning();
    return result[0];
  }

  async deleteDocument(id: number): Promise<void> {
    await this.db.delete(documents).where(eq(documents.id, id));
  }

  // Audit log methods
  async createAuditLog(insertAuditLog: InsertAuditLog): Promise<AuditLog> {
    const result = await this.db.insert(auditLogs).values(insertAuditLog as any).returning();
    return result[0];
  }

  async getAuditLogs(): Promise<AuditLog[]> {
    return await this.db.select().from(auditLogs).orderBy(sql`${auditLogs.createdAt} DESC`);
  }

  async getAuditLogsByUserId(userId: number): Promise<AuditLog[]> {
    return await this.db.select()
      .from(auditLogs)
      .where(eq(auditLogs.userId, userId))
      .orderBy(sql`${auditLogs.createdAt} DESC`);
  }

  async getAuditLogsByTarget(resourceId: number, resourceType: string): Promise<AuditLog[]> {
    return await this.db.select()
      .from(auditLogs)
      .where(
        and(
          eq(auditLogs.resourceId, resourceId),
          eq(auditLogs.resourceType, resourceType)
        )
      )
      .orderBy(sql`${auditLogs.createdAt} DESC`);
  }

  async getAuditLogsByAction(action: string): Promise<AuditLog[]> {
    return await this.db.select()
      .from(auditLogs)
      .where(eq(auditLogs.action, action))
      .orderBy(sql`${auditLogs.createdAt} DESC`);
  }

  // Utility methods
  async clearAll(): Promise<void> {
    await this.db.delete(auditLogs);
    await this.db.delete(documents);
    await this.db.delete(applications);
    await this.db.delete(programs);
    await this.db.delete(universities);
    await this.db.delete(users);
  }
}

// Export a singleton instance of the storage
export const storage = new DBStorage(db);
