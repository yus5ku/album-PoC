#!/bin/bash

# Album Video API - Setup Script
set -e

echo "🚀 Starting API setup..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js v22+ first."
    exit 1
fi

echo "✓ Node.js version: $(node --version)"

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "⚠️  .env file not found. Please create one based on README.md"
    echo "   Example: DATABASE_URL, NEXTAUTH_SECRET, JWT_SECRET, etc."
    exit 1
fi

echo "✓ .env file found"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npm run prisma:generate

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "  1. Make sure MySQL is running (docker compose up -d mysql)"
echo "  2. Run migrations: npm run prisma:migrate"
echo "  3. Start dev server: npm run dev"
echo ""

