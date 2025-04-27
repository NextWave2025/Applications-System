import { db } from './db';
import { users } from '@shared/schema';
import { eq } from 'drizzle-orm';
import { scrypt, randomBytes } from 'crypto';
import { promisify } from 'util';

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString('hex');
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString('hex')}.${salt}`;
}

/**
 * Script to create an admin user
 */
async function createAdminUser(
  email: string,
  password: string,
  firstName: string,
  lastName: string
) {
  console.log(`Creating admin user: ${email}`);
  
  try {
    // First check if user exists
    const existingUser = await db.select().from(users).where(eq(users.username, email));
    
    if (existingUser.length > 0) {
      // User exists, update to admin if not already
      if (existingUser[0].role !== 'admin') {
        await db.update(users)
          .set({ 
            role: 'admin',
            firstName,
            lastName 
          })
          .where(eq(users.id, existingUser[0].id));
        console.log(`User ${email} updated to admin role.`);
      } else {
        console.log(`User ${email} is already an admin.`);
      }
    } else {
      // Create new admin user
      const hashedPassword = await hashPassword(password);
      
      const [newUser] = await db.insert(users)
        .values({
          username: email,
          password: hashedPassword,
          firstName,
          lastName,
          role: 'admin'
        })
        .returning();
      
      console.log(`Admin user created with ID: ${newUser.id}`);
    }
    
    console.log('Admin user operation completed successfully');
  } catch (error) {
    console.error('Error creating/updating admin user:', error);
    process.exit(1);
  }
}

// Get command line arguments
const args = process.argv.slice(2);

if (args.length < 4) {
  console.error('Usage: tsx server/create-admin.ts <email> <password> <firstName> <lastName>');
  process.exit(1);
}

const [email, password, firstName, lastName] = args;

// Run the create admin function
createAdminUser(email, password, firstName, lastName)
  .then(() => process.exit(0))
  .catch(err => {
    console.error('Unhandled error:', err);
    process.exit(1);
  });