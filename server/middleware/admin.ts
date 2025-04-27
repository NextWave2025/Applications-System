import { Request, Response, NextFunction } from 'express';

/**
 * Middleware to check if user is authenticated and has admin role
 */
export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  // First check if user is authenticated
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  // Check if user has admin role
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }

  // User is authenticated and has admin role
  next();
}

/**
 * Middleware to check if the user is an admin OR the owner of the resource
 * For routes where admins can view/edit their own resources but also manage others
 */
export function requireAdminOrResourceOwner(resourceIdField: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    // First check if user is authenticated
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const resourceId = req.params[resourceIdField];
    
    // If user is admin, allow access
    if (req.user?.role === 'admin') {
      return next();
    }
    
    // If user is the owner of the resource, allow access
    // The specific check will depend on the resource
    const userId = req.user?.id;
    if (req.body.userId === userId || req.query.userId === userId) {
      return next();
    }
    
    // Otherwise, deny access
    return res.status(403).json({ error: 'Access forbidden' });
  };
}

/**
 * Middleware to log admin actions for auditing
 */
export function auditAdminAction(action: string, resourceType: string) {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Store original response methods
    const originalJson = res.json;
    const originalStatus = res.status;
    
    // Get user information
    const userId = req.user?.id;
    if (!userId) {
      return next();
    }
    
    // Store original request data
    const requestData = {
      body: req.body,
      params: req.params,
      query: req.query
    };
    
    // Override response.json method
    res.json = function(data) {
      // Log the action to audit log if successful (2xx status)
      if (res.statusCode >= 200 && res.statusCode < 300) {
        try {
          const resourceId = Number(req.params.id) || Number(req.body.id);
          
          // Create audit log
          // Note: We would normally call the database here to create the log,
          // but we'll handle this in the routes for now
          console.log('[AUDIT]', {
            userId,
            action,
            resourceType,
            resourceId,
            previousData: requestData,
            newData: data,
            ipAddress: req.ip,
            userAgent: req.get('User-Agent')
          });
        } catch (err) {
          console.error('Error creating audit log:', err);
        }
      }
      
      // Call original method
      return originalJson.call(res, data);
    };
    
    next();
  };
}