import { config } from 'dotenv';
import path from 'path';

// Load environment variables from .env.test file
config({ path: path.resolve(__dirname, '../../.env.test') });

// Add any global setup code here
beforeAll(() => {
    // Global setup if needed
});

afterAll(() => {
    // Global cleanup if needed
});