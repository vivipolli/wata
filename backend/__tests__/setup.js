import dotenv from 'dotenv';
import path from 'path';
// Load test environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env.test') });
// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.DB_PATH = ':memory:'; // Use in-memory SQLite for tests
process.env.PORT = '0'; // Use random available port
//# sourceMappingURL=setup.js.map