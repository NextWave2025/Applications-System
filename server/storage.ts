import { 
  users, type User, type InsertUser,
  programs, type Program, type InsertProgram,
  universities, type University, type InsertUniversity,
  type ProgramWithUniversity
} from "@shared/schema";

// Expanded storage interface with all the needed CRUD methods
export interface IStorage {
  // User methods (keeping the original methods)
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

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private programs: Map<number, Program>;
  private universities: Map<number, University>;

  private userCurrentId: number;
  private programCurrentId: number;
  private universityCurrentId: number;

  constructor() {
    this.users = new Map();
    this.programs = new Map();
    this.universities = new Map();
    
    this.userCurrentId = 1;
    this.programCurrentId = 1;
    this.universityCurrentId = 1;
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userCurrentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Program methods
  async getPrograms(filters?: ProgramFilters): Promise<ProgramWithUniversity[]> {
    let result = Array.from(this.programs.values());
    
    if (filters) {
      // Apply study level filter
      if (filters.studyLevel && filters.studyLevel.length > 0) {
        result = result.filter(program => filters.studyLevel!.includes(program.degree));
      }
      
      // Apply study field filter
      if (filters.studyField && filters.studyField.length > 0) {
        result = result.filter(program => filters.studyField!.includes(program.studyField));
      }
      
      // Apply university filter
      if (filters.universityIds && filters.universityIds.length > 0) {
        result = result.filter(program => filters.universityIds!.includes(program.universityId));
      }
      
      // Apply max tuition filter
      if (filters.maxTuition) {
        result = result.filter(program => {
          // Extract numeric value from tuition string (e.g., "35,000 AED/year" -> 35000)
          const tuitionValue = parseInt(program.tuition.replace(/[^0-9]/g, ''));
          return !isNaN(tuitionValue) && tuitionValue <= filters.maxTuition!;
        });
      }
      
      // Apply duration filter
      if (filters.duration && filters.duration.length > 0) {
        result = result.filter(program => filters.duration!.includes(program.duration));
      }
      
      // Apply scholarship filter
      if (filters.hasScholarship !== undefined) {
        result = result.filter(program => program.hasScholarship === filters.hasScholarship);
      }
      
      // Apply search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        result = result.filter(program => {
          const university = this.universities.get(program.universityId);
          return program.name.toLowerCase().includes(searchLower) || 
                (university && university.name.toLowerCase().includes(searchLower));
        });
      }
    }
    
    // Enrich programs with university data
    return result.map(program => {
      const university = this.universities.get(program.universityId);
      if (!university) {
        throw new Error(`University with id ${program.universityId} not found`);
      }
      
      return {
        ...program,
        university: {
          name: university.name,
          location: university.location,
          imageUrl: university.imageUrl
        }
      };
    });
  }

  async getProgramById(id: number): Promise<ProgramWithUniversity | undefined> {
    const program = this.programs.get(id);
    if (!program) return undefined;
    
    const university = this.universities.get(program.universityId);
    if (!university) {
      throw new Error(`University with id ${program.universityId} not found`);
    }
    
    return {
      ...program,
      university: {
        name: university.name,
        location: university.location,
        imageUrl: university.imageUrl
      }
    };
  }

  async createProgram(insertProgram: InsertProgram): Promise<Program> {
    const id = this.programCurrentId++;
    const program: Program = { ...insertProgram, id };
    this.programs.set(id, program);
    return program;
  }

  // University methods
  async getUniversities(): Promise<University[]> {
    return Array.from(this.universities.values());
  }

  async getUniversityById(id: number): Promise<University | undefined> {
    return this.universities.get(id);
  }

  async createUniversity(insertUniversity: InsertUniversity): Promise<University> {
    const id = this.universityCurrentId++;
    const university: University = { ...insertUniversity, id };
    this.universities.set(id, university);
    return university;
  }

  // Utility methods
  async clearAll(): Promise<void> {
    this.programs.clear();
    this.universities.clear();
    this.programCurrentId = 1;
    this.universityCurrentId = 1;
  }
}

export const storage = new MemStorage();
