# Changelog

All notable changes to the "Golang Implementation Lens" extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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

### [1.1.0] - Planned
- [ ] Support for embedded interfaces
- [ ] Configurable search directories
- [ ] Better performance for large projects
- [ ] Show method count in CodeLens
- [ ] Support for generic interfaces (Go 1.18+)

### [1.2.0] - Planned
- [ ] Show interface implementation status
- [ ] Highlight missing methods
- [ ] Quick fix for incomplete implementations
- [ ] Export/import search patterns

### Future Ideas
- [ ] Implementation diagram visualization
- [ ] Test coverage for interface implementations
- [ ] Integration with gopls
- [ ] Mermaid diagram generation

---

## Version History

| Version | Date | Description |
|---------|------|-------------|
| 1.0.0 | 2025-10-05 | Initial release with core features |

---

**Note**: This extension is under active development. Please report issues and feature requests on [GitHub](https://github.com/fabioods/golang-implementation-lens/issues).

