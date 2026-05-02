import { getDatabase } from './database.js';

const sampleContacts = [
  {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phone: '555-0101',
    address: '123 Main St',
    city: 'Springfield',
    state: 'IL',
    zipCode: '62701'
  },
  {
    firstName: 'Jane',
    lastName: 'Smith',
    email: 'jane.smith@example.com',
    phone: '555-0102',
    address: '456 Oak Ave',
    city: 'Chicago',
    state: 'IL',
    zipCode: '60601'
  },
  {
    firstName: 'Michael',
    lastName: 'Johnson',
    email: 'michael.johnson@example.com',
    phone: '555-0103',
    address: '789 Pine Rd',
    city: 'Naperville',
    state: 'IL',
    zipCode: '60540'
  },
  {
    firstName: 'Emily',
    lastName: 'Williams',
    email: 'emily.williams@example.com',
    phone: '555-0104',
    address: '321 Elm St',
    city: 'Evanston',
    state: 'IL',
    zipCode: '60201'
  },
  {
    firstName: 'David',
    lastName: 'Brown',
    email: 'david.brown@example.com',
    phone: '555-0105',
    address: '654 Maple Dr',
    city: 'Aurora',
    state: 'IL',
    zipCode: '60504'
  },
  {
    firstName: 'Sarah',
    lastName: 'Davis',
    email: 'sarah.davis@example.com',
    phone: '555-0106',
    address: '987 Cedar Ln',
    city: 'Rockford',
    state: 'IL',
    zipCode: '61101'
  },
  {
    firstName: 'Robert',
    lastName: 'Miller',
    email: 'robert.miller@example.com',
    phone: '555-0107',
    address: '147 Birch Dr',
    city: 'Joliet',
    state: 'IL',
    zipCode: '60432'
  },
  {
    firstName: 'Jennifer',
    lastName: 'Wilson',
    email: 'jennifer.wilson@example.com',
    phone: '555-0108',
    address: '258 Spruce Ave',
    city: 'Peoria',
    state: 'IL',
    zipCode: '61601'
  },
  {
    firstName: 'William',
    lastName: 'Moore',
    email: 'william.moore@example.com',
    phone: '555-0109',
    address: '369 Ash St',
    city: 'Springfield',
    state: 'MO',
    zipCode: '65801'
  },
  {
    firstName: 'Lisa',
    lastName: 'Taylor',
    email: 'lisa.taylor@example.com',
    phone: '555-0110',
    address: '741 Walnut Rd',
    city: 'Kansas City',
    state: 'MO',
    zipCode: '64105'
  }
];

export const seedDatabase = () => {
  return new Promise((resolve, reject) => {
    const db = getDatabase();

    // Check if table already has data
    db.get('SELECT COUNT(*) as count FROM contacts', (err, row) => {
      if (err) {
        reject(err);
        return;
      }

      if (row.count > 0) {
        console.log('Database already has contacts, skipping seed');
        resolve();
        return;
      }

      // Insert sample contacts
      const insertSql = `
        INSERT INTO contacts (firstName, lastName, email, phone, address, city, state, zipCode)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `;

      let completed = 0;
      sampleContacts.forEach((contact) => {
        db.run(
          insertSql,
          [
            contact.firstName,
            contact.lastName,
            contact.email,
            contact.phone,
            contact.address,
            contact.city,
            contact.state,
            contact.zipCode
          ],
          (err) => {
            if (err) {
              reject(err);
            }
            completed++;
            if (completed === sampleContacts.length) {
              console.log('Database seeded with 10 sample contacts');
              resolve();
            }
          }
        );
      });
    });
  });
};
