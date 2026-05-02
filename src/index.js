import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createApp } from './app.js';
import { initializeDatabase, createTables, closeDatabase } from './db/database.js';
import { seedDatabase } from './db/seed.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 3000;
const CERT_PATH = path.join(__dirname, '../server.pem');

/**
 * Validate SSL certificate exists and is readable
 */
const validateCertificate = () => {
  if (!fs.existsSync(CERT_PATH)) {
    console.error('\n❌ ERROR: SSL certificate not found at', CERT_PATH);
    console.error('\nTo fix this issue, run one of the following commands:\n');
    console.error('  Option 1 (Recommended): npm run setup');
    console.error('  Option 2: npm run generate-cert\n');
    console.error('This generates a self-signed certificate for local development/testing.\n');
    process.exit(1);
  }

  try {
    const cert = fs.readFileSync(CERT_PATH, 'utf8');
    if (!cert.includes('BEGIN') || !cert.includes('END')) {
      throw new Error('Invalid certificate format');
    }
    return cert;
  } catch (error) {
    console.error('\n❌ ERROR: Failed to read SSL certificate:', error.message);
    console.error('The certificate file may be corrupted. Try regenerating it:\n');
    console.error('  npm run generate-cert\n');
    process.exit(1);
  }
};

const startServer = async () => {
  try {
    // Validate SSL certificate before starting
    const cert = validateCertificate();

    // Initialize database
    await initializeDatabase();
    await createTables();
    await seedDatabase();

    // Create Express app
    const app = createApp();

    // Create HTTPS server
    const httpsServer = https.createServer({ cert, key: cert }, app);

    httpsServer.listen(PORT, () => {
      console.log('\n✓ HTTPS Server running on https://localhost:' + PORT);
      console.log('✓ Health check: https://localhost:' + PORT + '/health');
      console.log('✓ API Docs: https://localhost:' + PORT + '/api/contacts\n');
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      console.log('\n\nShutting down gracefully...');
      httpsServer.close(async () => {
        await closeDatabase();
        console.log('✓ Server stopped');
        process.exit(0);
      });
    });
  } catch (error) {
    console.error('\n❌ Failed to start server:', error.message);
    console.error('\nPlease check:\n');
    console.error('  1. SSL certificate exists: npm run generate-cert');
    console.error('  2. Database permissions are correct');
    console.error('  3. Port', PORT, 'is available\n');
    process.exit(1);
  }
};

startServer();
