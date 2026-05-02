#!/usr/bin/env node
/**
 * Setup script for Contacts Book API
 * Ensures SSL certificate exists before starting the application
 */

import fs from 'fs';
import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CERT_PATH = path.join(__dirname, 'server.pem');

console.log('🔐 Contacts Book API - Setup Script');
console.log('====================================\n');

// Check if SSL certificate exists
if (fs.existsSync(CERT_PATH)) {
  console.log('✓ SSL certificate found (server.pem)\n');
} else {
  console.log('⚠️  SSL certificate not found. Generating self-signed certificate...');
  try {
    execSync('npm run generate-cert', {
      stdio: 'inherit',
      cwd: __dirname
    });
    console.log('✓ SSL certificate generated (server.pem)\n');
  } catch (error) {
    console.error('✗ Failed to generate SSL certificate:', error.message);
    process.exit(1);
  }
}

console.log('✓ Setup complete! You can now run:\n');
console.log('  npm start        - Start production server');
console.log('  npm run dev      - Start development server with hot reload');
console.log('  npm test         - Run tests\n');
console.log('The HTTPS API will be available at https://localhost:3000\n');
