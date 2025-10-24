#!/bin/bash

echo "🔧 HOMA Platform - Fix File Structure for Git"
echo "=============================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Step 1: Check if files need to be moved
echo -e "${BLUE}📁 Checking file structure...${NC}"

if [ -f "App.tsx" ]; then
    echo -e "${YELLOW}⚠️  Files are in wrong location (root instead of src/)${NC}"
    echo ""
    
    # Create src directory if it doesn't exist
    mkdir -p src
    
    echo -e "${BLUE}📦 Moving files to src/...${NC}"
    
    # Move files to src/
    mv App.tsx src/ 2>/dev/null && echo "  ✅ App.tsx moved"
    mv components src/ 2>/dev/null && echo "  ✅ components/ moved"
    mv styles src/ 2>/dev/null && echo "  ✅ styles/ moved"
    mv types src/ 2>/dev/null && echo "  ✅ types/ moved"
    mv utils src/ 2>/dev/null && echo "  ✅ utils/ moved"
    
    echo -e "${GREEN}✅ Files moved successfully!${NC}"
else
    echo -e "${GREEN}✅ Files are already in correct location (src/)${NC}"
fi

echo ""

# Step 2: Update imports in main.tsx
echo -e "${BLUE}🔄 Updating import paths in src/main.tsx...${NC}"

if [ -f "src/main.tsx" ]; then
    # Backup original
    cp src/main.tsx src/main.tsx.backup
    
    # Update imports
    sed -i.tmp "s|import App from './App'|import App from './App'|g" src/main.tsx
    sed -i.tmp "s|import '../styles/globals.css'|import './styles/globals.css'|g" src/main.tsx
    rm -f src/main.tsx.tmp
    
    echo -e "${GREEN}✅ Import paths updated${NC}"
fi

echo ""

# Step 3: Clear cache
echo -e "${BLUE}🧹 Clearing cache...${NC}"
rm -rf node_modules/.vite .cache dist
echo -e "${GREEN}✅ Cache cleared${NC}"

echo ""

# Step 4: Check Git status
echo -e "${BLUE}📊 Checking Git status...${NC}"

if [ -d ".git" ]; then
    echo -e "${GREEN}✅ Git repository exists${NC}"
    echo ""
    echo -e "${YELLOW}📋 Current Git status:${NC}"
    git status --short
else
    echo -e "${YELLOW}⚠️  No Git repository found${NC}"
    echo ""
    echo -e "${BLUE}Do you want to initialize Git? (y/n)${NC}"
    read -r response
    if [[ "$response" =~ ^[Yy]$ ]]; then
        git init
        echo -e "${GREEN}✅ Git initialized${NC}"
        
        # Create initial commit
        git add .
        git commit -m "🎉 Initial commit: HOMA Platform setup"
        echo -e "${GREEN}✅ Initial commit created${NC}"
    fi
fi

echo ""

# Step 5: Show next steps
echo -e "${GREEN}✅ File structure fixed!${NC}"
echo ""
echo -e "${YELLOW}📝 Next steps:${NC}"
echo ""
echo "1️⃣  Test the application:"
echo "   ${BLUE}npm run dev${NC}"
echo ""
echo "2️⃣  Add files to Git:"
echo "   ${BLUE}git add .${NC}"
echo "   ${BLUE}git commit -m 'Fix: Move files to src/ directory'${NC}"
echo ""
echo "3️⃣  Push to GitHub:"
echo "   ${BLUE}git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git${NC}"
echo "   ${BLUE}git branch -M main${NC}"
echo "   ${BLUE}git push -u origin main${NC}"
echo ""
echo -e "${GREEN}🎉 Ready to push to GitHub!${NC}"
