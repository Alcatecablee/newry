import * as vscode from 'vscode';
import { ApiClient } from '../utils/ApiClient';

export class NeuroLintDiagnosticProvider {
    private diagnostics: vscode.DiagnosticCollection;
    private debounceTimer: Map<string, NodeJS.Timeout> = new Map();

    constructor(
        private apiClient: ApiClient,
        private outputChannel: vscode.OutputChannel
    ) {
        this.diagnostics = vscode.languages.createDiagnosticCollection('neurolint');
    }

    public updateDiagnostics(document: vscode.TextDocument): void {
        if (!this.isSupported(document)) {
            return;
        }

        // Debounce updates to avoid too many API calls
        const uri = document.uri.toString();
        const existingTimer = this.debounceTimer.get(uri);
        
        if (existingTimer) {
            clearTimeout(existingTimer);
        }

        const timer = setTimeout(() => {
            this.performAnalysis(document);
            this.debounceTimer.delete(uri);
        }, 1000); // 1 second debounce

        this.debounceTimer.set(uri, timer);
    }

    private async performAnalysis(document: vscode.TextDocument): Promise<void> {
        try {
            const result = await this.apiClient.analyzeCode(
                document.getText(),
                document.fileName
            );

            const diagnostics: vscode.Diagnostic[] = [];

            result.layers.forEach(layer => {
                if (layer.insights) {
                    layer.insights.forEach(insight => {
                        const diagnostic = this.createDiagnostic(insight, document);
                        if (diagnostic) {
                            diagnostics.push(diagnostic);
                        }
                    });
                }
            });

            this.diagnostics.set(document.uri, diagnostics);
            
        } catch (error) {
            // Clear diagnostics on error to avoid stale data
            this.diagnostics.set(document.uri, []);
            this.outputChannel.appendLine(`Diagnostic analysis failed for ${document.fileName}: ${error}`);
        }
    }

    private createDiagnostic(insight: any, document: vscode.TextDocument): vscode.Diagnostic | null {
        try {
            // Try to find the location of the issue in the document
            const text = document.getText();
            const lines = text.split('\n');
            
            let range: vscode.Range;
            
            if (insight.line !== undefined) {
                // Use provided line number
                const line = Math.max(0, Math.min(insight.line - 1, lines.length - 1));
                const lineText = lines[line];
                const startChar = insight.column || 0;
                const endChar = Math.min(startChar + (insight.length || 10), lineText.length);
                
                range = new vscode.Range(
                    new vscode.Position(line, startChar),
                    new vscode.Position(line, endChar)
                );
            } else if (insight.pattern) {
                // Try to find the pattern in the text
                const regex = new RegExp(insight.pattern, 'gi');
                const match = regex.exec(text);
                
                if (match) {
                    const startPos = document.positionAt(match.index);
                    const endPos = document.positionAt(match.index + match[0].length);
                    range = new vscode.Range(startPos, endPos);
                } else {
                    // Fallback to first line
                    range = new vscode.Range(0, 0, 0, lines[0]?.length || 0);
                }
            } else {
                // Default to first line
                range = new vscode.Range(0, 0, 0, lines[0]?.length || 0);
            }

            const severity = this.getSeverity(insight.severity || 'warning');
            
            const diagnostic = new vscode.Diagnostic(
                range,
                insight.message,
                severity
            );

            diagnostic.source = 'NeuroLint';
            diagnostic.code = insight.ruleId || `layer-${insight.layerId}`;
            
            if (insight.fix) {
                diagnostic.relatedInformation = [
                    new vscode.DiagnosticRelatedInformation(
                        new vscode.Location(document.uri, range),
                        `Suggested fix: ${insight.fix}`
                    )
                ];
            }

            return diagnostic;
            
        } catch (error) {
            this.outputChannel.appendLine(`Failed to create diagnostic: ${error}`);
            return null;
        }
    }

    private getSeverity(severity: string): vscode.DiagnosticSeverity {
        switch (severity.toLowerCase()) {
            case 'error':
                return vscode.DiagnosticSeverity.Error;
            case 'warning':
                return vscode.DiagnosticSeverity.Warning;
            case 'info':
                return vscode.DiagnosticSeverity.Information;
            case 'hint':
                return vscode.DiagnosticSeverity.Hint;
            default:
                return vscode.DiagnosticSeverity.Warning;
        }
    }

    private isSupported(document: vscode.TextDocument): boolean {
        return ['typescript', 'javascript', 'typescriptreact', 'javascriptreact']
            .includes(document.languageId);
    }

    public dispose(): void {
        this.diagnostics.dispose();
        this.debounceTimer.forEach(timer => clearTimeout(timer));
        this.debounceTimer.clear();
    }
}