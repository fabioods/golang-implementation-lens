#!/bin/bash

set -e

echo "================================================"
echo "🚀 GOLANG IMPLEMENTATION LENS - PUBLISH SCRIPT"
echo "================================================"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Get current version from package.json
CURRENT_VERSION=$(node -p "require('./package.json').version")
echo -e "${BLUE}📦 Current version: ${CURRENT_VERSION}${NC}"
echo ""

# Ask for new version
echo -e "${YELLOW}Enter new version (or press Enter to keep ${CURRENT_VERSION}):${NC}"
read NEW_VERSION

if [ -z "$NEW_VERSION" ]; then
    NEW_VERSION=$CURRENT_VERSION
    echo -e "${BLUE}Using current version: ${NEW_VERSION}${NC}"
else
    echo -e "${GREEN}New version will be: ${NEW_VERSION}${NC}"
    
    # Update package.json
    sed -i.bak "s/\"version\": \".*\"/\"version\": \"${NEW_VERSION}\"/" package.json
    rm package.json.bak
    echo -e "${GREEN}✅ Updated package.json${NC}"
fi

echo ""
echo -e "${BLUE}🔨 Building extension...${NC}"

# Package extension
vsce package

echo -e "${GREEN}✅ Extension packaged: golang-implementation-lens-${NEW_VERSION}.vsix${NC}"
echo ""

# Ask if should publish
echo -e "${YELLOW}Do you want to publish to VS Code Marketplace? (y/n)${NC}"
read PUBLISH_VSCODE

if [ "$PUBLISH_VSCODE" = "y" ] || [ "$PUBLISH_VSCODE" = "Y" ]; then
    echo -e "${BLUE}📤 Publishing to VS Code Marketplace...${NC}"
    vsce publish
    echo -e "${GREEN}✅ Published to VS Code Marketplace!${NC}"
fi

echo ""
echo -e "${YELLOW}Do you want to publish to Open VSX? (y/n)${NC}"
read PUBLISH_OPENVSX

if [ "$PUBLISH_OPENVSX" = "y" ] || [ "$PUBLISH_OPENVSX" = "Y" ]; then
    echo -e "${BLUE}📤 Publishing to Open VSX...${NC}"
    npx ovsx publish golang-implementation-lens-${NEW_VERSION}.vsix -p $OVSX_TOKEN
    echo -e "${GREEN}✅ Published to Open VSX!${NC}"
fi

echo ""
echo -e "${YELLOW}Do you want to commit and tag this version? (y/n)${NC}"
read COMMIT_VERSION

if [ "$COMMIT_VERSION" = "y" ] || [ "$COMMIT_VERSION" = "Y" ]; then
    echo -e "${BLUE}📝 Committing changes...${NC}"
    git add package.json CHANGELOG.md
    git commit -m "chore: bump version to ${NEW_VERSION}"
    git tag "v${NEW_VERSION}"
    echo -e "${GREEN}✅ Committed and tagged!${NC}"
    
    echo ""
    echo -e "${YELLOW}Do you want to push to remote? (y/n)${NC}"
    read PUSH_REMOTE
    
    if [ "$PUSH_REMOTE" = "y" ] || [ "$PUSH_REMOTE" = "Y" ]; then
        echo -e "${BLUE}📤 Pushing to remote...${NC}"
        git push origin main
        git push origin "v${NEW_VERSION}"
        echo -e "${GREEN}✅ Pushed to remote!${NC}"
    fi
fi

echo ""
echo "================================================"
echo -e "${GREEN}✅ PUBLISH COMPLETE!${NC}"
echo "================================================"
echo ""
echo -e "${BLUE}Next steps:${NC}"
echo "1. Create a GitHub release with the .vsix file"
echo "2. Update README if needed"
echo "3. Announce the release!"
echo ""

