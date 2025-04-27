import { Router, Request, Response } from 'express';
import { requireAdmin, auditAdminAction } from '../middleware/admin';
import { db } from '../db';
import { users, applications, auditLogs, insertAuditLogSchema } from '@shared/schema';
import { eq, desc, and, sql, inArray, not, asc } from 'drizzle-orm';
import { storage } from '../storage';

// Create admin router
const adminRouter = Router();

// Apply admin middleware to all routes
adminRouter.use(requireAdmin);

/**
 * Get all users (for admin user management)
 * GET /api/admin/users
 */
adminRouter.get('/users', async (req: Request, res: Response) => {
  try {
    const allUsers = await db.select({
      id: users.id, 
      username: users.username, 
      firstName: users.firstName, 
      lastName: users.lastName,
      agencyName: users.agencyName,
      country: users.country,
      phoneNumber: users.phoneNumber,
      website: users.website,
      role: users.role,
      active: users.active,
      createdAt: users.createdAt
    })
    .from(users)
    .orderBy(desc(users.createdAt));
    
    return res.status(200).json(allUsers);
  } catch (error) {
    console.error('Error fetching users:', error);
    return res.status(500).json({ error: 'Failed to fetch users' });
  }
});

/**
 * Get user details by ID
 * GET /api/admin/users/:id
 */
adminRouter.get('/users/:id', async (req: Request, res: Response) => {
  try {
    const userId = Number(req.params.id);
    if (isNaN(userId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }
    
    const [user] = await db.select({
      id: users.id, 
      username: users.username, 
      firstName: users.firstName, 
      lastName: users.lastName,
      agencyName: users.agencyName,
      country: users.country,
      phoneNumber: users.phoneNumber,
      website: users.website,
      role: users.role,
      active: users.active,
      createdAt: users.createdAt
    })
    .from(users)
    .where(eq(users.id, userId));
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    return res.status(200).json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    return res.status(500).json({ error: 'Failed to fetch user' });
  }
});

/**
 * Create a new agent user
 * POST /api/admin/users
 */
adminRouter.post(
  '/users', 
  auditAdminAction('create', 'user'),
  async (req: Request, res: Response) => {
    try {
      const { username, password, firstName, lastName, agencyName, country, phoneNumber, website } = req.body;
      
      // Validate required fields
      if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
      }
      
      // Check if username already exists
      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(400).json({ error: 'Username already exists' });
      }
      
      // Create new agent user
      const newUser = await storage.createUser({
        username,
        password,
        firstName,
        lastName,
        agencyName,
        country,
        phoneNumber,
        website,
        role: 'agent' // Force role to be agent (admins can only be created through CLI)
      });
      
      // Exclude password from response
      const { password: _, ...userWithoutPassword } = newUser;
      
      return res.status(201).json(userWithoutPassword);
    } catch (error) {
      console.error('Error creating user:', error);
      return res.status(500).json({ error: 'Failed to create user' });
    }
  }
);

/**
 * Update user (excluding role changes)
 * PUT /api/admin/users/:id
 */
adminRouter.put(
  '/users/:id', 
  auditAdminAction('update', 'user'),
  async (req: Request, res: Response) => {
    try {
      const userId = Number(req.params.id);
      if (isNaN(userId)) {
        return res.status(400).json({ error: 'Invalid user ID' });
      }
      
      // Get current user data
      const [currentUser] = await db.select()
        .from(users)
        .where(eq(users.id, userId));
      
      if (!currentUser) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      // Prevent updating admin users if they're not the current admin
      if (currentUser.role === 'admin' && currentUser.id !== req.user?.id) {
        return res.status(403).json({ error: 'Cannot modify other admin users' });
      }
      
      // Prepare update data
      const { role, ...updateData } = req.body;
      
      // Update user, excluding role (which cannot be changed)
      const [updatedUser] = await db.update(users)
        .set(updateData)
        .where(eq(users.id, userId))
        .returning();
      
      // Exclude password from response
      const { password, ...userWithoutPassword } = updatedUser;
      
      return res.status(200).json(userWithoutPassword);
    } catch (error) {
      console.error('Error updating user:', error);
      return res.status(500).json({ error: 'Failed to update user' });
    }
  }
);

/**
 * Activate/deactivate user account
 * PUT /api/admin/users/:id/status
 */
adminRouter.put(
  '/users/:id/status', 
  auditAdminAction('update-status', 'user'),
  async (req: Request, res: Response) => {
    try {
      const userId = Number(req.params.id);
      if (isNaN(userId)) {
        return res.status(400).json({ error: 'Invalid user ID' });
      }
      
      const { active } = req.body;
      if (typeof active !== 'boolean') {
        return res.status(400).json({ error: 'Active status must be a boolean' });
      }
      
      // Get current user data
      const [currentUser] = await db.select()
        .from(users)
        .where(eq(users.id, userId));
      
      if (!currentUser) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      // Prevent deactivating admin users
      if (currentUser.role === 'admin') {
        return res.status(403).json({ error: 'Cannot change status of admin users' });
      }
      
      // Update user active status
      const [updatedUser] = await db.update(users)
        .set({ active })
        .where(eq(users.id, userId))
        .returning();
      
      // Exclude password from response
      const { password, ...userWithoutPassword } = updatedUser;
      
      // Create audit log
      await db.insert(auditLogs).values({
        userId: req.user?.id!,
        action: active ? 'activate-user' : 'deactivate-user',
        resourceType: 'user',
        resourceId: userId,
        previousData: { active: currentUser.active },
        newData: { active },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent') || ''
      });
      
      return res.status(200).json(userWithoutPassword);
    } catch (error) {
      console.error('Error updating user status:', error);
      return res.status(500).json({ error: 'Failed to update user status' });
    }
  }
);

/**
 * Get all applications (for admin application management)
 * GET /api/admin/applications
 */
adminRouter.get('/applications', async (req: Request, res: Response) => {
  try {
    // Get query parameters for filtering
    const { status, userId, search } = req.query;
    
    // Fetch all applications with details
    const allApplications = await storage.getAllApplications({
      status: status as string,
      userId: userId ? Number(userId) : undefined,
      search: search as string
    });
    
    return res.status(200).json(allApplications);
  } catch (error) {
    console.error('Error fetching applications:', error);
    return res.status(500).json({ error: 'Failed to fetch applications' });
  }
});

/**
 * Update application status (admin can only update status)
 * PUT /api/admin/applications/:id/status
 */
adminRouter.put(
  '/applications/:id/status', 
  auditAdminAction('update-status', 'application'),
  async (req: Request, res: Response) => {
    try {
      const applicationId = Number(req.params.id);
      if (isNaN(applicationId)) {
        return res.status(400).json({ error: 'Invalid application ID' });
      }
      
      const { status } = req.body;
      if (!status) {
        return res.status(400).json({ error: 'Status is required' });
      }
      
      // Get current application
      const currentApplication = await storage.getApplicationById(applicationId);
      if (!currentApplication) {
        return res.status(404).json({ error: 'Application not found' });
      }
      
      // Update application status
      const updatedApplication = await storage.updateApplicationStatus(applicationId, status);
      
      // Create audit log entry
      await db.insert(auditLogs).values({
        userId: req.user?.id!,
        action: 'update-application-status',
        resourceType: 'application',
        resourceId: applicationId,
        previousData: { status: currentApplication.status },
        newData: { status },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent') || ''
      });
      
      return res.status(200).json(updatedApplication);
    } catch (error) {
      console.error('Error updating application status:', error);
      return res.status(500).json({ error: 'Failed to update application status' });
    }
  }
);

/**
 * Get audit logs
 * GET /api/admin/audit-logs
 */
adminRouter.get('/audit-logs', async (req: Request, res: Response) => {
  try {
    // Get query parameters for filtering
    const { userId, resourceType, resourceId, action } = req.query;
    
    // Build query
    let query = db.select()
      .from(auditLogs)
      .orderBy(desc(auditLogs.createdAt));
    
    // Apply filters
    if (userId) {
      query = query.where(eq(auditLogs.userId, Number(userId)));
    }
    
    if (resourceType) {
      query = query.where(eq(auditLogs.resourceType, resourceType as string));
    }
    
    if (resourceId) {
      query = query.where(eq(auditLogs.resourceId, Number(resourceId)));
    }
    
    if (action) {
      query = query.where(eq(auditLogs.action, action as string));
    }
    
    // Execute query
    const logs = await query;
    
    return res.status(200).json(logs);
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    return res.status(500).json({ error: 'Failed to fetch audit logs' });
  }
});

/**
 * Get admin dashboard statistics
 * GET /api/admin/stats
 */
adminRouter.get('/stats', async (req: Request, res: Response) => {
  try {
    // Get total applications count
    const [applicationsCount] = await db.select({ count: sql<number>`count(*)` })
      .from(applications);
    
    // Get pending applications count
    const [pendingCount] = await db.select({ count: sql<number>`count(*)` })
      .from(applications)
      .where(eq(applications.status, 'submitted'));
    
    // Get approved applications count
    const [approvedCount] = await db.select({ count: sql<number>`count(*)` })
      .from(applications)
      .where(eq(applications.status, 'approved'));
    
    // Get active agents count
    const [agentsCount] = await db.select({ count: sql<number>`count(*)` })
      .from(users)
      .where(and(
        eq(users.role, 'agent'),
        eq(users.active, true)
      ));
    
    // Get total students count (unique student emails across applications)
    const [studentsCount] = await db.select({ 
      count: sql<number>`count(distinct ${applications.studentEmail})` 
    })
    .from(applications);
    
    // Get total universities count
    const [universitiesCount] = await db.select({ count: sql<number>`count(*)` })
      .from(sql`universities`);
    
    return res.status(200).json({
      totalApplications: applicationsCount.count,
      pendingReviews: pendingCount.count,
      approvedApplications: approvedCount.count,
      activeAgents: agentsCount.count,
      totalStudents: studentsCount.count,
      totalUniversities: universitiesCount.count
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return res.status(500).json({ error: 'Failed to fetch admin statistics' });
  }
});

export default adminRouter;