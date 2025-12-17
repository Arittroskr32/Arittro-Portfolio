#!/bin/bash

echo "============================================"
echo "  Portfolio Website Setup Script"
echo "  Arittro Sarkar"
echo "============================================"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js is not installed!"
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi

echo "[1/6] Node.js detected:" 
node --version
echo ""

# Check if MySQL is accessible
if ! command -v mysql &> /dev/null; then
    echo "WARNING: MySQL CLI not found in PATH"
    echo "Make sure MySQL is installed and running"
    echo ""
else
    echo "[2/6] MySQL detected:"
    mysql --version
    echo ""
fi

# Install backend dependencies
echo "[3/6] Installing backend dependencies..."
cd backend || exit 1
if [ ! -f "package.json" ]; then
    echo "ERROR: backend/package.json not found!"
    exit 1
fi
npm install
if [ $? -ne 0 ]; then
    echo "ERROR: Failed to install backend dependencies"
    exit 1
fi
cd ..
echo "Backend dependencies installed successfully!"
echo ""

# Install frontend dependencies  
echo "[4/6] Installing frontend dependencies..."
if [ ! -f "package.json" ]; then
    echo "ERROR: package.json not found!"
    exit 1
fi
npm install
if [ $? -ne 0 ]; then
    echo "ERROR: Failed to install frontend dependencies"
    exit 1
fi
echo "Frontend dependencies installed successfully!"
echo ""

# Setup environment files
echo "[5/6] Setting up environment files..."

if [ ! -f ".env" ]; then
    if [ -f ".env.example" ]; then
        cp ".env.example" ".env"
        echo "Created frontend .env file"
    else
        echo "WARNING: .env.example not found"
    fi
else
    echo "Frontend .env already exists"
fi

if [ ! -f "backend/.env" ]; then
    if [ -f "backend/.env.example" ]; then
        cp "backend/.env.example" "backend/.env"
        echo "Created backend .env file"
        echo ""
        echo "IMPORTANT: Edit backend/.env with your MySQL credentials!"
    else
        echo "WARNING: backend/.env.example not found"
    fi
else
    echo "Backend .env already exists"
fi
echo ""

echo "[6/6] Setup complete!"
echo ""
echo "============================================"
echo "  Next Steps:"
echo "============================================"
echo ""
echo "1. Configure backend/.env file:"
echo "   - Set your MySQL credentials"
echo "   - Update JWT_SECRET"
echo "   - Optionally change admin credentials"
echo ""
echo "2. Create MySQL database:"
echo "   mysql -u root -p"
echo "   CREATE DATABASE portfolio_db;"
echo "   exit"
echo ""
echo "3. Initialize database:"
echo "   cd backend"
echo "   npm run db:init"
echo ""
echo "4. Start backend (in one terminal):"
echo "   cd backend"
echo "   npm run dev"
echo ""
echo "5. Start frontend (in another terminal):"
echo "   npm run dev"
echo ""
echo "6. Access the site:"
echo "   Frontend: http://localhost:5173"
echo "   Backend:  http://localhost:5000"
echo "   Admin:    http://localhost:5173/admin/login"
echo ""
echo "Default admin login:"
echo "   Email: admin@arittro.com"
echo "   Password: admin123"
echo ""
echo "============================================"
