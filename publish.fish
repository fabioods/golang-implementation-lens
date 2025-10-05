#!/usr/bin/env fish

set -x

echo "================================================"
echo "🚀 GOLANG IMPLEMENTATION LENS - PUBLISH SCRIPT"
echo "================================================"
echo ""

# Get current version from package.json
set CURRENT_VERSION (node -p "require('./package.json').version")
echo "📦 Current version: $CURRENT_VERSION"
echo ""

# Ask for new version
echo "Enter new version (or press Enter to keep $CURRENT_VERSION):"
read NEW_VERSION

if test -z "$NEW_VERSION"
    set NEW_VERSION $CURRENT_VERSION
    echo "Using current version: $NEW_VERSION"
else
    echo "New version will be: $NEW_VERSION"
    
    # Update package.json
    sed -i.bak "s/\"version\": \".*\"/\"version\": \"$NEW_VERSION\"/" package.json
    rm package.json.bak
    echo "✅ Updated package.json"
end

echo ""
echo "🔨 Building extension..."

# Package extension
vsce package

echo "✅ Extension packaged: golang-implementation-lens-$NEW_VERSION.vsix"
echo ""

# Ask if should publish
echo "Do you want to publish to VS Code Marketplace? (y/n)"
read PUBLISH_VSCODE

if test "$PUBLISH_VSCODE" = "y" -o "$PUBLISH_VSCODE" = "Y"
    echo "📤 Publishing to VS Code Marketplace..."
    vsce publish
    echo "✅ Published to VS Code Marketplace!"
end

echo ""
echo "Do you want to publish to Open VSX? (y/n)"
read PUBLISH_OPENVSX

if test "$PUBLISH_OPENVSX" = "y" -o "$PUBLISH_OPENVSX" = "Y"
    echo "📤 Publishing to Open VSX..."
    npx ovsx publish golang-implementation-lens-$NEW_VERSION.vsix -p $OVSX_TOKEN
    echo "✅ Published to Open VSX!"
end

echo ""
echo "Do you want to commit and tag this version? (y/n)"
read COMMIT_VERSION

if test "$COMMIT_VERSION" = "y" -o "$COMMIT_VERSION" = "Y"
    echo "📝 Committing changes..."
    git add package.json CHANGELOG.md
    git commit -m "chore: bump version to $NEW_VERSION"
    git tag "v$NEW_VERSION"
    echo "✅ Committed and tagged!"
    
    echo ""
    echo "Do you want to push to remote? (y/n)"
    read PUSH_REMOTE
    
    if test "$PUSH_REMOTE" = "y" -o "$PUSH_REMOTE" = "Y"
        echo "📤 Pushing to remote..."
        git push origin main
        git push origin "v$NEW_VERSION"
        echo "✅ Pushed to remote!"
    end
end

echo ""
echo "================================================"
echo "✅ PUBLISH COMPLETE!"
echo "================================================"
echo ""
echo "Next steps:"
echo "1. Create a GitHub release with the .vsix file"
echo "2. Update README if needed"
echo "3. Announce the release!"
echo ""

