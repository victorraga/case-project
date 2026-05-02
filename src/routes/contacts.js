import express from 'express';
import { getDatabase } from '../db/database.js';

const router = express.Router();

// GET all contacts
router.get('/', (req, res, next) => {
  const db = getDatabase();
  const sql = 'SELECT * FROM contacts ORDER BY createdAt DESC';

  db.all(sql, (err, rows) => {
    if (err) {
      return next(err);
    }
    res.json(rows || []);
  });
});

// GET contact by id
router.get('/:id', (req, res, next) => {
  const db = getDatabase();
  const { id } = req.params;
  const sql = 'SELECT * FROM contacts WHERE id = ?';

  db.get(sql, [id], (err, row) => {
    if (err) {
      return next(err);
    }
    if (!row) {
      return res.status(404).json({ error: 'Contact not found' });
    }
    res.json(row);
  });
});

// CREATE new contact
router.post('/', (req, res, next) => {
  const db = getDatabase();
  const { firstName, lastName, email, phone, address, city, state, zipCode } = req.body;

  // Validation
  if (!firstName || !lastName || !email || !phone) {
    return res.status(400).json({
      error: 'Missing required fields: firstName, lastName, email, phone'
    });
  }

  const sql = `
    INSERT INTO contacts (firstName, lastName, email, phone, address, city, state, zipCode)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.run(
    sql,
    [firstName, lastName, email, phone, address || null, city || null, state || null, zipCode || null],
    function (err) {
      if (err) {
        if (err.message.includes('UNIQUE constraint failed')) {
          return res.status(409).json({ error: 'Email already exists' });
        }
        return next(err);
      }

      // Get the created contact
      db.get('SELECT * FROM contacts WHERE id = ?', [this.lastID], (err, row) => {
        if (err) {
          return next(err);
        }
        res.status(201).json(row);
      });
    }
  );
});

// UPDATE contact
router.put('/:id', (req, res, next) => {
  const db = getDatabase();
  const { id } = req.params;
  const { firstName, lastName, email, phone, address, city, state, zipCode } = req.body;

  // Validation
  if (!firstName || !lastName || !email || !phone) {
    return res.status(400).json({
      error: 'Missing required fields: firstName, lastName, email, phone'
    });
  }

  const sql = `
    UPDATE contacts
    SET firstName = ?, lastName = ?, email = ?, phone = ?, address = ?, city = ?, state = ?, zipCode = ?, updatedAt = CURRENT_TIMESTAMP
    WHERE id = ?
  `;

  db.run(
    sql,
    [firstName, lastName, email, phone, address || null, city || null, state || null, zipCode || null, id],
    function (err) {
      if (err) {
        if (err.message.includes('UNIQUE constraint failed')) {
          return res.status(409).json({ error: 'Email already exists' });
        }
        return next(err);
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: 'Contact not found' });
      }

      // Get the updated contact
      db.get('SELECT * FROM contacts WHERE id = ?', [id], (err, row) => {
        if (err) {
          return next(err);
        }
        res.json(row);
      });
    }
  );
});

// DELETE contact
router.delete('/:id', (req, res, next) => {
  const db = getDatabase();
  const { id } = req.params;

  db.run('DELETE FROM contacts WHERE id = ?', [id], function (err) {
    if (err) {
      return next(err);
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'Contact not found' });
    }

    res.json({ message: 'Contact deleted successfully', id: parseInt(id) });
  });
});

export default router;
