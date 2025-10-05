# 📦 Guia de Publicação - Golang Implementation Lens

## 📋 Checklist Pré-Publicação

- [x] ✅ Versão atualizada no package.json (1.1.2)
- [x] ✅ CHANGELOG.md atualizado
- [x] ✅ README.md atualizado
- [x] ✅ Ícone atualizado (fundo azul Go)
- [ ] ⏳ Extensão empacotada (.vsix)
- [ ] ⏳ Publicado no VS Code Marketplace
- [ ] ⏳ Publicado no Open VSX (para Cursor)
- [ ] ⏳ GitHub Release criado
- [ ] ⏳ Commit e tag no Git

---

## 🔨 Passo 1: Empacotar a Extensão

```bash
cd ~/.cursor/extensions/golang-implementation-lens
vsce package
```

Isso criará: `golang-implementation-lens-1.1.2.vsix`

---

## 🚀 Passo 2: Publicar no VS Code Marketplace

### 2.1. Fazer Login (primeira vez)

```bash
vsce login fabioods
```

Você precisará de um **Personal Access Token** da Microsoft Azure:

1. Vá para: https://dev.azure.com/fabioods/_usersSettings/tokens
2. Clique em **"New Token"**
3. Nome: `vscode-marketplace`
4. Organization: **All accessible organizations**
5. Scopes: **Marketplace** → ✅ **Manage**
6. Clique **Create**
7. Copie o token e cole quando o `vsce login` pedir

### 2.2. Publicar

```bash
vsce publish
```

Ou especifique a versão:

```bash
vsce publish 1.1.2
```

---

## 🌐 Passo 3: Publicar no Open VSX (para Cursor)

O Cursor usa o **Open VSX Registry** como alternativa ao VS Code Marketplace.

### 3.1. Obter Token do Open VSX

1. Vá para: https://open-vsx.org/
2. Faça login com GitHub
3. Vá em: https://open-vsx.org/user-settings/tokens
4. Clique em **"Generate New Token"**
5. Copie o token

### 3.2. Configurar Token

```bash
export OVSX_TOKEN="seu-token-aqui"
```

Ou adicione ao seu shell config:

```bash
# Para fish
echo "set -x OVSX_TOKEN seu-token-aqui" >> ~/.config/fish/config.fish

# Para bash/zsh
echo "export OVSX_TOKEN=seu-token-aqui" >> ~/.bashrc  # ou ~/.zshrc
```

### 3.3. Publicar

```bash
npx ovsx publish golang-implementation-lens-1.1.2.vsix -p $OVSX_TOKEN
```

---

## 📝 Passo 4: Criar GitHub Release

### 4.1. Commit e Tag

```bash
git add .
git commit -m "chore: release v1.1.2 - Updated icon with Go brand colors"
git tag v1.1.2
git push origin main
git push origin v1.1.2
```

### 4.2. Criar Release no GitHub

1. Vá para: https://github.com/fabioods/golang-implementation-lens/releases
2. Clique em **"Draft a new release"**
3. Preencha:
   - **Tag**: `v1.1.2`
   - **Title**: `v1.1.2 - Updated Icon with Go Brand Colors`
   - **Description**:
     ```markdown
     ## 🎨 What's Changed
     
     - Updated extension icon with Go blue background (#00ADD8)
     - New stylized eye icon matching Go brand colors
     
     ## 📦 Installation
     
     - **VS Code Marketplace**: Search "Golang Implementation Lens"
     - **Manual**: Download `golang-implementation-lens-1.1.2.vsix` below
     
     ## 📝 Full Changelog
     
     See [CHANGELOG.md](https://github.com/fabioods/golang-implementation-lens/blob/main/CHANGELOG.md)
     
     **Full Changelog**: https://github.com/fabioods/golang-implementation-lens/compare/v1.1.1...v1.1.2
     ```
4. **Attach files**: Anexe o arquivo `golang-implementation-lens-1.1.2.vsix`
5. Clique em **"Publish release"**

---

## ✅ Passo 5: Verificar Publicação

### VS Code Marketplace

- URL: https://marketplace.visualstudio.com/items?itemName=fabioods.golang-implementation-lens
- Pode levar alguns minutos para aparecer

### Open VSX

- URL: https://open-vsx.org/extension/fabioods/golang-implementation-lens
- Pode levar alguns minutos para aparecer

---

## 🔄 Script Rápido (Tudo de uma vez)

Execute este script para fazer tudo automaticamente:

```bash
#!/bin/bash

echo "📦 Empacotando extensão..."
vsce package

echo "🚀 Publicando no VS Code Marketplace..."
vsce publish

echo "🌐 Publicando no Open VSX..."
npx ovsx publish golang-implementation-lens-1.1.2.vsix -p $OVSX_TOKEN

echo "📝 Fazendo commit e tag..."
git add .
git commit -m "chore: release v1.1.2 - Updated icon with Go brand colors"
git tag v1.1.2
git push origin main
git push origin v1.1.2

echo "✅ Publicação concluída!"
echo "📌 Não esqueça de criar o GitHub Release manualmente:"
echo "   https://github.com/fabioods/golang-implementation-lens/releases/new"
```

---

## 🐛 Troubleshooting

### Erro: "ENOENT: no such file or directory"

```bash
# Limpe arquivos antigos
rm *.vsix
vsce package
```

### Erro: "Publisher not found"

```bash
# Faça login novamente
vsce logout
vsce login fabioods
```

### Erro: "Unauthorized" no Open VSX

```bash
# Verifique se o token está configurado
echo $OVSX_TOKEN

# Se vazio, configure novamente
export OVSX_TOKEN="seu-token-aqui"
```

---

## 📊 Métricas de Sucesso

Após publicar, monitore:

- ⬇️ **Downloads**: VS Code Marketplace Statistics
- ⭐ **Ratings**: Feedback dos usuários
- 🐛 **Issues**: GitHub Issues
- 📈 **Tendências**: VS Code Extension Analytics

---

**Boa sorte com a publicação! 🚀**

