# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a VS Code/Cursor extension that provides CodeLens navigation for Go interfaces and their implementations. It enables bidirectional navigation: from interfaces to implementations, from methods to implementations, and from implementations back to interface declarations.

## Development Commands

### Building and Testing
```bash
# Install dependencies (if needed)
npm install

# Test the extension
# Press F5 in VS Code/Cursor to launch Extension Development Host
# This opens a new window with the extension loaded for testing

# Package the extension for distribution
vsce package

# Publish to VS Code Marketplace (requires login)
vsce publish

# Publish to Open VSX (for Cursor)
npx ovsx publish golang-implementation-lens-X.Y.Z.vsix -p $OVSX_TOKEN
```

### Development Workflow
- The extension activates automatically when a `.go` file is opened
- Use `console.error()` for logging - output appears in "Extension Host" logs
- To debug: View → Output → Select "Extension Host" from dropdown
- Reload window after changes: Cmd+Shift+P → "Reload Window"

## Architecture Overview

### Core Components

**Two CodeLens Providers:**
1. `GolangImplementationLensProvider` - Shows "👁️ implementations" above interfaces and "→ implementations" for each method
2. `GolangGotoInterfaceLensProvider` - Shows "← goto interface" above struct methods

**Four Commands:**
- `golang-implementation-lens.showImplementations` - Navigate from interface to implementations
- `golang-implementation-lens.showMethodImplementations` - Navigate from method to implementations
- `golang-implementation-lens.gotoInterface` - Navigate from implementation to interface
- `golang-implementation-lens.clearCache` - Clear cached search results

### Search and Detection Strategy

**Interface Detection:**
- Regex pattern: `/^\s*type\s+(\w+)\s+interface\s*\{/`
- Tracks brace count to detect interface boundaries
- Extracts all method names within interface definition

**Implementation Search:**
1. Uses `grep` to find receiver methods matching interface methods
2. Extracts receiver type from: `func (r *ReceiverType) MethodName(...)`
3. Validates that ALL interface methods are implemented
4. Only shows types that fully implement the interface

**Receiver Method Detection:**
- Regex pattern: `/func\s+\(\s*\w+\s+\*?(\w+)\s*\)\s+(\w+)\s*\(/`
- Supports both pointer (`*Type`) and value (`Type`) receivers

### Filtering System

The extension uses a configurable filtering system to exclude unwanted implementations from results. Users can customize which folders, files, and types to exclude through VS Code settings.

**Configuration Settings:**
- `golangImplementationLens.excludedFolders` - Folder names to exclude (default: `["mocks", "mock", "testdata", "vendor"]`)
- `golangImplementationLens.excludedFilePatterns` - File patterns to exclude (default: `["_mock.go", "mock_", ".pb.go", "_test.go"]`)
- `golangImplementationLens.excludedTypePatterns` - Type name patterns to exclude (default: `["Mock", "mock", "Stub", "Fake"]`)

**Helper Functions:**
- `getConfiguration()` - extension.js:10-17 - Reads configuration from VS Code settings
- `shouldExclude(filePath, receiverType)` - extension.js:19-57 - Centralized filtering logic that checks:
  - If file path contains any excluded folders
  - If file name matches any excluded patterns
  - If receiver type contains any excluded patterns
  - If type starts with `_` (test helpers)

This filtering is applied in all three navigation features: interface→implementations, method→implementations, and implementation→interface.

### Key Helper Functions

**`extractInterfaceMethods(text, interfaceName)`** - extension.js:562-596
- Parses interface definition to extract method names
- Handles nested braces correctly
- Used by all navigation commands

**`checkAllMethodsImplemented(filePath, receiverType, methods)`** - extension.js:598-620
- Validates that a type implements all interface methods
- Uses regex to match receiver methods
- Returns false if any method is missing

**`showImplementations(interfaceName, documentUri)`** - extension.js:147-318
- Main function for interface → implementations navigation
- Uses grep to find candidate types
- Validates implementation completeness
- Shows QuickPick with results

**`showMethodImplementations(interfaceName, methodName, documentUri)`** - extension.js:320-442
- Function for method → implementations navigation
- Finds all implementations of a specific method
- Direct navigation to method location (not struct declaration)

**`gotoInterface(receiverType, methodName, documentUri)`** - extension.js:444-560
- Reverse navigation from implementation → interface
- Searches all interfaces for method declarations
- Validates that interface contains the method

## Code Patterns and Conventions

### Adding New CodeLens Providers
1. Create a class with `provideCodeLenses(document, token)` method
2. Use regex to detect code patterns in document text
3. Return array of `vscode.CodeLens` objects with command arguments
4. Register provider in `activate()` function with `vscode.languages.registerCodeLensProvider()`

### Command Implementation Pattern
1. Extract workspace path from documentUri
2. Build grep command for initial search
3. Wrap execution in `vscode.window.withProgress()` for UX
4. Parse grep output: `file:line:content`
5. Validate results (check implementation completeness, filter mocks)
6. Show QuickPick with formatted items
7. Navigate to selected location using `vscode.workspace.openTextDocument()`

### Grep Command Pattern
```javascript
const cmd = `cd "${workspacePath}" && grep -rn "pattern" --include="*.go" . 2>/dev/null`;
exec(cmd, { timeout: 5000, maxBuffer: 1024 * 1024 }, callback);
```

## Extension Metadata

- **Publisher**: fabioods
- **Current Version**: 1.2.0
- **Minimum VS Code**: 1.60.0
- **Activation**: `onLanguage:go`
- **Main Entry**: extension.js

## Security Best Practices

When generating new code:
- Always run security scans on first-party code in supported languages
- If security issues are found, fix them based on scan results
- Rescan after fixes to ensure issues are resolved
- Repeat until no new issues are found

## Important Files

- `extension.js` - Main extension code (697 lines)
- `package.json` - Extension manifest with commands and configuration
- `CHANGELOG.md` - Version history and feature documentation
- `README.md` - User-facing documentation with usage examples
- `PUBLISH_GUIDE.md` - Publishing instructions for VS Code Marketplace and Open VSX

## Known Limitations

- Performance on very large projects (1000+ files) may be slow
- Does not detect embedded interfaces yet
- Requires `grep` to be available in PATH
- Limited support for complex generic scenarios (Go 1.18+)
