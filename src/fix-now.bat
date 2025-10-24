@echo off
echo 🧹 HOMA Platform - Cleanup ^& Fix Script (Windows)
echo ========================================
echo.

REM Step 1: Clear Vite cache
echo 📦 Clearing Vite cache...
if exist node_modules\.vite (
    rmdir /s /q node_modules\.vite
    echo ✅ Vite cache cleared
) else (
    echo ℹ️  No Vite cache found
)

if exist .cache (
    rmdir /s /q .cache
    echo ✅ .cache cleared
)

if exist dist (
    rmdir /s /q dist
    echo ✅ dist cleared
)
echo.

REM Step 2: Browser cache instructions
echo 🌐 Next steps:
echo 1. Clear your browser cache (Ctrl+Shift+Delete)
echo 2. Or use Hard Refresh (Ctrl+Shift+R)
echo.

REM Step 3: Check PostCSS config
echo 🎨 Checking Tailwind CSS configuration...
findstr /C:"@tailwindcss/postcss" postcss.config.js >nul
if %errorlevel% equ 0 (
    echo ✅ Tailwind CSS v4 PostCSS configured correctly
) else (
    echo ⚠️  PostCSS config needs update
    echo    Run: npm install -D @tailwindcss/postcss
)
echo.

REM Step 4: Restart dev server
echo 🚀 Starting dev server with clean cache...
echo.
npm run dev

REM If dev fails, try full reinstall
if %errorlevel% neq 0 (
    echo.
    echo ❌ Dev server failed to start
    echo 🔧 Trying full reinstall...
    rmdir /s /q node_modules
    npm install
    npm run dev
)
