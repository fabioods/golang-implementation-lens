# Golang Implementation Lens

[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://github.com/fabioods/golang-implementation-lens)
[![VSCode](https://img.shields.io/badge/VSCode-1.60+-green.svg)](https://code.visualstudio.com/)

> Show implementation count above Go interfaces with one-click navigation.

## ✨ Features

- 🔍 **Visual CodeLens** above every Go interface showing "👁️ implementations"
- 📊 **Click to navigate** - Opens a quick pick with all implementations
- ⚡ **Fast search** using grep for instant results
- 🏗️ **Multi-package support** - Works perfectly with Go modules
- 💾 **Smart detection** - Intelligently finds types that implement all interface methods

## 📸 Screenshots

### Interface with CodeLens
```go
👁️ implementations                    ← Click here!
type UserRepository interface {
    FindByID(id string) (*User, error)
    Save(user *User) error
}
```

### Quick Pick with Implementations
```
┌─────────────────────────────────────────────────────┐
│ Select implementation of UserRepository             │
├─────────────────────────────────────────────────────┤
│ ○ PostgresUserRepository                            │
│    in repository/postgres.go                        │
│    Implements 2 method(s)                           │
├─────────────────────────────────────────────────────┤
│ ○ MockUserRepository                                │
│    in repository/mock.go                            │
│    Implements 2 method(s)                           │
└─────────────────────────────────────────────────────┘
```

## 🚀 Usage

### Method 1: CodeLens (Recommended)
1. Open any Go file with an interface
2. Look above the `type InterfaceName interface {` declaration
3. Click on **"👁️ implementations"**
4. Select the implementation from the list
5. Navigate automatically to the struct!

### Method 2: Command Palette
1. Press `Cmd+Shift+P` (Mac) or `Ctrl+Shift+P` (Windows/Linux)
2. Type: **"Go: Show Implementations"**
3. Enter the interface name
4. Select from the list

## 📋 Requirements

- **VSCode/Cursor**: 1.60.0 or higher
- **Go files**: `.go` extension
- **Project structure**: Works with Go modules and any project structure
- **Search tool**: `grep` (pre-installed on macOS/Linux, Git Bash on Windows)

## ⚙️ How It Works

### CodeLens Provider
The extension registers a CodeLens provider that:
1. Scans all Go files for `type Name interface {` declarations
2. Shows a clickable lens above each interface
3. On click, searches for types that implement all interface methods

### Search Strategy
The extension:
1. Extracts all method signatures from the interface
2. Searches for receiver functions matching the first method
3. Validates that the type implements ALL interface methods
4. Shows only types that fully implement the interface

This pattern matches Go's implicit interface implementation:
```go
type UserRepository interface {
    FindByID(id string) (*User, error)
    Save(user *User) error
}

type PostgresUserRepository struct {
    db *sql.DB
}

// These methods are automatically detected!
func (r *PostgresUserRepository) FindByID(id string) (*User, error) {
    // implementation
}

func (r *PostgresUserRepository) Save(user *User) error {
    // implementation
}
```

### Performance
- **First search**: ~50-300ms (depending on project size)
- **Validation**: Checks all methods to ensure complete implementation
- **Smart filtering**: Only shows types that implement ALL interface methods

## 🎨 Configuration

Currently, the extension works out-of-the-box with sensible defaults. Future versions may include:

- Configurable search directories
- Custom search patterns
- CodeLens appearance customization
- Performance optimizations

## 🔧 Commands

| Command | Description |
|---------|-------------|
| `Go: Show Implementations` | Manually search for implementations |
| `Go: Clear Implementation Lens Cache` | Clear cached search results |

## 🐛 Troubleshooting

### CodeLens not showing?
1. Make sure you're viewing a `.go` file
2. Check that the file contains `type Name interface {` declarations
3. Reload window: `Cmd+Shift+P` → "Reload Window"

### "No implementations found"?
1. Verify the implementation exists
2. Check that all interface methods are implemented
3. Ensure the receiver functions follow Go conventions: `func (r *Type) Method()`
4. Try clearing cache: `Cmd+Shift+P` → "Go: Clear Implementation Lens Cache"

### Extension not loading?
1. Check VSCode/Cursor version (must be 1.60+)
2. View Extension Host logs: `Cmd+Shift+P` → "Developer: Show Logs" → "Extension Host"
3. Look for errors related to `golang-implementation-lens`

## 📦 Installation

### From Marketplace (Coming Soon)
1. Open Extensions: `Cmd+Shift+X`
2. Search: "Golang Implementation Lens"
3. Click "Install"

### Manual Installation
1. Download `.vsix` file from [releases](https://github.com/fabioods/golang-implementation-lens/releases)
2. Open Extensions: `Cmd+Shift+X`
3. Click `...` → "Install from VSIX..."
4. Select downloaded file

### From Source
```bash
cd ~/.cursor/extensions/
git clone https://github.com/fabioods/golang-implementation-lens.git
cd golang-implementation-lens
npm install
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

### Development Setup
```bash
# Clone the repository
git clone https://github.com/fabioods/golang-implementation-lens.git
cd golang-implementation-lens

# Install dependencies (if any)
npm install

# Open in VSCode/Cursor
code .

# Press F5 to launch Extension Development Host
```

## 📝 Changelog

See [CHANGELOG.md](CHANGELOG.md) for release history.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built for the Go community
- Inspired by VS Code's native implementation lens
- Special thanks to all contributors

## 🔗 Links

- [GitHub Repository](https://github.com/fabioods/golang-implementation-lens)
- [Issue Tracker](https://github.com/fabioods/golang-implementation-lens/issues)
- [VSCode Marketplace](https://marketplace.visualstudio.com/items?itemName=fabioods.golang-implementation-lens)

## 💡 Tips & Tricks

### Keyboard Shortcut
Add a custom keybinding for quick access:
```json
{
  "key": "cmd+shift+i",
  "command": "golang-implementation-lens.showImplementations"
}
```

### Works with Interfaces
The extension understands Go's implicit interface implementation, so you don't need any special syntax or annotations!

## 🌟 Star History

If you find this extension useful, please consider giving it a ⭐ on [GitHub](https://github.com/fabioods/golang-implementation-lens)!

---

**Made with ❤️ for the Go community**

