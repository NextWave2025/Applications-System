import { 
  users, type User, type InsertUser,
  programs, type Program, type InsertProgram,
  universities, type University, type InsertUniversity,
  type ProgramWithUniversity
} from "@shared/schema";
import { eq, and, like, inArray, sql } from "drizzle-orm";
import { PostgresJsDatabase, drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import session from "express-session";
import connectPg from "connect-pg-simple";

// Database connection
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is required");
}

// Create postgres connection
const connectionString = process.env.DATABASE_URL;
const client = postgres(connectionString);
const db = drizzle(client);

// Create postgres session store
const pool = {
  query: async (text: string, params: any[]) => {
    return client(text, ...params);
  }
};

const PostgresSessionStore = connectPg(session);

// Expanded storage interface with all the needed CRUD methods
export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Program methods
  getPrograms(filters?: ProgramFilters): Promise<ProgramWithUniversity[]>;
  getProgramById(id: number): Promise<ProgramWithUniversity | undefined>;
  createProgram(program: InsertProgram): Promise<Program>;
  
  // University methods
  getUniversities(): Promise<University[]>;
  getUniversityById(id: number): Promise<University | undefined>;
  createUniversity(university: InsertUniversity): Promise<University>;

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

export class DBStorage implements IStorage {
  private db: PostgresJsDatabase;
  public sessionStore: session.Store;

  constructor(db: PostgresJsDatabase) {
    this.db = db;
    this.sessionStore = new PostgresSessionStore({
      pool, 
      createTableIfMissing: true,
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

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await this.db.insert(users).values(insertUser).returning();
    return result[0];
  }

  // Program methods
  async getPrograms(filters?: ProgramFilters): Promise<ProgramWithUniversity[]> {
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
    
    // Apply filters if provided
    if (filters) {
      const conditions = [];
      
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
      
      // Max tuition filter - this is a bit tricky since tuition is stored as a string
      // For now, we'll handle it in-memory after fetching
      
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
        const searchTerm = `%${filters.search}%`;
        conditions.push(
          sql`(${programs.name} ILIKE ${searchTerm} OR ${universities.name} ILIKE ${searchTerm})`
        );
      }
      
      // Apply all conditions
      if (conditions.length > 0) {
        query = query.where(and(...conditions));
      }
    }
    
    const results = await query;
    
    // Handle the max tuition filter in memory since it's stored as a string
    if (filters?.maxTuition) {
      return results.filter(program => {
        const tuitionValue = parseInt(program.tuition.replace(/[^0-9]/g, ''));
        return !isNaN(tuitionValue) && tuitionValue <= filters.maxTuition!;
      });
    }
    
    return results;
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

  // Utility methods
  async clearAll(): Promise<void> {
    await this.db.delete(programs);
    await this.db.delete(universities);
  }
}

// Export a singleton instance of the storage
export const storage = new DBStorage(db);
