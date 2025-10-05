# Como Atualizar e Publicar - Golang Implementation Lens

Este guia explica como atualizar, testar e publicar a extensão Golang Implementation Lens.

## 📋 Índice

1. [Estrutura do Projeto](#estrutura-do-projeto)
2. [Desenvolvimento Local](#desenvolvimento-local)
3. [Testando a Extensão](#testando-a-extensão)
4. [Atualizando a Versão](#atualizando-a-versão)
5. [Publicando](#publicando)
6. [Troubleshooting](#troubleshooting)

---

## 🏗️ Estrutura do Projeto

```
golang-implementation-lens/
├── extension.js          # Código principal da extensão
├── package.json          # Manifesto da extensão
├── README.md            # Documentação
├── CHANGELOG.md         # Histórico de mudanças
├── LICENSE              # Licença MIT
├── icon.png             # Ícone da extensão
├── publish.sh           # Script de publicação (bash)
├── publish.fish         # Script de publicação (fish shell)
└── TODO.md              # Lista de tarefas
```

---

## 💻 Desenvolvimento Local

### Pré-requisitos

```bash
# VSCode ou Cursor instalado
# Node.js (versão 14+)
# npm ou yarn

# Instalar VSCE (VSCode Extension Manager)
npm install -g @vscode/vsce

# (Opcional) Para publicar no Open VSX
npm install -g ovsx
```

### Instalação Local

1. **Clone ou navegue até o diretório**:
   ```bash
   cd ~/.cursor/extensions/golang-implementation-lens
   ```

2. **Não há dependências npm neste projeto**, mas se houver:
   ```bash
   npm install
   ```

3. **Abra no VSCode/Cursor**:
   ```bash
   code .
   ```

---

## 🧪 Testando a Extensão

### Método 1: Extension Development Host (F5)

1. Abra o projeto no VSCode/Cursor
2. Pressione `F5` (ou Run → Start Debugging)
3. Uma nova janela abrirá com a extensão carregada
4. Abra um projeto Go com interfaces
5. Verifique se o CodeLens aparece

### Método 2: Instalação Manual

1. **Empacote a extensão**:
   ```bash
   vsce package
   ```

2. **Instale o .vsix gerado**:
   - Abra VSCode/Cursor
   - Extensions → `...` → Install from VSIX
   - Selecione `golang-implementation-lens-X.X.X.vsix`

3. **Reload Window**:
   - `Cmd+Shift+P` → "Reload Window"

### Método 3: Desenvolvimento com Symlink

```bash
# VSCode
ln -s /Users/santos.fabio/.cursor/extensions/golang-implementation-lens \
      ~/.vscode/extensions/golang-implementation-lens

# Cursor
# Já está na pasta correta!
```

### Verificando Logs

1. **Abra o Developer Console**:
   - `Cmd+Shift+P` → "Developer: Toggle Developer Tools"

2. **Veja logs da extensão**:
   ```javascript
   // Os logs começam com emojis:
   // 🚀 GOLANG IMPLEMENTATION LENS ACTIVATED
   // 👁️ provideCodeLenses called
   // ✅ Found interface
   ```

3. **Extension Host Logs**:
   - `Cmd+Shift+P` → "Developer: Show Logs" → "Extension Host"

---

## 🔄 Atualizando a Versão

### 1. Faça suas alterações no código

Edite `extension.js`, `README.md`, etc.

### 2. Atualize o CHANGELOG.md

```markdown
## [1.1.0] - 2025-10-10

### Added
- Support for embedded interfaces
- Configurable search directories

### Fixed
- Performance issue with large projects

### Changed
- Updated README with new examples
```

### 3. Atualize a versão no package.json

**Opção A: Manual**
```json
{
  "version": "1.1.0"
}
```

**Opção B: Usando npm**
```bash
npm version patch  # 1.0.0 → 1.0.1
npm version minor  # 1.0.0 → 1.1.0
npm version major  # 1.0.0 → 2.0.0
```

### 4. Teste completamente

Execute todos os testes do item anterior!

---

## 📦 Publicando

### Método 1: Script Automático (Recomendado)

```bash
# Bash
./publish.sh

# Fish
./publish.fish
```

O script irá:
1. ✅ Perguntar a nova versão
2. ✅ Atualizar package.json
3. ✅ Empacotar a extensão
4. ✅ Perguntar se deve publicar no VS Code Marketplace
5. ✅ Perguntar se deve publicar no Open VSX
6. ✅ Perguntar se deve fazer commit e tag
7. ✅ Perguntar se deve fazer push

### Método 2: Manual

#### Passo 1: Empacote

```bash
vsce package
# Gera: golang-implementation-lens-X.X.X.vsix
```

#### Passo 2: Publique no VS Code Marketplace

```bash
# Primeira vez: faça login
vsce login fabioods

# Publique
vsce publish
# Ou especifique a versão
vsce publish 1.1.0
```

#### Passo 3: Publique no Open VSX

```bash
# Configure o token
export OVSX_TOKEN="seu-token-aqui"

# Publique
npx ovsx publish golang-implementation-lens-X.X.X.vsix -p $OVSX_TOKEN
```

#### Passo 4: Commit e Tag

```bash
git add .
git commit -m "chore: bump version to 1.1.0"
git tag v1.1.0
git push origin main
git push origin v1.1.0
```

#### Passo 5: Crie GitHub Release

1. Vá para: https://github.com/fabioods/golang-implementation-lens/releases
2. Clique em "Draft a new release"
3. Tag: `v1.1.0`
4. Title: `v1.1.0 - Feature Name`
5. Description: Cole do CHANGELOG.md
6. Anexe o arquivo `.vsix`
7. Publish release

---

## 🔑 Configurando Tokens

### VS Code Marketplace

1. Vá para: https://dev.azure.com/fabioods/_usersSettings/tokens
2. Crie um Personal Access Token com escopo `Marketplace`
3. Use no login: `vsce login fabioods`

### Open VSX

1. Vá para: https://open-vsx.org/user-settings/tokens
2. Crie um Access Token
3. Configure:
   ```bash
   export OVSX_TOKEN="seu-token-aqui"
   # Ou adicione no ~/.bashrc ou ~/.config/fish/config.fish
   ```

---

## 🐛 Troubleshooting

### Erro: "Extension not activated"

**Solução**:
1. Verifique `activationEvents` no package.json
2. Deve conter: `"onLanguage:go"`
3. Reload window

### Erro: "CodeLens not showing"

**Solução**:
1. Verifique se está em arquivo `.go`
2. Verifique se há `type Name interface {`
3. Veja logs no Developer Console
4. Clear cache: `Go: Clear Implementation Lens Cache`

### Erro: "No implementations found"

**Possíveis causas**:
1. Interface não tem implementações
2. Implementações não seguem padrão Go
3. Grep não está no PATH

**Debug**:
```bash
# Teste manualmente
cd /seu/projeto
grep -rn "^func.*NomeDoMetodo" --include="*.go" .
```

### Erro: "ENOENT: vsce: command not found"

**Solução**:
```bash
npm install -g @vscode/vsce
```

### Erro: "Publisher not found"

**Solução**:
```bash
# Faça login novamente
vsce login fabioods
```

### Performance Lenta

**Soluções**:
1. Limite diretórios de busca no `extension.js`
2. Aumente timeout: `{ timeout: 10000 }`
3. Use cache mais agressivo
4. Considere usar gopls em vez de grep

---

## 📊 Checklist de Publicação

Antes de publicar, verifique:

- [ ] ✅ Código testado localmente
- [ ] ✅ Documentação atualizada (README.md)
- [ ] ✅ Changelog atualizado (CHANGELOG.md)
- [ ] ✅ Versão atualizada (package.json)
- [ ] ✅ Ícone presente (icon.png)
- [ ] ✅ Licença presente (LICENSE)
- [ ] ✅ Sem console.log desnecessários
- [ ] ✅ Extension empacotada (vsce package)
- [ ] ✅ Testado o .vsix instalado
- [ ] ✅ Publicado no Marketplace
- [ ] ✅ Publicado no Open VSX (opcional)
- [ ] ✅ Git commit + tag
- [ ] ✅ Git push + push tags
- [ ] ✅ GitHub Release criado
- [ ] ✅ Anunciado nas redes sociais (opcional)

---

## 🚀 Comandos Rápidos

```bash
# Testar localmente
code .  # Abrir projeto
F5      # Iniciar debug

# Empacotar
vsce package

# Publicar VS Code
vsce publish

# Publicar Open VSX
npx ovsx publish *.vsix -p $OVSX_TOKEN

# Git
git add .
git commit -m "chore: release vX.X.X"
git tag vX.X.X
git push origin main --tags
```

---

## 📚 Recursos

- [VS Code Extension API](https://code.visualstudio.com/api)
- [Publishing Extensions](https://code.visualstudio.com/api/working-with-extensions/publishing-extension)
- [VSCE Documentation](https://github.com/microsoft/vscode-vsce)
- [Open VSX](https://open-vsx.org/)

---

**Última atualização**: 2025-10-05  
**Mantenedor**: Fabio Santos (@fabioods)

