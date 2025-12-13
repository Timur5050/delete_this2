#!/bin/bash

# Linux Process Viewer - Setup Script

echo "🚀 Linux Process Viewer Setup"
echo "=============================="
echo ""

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL is not installed. Please install it first:"
    echo "   Ubuntu/Debian: sudo apt-get install postgresql"
    echo "   macOS: brew install postgresql"
    exit 1
fi

echo "✅ PostgreSQL found"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install it first:"
    echo "   Visit: https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js found ($(node --version))"
echo ""

# Setup Backend
echo "📦 Setting up Backend..."
cd backend
npm install

if [ ! -f .env ]; then
    echo "📝 Creating .env file with default values..."
    cp .env .env.bak
fi

echo "✅ Backend setup complete"
echo ""

# Setup Frontend
echo "📦 Setting up Frontend..."
cd ../frontend
npm install
echo "✅ Frontend setup complete"
echo ""

echo "=============================="
echo "✅ Setup Complete!"
echo ""
echo "Next steps:"
echo "1. Update backend/.env with your PostgreSQL credentials"
echo "2. Create the database: createdb process_viewer"
echo "3. Initialize the database: cd backend && npm run seed"
echo "4. Start backend: cd backend && npm run dev"
echo "5. Start frontend: cd frontend && npm start"
echo ""
echo "Frontend will open on: http://localhost:3000"
echo "Backend API: http://localhost:5000"
echo ""
