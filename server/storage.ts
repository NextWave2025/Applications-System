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
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is required");
}

// Create postgres connection
const connectionString = process.env.DATABASE_URL;
const pgConnection = postgres(connectionString);
const db = drizzle(pgConnection);

// Create a memory store for sessions
const MemoryStore = createMemoryStore(session);

// Expanded storage interface with all the needed CRUD methods
export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserById(id: number): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserStatus(id: number, active: boolean): Promise<User>;
  getAllUsers(): Promise<User[]>;
  
  // Program methods
  getPrograms(filters?: ProgramFilters): Promise<ProgramWithUniversity[]>;
  getProgramById(id: number): Promise<ProgramWithUniversity | undefined>;
  createProgram(program: InsertProgram): Promise<Program>;
  
  // University methods
  getUniversities(): Promise<University[]>;
  getUniversityById(id: number): Promise<University | undefined>;
  createUniversity(university: InsertUniversity): Promise<University>;
  
  // Application methods
  getApplications(userId: number): Promise<ApplicationWithDetails[]>;
  getAllApplications(filters?: ApplicationFilters): Promise<ApplicationWithDetails[]>; // For admin use
  getApplicationById(id: number): Promise<ApplicationWithDetails | undefined>;
  createApplication(application: InsertApplication): Promise<Application>;
  updateApplicationStatus(id: number, status: string): Promise<Application>;
  updateApplication(id: number, application: Partial<Application>): Promise<Application>;
  
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
  maxTuition?: number;
  duration?: string[];
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
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // prune expired entries every 24h
    });
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

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await this.db.insert(users).values(insertUser).returning();
    return result[0];
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
        query = query.where(and(...conditions));
      }
      
      console.log("Executing ORM query...");
      const result = await query;
      console.log(`Query returned ${result.length} programs`);
      
      // Handle max tuition filter in memory since tuition is stored as string with "AED/year" suffix
      if (filters?.maxTuition) {
        return result.filter((program: ProgramWithUniversity) => {
          try {
            // Extract numeric part from "35,000 AED/year" format
            const tuitionValue = parseInt(program.tuition.replace(/[^0-9]/g, ''));
            return !isNaN(tuitionValue) && tuitionValue <= (filters.maxTuition || 0);
          } catch (e) {
            console.error("Error parsing tuition:", e, "for program:", program.name);
            return true; // Include by default if parsing fails
          }
        });
      }
      
      return result;
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
        name: universities.name,
        location: universities.location,
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
          program: {
            name: program?.name || "",
            universityName: program?.university.name || "",
            universityLogo: program?.university.imageUrl || "",
            degree: program?.degree || ""
          },
          documents: docs
        };
      })
    );
    
    return applicationsWithDetails;
  }
  
  async getAllApplications(filters?: ApplicationFilters): Promise<ApplicationWithDetails[]> {
    try {
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
          query = query.where(and(...conditions));
        }
      }
      
      // Sort by most recently updated
      const applicationResults = await query.orderBy(sql`${applications.updatedAt} DESC`);
      
      // Fetch program details, user info, and documents for each application
      const applicationsWithDetails = await Promise.all(
        applicationResults.map(async (application) => {
          // Get program details with university info
          const program = await this.getProgramById(application.programId);
          
          // Get user (agent) details
          const user = await this.getUser(application.userId);
          
          // Get documents for this application
          const docs = await this.getDocumentsByApplicationId(application.id);
          
          return {
            ...application,
            program: {
              name: program?.name || "",
              universityName: program?.university.name || "",
              universityLogo: program?.university.imageUrl || "",
              degree: program?.degree || ""
            },
            agent: {
              name: user ? `${user.firstName} ${user.lastName}` : "",
              agencyName: user?.agencyName || ""
            },
            documents: docs
          };
        })
      );
      
      return applicationsWithDetails;
    } catch (error) {
      console.error("Error in getAllApplications:", error);
      throw error;
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
    
    // Get documents for this application
    const docs = await this.getDocumentsByApplicationId(application.id);
    
    return {
      ...application,
      program: {
        name: program?.name || "",
        universityName: program?.university.name || "",
        universityLogo: program?.university.imageUrl || "",
        degree: program?.degree || ""
      },
      documents: docs
    };
  }
  
  async createApplication(insertApplication: InsertApplication): Promise<Application> {
    const result = await this.db.insert(applications).values(insertApplication).returning();
    return result[0];
  }
  
  async updateApplicationStatus(id: number, status: string): Promise<Application> {
    const result = await this.db.update(applications)
      .set({ 
        status, 
        updatedAt: new Date() 
      })
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
    const result = await this.db.insert(auditLogs).values(insertAuditLog).returning();
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
