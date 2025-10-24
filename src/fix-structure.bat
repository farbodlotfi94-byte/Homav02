@echo off
echo 🔧 HOMA Platform - Fix File Structure for Git
echo ==============================================
echo.

REM Step 1: Check if files need to be moved
echo 📁 Checking file structure...

if exist App.tsx (
    echo ⚠️  Files are in wrong location (root instead of src/)
    echo.
    
    REM Create src directory if it doesn't exist
    if not exist src mkdir src
    
    echo 📦 Moving files to src/...
    
    REM Move files to src/
    if exist App.tsx (
        move App.tsx src\ >nul 2>&1
        echo   ✅ App.tsx moved
    )
    if exist components (
        move components src\ >nul 2>&1
        echo   ✅ components/ moved
    )
    if exist styles (
        move styles src\ >nul 2>&1
        echo   ✅ styles/ moved
    )
    if exist types (
        move types src\ >nul 2>&1
        echo   ✅ types/ moved
    )
    if exist utils (
        move utils src\ >nul 2>&1
        echo   ✅ utils/ moved
    )
    
    echo ✅ Files moved successfully!
) else (
    echo ✅ Files are already in correct location (src/)
)

echo.

REM Step 2: Update imports in main.tsx
echo 🔄 Updating import paths in src/main.tsx...

if exist src\main.tsx (
    REM PowerShell command to update imports
    powershell -Command "(Get-Content src\main.tsx) -replace \"import App from '../App'\", \"import App from './App'\" -replace \"import '../styles/globals.css'\", \"import './styles/globals.css'\" | Set-Content src\main.tsx"
    echo ✅ Import paths updated
)

echo.

REM Step 3: Clear cache
echo 🧹 Clearing cache...
if exist node_modules\.vite rmdir /s /q node_modules\.vite
if exist .cache rmdir /s /q .cache
if exist dist rmdir /s /q dist
echo ✅ Cache cleared

echo.

REM Step 4: Check Git status
echo 📊 Checking Git status...

if exist .git (
    echo ✅ Git repository exists
    echo.
    echo 📋 Current Git status:
    git status --short
) else (
    echo ⚠️  No Git repository found
    echo.
    set /p response="Do you want to initialize Git? (y/n): "
    if /i "%response%"=="y" (
        git init
        echo ✅ Git initialized
        
        REM Create initial commit
        git add .
        git commit -m "🎉 Initial commit: HOMA Platform setup"
        echo ✅ Initial commit created
    )
)

echo.

REM Step 5: Show next steps
echo ✅ File structure fixed!
echo.
echo 📝 Next steps:
echo.
echo 1️⃣  Test the application:
echo    npm run dev
echo.
echo 2️⃣  Add files to Git:
echo    git add .
echo    git commit -m "Fix: Move files to src/ directory"
echo.
echo 3️⃣  Push to GitHub:
echo    git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
echo    git branch -M main
echo    git push -u origin main
echo.
echo 🎉 Ready to push to GitHub!

pause
