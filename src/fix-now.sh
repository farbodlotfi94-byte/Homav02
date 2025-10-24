#!/bin/bash

echo "🧹 HOMA Platform - Cleanup & Fix Script"
echo "========================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Step 1: Clear Vite cache
echo "📦 Clearing Vite cache..."
rm -rf node_modules/.vite
rm -rf .cache
rm -rf dist
echo -e "${GREEN}✅ Cache cleared${NC}"
echo ""

# Step 2: Clear browser cache instructions
echo "🌐 Next steps:"
echo -e "${YELLOW}1. Clear your browser cache (Ctrl+Shift+Delete)${NC}"
echo -e "${YELLOW}2. Or use Hard Refresh (Ctrl+Shift+R / Cmd+Shift+R)${NC}"
echo ""

# Step 3: Check for Tailwind CSS v4 PostCSS plugin
echo "🎨 Checking Tailwind CSS configuration..."
if grep -q "@tailwindcss/postcss" postcss.config.js; then
    echo -e "${GREEN}✅ Tailwind CSS v4 PostCSS configured correctly${NC}"
else
    echo -e "${RED}⚠️  PostCSS config needs update${NC}"
    echo "   Run: npm install -D @tailwindcss/postcss"
fi
echo ""

# Step 4: Restart dev server
echo "🚀 Starting dev server with clean cache..."
echo ""
npm run dev

# If dev fails, try full reinstall
if [ $? -ne 0 ]; then
    echo ""
    echo -e "${RED}❌ Dev server failed to start${NC}"
    echo -e "${YELLOW}Trying full reinstall...${NC}"
    rm -rf node_modules
    npm install
    npm run dev
fi
