import * as vscode from "vscode";
import { ApiClient, Insight } from "../utils/ApiClient";

export class NeuroLintCodeActionProvider implements vscode.CodeActionProvider {
  private insights: Map<string, Insight[]> = new Map();

  constructor(
    private apiClient: ApiClient,
    private outputChannel: vscode.OutputChannel,
  ) {}

  public async provideCodeActions(
    document: vscode.TextDocument,
    range: vscode.Range | vscode.Selection,
    context: vscode.CodeActionContext,
    token: vscode.CancellationToken,
  ): Promise<vscode.CodeAction[]> {
    const actions: vscode.CodeAction[] = [];

    // Get diagnostics for the current range
    const relevantDiagnostics = context.diagnostics.filter(
      (diagnostic) => diagnostic.source === "NeuroLint",
    );

    for (const diagnostic of relevantDiagnostics) {
      // Create quick fix action
      const quickFix = this.createQuickFixAction(document, diagnostic);
      if (quickFix) {
        actions.push(quickFix);
      }

      // Create refactor action if applicable
      const refactorAction = this.createRefactorAction(document, diagnostic);
      if (refactorAction) {
        actions.push(refactorAction);
      }
    }

    // Add general NeuroLint actions
    actions.push(...this.createGeneralActions(document, range));

    return actions;
  }

  private createQuickFixAction(
    document: vscode.TextDocument,
    diagnostic: vscode.Diagnostic,
  ): vscode.CodeAction | undefined {
    if (
      !diagnostic.relatedInformation ||
      diagnostic.relatedInformation.length === 0
    ) {
      return undefined;
    }

    const action = new vscode.CodeAction(
      `NeuroLint: Fix ${diagnostic.message.split(":")[0]}`,
      vscode.CodeActionKind.QuickFix,
    );

    action.diagnostics = [diagnostic];
    action.isPreferred = true;

    // Extract fix suggestion from related information
    const fixInfo = diagnostic.relatedInformation[0];
    const fixText = fixInfo.message.replace("Suggested fix: ", "");

    const edit = new vscode.WorkspaceEdit();
    edit.replace(document.uri, diagnostic.range, fixText);
    action.edit = edit;

    return action;
  }

  private createRefactorAction(
    document: vscode.TextDocument,
    diagnostic: vscode.Diagnostic,
  ): vscode.CodeAction | undefined {
    // Check if this is a refactoring opportunity
    if (
      !diagnostic.message.includes("refactor") &&
      !diagnostic.message.includes("optimize")
    ) {
      return undefined;
    }

    const action = new vscode.CodeAction(
      `NeuroLint: Refactor ${diagnostic.message.split(":")[0]}`,
      vscode.CodeActionKind.Refactor,
    );

    action.diagnostics = [diagnostic];

    // For refactoring, we'll trigger the transform API
    action.command = {
      title: "Apply NeuroLint Refactoring",
      command: "neurolint.applyRefactor",
      arguments: [document.uri, diagnostic.range],
    };

    return action;
  }

  private createGeneralActions(
    document: vscode.TextDocument,
    range: vscode.Range,
  ): vscode.CodeAction[] {
    const actions: vscode.CodeAction[] = [];

    // Analyze current file action
    const analyzeAction = new vscode.CodeAction(
      "NeuroLint: Analyze current file",
      vscode.CodeActionKind.Source,
    );
    analyzeAction.command = {
      title: "Analyze File",
      command: "neurolint.analyzeFile",
      arguments: [document.uri],
    };
    actions.push(analyzeAction);

    // Fix entire file action
    const fixFileAction = new vscode.CodeAction(
      "NeuroLint: Fix entire file",
      vscode.CodeActionKind.SourceFixAll,
    );
    fixFileAction.command = {
      title: "Fix File",
      command: "neurolint.fixFile",
      arguments: [document.uri],
    };
    actions.push(fixFileAction);

    // Organize imports action for TypeScript files
    if (
      document.languageId === "typescript" ||
      document.languageId === "typescriptreact"
    ) {
      const organizeAction = new vscode.CodeAction(
        "NeuroLint: Optimize imports and structure",
        vscode.CodeActionKind.SourceOrganizeImports,
      );
      organizeAction.command = {
        title: "Optimize Structure",
        command: "neurolint.optimizeStructure",
        arguments: [document.uri, range],
      };
      actions.push(organizeAction);
    }

    return actions;
  }

  public updateInsights(uri: string, insights: Insight[]): void {
    this.insights.set(uri, insights);
  }

  private getInsightsForRange(uri: string, range: vscode.Range): Insight[] {
    const fileInsights = this.insights.get(uri) || [];
    return fileInsights.filter((insight) => {
      if (insight.line === undefined) return false;

      const insightLine = insight.line - 1; // Convert to 0-based
      return insightLine >= range.start.line && insightLine <= range.end.line;
    });
  }
}
