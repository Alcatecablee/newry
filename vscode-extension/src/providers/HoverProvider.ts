import * as vscode from "vscode";
import { ApiClient } from "../utils/ApiClient";

export class NeuroLintHoverProvider implements vscode.HoverProvider {
  private layerInfo: Map<number, any> = new Map();
  private ruleDocumentation: Map<string, any> = new Map();

  constructor(private apiClient: ApiClient) {
    this.loadLayerInfo();
  }

  public async provideHover(
    document: vscode.TextDocument,
    position: vscode.Position,
    token: vscode.CancellationToken,
  ): Promise<vscode.Hover | undefined> {
    // Get the word at the current position
    const wordRange = document.getWordRangeAtPosition(position);
    if (!wordRange) {
      return undefined;
    }

    const word = document.getText(wordRange);

    // Check if this position has NeuroLint diagnostics
    const diagnostics = vscode.languages.getDiagnostics(document.uri);
    const neurolintDiagnostics = diagnostics.filter(
      (d) => d.source === "NeuroLint" && d.range.contains(position),
    );

    if (neurolintDiagnostics.length > 0) {
      return this.createDiagnosticHover(neurolintDiagnostics[0], position);
    }

    // Check for React/TypeScript patterns
    if (this.isReactComponent(word, document, position)) {
      return this.createReactComponentHover(word);
    }

    if (this.isTypeScriptPattern(word, document, position)) {
      return this.createTypeScriptPatternHover(word, document, position);
    }

    // Check for NeuroLint layer-specific documentation
    return this.createGeneralHover(word, document, position);
  }

  private createDiagnosticHover(
    diagnostic: vscode.Diagnostic,
    position: vscode.Position,
  ): vscode.Hover {
    const contents: vscode.MarkdownString[] = [];

    // Main diagnostic message
    const mainContent = new vscode.MarkdownString();
    mainContent.appendMarkdown(`**NeuroLint Analysis**\n\n`);
    mainContent.appendMarkdown(`${diagnostic.message}\n\n`);

    if (diagnostic.code) {
      const ruleId = diagnostic.code.toString();
      mainContent.appendMarkdown(`**Rule:** \`${ruleId}\`\n\n`);

      // Add rule documentation if available
      const ruleDoc = this.getRuleDocumentation(ruleId);
      if (ruleDoc) {
        mainContent.appendMarkdown(
          `**Description:** ${ruleDoc.description}\n\n`,
        );

        if (ruleDoc.examples) {
          mainContent.appendMarkdown(`**Examples:**\n`);
          mainContent.appendCodeblock(ruleDoc.examples.bad, "typescript");
          mainContent.appendMarkdown(`**Better:**\n`);
          mainContent.appendCodeblock(ruleDoc.examples.good, "typescript");
        }
      }
    }

    // Add fix suggestions
    if (
      diagnostic.relatedInformation &&
      diagnostic.relatedInformation.length > 0
    ) {
      mainContent.appendMarkdown(`**Suggested Fix:**\n`);
      diagnostic.relatedInformation.forEach((info) => {
        mainContent.appendMarkdown(
          `- ${info.message.replace("Suggested fix: ", "")}\n`,
        );
      });
    }

    contents.push(mainContent);

    return new vscode.Hover(contents, diagnostic.range);
  }

  private createReactComponentHover(componentName: string): vscode.Hover {
    const content = new vscode.MarkdownString();
    content.appendMarkdown(`**React Component Analysis**\n\n`);
    content.appendMarkdown(`Component: \`${componentName}\`\n\n`);
    content.appendMarkdown(`**NeuroLint Checks:**\n`);
    content.appendMarkdown(`- Component naming conventions\n`);
    content.appendMarkdown(`- Props type safety\n`);
    content.appendMarkdown(`- Performance optimizations\n`);
    content.appendMarkdown(`- Accessibility guidelines\n\n`);
    content.appendMarkdown(
      `Run NeuroLint analysis for detailed component recommendations.`,
    );

    return new vscode.Hover(content);
  }

  private createTypeScriptPatternHover(
    word: string,
    document: vscode.TextDocument,
    position: vscode.Position,
  ): vscode.Hover {
    const content = new vscode.MarkdownString();
    content.appendMarkdown(`**TypeScript Pattern Analysis**\n\n`);
    content.appendMarkdown(`Pattern: \`${word}\`\n\n`);

    // Analyze the context
    const line = document.lineAt(position);
    const lineText = line.text;

    if (lineText.includes("interface") || lineText.includes("type")) {
      content.appendMarkdown(`**Type Definition**\n`);
      content.appendMarkdown(
        `NeuroLint can optimize type definitions for better performance and maintainability.\n\n`,
      );
    } else if (lineText.includes("function") || lineText.includes("=>")) {
      content.appendMarkdown(`**Function Analysis**\n`);
      content.appendMarkdown(
        `NeuroLint checks for function complexity, naming, and return type clarity.\n\n`,
      );
    }

    content.appendMarkdown(`**Layer Analysis:**\n`);
    content.appendMarkdown(`- Layer 1: Syntax and type validation\n`);
    content.appendMarkdown(`- Layer 2: Pattern optimization\n`);
    content.appendMarkdown(`- Layer 3: Component best practices\n`);
    content.appendMarkdown(`- Layer 4: Performance analysis\n`);

    return new vscode.Hover(content);
  }

  private createGeneralHover(
    word: string,
    document: vscode.TextDocument,
    position: vscode.Position,
  ): vscode.Hover | undefined {
    // Only provide hover for specific NeuroLint-related patterns
    const neurolintPatterns = [
      "useState",
      "useEffect",
      "useCallback",
      "useMemo",
      "interface",
      "type",
      "export",
      "import",
      "const",
      "let",
      "var",
    ];

    if (!neurolintPatterns.some((pattern) => word.includes(pattern))) {
      return undefined;
    }

    const content = new vscode.MarkdownString();
    content.appendMarkdown(`**NeuroLint Code Intelligence**\n\n`);
    content.appendMarkdown(`Analyzing: \`${word}\`\n\n`);
    content.appendMarkdown(
      `Right-click for NeuroLint actions or run analysis for detailed insights.\n\n`,
    );
    content.appendMarkdown(`**Available Commands:**\n`);
    content.appendMarkdown(`- Analyze File\n`);
    content.appendMarkdown(`- Fix Issues\n`);
    content.appendMarkdown(`- Optimize Structure\n`);

    return new vscode.Hover(content);
  }

  private isReactComponent(
    word: string,
    document: vscode.TextDocument,
    position: vscode.Position,
  ): boolean {
    // Check if word starts with uppercase (React component convention)
    if (!/^[A-Z]/.test(word)) {
      return false;
    }

    // Check if we're in a JSX/TSX file
    if (!["typescriptreact", "javascriptreact"].includes(document.languageId)) {
      return false;
    }

    // Check surrounding context for JSX usage
    const line = document.lineAt(position);
    const lineText = line.text;

    return (
      lineText.includes("<") ||
      lineText.includes("React") ||
      lineText.includes("component")
    );
  }

  private isTypeScriptPattern(
    word: string,
    document: vscode.TextDocument,
    position: vscode.Position,
  ): boolean {
    if (!["typescript", "typescriptreact"].includes(document.languageId)) {
      return false;
    }

    const typeScriptKeywords = [
      "interface",
      "type",
      "enum",
      "namespace",
      "declare",
      "readonly",
      "keyof",
      "typeof",
      "extends",
      "implements",
    ];

    return typeScriptKeywords.includes(word);
  }

  private async loadLayerInfo(): Promise<void> {
    try {
      const layers = await this.apiClient.getLayerInfo();
      layers.forEach((layer) => {
        this.layerInfo.set(layer.id, layer);
      });
    } catch (error) {
      // Fallback layer information
      this.loadFallbackLayerInfo();
    }
  }

  private loadFallbackLayerInfo(): void {
    const fallbackLayers = [
      {
        id: 1,
        name: "Configuration Validation",
        description: "Validates TypeScript configuration and project setup",
      },
      {
        id: 2,
        name: "Pattern & Entity Analysis",
        description: "Identifies code patterns and entity relationships",
      },
      {
        id: 3,
        name: "Component Best Practices",
        description: "Ensures React components follow best practices",
      },
      {
        id: 4,
        name: "Hydration & SSR Guards",
        description: "Prevents hydration mismatches in SSR applications",
      },
      {
        id: 5,
        name: "Next.js Optimization",
        description: "Optimizes Next.js specific patterns and features",
      },
      {
        id: 6,
        name: "Testing Integration",
        description: "Ensures proper testing patterns and coverage",
      },
    ];

    fallbackLayers.forEach((layer) => {
      this.layerInfo.set(layer.id, layer);
    });
  }

  private getRuleDocumentation(ruleId: string): any {
    // This would normally fetch from API or local cache
    return this.ruleDocumentation.get(ruleId);
  }
}
