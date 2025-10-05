# Changelog

All notable changes to the "Golang Implementation Lens" extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.2.0] - 2025-10-05

### Added
- 🔙 **Goto Interface**: Reverse navigation from implementation methods to interface declarations
- 🎯 New CodeLens "← goto interface" on struct/type methods
- 📋 New command: "Go: Goto Interface"
- 🔍 Smart interface detection that finds which interfaces declare a specific method
- 🚫 Automatic filtering of mock methods in goto interface feature

### Changed
- Enhanced CodeLens provider system with bidirectional navigation
- Improved method detection with support for both pointer and value receivers
- Better integration with existing implementation search

### Technical Improvements
- Added `GolangGotoInterfaceLensProvider` class for reverse navigation
- New `gotoInterface` function that searches for interfaces declaring specific methods
- Validates interface methods before showing in quick pick
- Reuses existing `extractInterfaceMethods` helper for consistency

## [1.1.2] - 2025-10-05

### Changed
- 🎨 Updated extension icon with Go blue background (#00ADD8)
- 👁️ New stylized eye icon matching Go brand colors

## [1.1.1] - 2025-10-05

### Added
- 🚫 Automatic filtering of mock implementations
- 📝 Enhanced logging for debugging implementation search

### Changed
- Mock files and types are now automatically excluded from results
- Filters out files in `/mocks/` directories
- Filters out files with `_mock.go` or `mock_` patterns
- Filters out types containing "Mock" or "mock" in the name
- Improved user experience by showing only real implementations

### Fixed
- Better handling of test helper structs starting with `_`

## [1.1.0] - 2025-10-05

### Added
- ✨ **Method-level CodeLens**: Each interface method now has its own "→ implementations" lens
- 🎯 Direct navigation to specific method implementations
- 📊 New command: "Go: Show Method Implementations"
- 🔍 Enhanced debugging with detailed extraction logs

### Changed
- Interface CodeLens now uses "👁️ implementations" (unchanged)
- Method CodeLens uses "→ implementations" for cleaner visual distinction
- Improved receiver type extraction regex for better accuracy
- Better handling of complex function signatures

### Fixed
- 🐛 Fixed regex that was extracting only last character of type names
- ✅ Now correctly extracts full type names like `sinergiaClient`, `accountAPI`
- Fixed issue where real implementations were being filtered out incorrectly

### Technical Improvements
- Changed regex from `/func\s+\([^)]*\*?(\w+)\)/` to `/func\s+\(\s*\w+\s+\*?(\w+)\s*\)/`
- Added comprehensive logging: 🔎 (extraction), 🔍 (checking), ✅ (success), ❌ (failure)
- Better error messages for debugging

## [1.0.0] - 2025-10-05

### Added
- 🎉 Initial release
- 🔍 CodeLens above Go interface declarations
- 📊 One-click navigation to implementations
- ⚡ Fast grep-based search
- 💾 Smart validation of interface implementations
- 🏗️ Multi-package support
- 🧹 Cache clearing command

### Features
- Automatically detects `type Name interface {}` declarations
- Shows "👁️ implementations" above each interface
- Searches for types implementing all interface methods
- Validates complete interface implementation
- Quick pick UI for selecting implementations
- Navigates to struct declaration
- Progress notification during search
- Detailed implementation information

### Technical Details
- Uses grep for fast initial search
- Validates all methods are implemented
- Supports pointer and value receivers
- Works with Go modules
- Handles nested interfaces gracefully

### Known Limitations
- Does not detect embedded interfaces yet
- Large projects (1000+ files) may take a few seconds
- Requires grep to be available in PATH

---

## Upcoming Features

### [1.3.0] - Planned
- [ ] Support for embedded interfaces
- [ ] Configurable search directories
- [ ] Better performance for large projects
- [ ] Show method count in CodeLens
- [ ] Support for generic interfaces (Go 1.18+)

### [1.4.0] - Planned
- [ ] Show interface implementation status
- [ ] Highlight missing methods
- [ ] Quick fix for incomplete implementations
- [ ] Export/import search patterns

### Future Ideas
- [ ] Implementation diagram visualization
- [ ] Test coverage for interface implementations
- [ ] Integration with gopls
- [ ] Mermaid diagram generation
- [ ] Show/hide mocks via settings

---

## Version History

| Version | Date | Description |
|---------|------|-------------|
| 1.2.0 | 2025-10-05 | Goto Interface - Reverse navigation feature |
| 1.1.2 | 2025-10-05 | Updated icon with Go brand colors |
| 1.1.1 | 2025-10-05 | Automatic mock filtering |
| 1.1.0 | 2025-10-05 | Method-level CodeLens and navigation |
| 1.0.0 | 2025-10-05 | Initial release with core features |

---

**Note**: This extension is under active development. Please report issues and feature requests on [GitHub](https://github.com/fabioods/golang-implementation-lens/issues).

