const vscode = require('vscode');
const { exec } = require('child_process');
const path = require('path');

console.error('================================================');
console.error('🚀 GOLANG IMPLEMENTATION LENS - MODULE LOADED');
console.error('================================================');

// Configuration helper functions
function getConfiguration() {
    const config = vscode.workspace.getConfiguration('golangImplementationLens');
    return {
        excludedFolders: config.get('excludedFolders', ['mocks', 'mock', 'testdata', 'vendor']),
        excludedFilePatterns: config.get('excludedFilePatterns', ['_mock.go', 'mock_', '.pb.go', '_test.go']),
        excludedTypePatterns: config.get('excludedTypePatterns', ['Mock', 'mock', 'Stub', 'Fake'])
    };
}

function shouldExclude(filePath, receiverType) {
    const config = getConfiguration();

    // Check if file path contains any excluded folders
    const pathParts = filePath.split(path.sep);
    for (const folder of config.excludedFolders) {
        if (pathParts.includes(folder)) {
            console.error(`  🚫 Excluded by folder pattern: ${folder}`);
            return true;
        }
    }

    // Check if file matches any excluded file patterns
    const fileName = path.basename(filePath);
    for (const pattern of config.excludedFilePatterns) {
        if (fileName.includes(pattern)) {
            console.error(`  🚫 Excluded by file pattern: ${pattern}`);
            return true;
        }
    }

    // Check if type matches any excluded type patterns
    if (receiverType) {
        for (const pattern of config.excludedTypePatterns) {
            if (receiverType.includes(pattern)) {
                console.error(`  🚫 Excluded by type pattern: ${pattern}`);
                return true;
            }
        }

        // Also check for types starting with underscore (test helpers)
        if (receiverType.startsWith('_')) {
            console.error(`  🚫 Excluded type starting with underscore`);
            return true;
        }
    }

    return false;
}

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

        // Regex to match Go interface declarations:
        // - type InterfaceName interface {
        // - InterfaceName interface { (dentro de um bloco type)
        const interfaceRegex = /^\s*type\s+(\w+)\s+interface\s*\{/;
        const interfaceInBlockRegex = /^\s*(\w+)\s+interface\s*\{/;
        const methodRegex = /^\s*(\w+)\s*\(/;

        let currentInterface = null;
        let braceCount = 0;

        lines.forEach((line, index) => {
            // Detecta início da interface (formato padrão)
            const interfaceMatch = line.match(interfaceRegex);
            if (interfaceMatch) {
                currentInterface = interfaceMatch[1];
                braceCount = 1;
                console.error(`✅ Found interface: ${currentInterface} at line ${index + 1}`);
                const range = new vscode.Range(index, 0, index, line.length);

                // CodeLens para toda a interface
                const codeLens = new vscode.CodeLens(range, {
                    title: "👁️ implementations",
                    command: 'golang-implementation-lens.showImplementations',
                    arguments: [currentInterface, document.uri]
                });

                codeLenses.push(codeLens);
                return;
            }

            // Detecta início da interface dentro de um bloco type (sem a palavra "type")
            const interfaceInBlockMatch = line.match(interfaceInBlockRegex);
            if (interfaceInBlockMatch && !currentInterface) {
                currentInterface = interfaceInBlockMatch[1];
                braceCount = 1;
                console.error(`✅ Found interface in type block: ${currentInterface} at line ${index + 1}`);
                const range = new vscode.Range(index, 0, index, line.length);

                // CodeLens para toda a interface
                const codeLens = new vscode.CodeLens(range, {
                    title: "👁️ implementations",
                    command: 'golang-implementation-lens.showImplementations',
                    arguments: [currentInterface, document.uri]
                });

                codeLenses.push(codeLens);
                return;
            }

            // Se estamos dentro de uma interface
            if (currentInterface) {
                // Conta chaves para detectar fim da interface
                braceCount += (line.match(/\{/g) || []).length;
                braceCount -= (line.match(/\}/g) || []).length;

                if (braceCount === 0) {
                    currentInterface = null;
                    return;
                }

                // Detecta métodos dentro da interface
                const methodMatch = line.match(methodRegex);
                if (methodMatch && !line.trim().startsWith('//')) {
                    const methodName = methodMatch[1];
                    console.error(`  ✅ Found method: ${methodName} in ${currentInterface}`);
                    const range = new vscode.Range(index, 0, index, line.length);

                    // CodeLens para cada método
                    const codeLens = new vscode.CodeLens(range, {
                        title: "→ implementations",
                        command: 'golang-implementation-lens.showMethodImplementations',
                        arguments: [currentInterface, methodName, document.uri]
                    });

                    codeLenses.push(codeLens);
                }
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

// Provider para detectar métodos de structs e mostrar "goto interface"
class GolangGotoInterfaceLensProvider {
    constructor() {
        console.error('📦 GolangGotoInterfaceLensProvider CONSTRUCTOR called');
        this._onDidChangeCodeLenses = new vscode.EventEmitter();
        this.onDidChangeCodeLenses = this._onDidChangeCodeLenses.event;
    }

    provideCodeLenses(document, token) {
        console.error(`🔙 GotoInterface provideCodeLenses called for: ${document.fileName}`);
        const codeLenses = [];
        const text = document.getText();
        const lines = text.split('\n');
        
        // Regex para detectar métodos de structs: func (r *Type) MethodName(...) ...
        const methodReceiverRegex = /^\s*func\s+\(\s*\w+\s+\*?(\w+)\s*\)\s+(\w+)\s*\(/;
        
        lines.forEach((line, index) => {
            const match = line.match(methodReceiverRegex);
            if (match) {
                const receiverType = match[1];
                const methodName = match[2];

                // Check if should be excluded based on configuration
                if (shouldExclude(document.fileName, receiverType)) {
                    console.error(`  🚫 Skipping excluded method: ${receiverType}.${methodName}`);
                    return;
                }
                
                console.error(`  ✅ Found struct method: ${receiverType}.${methodName} at line ${index + 1}`);
                const range = new vscode.Range(index, 0, index, line.length);
                
                // CodeLens para navegar para interface
                const codeLens = new vscode.CodeLens(range, {
                    title: "← goto interface",
                    command: 'golang-implementation-lens.gotoInterface',
                    arguments: [receiverType, methodName, document.uri]
                });
                
                codeLenses.push(codeLens);
            }
        });

        console.error(`📊 Returning ${codeLenses.length} GotoInterface CodeLens(es)`);
        return codeLenses;
    }

    resolveCodeLens(codeLens, token) {
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

                        // Check if should be excluded based on configuration
                        if (shouldExclude(filePath, receiverType)) {
                            console.error(`🚫 Skipping excluded: ${receiverType}`);
                            continue;
                        }
                        
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

async function showMethodImplementations(interfaceName, methodName, documentUri) {
    console.error(`🎯 showMethodImplementations called for: ${interfaceName}.${methodName}`);
    const workspaceFolder = vscode.workspace.getWorkspaceFolder(documentUri);
    if (!workspaceFolder) {
        vscode.window.showErrorMessage('No workspace folder found');
        return;
    }

    const workspacePath = workspaceFolder.uri.fsPath;
    
    // Busca por implementações do método específico
    const cmd = `cd "${workspacePath}" && grep -rn "^func.*${methodName}" --include="*.go" . 2>/dev/null`;
    
    console.error(`📍 Finding implementations of ${methodName} with: ${cmd}`);

    await vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: `Searching ${methodName} implementations...`,
        cancellable: false
    }, async () => {
        return new Promise((resolve) => {
            exec(cmd, { timeout: 5000, maxBuffer: 1024 * 1024 }, async (error, stdout, stderr) => {
                console.error(`📤 stdout for ${methodName}:`, stdout);
                
                if (error && !stdout) {
                    vscode.window.showWarningMessage(`No implementations found for ${methodName}`);
                    console.error(`❌ Error:`, error);
                    resolve();
                    return;
                }

                if (!stdout || stdout.trim().length === 0) {
                    vscode.window.showInformationMessage(`No implementations found for ${methodName}`);
                    resolve();
                    return;
                }

                const lines = stdout.trim().split('\n');
                console.error(`📊 Found ${lines.length} matches for ${methodName}`);
                
                const items = [];
                const processedItems = new Set();
                
                for (const line of lines) {
                    const match = line.match(/^(.+):(\d+):(.*)$/);
                    if (match) {
                        const filePath = match[1];
                        const lineNum = parseInt(match[2]) - 1;
                        const content = match[3].trim();
                        
                        // Extrai o tipo do receiver: func (r *ReceiverType) Method
                        const receiverMatch = content.match(/func\s+\(\s*\w+\s+\*?(\w+)\s*\)/);
                        if (!receiverMatch) continue;

                        const receiverType = receiverMatch[1];

                        // Check if should be excluded based on configuration
                        if (shouldExclude(filePath, receiverType)) {
                            console.error(`  🚫 Skipping excluded: ${receiverType} in ${filePath}`);
                            continue;
                        }
                        
                        const key = `${receiverType}:${filePath}`;
                        
                        // Evita duplicatas
                        if (processedItems.has(key)) continue;
                        processedItems.add(key);
                        
                        const fullPath = path.isAbsolute(filePath) ? filePath : path.join(workspacePath, filePath);
                        const fileName = path.basename(fullPath);
                        const dirName = path.basename(path.dirname(fullPath));
                        
                        items.push({
                            label: `$(symbol-method) ${receiverType}.${methodName}`,
                            description: `${dirName}/${fileName}:${lineNum + 1}`,
                            detail: content,
                            filePath: fullPath,
                            lineNum: lineNum,
                            receiverType: receiverType
                        });
                    }
                }

                if (items.length === 0) {
                    vscode.window.showInformationMessage(`No implementations found for ${methodName}`);
                    resolve();
                    return;
                }

                const selected = await vscode.window.showQuickPick(items, {
                    placeHolder: `${items.length} implementation(s) of ${interfaceName}.${methodName} - Select to navigate`,
                    matchOnDescription: true,
                    matchOnDetail: true
                });

                if (selected) {
                    try {
                        const document = await vscode.workspace.openTextDocument(selected.filePath);
                        const editor = await vscode.window.showTextDocument(document);
                        
                        const position = new vscode.Position(selected.lineNum, 0);
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

async function gotoInterface(receiverType, methodName, documentUri) {
    console.error(`🔙 gotoInterface called for: ${receiverType}.${methodName}`);
    const workspaceFolder = vscode.workspace.getWorkspaceFolder(documentUri);
    if (!workspaceFolder) {
        vscode.window.showErrorMessage('No workspace folder found');
        return;
    }

    const workspacePath = workspaceFolder.uri.fsPath;

    // Busca por interfaces que declaram este método (ambos formatos: type X interface e X interface)
    const cmd = `cd "${workspacePath}" && grep -rn "interface\\s*{" --include="*.go" . 2>/dev/null`;

    console.error(`🔍 Searching interfaces with: ${cmd}`);

    await vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: `Searching interfaces with ${methodName}...`,
        cancellable: false
    }, async () => {
        return new Promise((resolve) => {
            exec(cmd, { timeout: 5000, maxBuffer: 1024 * 1024 }, async (error, stdout, stderr) => {
                if (error && !stdout) {
                    vscode.window.showWarningMessage(`No interfaces found`);
                    console.error(`❌ Error:`, error);
                    resolve();
                    return;
                }

                if (!stdout || stdout.trim().length === 0) {
                    vscode.window.showInformationMessage(`No interfaces found`);
                    resolve();
                    return;
                }

                const lines = stdout.trim().split('\n');
                console.error(`📊 Found ${lines.length} interface declarations`);
                
                const items = [];
                
                for (const line of lines) {
                    const match = line.match(/^(.+):(\d+):(.*)$/);
                    if (match) {
                        const filePath = match[1];
                        const lineNum = parseInt(match[2]) - 1;
                        const content = match[3].trim();

                        // Extrai nome da interface: type InterfaceName interface OU InterfaceName interface (dentro de bloco)
                        let interfaceMatch = content.match(/type\s+(\w+)\s+interface/);
                        if (!interfaceMatch) {
                            // Tenta o formato de bloco type
                            interfaceMatch = content.match(/^\s*(\w+)\s+interface/);
                        }
                        if (!interfaceMatch) continue;

                        const interfaceName = interfaceMatch[1];
                        
                        // Verifica se a interface contém o método
                        const fullPath = path.isAbsolute(filePath) ? filePath : path.join(workspacePath, filePath);
                        
                        try {
                            const document = await vscode.workspace.openTextDocument(fullPath);
                            const interfaceMethods = extractInterfaceMethods(document.getText(), interfaceName);
                            
                            if (!interfaceMethods.includes(methodName)) {
                                console.error(`  ⏭️ ${interfaceName} doesn't have method ${methodName}`);
                                continue;
                            }
                            
                            console.error(`  ✅ ${interfaceName} contains ${methodName}`);
                            
                            const fileName = path.basename(fullPath);
                            const dirName = path.basename(path.dirname(fullPath));
                            
                            items.push({
                                label: `$(symbol-interface) ${interfaceName}`,
                                description: `${dirName}/${fileName}:${lineNum + 1}`,
                                detail: `Interface with ${interfaceMethods.length} method(s)`,
                                filePath: fullPath,
                                lineNum: lineNum,
                                interfaceName: interfaceName
                            });
                        } catch (err) {
                            console.error(`❌ Error reading ${filePath}:`, err);
                        }
                    }
                }

                if (items.length === 0) {
                    vscode.window.showInformationMessage(`No interfaces found declaring ${methodName}`);
                    resolve();
                    return;
                }

                const selected = await vscode.window.showQuickPick(items, {
                    placeHolder: `${items.length} interface(s) declaring ${methodName} - Select to navigate`,
                    matchOnDescription: true,
                    matchOnDetail: true
                });

                if (selected) {
                    try {
                        const document = await vscode.workspace.openTextDocument(selected.filePath);
                        const editor = await vscode.window.showTextDocument(document);
                        
                        const position = new vscode.Position(selected.lineNum, 0);
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
        // Detecta início da interface (formato padrão)
        const interfaceStart = line.match(new RegExp(`type\\s+${interfaceName}\\s+interface\\s*\\{`));
        if (interfaceStart) {
            inInterface = true;
            braceCount = 1;
            continue;
        }

        // Detecta início da interface dentro de um bloco type
        const interfaceInBlockStart = line.match(new RegExp(`^\\s*${interfaceName}\\s+interface\\s*\\{`));
        if (interfaceInBlockStart) {
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
    const gotoInterfaceProvider = new GolangGotoInterfaceLensProvider();
    
    console.error('📝 Registering CodeLens providers...');
    
    // Provider para interfaces -> implementações
    context.subscriptions.push(
        vscode.languages.registerCodeLensProvider(
            { language: 'go', scheme: 'file' }, 
            provider
        )
    );
    
    // Provider para implementações -> interfaces
    context.subscriptions.push(
        vscode.languages.registerCodeLensProvider(
            { language: 'go', scheme: 'file' }, 
            gotoInterfaceProvider
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
            'golang-implementation-lens.showMethodImplementations', 
            showMethodImplementations
        )
    );
    
    context.subscriptions.push(
        vscode.commands.registerCommand(
            'golang-implementation-lens.gotoInterface', 
            gotoInterface
        )
    );

    context.subscriptions.push(
        vscode.commands.registerCommand(
            'golang-implementation-lens.clearCache',
            () => {
                provider.cache.clear();
                vscode.window.showInformationMessage('✅ Cache cleared!');
                provider._onDidChangeCodeLenses.fire();
                gotoInterfaceProvider._onDidChangeCodeLenses.fire();
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

