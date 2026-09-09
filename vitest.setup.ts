process.env.SESSION_SECRET = process.env.SESSION_SECRET || 'x'.repeat(40);
process.env.DATABASE_URL = process.env.DATABASE_URL || 'file:./dev.db';