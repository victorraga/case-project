#!/bin/bash
set -e

echo "🔐 Contacts Book API - Setup Script"
echo "===================================="
echo ""

# Check if SSL certificate exists
if [ -f "server.pem" ]; then
  echo "✓ SSL certificate found (server.pem)"
else
  echo "⚠️  SSL certificate not found. Generating self-signed certificate..."
  npm run generate-cert
  echo "✓ SSL certificate generated (server.pem)"
fi

echo ""
echo "✓ Setup complete! You can now run:"
echo ""
echo "  npm start        - Start production server"
echo "  npm run dev      - Start development server with hot reload"
echo "  npm test         - Run tests"
echo ""
echo "The HTTPS API will be available at https://localhost:3000"
echo ""
