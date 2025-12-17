@echo off
echo ============================================
echo   Portfolio Website Setup Script
echo   Arittro Sarkar
echo ============================================
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js is not installed!
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo [1/6] Node.js detected: 
node --version
echo.

REM Check if MySQL is accessible
mysql --version >nul 2>&1
if errorlevel 1 (
    echo WARNING: MySQL CLI not found in PATH
    echo Make sure MySQL is installed and running
    echo.
) else (
    echo [2/6] MySQL detected:
    mysql --version
    echo.
)

REM Install backend dependencies
echo [3/6] Installing backend dependencies...
cd backend
if not exist "package.json" (
    echo ERROR: backend/package.json not found!
    pause
    exit /b 1
)
call npm install
if errorlevel 1 (
    echo ERROR: Failed to install backend dependencies
    pause
    exit /b 1
)
cd ..
echo Backend dependencies installed successfully!
echo.

REM Install frontend dependencies  
echo [4/6] Installing frontend dependencies...
if not exist "package.json" (
    echo ERROR: package.json not found!
    pause
    exit /b 1
)
call npm install
if errorlevel 1 (
    echo ERROR: Failed to install frontend dependencies
    pause
    exit /b 1
)
echo Frontend dependencies installed successfully!
echo.

REM Setup environment files
echo [5/6] Setting up environment files...

if not exist ".env" (
    if exist ".env.example" (
        copy ".env.example" ".env"
        echo Created frontend .env file
    ) else (
        echo WARNING: .env.example not found
    )
) else (
    echo Frontend .env already exists
)

if not exist "backend\.env" (
    if exist "backend\.env.example" (
        copy "backend\.env.example" "backend\.env"
        echo Created backend .env file
        echo.
        echo IMPORTANT: Edit backend\.env with your MySQL credentials!
    ) else (
        echo WARNING: backend\.env.example not found
    )
) else (
    echo Backend .env already exists
)
echo.

echo [6/6] Setup complete!
echo.
echo ============================================
echo   Next Steps:
echo ============================================
echo.
echo 1. Configure backend\.env file:
echo    - Set your MySQL credentials
echo    - Update JWT_SECRET
echo    - Optionally change admin credentials
echo.
echo 2. Create MySQL database:
echo    mysql -u root -p
echo    CREATE DATABASE portfolio_db;
echo    exit
echo.
echo 3. Initialize database:
echo    cd backend
echo    npm run db:init
echo.
echo 4. Start backend (in one terminal):
echo    cd backend
echo    npm run dev
echo.
echo 5. Start frontend (in another terminal):
echo    npm run dev
echo.
echo 6. Access the site:
echo    Frontend: http://localhost:5173
echo    Backend:  http://localhost:5000
echo    Admin:    http://localhost:5173/admin/login
echo.
echo Default admin login:
echo    Email: admin@arittro.com
echo    Password: admin123
echo.
echo ============================================
pause
