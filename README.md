# Contacts Book API

A minimal, production-ready contacts management REST API built with Node.js, Express, and SQLite. The application provides complete CRUD operations for managing contacts with HTTPS support and comprehensive test coverage.

## Features

- ✅ Full CRUD operations for contacts
- ✅ 10 sample contacts pre-seeded in database
- ✅ HTTPS support with self-signed SSL certificate
- ✅ RESTful API design
- ✅ Input validation and error handling
- ✅ 14 comprehensive test cases with Vitest
- ✅ Docker and Docker Compose support
- ✅ SQLite database for persistent storage
- ✅ Health check endpoint
- ✅ CORS and security middleware (Helmet)

## Tech Stack

- **Runtime**: Node.js 18+
- **Server**: Express.js
- **Database**: SQLite3
- **Testing**: Vitest + Supertest
- **Containerization**: Docker & Docker Compose
- **Security**: HTTPS with self-signed certificate, Helmet, CORS

## Project Structure

```
case-project/
├── src/
│   ├── index.js                 # Application entry point
│   ├── app.js                   # Express app configuration
│   ├── routes/
│   │   └── contacts.js          # Contact CRUD routes
│   └── db/
│       ├── database.js          # Database initialization
│       └── seed.js              # Sample data seeding
├── tests/
│   └── api.test.js              # Comprehensive API tests
├── server.pem                   # Self-signed SSL certificate
├── Dockerfile                   # Docker container definition
├── docker-compose.yml           # Docker Compose configuration
├── vitest.config.js             # Vitest configuration
├── package.json                 # Project metadata and scripts
└── README.md                    # This file
```

## Installation

### Prerequisites

- Node.js 18 or higher
- npm 9 or higher
- Docker and Docker Compose (for containerized deployment)
- OpenSSL (for SSL certificate generation)

### Local Development Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/victorraga/case-project.git
   cd case-project
   ```

2. **Install dependencies and setup (automatic):**
   ```bash
   npm install
   ```
   
   This automatically generates a self-signed SSL certificate during installation.
   The certificate will be created at `server.pem` and added to `.gitignore`.

3. **Alternative manual setup:**
   ```bash
   npm run setup
   ```
   
   Or manually generate the certificate:
   ```bash
   npm run generate-cert
   ```

4. **Start the server:**
   ```bash
   npm start
   ```

   The server will start on `https://localhost:3000`

## NPM Scripts

### Development

```bash
# Start server with hot reload
npm run dev

# Start production server
npm start

# Generate self-signed SSL certificate
npm run generate-cert

# Reset database and certificate
npm run db:reset
```

### Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with UI
npm run test:ui

# Generate coverage report
npm run test:coverage
```

### Building for Production

```bash
# Build Docker image
docker build -t contacts-book-api .

# Run with Docker Compose
docker-compose up

# Stop services
docker-compose down
```

## API Endpoints

All endpoints require HTTPS and return JSON responses.

### Health Check

```http
GET /health
```

Response:
```json
{
  "status": "ok",
  "timestamp": "2026-05-01T23:04:35.123Z"
}
```

### Get All Contacts

```http
GET /api/contacts
```

Response: Array of contacts

### Get Contact by ID

```http
GET /api/contacts/:id
```

Response: Single contact object

### Create Contact

```http
POST /api/contacts
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "phone": "555-1234",
  "address": "123 Main St",
  "city": "Springfield",
  "state": "IL",
  "zipCode": "62701"
}
```

**Required fields**: `firstName`, `lastName`, `email`, `phone`

Response: Created contact with ID (HTTP 201)

### Update Contact

```http
PUT /api/contacts/:id
Content-Type: application/json

{
  "firstName": "Jane",
  "lastName": "Smith",
  "email": "jane@example.com",
  "phone": "555-5678",
  "address": "456 Oak Ave",
  "city": "Chicago",
  "state": "IL",
  "zipCode": "60601"
}
```

**Required fields**: `firstName`, `lastName`, `email`, `phone`

Response: Updated contact object

### Delete Contact

```http
DELETE /api/contacts/:id
```

Response:
```json
{
  "message": "Contact deleted successfully",
  "id": 1
}
```

## Sample Contacts

The database is pre-populated with 10 sample contacts:

1. John Doe (Springfield, IL)
2. Jane Smith (Chicago, IL)
3. Michael Johnson (Naperville, IL)
4. Emily Williams (Evanston, IL)
5. David Brown (Aurora, IL)
6. Sarah Davis (Rockford, IL)
7. Robert Miller (Joliet, IL)
8. Jennifer Wilson (Peoria, IL)
9. William Moore (Springfield, MO)
10. Lisa Taylor (Kansas City, MO)

## Testing

The application includes 14 comprehensive test cases covering:

- Health check endpoint
- GET all contacts
- GET contact by ID (existing and non-existent)
- POST new contact (success and validation)
- Duplicate email handling
- PUT contact updates (success and validation)
- DELETE contact (success and not found)
- 404 error handling

**Run tests:**
```bash
npm test
```

**Expected output:**
```
✓ tests/api.test.js (14 tests) 170ms

Test Files  1 passed (1)
     Tests  14 passed (14)
```

## Database

### Schema

```sql
CREATE TABLE contacts (
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
```

- Database file: `contacts.db` (SQLite)
- Automatically created on first run
- Pre-populated with 10 sample entries
- Email field is unique (no duplicates allowed)

## Security

### Secure by Default

- **HTTPS**: Self-signed SSL certificate for encrypted communication (automatically generated)
- **Helmet**: Security headers middleware for defense against common attacks
- **CORS**: Cross-Origin Resource Sharing controlled access
- **Input Validation**: Request body validation on all endpoints
- **Error Handling**: Centralized error handling without information disclosure
- **No Secrets in VCS**: Private keys and sensitive files excluded from git

### Certificate Security

The SSL certificate is **never committed to version control**:

- Auto-generated during `npm install`
- Stored in `.gitignore` with all cryptographic material
- Can be regenerated any time: `npm run generate-cert`
- For production, use certificates from a trusted CA

### For Detailed Security Information

See [SECURITY.md](SECURITY.md) for:
- Certificate management best practices
- Production deployment guidelines
- Dependency vulnerability scanning
- Data protection recommendations
- Compliance considerations

## Docker Deployment

### Build and Run Locally

```bash
# Build Docker image
docker build -t contacts-book-api:latest .

# Run container
docker run -p 3000:3000 contacts-book-api:latest
```

### Using Docker Compose

```bash
# Start services
docker-compose up -d

# View logs
docker-compose logs -f contacts-api

# Stop services
docker-compose down
```

### Docker Configuration

- **Base Image**: node:18-alpine (lightweight, secure)
- **Exposed Port**: 3000 (HTTPS)
- **Health Check**: Automatic endpoint monitoring
- **Volume**: Database persistence with Docker named volume
- **Restart Policy**: Auto-restart on failure

## Environment Variables

```bash
# Optional: Set custom database path
DB_PATH=/path/to/contacts.db

# Optional: Set port (default: 3000)
PORT=3000

# Optional: Production/development mode
NODE_ENV=production
```

## Troubleshooting

### SSL Certificate Issues

If you see "SSL certificate not found" error:
```bash
npm run generate-cert
```

### Database Issues

Reset database to fresh state:
```bash
npm run db:reset
```

### Port Already in Use

Change the port:
```bash
PORT=3001 npm start
```

## Testing with cURL

Test the health endpoint:
```bash
curl -k https://localhost:3000/health
```

Get all contacts:
```bash
curl -k https://localhost:3000/api/contacts
```

Create a contact:
```bash
curl -k -X POST https://localhost:3000/api/contacts \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Alice",
    "lastName": "Johnson",
    "email": "alice@example.com",
    "phone": "555-9999",
    "city": "Boston"
  }'
```

## Performance Considerations

- SQLite is suitable for the current volume (10+ contacts)
- For production with millions of records, consider PostgreSQL
- Database queries are optimized with proper indexing
- Connection pooling is handled by SQLite3 driver

## License

ISC

## Author

Victor Raga

## Contributing

1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Ensure all tests pass: `npm test`
5. Submit a pull request
