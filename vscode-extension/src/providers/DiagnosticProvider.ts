import * as vscode from "vscode";
import { ApiClient } from "../utils/ApiClient";

export class NeuroLintDiagnosticProvider {
  private diagnostics: vscode.DiagnosticCollection;
  private debounceTimer: Map<string, NodeJS.Timeout> = new Map();
  private analysisQueue: Map<string, Promise<void>> = new Map();
  private isDisposed: boolean = false;

  constructor(
    private apiClient: ApiClient,
    private outputChannel: vscode.OutputChannel,
  ) {
    this.diagnostics = vscode.languages.createDiagnosticCollection("neurolint");
  }

  public updateDiagnostics(document: vscode.TextDocument): void {
    if (!this.isSupported(document) || this.isDisposed) {
      return;
    }

    // Debounce updates with adaptive timing based on file size
    const uri = document.uri.toString();
    const existingTimer = this.debounceTimer.get(uri);

    if (existingTimer) {
      clearTimeout(existingTimer);
    }

    // Adaptive debounce timing based on file size and connection status
    const fileSize = document.getText().length;
    const baseDelay = this.apiClient.isConnectionHealthy() ? 800 : 2000;
    const adaptiveDelay = Math.min(baseDelay + (fileSize / 10000) * 100, 5000);

    const timer = setTimeout(() => {
      this.performAnalysis(document);
      this.debounceTimer.delete(uri);
    }, adaptiveDelay);

    this.debounceTimer.set(uri, timer);
  }

  private async performAnalysis(document: vscode.TextDocument): Promise<void> {
    if (this.isDisposed) return;

    const uri = document.uri.toString();

    // Cancel existing analysis for this document
    const existingAnalysis = this.analysisQueue.get(uri);
    if (existingAnalysis) {
      // Let existing analysis complete to avoid duplicate API calls
      return;
    }

    // Skip analysis for very large files to avoid performance issues
    const fileSize = document.getText().length;
    if (fileSize > 2 * 1024 * 1024) {
      // 2MB limit
      this.outputChannel.appendLine(
        `Skipping analysis for large file: ${document.fileName} (${Math.round(fileSize / 1024)}KB)`,
      );
      return;
    }

    const analysisPromise = this.doAnalysis(document);
    this.analysisQueue.set(uri, analysisPromise);

    try {
      await analysisPromise;
    } finally {
      this.analysisQueue.delete(uri);
    }
  }

  private async doAnalysis(document: vscode.TextDocument): Promise<void> {
    try {
      const result = await this.apiClient.analyzeCode(
        document.getText(),
        document.fileName,
      );

      if (this.isDisposed) return;

      const diagnostics: vscode.Diagnostic[] = [];

      if (result.layers) {
        result.layers.forEach((layer) => {
          if (layer.insights && Array.isArray(layer.insights)) {
            layer.insights.forEach((insight) => {
              const diagnostic = this.createDiagnostic(insight, document);
              if (diagnostic) {
                diagnostics.push(diagnostic);
              }
            });
          }
        });
      }

      // Add connection status diagnostic if offline
      if (!this.apiClient.isConnectionHealthy()) {
        const statusDiagnostic = new vscode.Diagnostic(
          new vscode.Range(0, 0, 0, 0),
          "NeuroLint: Analysis limited - API server not connected",
          vscode.DiagnosticSeverity.Information,
        );
        statusDiagnostic.source = "NeuroLint";
        statusDiagnostic.code = "connection-status";
        diagnostics.push(statusDiagnostic);
      }

      this.diagnostics.set(document.uri, diagnostics);
    } catch (error) {
      if (this.isDisposed) return;

      // Only clear diagnostics for connection errors, preserve existing ones for other errors
      if (error && typeof error === "object" && "code" in error) {
        const errorCode = (error as any).code;
        if (
          errorCode === "ECONNREFUSED" ||
          errorCode === "ETIMEDOUT" ||
          errorCode === "ENOTFOUND"
        ) {
          // Show connection issue as diagnostic instead of clearing all
          const connectionDiagnostic = new vscode.Diagnostic(
            new vscode.Range(0, 0, 0, 0),
            "NeuroLint: Cannot connect to analysis server",
            vscode.DiagnosticSeverity.Warning,
          );
          connectionDiagnostic.source = "NeuroLint";
          connectionDiagnostic.code = "connection-error";
          this.diagnostics.set(document.uri, [connectionDiagnostic]);
          return;
        }
      }

      // For other errors, just log them without clearing diagnostics
      this.outputChannel.appendLine(
        `Diagnostic analysis failed for ${document.fileName}: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  private createDiagnostic(
    insight: any,
    document: vscode.TextDocument,
  ): vscode.Diagnostic | null {
    try {
      // Try to find the location of the issue in the document
      const text = document.getText();
      const lines = text.split("\n");

      let range: vscode.Range;

      if (insight.line !== undefined) {
        // Use provided line number
        const line = Math.max(0, Math.min(insight.line - 1, lines.length - 1));
        const lineText = lines[line];
        const startChar = insight.column || 0;
        const endChar = Math.min(
          startChar + (insight.length || 10),
          lineText.length,
        );

        range = new vscode.Range(
          new vscode.Position(line, startChar),
          new vscode.Position(line, endChar),
        );
      } else if (insight.pattern) {
        // Try to find the pattern in the text
        const regex = new RegExp(insight.pattern, "gi");
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

      const severity = this.getSeverity(insight.severity || "warning");

      const diagnostic = new vscode.Diagnostic(
        range,
        insight.message,
        severity,
      );

      diagnostic.source = "NeuroLint";
      diagnostic.code = insight.ruleId || `layer-${insight.layerId}`;

      if (insight.fix) {
        diagnostic.relatedInformation = [
          new vscode.DiagnosticRelatedInformation(
            new vscode.Location(document.uri, range),
            `Suggested fix: ${insight.fix}`,
          ),
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
      case "error":
        return vscode.DiagnosticSeverity.Error;
      case "warning":
        return vscode.DiagnosticSeverity.Warning;
      case "info":
        return vscode.DiagnosticSeverity.Information;
      case "hint":
        return vscode.DiagnosticSeverity.Hint;
      default:
        return vscode.DiagnosticSeverity.Warning;
    }
  }

  private isSupported(document: vscode.TextDocument): boolean {
    return [
      "typescript",
      "javascript",
      "typescriptreact",
      "javascriptreact",
    ].includes(document.languageId);
  }

  public dispose(): void {
    this.diagnostics.dispose();
    this.debounceTimer.forEach((timer) => clearTimeout(timer));
    this.debounceTimer.clear();
  }
}
