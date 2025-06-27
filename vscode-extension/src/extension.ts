import * as vscode from 'vscode';
import { NeuroLintProvider } from './providers/NeuroLintProvider';
import { NeuroLintCodeActionProvider } from './providers/CodeActionProvider';
import { NeuroLintHoverProvider } from './providers/HoverProvider';
import { NeuroLintDiagnosticProvider } from './providers/DiagnosticProvider';
import { NeuroLintTreeDataProvider } from './providers/TreeDataProvider';
import { NeuroLintStatusBar } from './ui/StatusBar';
import { NeuroLintWebview } from './ui/Webview';
import { ConfigurationManager } from './utils/ConfigurationManager';
import { ApiClient } from './utils/ApiClient';

let diagnosticProvider: NeuroLintDiagnosticProvider;
let statusBar: NeuroLintStatusBar;
let outputChannel: vscode.OutputChannel;

export function activate(context: vscode.ExtensionContext) {
    // Initialize output channel
    outputChannel = vscode.window.createOutputChannel('NeuroLint');
    outputChannel.appendLine('🧠 NeuroLint extension activated');

    // Initialize configuration manager
    const configManager = new ConfigurationManager();
    
    // Initialize API client
    const apiClient = new ApiClient(configManager);

    // Initialize status bar
    statusBar = new NeuroLintStatusBar();
    context.subscriptions.push(statusBar.statusBarItem);

    // Initialize diagnostic provider
    diagnosticProvider = new NeuroLintDiagnosticProvider(apiClient, outputChannel);
    context.subscriptions.push(diagnosticProvider);

    // Register providers
    const selector = [
        { scheme: 'file', language: 'typescript' },
        { scheme: 'file', language: 'javascript' },
        { scheme: 'file', language: 'typescriptreact' },
        { scheme: 'file', language: 'javascriptreact' }
    ];

    // Code action provider (quick fixes)
    context.subscriptions.push(
        vscode.languages.registerCodeActionsProvider(
            selector,
            new NeuroLintCodeActionProvider(apiClient, outputChannel)
        )
    );

    // Hover provider (documentation)
    context.subscriptions.push(
        vscode.languages.registerHoverProvider(
            selector,
            new NeuroLintHoverProvider(apiClient)
        )
    );

    // Tree data provider (explorer view)
    const treeDataProvider = new NeuroLintTreeDataProvider(apiClient);
    context.subscriptions.push(
        vscode.window.createTreeView('neurolintExplorer', {
            treeDataProvider,
            showCollapseAll: true
        })
    );

    // Register commands
    context.subscriptions.push(
        vscode.commands.registerCommand('neurolint.analyzeFile', async (uri?: vscode.Uri) => {
            await analyzeFile(uri, apiClient);
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('neurolint.analyzeWorkspace', async () => {
            await analyzeWorkspace(apiClient);
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('neurolint.fixFile', async (uri?: vscode.Uri) => {
            await fixFile(uri, apiClient);
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('neurolint.fixWorkspace', async () => {
            await fixWorkspace(apiClient);
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('neurolint.configure', async () => {
            await configureNeuroLint();
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('neurolint.login', async () => {
            await loginToNeuroLint(configManager);
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('neurolint.showOutput', () => {
            outputChannel.show();
        })
    );

    // Auto-fix on save if enabled
    context.subscriptions.push(
        vscode.workspace.onWillSaveTextDocument(async (event) => {
            const config = vscode.workspace.getConfiguration('neurolint');
            if (config.get('autoFix') && isSupported(event.document)) {
                event.waitUntil(autoFixDocument(event.document, apiClient));
            }
        })
    );

    // File change listeners
    context.subscriptions.push(
        vscode.workspace.onDidChangeTextDocument((event) => {
            if (isSupported(event.document)) {
                diagnosticProvider.updateDiagnostics(event.document);
            }
        })
    );

    context.subscriptions.push(
        vscode.workspace.onDidOpenTextDocument((document) => {
            if (isSupported(document)) {
                diagnosticProvider.updateDiagnostics(document);
            }
        })
    );

    // Configuration change listener
    context.subscriptions.push(
        vscode.workspace.onDidChangeConfiguration((event) => {
            if (event.affectsConfiguration('neurolint')) {
                configManager.reload();
                statusBar.updateStatus('Configuration updated');
            }
        })
    );

    // Set context for when extension is enabled
    vscode.commands.executeCommand('setContext', 'neurolint.enabled', true);

    outputChannel.appendLine('✅ NeuroLint extension ready');
    statusBar.updateStatus('Ready');
}

export function deactivate() {
    if (diagnosticProvider) {
        diagnosticProvider.dispose();
    }
    if (statusBar) {
        statusBar.dispose();
    }
    if (outputChannel) {
        outputChannel.dispose();
    }
}

async function analyzeFile(uri: vscode.Uri | undefined, apiClient: ApiClient) {
    const document = uri ? await vscode.workspace.openTextDocument(uri) : vscode.window.activeTextEditor?.document;
    
    if (!document || !isSupported(document)) {
        vscode.window.showWarningMessage('Please select a TypeScript or JavaScript file');
        return;
    }

    statusBar.updateStatus('Analyzing...', true);
    outputChannel.appendLine(`🔍 Analyzing: ${document.fileName}`);

    try {
        const result = await apiClient.analyzeCode(document.getText(), document.fileName);
        
        // Show results in webview
        const webview = new NeuroLintWebview();
        webview.showAnalysisResults(result);
        
        outputChannel.appendLine(`✅ Analysis complete: ${result.layers.length} layers processed`);
        statusBar.updateStatus('Analysis complete');
        
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        outputChannel.appendLine(`❌ Analysis failed: ${message}`);
        vscode.window.showErrorMessage(`NeuroLint analysis failed: ${message}`);
        statusBar.updateStatus('Analysis failed');
    }
}

async function analyzeWorkspace(apiClient: ApiClient) {
    const files = await vscode.workspace.findFiles('**/*.{ts,tsx,js,jsx}', '**/node_modules/**');
    
    if (files.length === 0) {
        vscode.window.showInformationMessage('No TypeScript/JavaScript files found in workspace');
        return;
    }

    const result = await vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: 'NeuroLint Workspace Analysis',
        cancellable: true
    }, async (progress, token) => {
        const results = [];
        
        for (let i = 0; i < files.length; i++) {
            if (token.isCancellationRequested) {
                break;
            }
            
            const file = files[i];
            progress.report({ 
                increment: (100 / files.length), 
                message: `Analyzing ${file.fsPath}` 
            });
            
            try {
                const document = await vscode.workspace.openTextDocument(file);
                const result = await apiClient.analyzeCode(document.getText(), document.fileName);
                results.push({ file: file.fsPath, result });
            } catch (error) {
                outputChannel.appendLine(`❌ Failed to analyze ${file.fsPath}: ${error}`);
            }
        }
        
        return results;
    });

    // Show workspace results
    const webview = new NeuroLintWebview();
    webview.showWorkspaceResults(result);
}

async function fixFile(uri: vscode.Uri | undefined, apiClient: ApiClient) {
    const document = uri ? await vscode.workspace.openTextDocument(uri) : vscode.window.activeTextEditor?.document;
    
    if (!document || !isSupported(document)) {
        vscode.window.showWarningMessage('Please select a TypeScript or JavaScript file');
        return;
    }

    const choice = await vscode.window.showWarningMessage(
        'This will modify your file. Do you want to continue?',
        'Yes', 'Preview Changes', 'Cancel'
    );

    if (choice === 'Cancel') {
        return;
    }

    statusBar.updateStatus('Fixing...', true);
    outputChannel.appendLine(`🔧 Fixing: ${document.fileName}`);

    try {
        const result = await apiClient.transformCode(document.getText(), document.fileName);
        
        if (choice === 'Preview Changes') {
            // Show diff in editor
            const originalUri = document.uri;
            const modifiedUri = originalUri.with({ scheme: 'neurolint', query: 'modified' });
            
            await vscode.commands.executeCommand('vscode.diff', originalUri, modifiedUri, 'NeuroLint: Changes Preview');
        } else {
            // Apply changes directly
            const edit = new vscode.WorkspaceEdit();
            const fullRange = new vscode.Range(
                document.positionAt(0),
                document.positionAt(document.getText().length)
            );
            edit.replace(document.uri, fullRange, result.transformed);
            
            const success = await vscode.workspace.applyEdit(edit);
            if (success) {
                outputChannel.appendLine(`✅ File fixed successfully`);
                statusBar.updateStatus('Fix applied');
                vscode.window.showInformationMessage('NeuroLint fixes applied successfully');
            }
        }
        
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        outputChannel.appendLine(`❌ Fix failed: ${message}`);
        vscode.window.showErrorMessage(`NeuroLint fix failed: ${message}`);
        statusBar.updateStatus('Fix failed');
    }
}

async function fixWorkspace(apiClient: ApiClient) {
    const files = await vscode.workspace.findFiles('**/*.{ts,tsx,js,jsx}', '**/node_modules/**');
    
    if (files.length === 0) {
        vscode.window.showInformationMessage('No TypeScript/JavaScript files found in workspace');
        return;
    }

    const choice = await vscode.window.showWarningMessage(
        `This will modify ${files.length} files in your workspace. Do you want to continue?`,
        'Yes', 'Cancel'
    );

    if (choice === 'Cancel') {
        return;
    }

    await vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: 'NeuroLint Workspace Fix',
        cancellable: true
    }, async (progress, token) => {
        let fixed = 0;
        
        for (let i = 0; i < files.length; i++) {
            if (token.isCancellationRequested) {
                break;
            }
            
            const file = files[i];
            progress.report({ 
                increment: (100 / files.length), 
                message: `Fixing ${file.fsPath}` 
            });
            
            try {
                const document = await vscode.workspace.openTextDocument(file);
                const result = await apiClient.transformCode(document.getText(), document.fileName);
                
                if (result.transformed !== document.getText()) {
                    const edit = new vscode.WorkspaceEdit();
                    const fullRange = new vscode.Range(
                        document.positionAt(0),
                        document.positionAt(document.getText().length)
                    );
                    edit.replace(document.uri, fullRange, result.transformed);
                    
                    if (await vscode.workspace.applyEdit(edit)) {
                        fixed++;
                    }
                }
            } catch (error) {
                outputChannel.appendLine(`❌ Failed to fix ${file.fsPath}: ${error}`);
            }
        }
        
        vscode.window.showInformationMessage(`NeuroLint fixed ${fixed} files`);
    });
}

async function configureNeuroLint() {
    const config = vscode.workspace.getConfiguration('neurolint');
    
    const items = [
        'API URL',
        'API Key', 
        'Enabled Layers',
        'Auto Fix on Save',
        'Diagnostic Level'
    ];

    const choice = await vscode.window.showQuickPick(items, {
        placeHolder: 'Select configuration to modify'
    });

    switch (choice) {
        case 'API URL':
            const apiUrl = await vscode.window.showInputBox({
                prompt: 'Enter NeuroLint API URL',
                value: config.get('apiUrl')
            });
            if (apiUrl) {
                await config.update('apiUrl', apiUrl, vscode.ConfigurationTarget.Workspace);
            }
            break;
            
        case 'API Key':
            const apiKey = await vscode.window.showInputBox({
                prompt: 'Enter NeuroLint API Key',
                password: true
            });
            if (apiKey) {
                await config.update('apiKey', apiKey, vscode.ConfigurationTarget.Workspace);
            }
            break;
            
        // Add other configuration options...
    }
}

async function loginToNeuroLint(configManager: ConfigurationManager) {
    const apiKey = await vscode.window.showInputBox({
        prompt: 'Enter your NeuroLint API key',
        password: true,
        ignoreFocusOut: true
    });

    if (apiKey) {
        const config = vscode.workspace.getConfiguration('neurolint');
        await config.update('apiKey', apiKey, vscode.ConfigurationTarget.Global);
        vscode.window.showInformationMessage('Successfully logged in to NeuroLint');
        statusBar.updateStatus('Logged in');
    }
}

async function autoFixDocument(document: vscode.TextDocument, apiClient: ApiClient): Promise<vscode.TextEdit[]> {
    try {
        const result = await apiClient.transformCode(document.getText(), document.fileName);
        
        if (result.transformed !== document.getText()) {
            const fullRange = new vscode.Range(
                document.positionAt(0),
                document.positionAt(document.getText().length)
            );
            return [vscode.TextEdit.replace(fullRange, result.transformed)];
        }
    } catch (error) {
        outputChannel.appendLine(`Auto-fix failed: ${error}`);
    }
    
    return [];
}

function isSupported(document: vscode.TextDocument): boolean {
    return ['typescript', 'javascript', 'typescriptreact', 'javascriptreact'].includes(document.languageId);
}