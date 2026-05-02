# Security Considerations

This document outlines the security practices and considerations for the Contacts Book API.

## SSL/TLS Certificate Management

### Development & Testing

For development and testing purposes, this project uses self-signed SSL certificates. These are generated using OpenSSL and are not suitable for production without proper certificate authority (CA) validation.

**⚠️ Important:** 
- Never commit SSL certificates or private keys to version control
- All `.pem`, `.key`, `.cert`, `.crt` files are excluded from git
- The `server.pem` file is regenerated on each setup/installation

### Certificate Generation

The self-signed certificate is automatically generated during setup:

```bash
npm install  # Certificate generated via postinstall hook
# OR
npm run setup
# OR manually
npm run generate-cert
```

**Certificate Details:**
- Algorithm: RSA 4096-bit
- Self-signed: Yes
- Common Name: localhost
- Valid for: 365 days
- Subject: CN=localhost

### Production Deployments

For production deployments:

1. **Use a proper Certificate Authority (CA)**
   - Obtain certificates from a trusted CA (Let's Encrypt, DigiCert, etc.)
   - Implement certificate renewal automated processes
   - Use ACME clients for Let's Encrypt certificates

2. **Environment-based Certificate Management**
   ```bash
   # Store certificates in environment or secret management systems:
   # - AWS Secrets Manager
   # - HashiCorp Vault
   # - Kubernetes Secrets
   # - Docker Secrets
   # - Environment variables (for testing only)
   ```

3. **Certificate Rotation**
   - Implement automated certificate renewal
   - Monitor certificate expiration dates
   - Set up alerts for expiring certificates

## Sensitive Data Protection

### Files Never Committed to Git

The following types of files are explicitly ignored:

```
*.pem       # PEM certificates and keys
*.key       # Private/public keys
*.cert      # Certificate files
*.crt       # Certificate files
*.p12       # PKCS#12 keystores
*.pfx       # Personal Information Exchange files
*.jks       # Java KeyStore files
```

### Environment Variables

Sensitive configuration should use environment variables:

```bash
# .env (never committed)
DATABASE_URL=...
API_KEY=...
SECRET=...
```

## HTTPS Security

### Features Implemented

- ✓ HTTPS/TLS encryption for all communication
- ✓ Helmet.js security headers
- ✓ CORS protection
- ✓ Input validation on all endpoints
- ✓ Error handling without information disclosure

### Recommended Headers (Helmet.js)

The application uses Helmet.js which automatically sets:

```
X-Frame-Options: DENY          # Prevent clickjacking
X-Content-Type-Options: nosniff # Prevent MIME sniffing
X-XSS-Protection: 1; mode=block # XSS protection
Strict-Transport-Security      # HSTS for HTTPS enforcement
```

## Database Security

### SQLite Best Practices

1. **File Permissions**
   ```bash
   chmod 600 contacts.db  # Owner read/write only
   ```

2. **Database Backups**
   - Include database in backup strategy
   - Never backup to public locations
   - Encrypt backups at rest

3. **Data Validation**
   - All inputs are validated before database operations
   - SQL injection prevented through parameterized queries
   - Email uniqueness constraint enforced at database level

## Dependencies Security

### Vulnerability Scanning

Regular security scanning with tools like:
- Trivy (filesystem and container scanning)
- npm audit
- Snyk

```bash
npm audit                    # Check for vulnerable dependencies
trivy fs .                   # Scan container and imports
```

### Dependency Updates

Keep dependencies updated:

```bash
npm outdated               # Check for outdated packages
npm update                 # Update packages
npm audit fix              # Fix known vulnerabilities
```

## Application Security

### Input Validation

All API endpoints validate input:

```javascript
// Required fields validation
if (!firstName || !lastName || !email || !phone) {
  return res.status(400).json({ error: 'Missing required fields' });
}
```

### Error Handling

Error messages are generic to prevent information disclosure:

```javascript
// Don't expose internal details
res.status(500).json({ error: 'Internal server error' });

// Not: error: 'Database query failed at line 42 in ...'
```

### CORS Configuration

CORS is enabled but can be restricted:

```javascript
app.use(cors()); // Allow all origins in development

// For production, restrict:
app.use(cors({
  origin: 'https://yourdomain.com',
  credentials: true
}));
```

## Docker Security

### Container Image Security

- Use minimal base images (alpine)
- Don't run as root
- Scan images for vulnerabilities

```bash
docker build -t contacts-book-api .
trivy image contacts-book-api
```

### Secrets Management

For Docker/Kubernetes:

```yaml
services:
  api:
    environment:
      - NODE_ENV=production
    # Don't pass secrets via environment in production
    # Use Docker secrets or Kubernetes secrets instead
```

## Testing Security

The test suite validates:
- Input validation errors
- 404 handling (no information disclosure)
- Duplicate entry prevention
- Authorization/access control

```bash
npm test
```

## Compliance Checklist

- ✓ No private keys in version control
- ✓ HTTPS enabled for all communication
- ✓ Input validation on all endpoints
- ✓ Secure error handling
- ✓ Security headers configured
- ✓ Dependencies scanned for vulnerabilities
- ✓ Database file permissions restricted
- ✓ CORS configured appropriately

## Reporting Security Issues

If you discover a security vulnerability, please email security@example.com with:

1. Description of the vulnerability
2. Steps to reproduce
3. Potential impact
4. Suggested fix (if available)

**Do not** open public GitHub issues for security vulnerabilities.

## Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [NIST Cybersecurity Framework](https://www.nist.gov/cyberframework)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [Express.js Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [HTTPS Certificate Best Practices](https://cheatsheetseries.owasp.org/cheatsheets/Transport_Layer_Protection_Cheat_Sheet.html)
