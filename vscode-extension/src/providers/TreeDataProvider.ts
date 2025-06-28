import * as vscode from "vscode";
import * as path from "path";
import { ApiClient } from "../utils/ApiClient";

export class NeuroLintTreeDataProvider
  implements vscode.TreeDataProvider<NeuroLintTreeItem>
{
  private _onDidChangeTreeData: vscode.EventEmitter<
    NeuroLintTreeItem | undefined | null | void
  > = new vscode.EventEmitter<NeuroLintTreeItem | undefined | null | void>();
  readonly onDidChangeTreeData: vscode.Event<
    NeuroLintTreeItem | undefined | null | void
  > = this._onDidChangeTreeData.event;

  private analysisResults: Map<string, any> = new Map();
  private workspaceStats: any = null;

  constructor(private apiClient: ApiClient) {
    this.loadWorkspaceStats();
  }

  refresh(): void {
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(element: NeuroLintTreeItem): vscode.TreeItem {
    return element;
  }

  getChildren(element?: NeuroLintTreeItem): Thenable<NeuroLintTreeItem[]> {
    if (!element) {
      // Root level items
      return Promise.resolve(this.getRootItems());
    }

    switch (element.contextValue) {
      case "overview":
        return Promise.resolve(this.getOverviewItems());
      case "issues":
        return Promise.resolve(this.getIssueItems());
      case "layers":
        return Promise.resolve(this.getLayerItems());
      case "files":
        return Promise.resolve(this.getFileItems());
      case "layer":
        return Promise.resolve(this.getLayerDetails(element.layerId!));
      case "file":
        return Promise.resolve(this.getFileDetails(element.filePath!));
      default:
        return Promise.resolve([]);
    }
  }

  private getRootItems(): NeuroLintTreeItem[] {
    const items: NeuroLintTreeItem[] = [];

    // Overview section
    items.push(
      new NeuroLintTreeItem(
        "Project Overview",
        vscode.TreeItemCollapsibleState.Expanded,
        "overview",
        "graph",
      ),
    );

    // Issues section
    items.push(
      new NeuroLintTreeItem(
        "Issues",
        vscode.TreeItemCollapsibleState.Expanded,
        "issues",
        "warning",
      ),
    );

    // Layers section
    items.push(
      new NeuroLintTreeItem(
        "Analysis Layers",
        vscode.TreeItemCollapsibleState.Collapsed,
        "layers",
        "layers",
      ),
    );

    // Files section
    items.push(
      new NeuroLintTreeItem(
        "Analyzed Files",
        vscode.TreeItemCollapsibleState.Collapsed,
        "files",
        "files",
      ),
    );

    return items;
  }

  private getOverviewItems(): NeuroLintTreeItem[] {
    const items: NeuroLintTreeItem[] = [];

    if (this.workspaceStats) {
      items.push(
        new NeuroLintTreeItem(
          `Total Files: ${this.workspaceStats.totalFiles || 0}`,
          vscode.TreeItemCollapsibleState.None,
          "stat",
          "file",
        ),
      );

      items.push(
        new NeuroLintTreeItem(
          `Analyzed: ${this.workspaceStats.analyzedFiles || 0}`,
          vscode.TreeItemCollapsibleState.None,
          "stat",
          "check",
        ),
      );

      items.push(
        new NeuroLintTreeItem(
          `Issues Found: ${this.workspaceStats.totalIssues || 0}`,
          vscode.TreeItemCollapsibleState.None,
          "stat",
          "alert",
        ),
      );

      items.push(
        new NeuroLintTreeItem(
          `Code Quality: ${this.workspaceStats.qualityScore || 0}%`,
          vscode.TreeItemCollapsibleState.None,
          "stat",
          "star",
        ),
      );
    } else {
      items.push(
        new NeuroLintTreeItem(
          "No analysis data available",
          vscode.TreeItemCollapsibleState.None,
          "info",
          "info",
        ),
      );

      items.push(
        new NeuroLintTreeItem(
          "Run analysis to see project overview",
          vscode.TreeItemCollapsibleState.None,
          "action",
          "play",
          "neurolint.analyzeWorkspace",
        ),
      );
    }

    return items;
  }

  private getIssueItems(): NeuroLintTreeItem[] {
    const items: NeuroLintTreeItem[] = [];

    // Group issues by severity
    const issuesBySeverity = this.groupIssuesBySeverity();

    Object.entries(issuesBySeverity).forEach(([severity, count]) => {
      if (count > 0) {
        const icon = this.getSeverityIcon(severity);
        items.push(
          new NeuroLintTreeItem(
            `${severity}: ${count}`,
            vscode.TreeItemCollapsibleState.None,
            "issue-category",
            icon,
          ),
        );
      }
    });

    if (items.length === 0) {
      items.push(
        new NeuroLintTreeItem(
          "No issues found",
          vscode.TreeItemCollapsibleState.None,
          "info",
          "check",
        ),
      );
    }

    return items;
  }

  private getLayerItems(): NeuroLintTreeItem[] {
    const layers = [
      { id: 1, name: "Configuration Validation", status: "active" },
      { id: 2, name: "Pattern & Entity Analysis", status: "active" },
      { id: 3, name: "Component Best Practices", status: "active" },
      { id: 4, name: "Hydration & SSR Guards", status: "active" },
      { id: 5, name: "Next.js Optimization", status: "inactive" },
      { id: 6, name: "Testing Integration", status: "inactive" },
    ];

    return layers.map((layer) => {
      const item = new NeuroLintTreeItem(
        `Layer ${layer.id}: ${layer.name}`,
        vscode.TreeItemCollapsibleState.Collapsed,
        "layer",
        layer.status === "active" ? "check" : "circle",
      );
      item.layerId = layer.id;
      return item;
    });
  }

  private getFileItems(): NeuroLintTreeItem[] {
    const items: NeuroLintTreeItem[] = [];

    this.analysisResults.forEach((result, filePath) => {
      const fileName = path.basename(filePath);
      const issueCount = result.issues?.length || 0;

      const item = new NeuroLintTreeItem(
        `${fileName} (${issueCount} issues)`,
        vscode.TreeItemCollapsibleState.Collapsed,
        "file",
        issueCount > 0 ? "warning" : "check",
      );
      item.filePath = filePath;
      return item;
    });

    if (items.length === 0) {
      items.push(
        new NeuroLintTreeItem(
          "No files analyzed yet",
          vscode.TreeItemCollapsibleState.None,
          "info",
          "info",
        ),
      );
    }

    return items;
  }

  private getLayerDetails(layerId: number): NeuroLintTreeItem[] {
    const items: NeuroLintTreeItem[] = [];

    // Show layer-specific information
    items.push(
      new NeuroLintTreeItem(
        "Status: Active",
        vscode.TreeItemCollapsibleState.None,
        "layer-detail",
        "check",
      ),
    );

    items.push(
      new NeuroLintTreeItem(
        "Files processed: 23",
        vscode.TreeItemCollapsibleState.None,
        "layer-detail",
        "file",
      ),
    );

    items.push(
      new NeuroLintTreeItem(
        "Issues found: 5",
        vscode.TreeItemCollapsibleState.None,
        "layer-detail",
        "warning",
      ),
    );

    return items;
  }

  private getFileDetails(filePath: string): NeuroLintTreeItem[] {
    const result = this.analysisResults.get(filePath);
    const items: NeuroLintTreeItem[] = [];

    if (result && result.issues) {
      result.issues.forEach((issue: any) => {
        items.push(
          new NeuroLintTreeItem(
            `Line ${issue.line}: ${issue.message}`,
            vscode.TreeItemCollapsibleState.None,
            "issue",
            this.getSeverityIcon(issue.severity),
          ),
        );
      });
    } else {
      items.push(
        new NeuroLintTreeItem(
          "No issues found",
          vscode.TreeItemCollapsibleState.None,
          "info",
          "check",
        ),
      );
    }

    return items;
  }

  private groupIssuesBySeverity(): Record<string, number> {
    const groups: Record<string, number> = {
      Error: 0,
      Warning: 0,
      Info: 0,
      Hint: 0,
    };

    this.analysisResults.forEach((result) => {
      if (result.issues) {
        result.issues.forEach((issue: any) => {
          const severity = issue.severity || "Warning";
          const key = severity.charAt(0).toUpperCase() + severity.slice(1);
          if (groups[key] !== undefined) {
            groups[key]++;
          }
        });
      }
    });

    return groups;
  }

  private getSeverityIcon(severity: string): string {
    switch (severity.toLowerCase()) {
      case "error":
        return "error";
      case "warning":
        return "warning";
      case "info":
        return "info";
      case "hint":
        return "lightbulb";
      default:
        return "circle";
    }
  }

  private async loadWorkspaceStats(): Promise<void> {
    try {
      // This would typically fetch from the API
      this.workspaceStats = {
        totalFiles: 47,
        analyzedFiles: 45,
        totalIssues: 12,
        qualityScore: 87,
      };
      this.refresh();
    } catch (error) {
      // Handle error silently for now
    }
  }

  public updateAnalysisResults(filePath: string, result: any): void {
    this.analysisResults.set(filePath, result);
    this.refresh();
  }

  public updateWorkspaceStats(stats: any): void {
    this.workspaceStats = stats;
    this.refresh();
  }
}

export class NeuroLintTreeItem extends vscode.TreeItem {
  constructor(
    public readonly label: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
    public readonly contextValue: string,
    iconName?: string,
    command?: string,
    public layerId?: number,
    public filePath?: string,
  ) {
    super(label, collapsibleState);

    this.contextValue = contextValue;

    if (iconName) {
      this.iconPath = new vscode.ThemeIcon(iconName);
    }

    if (command) {
      this.command = {
        command: command,
        title: label,
        arguments: [],
      };
    }

    // Set tooltip based on context
    switch (contextValue) {
      case "layer":
        this.tooltip = `NeuroLint Layer ${layerId}: Click to view details`;
        break;
      case "file":
        this.tooltip = `${filePath}: Click to view issues`;
        break;
      case "issue":
        this.tooltip = "Click to go to issue location";
        break;
      default:
        this.tooltip = label;
    }
  }
}
