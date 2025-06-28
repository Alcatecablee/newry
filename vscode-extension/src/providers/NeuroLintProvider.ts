import * as vscode from "vscode";
import { ApiClient } from "../utils/ApiClient";
import { ConfigurationManager } from "../utils/ConfigurationManager";

export class NeuroLintProvider {
  private diagnosticCollection: vscode.DiagnosticCollection;
  private documentAnalysisCache: Map<string, any> = new Map();
  private analysisQueue: Set<string> = new Set();
  private isAnalyzing: boolean = false;

  constructor(
    private apiClient: ApiClient,
    private configManager: ConfigurationManager,
    private outputChannel: vscode.OutputChannel,
  ) {
    this.diagnosticCollection =
      vscode.languages.createDiagnosticCollection("neurolint");
  }

  public async analyzeDocument(document: vscode.TextDocument): Promise<void> {
    if (!this.isSupported(document)) {
      return;
    }

    const uri = document.uri.toString();

    // Avoid duplicate analysis
    if (this.analysisQueue.has(uri)) {
      return;
    }

    this.analysisQueue.add(uri);

    try {
      this.outputChannel.appendLine(`Analyzing document: ${document.fileName}`);

      const result = await this.apiClient.analyzeCode(
        document.getText(),
        document.fileName,
      );

      // Cache the result
      this.documentAnalysisCache.set(uri, result);

      // Update diagnostics
      this.updateDiagnostics(document, result);

      // Log audit trail if enabled
      if (this.configManager.isAuditLoggingEnabled()) {
        this.logAuditEvent("document.analyzed", {
          file: document.fileName,
          layers: result.layers?.length || 0,
          issues: this.countIssues(result),
          timestamp: new Date().toISOString(),
        });
      }
    } catch (error) {
      this.outputChannel.appendLine(
        `Analysis failed: ${error instanceof Error ? error.message : String(error)}`,
      );

      // Clear diagnostics on error
      this.diagnosticCollection.set(document.uri, []);

      if (this.configManager.isAuditLoggingEnabled()) {
        this.logAuditEvent("document.analysis.failed", {
          file: document.fileName,
          error: error instanceof Error ? error.message : String(error),
          timestamp: new Date().toISOString(),
        });
      }
    } finally {
      this.analysisQueue.delete(uri);
    }
  }

  public async transformDocument(
    document: vscode.TextDocument,
  ): Promise<string | undefined> {
    if (!this.isSupported(document)) {
      return undefined;
    }

    try {
      this.outputChannel.appendLine(
        `Transforming document: ${document.fileName}`,
      );

      const result = await this.apiClient.transformCode(
        document.getText(),
        document.fileName,
      );

      // Log audit trail if enabled
      if (this.configManager.isAuditLoggingEnabled()) {
        this.logAuditEvent("document.transformed", {
          file: document.fileName,
          layers: result.layers?.length || 0,
          changes: this.countChanges(result),
          timestamp: new Date().toISOString(),
        });
      }

      return result.transformed;
    } catch (error) {
      this.outputChannel.appendLine(
        `Transform failed: ${error instanceof Error ? error.message : String(error)}`,
      );

      if (this.configManager.isAuditLoggingEnabled()) {
        this.logAuditEvent("document.transform.failed", {
          file: document.fileName,
          error: error instanceof Error ? error.message : String(error),
          timestamp: new Date().toISOString(),
        });
      }

      throw error;
    }
  }

  public async validateWorkspace(): Promise<
    vscode.WorkspaceFoldersChangeEvent | undefined
  > {
    if (!vscode.workspace.workspaceFolders) {
      return undefined;
    }

    try {
      this.outputChannel.appendLine("Validating workspace configuration...");

      // Check configuration validity
      const configValidation = this.configManager.validateConfiguration();
      if (!configValidation.valid) {
        vscode.window.showWarningMessage(
          `NeuroLint configuration issues: ${configValidation.errors.join(", ")}`,
        );
        return undefined;
      }

      // Validate API connection
      const connectionValid = await this.apiClient.healthCheck();
      if (!connectionValid) {
        vscode.window.showErrorMessage(
          "NeuroLint: Cannot connect to API server",
        );
        return undefined;
      }

      // Enterprise validation
      if (this.configManager.isEnterpriseMode()) {
        const teamId = this.configManager.getTeamId();
        if (!teamId) {
          vscode.window.showWarningMessage(
            "NeuroLint: Enterprise mode requires team configuration",
          );
        }
      }

      this.outputChannel.appendLine(
        "Workspace validation completed successfully",
      );

      if (this.configManager.isAuditLoggingEnabled()) {
        this.logAuditEvent("workspace.validated", {
          workspaceCount: vscode.workspace.workspaceFolders.length,
          enterpriseMode: this.configManager.isEnterpriseMode(),
          timestamp: new Date().toISOString(),
        });
      }
    } catch (error) {
      this.outputChannel.appendLine(
        `Workspace validation failed: ${error instanceof Error ? error.message : String(error)}`,
      );
      vscode.window.showErrorMessage(
        `NeuroLint workspace validation failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }

    return undefined;
  }

  public getAnalysisResult(document: vscode.TextDocument): any {
    return this.documentAnalysisCache.get(document.uri.toString());
  }

  public clearAnalysisCache(): void {
    this.documentAnalysisCache.clear();
    this.diagnosticCollection.clear();
    this.outputChannel.appendLine("Analysis cache cleared");
  }

  public async analyzeWorkspace(): Promise<void> {
    if (!vscode.workspace.workspaceFolders) {
      vscode.window.showWarningMessage("No workspace folder open");
      return;
    }

    const workspaceSettings = this.configManager.getWorkspaceSettings();

    try {
      this.isAnalyzing = true;

      // Find files to analyze
      const files = await vscode.workspace.findFiles(
        `{${workspaceSettings.includePatterns.join(",")}}`,
        `{${workspaceSettings.excludePatterns.join(",")}}`,
      );

      if (files.length === 0) {
        vscode.window.showInformationMessage("No files found to analyze");
        return;
      }

      // Check file count limit
      if (files.length > workspaceSettings.maxFiles) {
        const proceed = await vscode.window.showWarningMessage(
          `Found ${files.length} files, but limit is ${workspaceSettings.maxFiles}. Continue with first ${workspaceSettings.maxFiles} files?`,
          "Yes",
          "No",
        );
        if (proceed !== "Yes") {
          return;
        }
        files.splice(workspaceSettings.maxFiles);
      }

      await vscode.window.withProgress(
        {
          location: vscode.ProgressLocation.Notification,
          title: "NeuroLint Workspace Analysis",
          cancellable: true,
        },
        async (progress, token) => {
          let completed = 0;
          const total = files.length;

          for (const file of files) {
            if (token.isCancellationRequested) {
              break;
            }

            try {
              const document = await vscode.workspace.openTextDocument(file);

              // Check file size
              if (document.getText().length > workspaceSettings.maxFileSize) {
                this.outputChannel.appendLine(
                  `Skipping large file: ${file.fsPath}`,
                );
                continue;
              }

              await this.analyzeDocument(document);
              completed++;

              progress.report({
                increment: 100 / total,
                message: `${completed}/${total} files analyzed`,
              });
            } catch (error) {
              this.outputChannel.appendLine(
                `Failed to analyze ${file.fsPath}: ${error}`,
              );
            }
          }

          return completed;
        },
      );

      if (this.configManager.isAuditLoggingEnabled()) {
        this.logAuditEvent("workspace.analyzed", {
          totalFiles: files.length,
          completedFiles: this.documentAnalysisCache.size,
          timestamp: new Date().toISOString(),
        });
      }
    } finally {
      this.isAnalyzing = false;
    }
  }

  public isAnalysisInProgress(): boolean {
    return this.isAnalyzing || this.analysisQueue.size > 0;
  }

  private updateDiagnostics(document: vscode.TextDocument, result: any): void {
    const diagnostics: vscode.Diagnostic[] = [];

    if (result.layers) {
      result.layers.forEach((layer: any) => {
        if (layer.insights) {
          layer.insights.forEach((insight: any) => {
            const diagnostic = this.createDiagnostic(insight, document);
            if (diagnostic) {
              diagnostics.push(diagnostic);
            }
          });
        }
      });
    }

    this.diagnosticCollection.set(document.uri, diagnostics);
  }

  private createDiagnostic(
    insight: any,
    document: vscode.TextDocument,
  ): vscode.Diagnostic | null {
    try {
      let range: vscode.Range;

      if (insight.line !== undefined) {
        const line = Math.max(
          0,
          Math.min(insight.line - 1, document.lineCount - 1),
        );
        const lineText = document.lineAt(line).text;
        const startChar = insight.column || 0;
        const endChar = Math.min(
          startChar + (insight.length || 10),
          lineText.length,
        );

        range = new vscode.Range(
          new vscode.Position(line, startChar),
          new vscode.Position(line, endChar),
        );
      } else {
        range = new vscode.Range(0, 0, 0, 0);
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

  private countIssues(result: any): number {
    if (!result.layers) return 0;
    return result.layers.reduce(
      (sum: number, layer: any) => sum + (layer.insights?.length || 0),
      0,
    );
  }

  private countChanges(result: any): number {
    if (!result.layers) return 0;
    return result.layers.reduce(
      (sum: number, layer: any) => sum + (layer.changes || 0),
      0,
    );
  }

  private logAuditEvent(event: string, data: any): void {
    const auditData = {
      event,
      data,
      user: vscode.env.username,
      workspace: vscode.workspace.name,
      extension: "vscode-neurolint",
      version: "1.0.0",
      timestamp: new Date().toISOString(),
    };

    this.outputChannel.appendLine(`AUDIT: ${JSON.stringify(auditData)}`);
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
    this.diagnosticCollection.dispose();
    this.documentAnalysisCache.clear();
    this.analysisQueue.clear();
  }
}
