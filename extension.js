const vscode = require('vscode');
const { exec } = require('child_process');
const path = require('path');

console.error('================================================');
console.error('🚀 GOLANG IMPLEMENTATION LENS - MODULE LOADED');
console.error('================================================');

class GolangImplementationLensProvider {
    constructor() {
        console.error('📦 GolangImplementationLensProvider CONSTRUCTOR called');
        this._onDidChangeCodeLenses = new vscode.EventEmitter();
        this.onDidChangeCodeLenses = this._onDidChangeCodeLenses.event;
        this.cache = new Map();
    }

    provideCodeLenses(document, token) {
        console.error(`👁️ provideCodeLenses called for: ${document.fileName}`);
        const codeLenses = [];
        const text = document.getText();
        const lines = text.split('\n');
        
        // Regex to match Go interface declarations: type InterfaceName interface {
        const interfaceRegex = /^\s*type\s+(\w+)\s+interface\s*\{/;

        lines.forEach((line, index) => {
            const match = line.match(interfaceRegex);
            if (match) {
                const interfaceName = match[1];
                console.error(`✅ Found interface: ${interfaceName} at line ${index + 1}`);
                const range = new vscode.Range(index, 0, index, line.length);
                
                const codeLens = new vscode.CodeLens(range, {
                    title: "👁️ implementations",
                    command: 'golang-implementation-lens.showImplementations',
                    arguments: [interfaceName, document.uri]
                });
                
                codeLenses.push(codeLens);
            }
        });

        console.error(`📊 Returning ${codeLenses.length} CodeLens(es)`);
        return codeLenses;
    }

    resolveCodeLens(codeLens, token) {
        // Não fazemos o resolve - deixamos o título fixo e funcional
        // O usuário clica e vê as implementações direto!
        return codeLens;
    }
}

async function showImplementations(interfaceName, documentUri) {
    console.error(`🎯 showImplementations called for: ${interfaceName}`);
    const workspaceFolder = vscode.workspace.getWorkspaceFolder(documentUri);
    if (!workspaceFolder) {
        vscode.window.showErrorMessage('No workspace folder found');
        return;
    }

    const workspacePath = workspaceFolder.uri.fsPath;
    
    // Para Go, vamos procurar por receiver methods que podem implementar a interface
    // Busca por: func (receiver Type) MethodName
    // Primeiro, precisamos encontrar os métodos da interface
    const document = await vscode.workspace.openTextDocument(documentUri);
    const text = document.getText();
    const interfaceMethods = extractInterfaceMethods(text, interfaceName);
    
    if (interfaceMethods.length === 0) {
        vscode.window.showInformationMessage(`Could not parse methods for ${interfaceName}`);
        return;
    }

    console.error(`📍 Found ${interfaceMethods.length} methods in ${interfaceName}: ${interfaceMethods.join(', ')}`);
    
    // Busca por structs que implementam o primeiro método da interface
    const firstMethod = interfaceMethods[0];
    const cmd = `cd "${workspacePath}" && grep -rn "^func.*${firstMethod}" --include="*.go" . 2>/dev/null`;
    
    console.error(`📍 Finding implementations with: ${cmd}`);

    await vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: `Searching ${interfaceName} implementations...`,
        cancellable: false
    }, async () => {
        return new Promise((resolve) => {
            exec(cmd, { timeout: 5000, maxBuffer: 1024 * 1024 }, async (error, stdout, stderr) => {
                console.error(`📤 stdout:`, stdout);
                
                if (error && !stdout) {
                    vscode.window.showWarningMessage(`No implementations found for ${interfaceName}`);
                    console.error(`❌ Error:`, error);
                    resolve();
                    return;
                }

                if (!stdout || stdout.trim().length === 0) {
                    vscode.window.showInformationMessage(`No implementations found for ${interfaceName}`);
                    resolve();
                    return;
                }

                const lines = stdout.trim().split('\n');
                console.error(`📊 Found ${lines.length} matches`);
                
                const items = [];
                const processedTypes = new Set();
                
                for (const line of lines) {
                    const match = line.match(/^(.+):(\d+):(.*)$/);
                    if (match) {
                        const filePath = match[1];
                        const lineNum = parseInt(match[2]) - 1;
                        const content = match[3].trim();
                        
                        // Extrai o tipo do receiver: func (r *ReceiverType) Method
                        // Padrão: func (variavel *Tipo) ou func (variavel Tipo)
                        const receiverMatch = content.match(/func\s+\(\s*\w+\s+\*?(\w+)\s*\)/);
                        if (!receiverMatch) {
                            console.error(`⚠️ Could not extract receiver from: ${content}`);
                            continue;
                        }
                        
                        const receiverType = receiverMatch[1];
                        console.error(`🔎 Extracted receiver type: "${receiverType}" from: ${filePath}:${lineNum}`);
                        
                        // Evita duplicatas
                        if (processedTypes.has(receiverType)) {
                            console.error(`⏭️ Skipping duplicate: ${receiverType}`);
                            continue;
                        }
                        
                        // Verifica se o tipo implementa todos os métodos da interface
                        const fullPath = path.isAbsolute(filePath) ? filePath : path.join(workspacePath, filePath);
                        console.error(`🔍 Checking type: ${receiverType} in ${filePath}`);
                        const implementsAll = await checkAllMethodsImplemented(
                            fullPath,
                            receiverType,
                            interfaceMethods
                        );
                        
                        if (!implementsAll) {
                            console.error(`❌ ${receiverType} does NOT implement all methods`);
                            continue;
                        }
                        console.error(`✅ ${receiverType} implements all methods!`);
                        
                        processedTypes.add(receiverType);
                        
                        const fileName = path.basename(fullPath);
                        const dirName = path.basename(path.dirname(fullPath));
                        
                        items.push({
                            label: `$(symbol-struct) ${receiverType}`,
                            description: `${dirName}/${fileName}`,
                            detail: `Implements ${interfaceMethods.length} method(s)`,
                            filePath: fullPath,
                            receiverType: receiverType
                        });
                    }
                }

                if (items.length === 0) {
                    vscode.window.showInformationMessage(`No implementations found for ${interfaceName}`);
                    resolve();
                    return;
                }

                const selected = await vscode.window.showQuickPick(items, {
                    placeHolder: `${items.length} implementation(s) of ${interfaceName} - Select to navigate`,
                    matchOnDescription: true,
                    matchOnDetail: true
                });

                if (selected) {
                    try {
                        const document = await vscode.workspace.openTextDocument(selected.filePath);
                        const editor = await vscode.window.showTextDocument(document);
                        
                        const text = document.getText();
                        const lines = text.split('\n');
                        
                        // Procura pela declaração do struct
                        let structLine = 0;
                        const structPattern = new RegExp(`type\\s+${selected.receiverType}\\s+struct`);
                        
                        for (let i = 0; i < lines.length; i++) {
                            if (structPattern.test(lines[i])) {
                                structLine = i;
                                break;
                            }
                        }
                        
                        const position = new vscode.Position(structLine, 0);
                        editor.selection = new vscode.Selection(position, position);
                        editor.revealRange(
                            new vscode.Range(position, position), 
                            vscode.TextEditorRevealType.InCenter
                        );
                    } catch (err) {
                        vscode.window.showErrorMessage(`Error opening file: ${err.message}`);
                    }
                }
                
                resolve();
            });
        });
    });
}

function extractInterfaceMethods(text, interfaceName) {
    const methods = [];
    const lines = text.split('\n');
    
    let inInterface = false;
    let braceCount = 0;
    
    for (const line of lines) {
        // Detecta início da interface
        const interfaceStart = line.match(new RegExp(`type\\s+${interfaceName}\\s+interface\\s*\\{`));
        if (interfaceStart) {
            inInterface = true;
            braceCount = 1;
            continue;
        }
        
        if (inInterface) {
            // Conta chaves para detectar fim da interface
            braceCount += (line.match(/\{/g) || []).length;
            braceCount -= (line.match(/\}/g) || []).length;
            
            if (braceCount === 0) {
                break;
            }
            
            // Extrai nome do método (ignora linhas vazias e comentários)
            const methodMatch = line.match(/^\s*(\w+)\s*\(/);
            if (methodMatch && !line.trim().startsWith('//')) {
                methods.push(methodMatch[1]);
            }
        }
    }
    
    return methods;
}

async function checkAllMethodsImplemented(filePath, receiverType, methods) {
    try {
        const document = await vscode.workspace.openTextDocument(filePath);
        const text = document.getText();
        
        console.error(`  📝 Checking ${methods.length} methods for ${receiverType}`);
        
        // Verifica se todos os métodos estão implementados
        for (const method of methods) {
            const pattern = new RegExp(`func\\s+\\([^)]*\\*?${receiverType}\\)\\s+${method}\\s*\\(`);
            if (!pattern.test(text)) {
                console.error(`  ❌ Missing method: ${method}`);
                return false;
            }
        }
        
        console.error(`  ✅ All ${methods.length} methods found!`);
        return true;
    } catch (err) {
        console.error(`❌ Error reading file ${filePath}:`, err);
        return false;
    }
}

function activate(context) {
    console.error('================================================');
    console.error('🚀🚀🚀 GOLANG IMPLEMENTATION LENS ACTIVATED! 🚀🚀🚀');
    console.error('================================================');
    
    vscode.window.showInformationMessage('🎉 Golang Implementation Lens is active!');

    const provider = new GolangImplementationLensProvider();
    
    console.error('📝 Registering CodeLens provider...');
    context.subscriptions.push(
        vscode.languages.registerCodeLensProvider(
            { language: 'go', scheme: 'file' }, 
            provider
        )
    );

    console.error('⚙️ Registering commands...');
    context.subscriptions.push(
        vscode.commands.registerCommand(
            'golang-implementation-lens.showImplementations', 
            showImplementations
        )
    );

    context.subscriptions.push(
        vscode.commands.registerCommand(
            'golang-implementation-lens.clearCache',
            () => {
                provider.cache.clear();
                vscode.window.showInformationMessage('✅ Cache cleared!');
                provider._onDidChangeCodeLenses.fire();
            }
        )
    );
    
    console.error('✅ All components registered successfully!');
    console.error('================================================');
}

function deactivate() {
    console.error('👋 Golang Implementation Lens deactivated');
}

module.exports = {
    activate,
    deactivate
};

