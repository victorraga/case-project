import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import { createApp } from '../src/app.js';
import { setDatabase, closeDatabase } from '../src/db/database.js';
import request from 'supertest';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const TEST_DB_PATH = path.join(__dirname, '../test-contacts.db');

let db;
let app;

// Setup test database
const initTestDatabase = () => {
  return new Promise((resolve, reject) => {
    db = new sqlite3.Database(TEST_DB_PATH, (err) => {
      if (err) reject(err);
      else {
        const sql = `
          CREATE TABLE IF NOT EXISTS contacts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            firstName TEXT NOT NULL,
            lastName TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE,
            phone TEXT NOT NULL,
            address TEXT,
            city TEXT,
            state TEXT,
            zipCode TEXT,
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
            updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
          )
        `;
        db.run(sql, (err) => {
          if (err) reject(err);
          else resolve();
        });
      }
    });
  });
};

const clearTestDatabase = () => {
  return new Promise((resolve, reject) => {
    db.run('DELETE FROM contacts', (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
};

describe('Contacts API', () => {
  beforeAll(async () => {
    await initTestDatabase();
    setDatabase(db);
    app = createApp();
  });

  afterAll(async () => {
    await closeDatabase();
    return new Promise((resolve, reject) => {
      if (db && db.open) {
        db.close((err) => {
          if (err) reject(err);
          else resolve();
        });
      } else {
        resolve();
      }
    });
  });

  beforeEach(async () => {
    await clearTestDatabase();
  });

  describe('GET /health', () => {
    it('should return health status', async () => {
      const res = await request(app).get('/health');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('ok');
      expect(res.body.timestamp).toBeDefined();
    });
  });

  describe('GET /api/contacts', () => {
    it('should return empty array when no contacts exist', async () => {
      const res = await request(app).get('/api/contacts');
      expect(res.status).toBe(200);
      expect(res.body).toEqual([]);
    });

    it('should return all contacts', async () => {
      // Insert a contact
      await new Promise((resolve, reject) => {
        db.run(
          'INSERT INTO contacts (firstName, lastName, email, phone) VALUES (?, ?, ?, ?)',
          ['John', 'Doe', 'john@example.com', '555-1234'],
          (err) => {
            if (err) reject(err);
            else resolve();
          }
        );
      });

      const res = await request(app).get('/api/contacts');
      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(1);
      expect(res.body[0].firstName).toBe('John');
    });
  });

  describe('GET /api/contacts/:id', () => {
    it('should return 404 for non-existent contact', async () => {
      const res = await request(app).get('/api/contacts/999');
      expect(res.status).toBe(404);
      expect(res.body.error).toBe('Contact not found');
    });

    it('should return contact by id', async () => {
      // Insert a contact
      const id = await new Promise((resolve, reject) => {
        db.run(
          'INSERT INTO contacts (firstName, lastName, email, phone) VALUES (?, ?, ?, ?)',
          ['Jane', 'Smith', 'jane@example.com', '555-5678'],
          function (err) {
            if (err) reject(err);
            else resolve(this.lastID);
          }
        );
      });

      const res = await request(app).get(`/api/contacts/${id}`);
      expect(res.status).toBe(200);
      expect(res.body.id).toBe(id);
      expect(res.body.firstName).toBe('Jane');
    });
  });

  describe('POST /api/contacts', () => {
    it('should return 400 for missing required fields', async () => {
      const res = await request(app)
        .post('/api/contacts')
        .send({ firstName: 'John' });
      expect(res.status).toBe(400);
      expect(res.body.error).toContain('Missing required fields');
    });

    it('should create a new contact', async () => {
      const res = await request(app)
        .post('/api/contacts')
        .send({
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com',
          phone: '555-1234',
          address: '123 Main St',
          city: 'Springfield',
          state: 'IL',
          zipCode: '62701'
        });

      expect(res.status).toBe(201);
      expect(res.body.id).toBeDefined();
      expect(res.body.firstName).toBe('John');
      expect(res.body.email).toBe('john.doe@example.com');
    });

    it('should return 409 for duplicate email', async () => {
      const contact = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        phone: '555-1234'
      };

      // Create first contact
      await request(app).post('/api/contacts').send(contact);

      // Try to create duplicate
      const res = await request(app)
        .post('/api/contacts')
        .send(contact);

      expect(res.status).toBe(409);
      expect(res.body.error).toContain('Email already exists');
    });
  });

  describe('PUT /api/contacts/:id', () => {
    it('should return 404 for non-existent contact', async () => {
      const res = await request(app)
        .put('/api/contacts/999')
        .send({
          firstName: 'Jane',
          lastName: 'Smith',
          email: 'jane@example.com',
          phone: '555-5678'
        });
      expect(res.status).toBe(404);
    });

    it('should return 400 for missing required fields', async () => {
      // Create contact first
      const createRes = await request(app)
        .post('/api/contacts')
        .send({
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          phone: '555-1234'
        });

      const res = await request(app)
        .put(`/api/contacts/${createRes.body.id}`)
        .send({ firstName: 'Jane' });

      expect(res.status).toBe(400);
    });

    it('should update a contact', async () => {
      // Create contact
      const createRes = await request(app)
        .post('/api/contacts')
        .send({
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          phone: '555-1234'
        });

      const id = createRes.body.id;

      const res = await request(app)
        .put(`/api/contacts/${id}`)
        .send({
          firstName: 'Jane',
          lastName: 'Smith',
          email: 'jane.smith@example.com',
          phone: '555-5678',
          city: 'Chicago'
        });

      expect(res.status).toBe(200);
      expect(res.body.id).toBe(id);
      expect(res.body.firstName).toBe('Jane');
      expect(res.body.city).toBe('Chicago');
    });
  });

  describe('DELETE /api/contacts/:id', () => {
    it('should return 404 for non-existent contact', async () => {
      const res = await request(app).delete('/api/contacts/999');
      expect(res.status).toBe(404);
    });

    it('should delete a contact', async () => {
      // Create contact
      const createRes = await request(app)
        .post('/api/contacts')
        .send({
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          phone: '555-1234'
        });

      const id = createRes.body.id;

      // Delete contact
      const deleteRes = await request(app).delete(`/api/contacts/${id}`);
      expect(deleteRes.status).toBe(200);
      expect(deleteRes.body.message).toBe('Contact deleted successfully');

      // Verify it's deleted
      const getRes = await request(app).get(`/api/contacts/${id}`);
      expect(getRes.status).toBe(404);
    });
  });

  describe('404 Handler', () => {
    it('should return 404 for unknown routes', async () => {
      const res = await request(app).get('/unknown-route');
      expect(res.status).toBe(404);
      expect(res.body.error).toBe('Not found');
    });
  });
});
