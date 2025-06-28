import * as vscode from "vscode";

export class NeuroLintStatusBar {
  private _statusBarItem: vscode.StatusBarItem;
  private _isAnalyzing: boolean = false;

  constructor() {
    this._statusBarItem = vscode.window.createStatusBarItem(
      vscode.StatusBarAlignment.Left,
      100,
    );

    this._statusBarItem.command = "neurolint.showOutput";
    this._statusBarItem.name = "NeuroLint Status";
    this.updateStatus("Ready");
    this._statusBarItem.show();
  }

  public get statusBarItem(): vscode.StatusBarItem {
    return this._statusBarItem;
  }

  public updateStatus(message: string, isLoading: boolean = false): void {
    this._isAnalyzing = isLoading;

    const prefix = "NeuroLint";
    const loadingIndicator = isLoading ? "$(sync~spin)" : "$(check)";

    this._statusBarItem.text = `${loadingIndicator} ${prefix}: ${message}`;

    // Update tooltip with more information
    this._statusBarItem.tooltip = this.createTooltip(message, isLoading);

    // Update background color based on status
    this._statusBarItem.backgroundColor = this.getBackgroundColor(message);
  }

  public updateProgress(
    current: number,
    total: number,
    operation: string,
  ): void {
    const percentage = Math.round((current / total) * 100);
    const progressBar = this.createProgressBar(percentage);

    this._statusBarItem.text = `$(sync~spin) NeuroLint: ${operation} ${progressBar} ${percentage}%`;
    this._statusBarItem.tooltip = `NeuroLint: Analyzing ${current}/${total} files`;
  }

  public showError(message: string): void {
    this._statusBarItem.text = `$(error) NeuroLint: ${message}`;
    this._statusBarItem.backgroundColor = new vscode.ThemeColor(
      "statusBarItem.errorBackground",
    );
    this._statusBarItem.tooltip = `NeuroLint Error: ${message}\nClick to view output for details`;

    // Auto-hide error after 10 seconds
    setTimeout(() => {
      if (this._statusBarItem.text.includes("$(error)")) {
        this.updateStatus("Ready");
      }
    }, 10000);
  }

  public showWarning(message: string): void {
    this._statusBarItem.text = `$(warning) NeuroLint: ${message}`;
    this._statusBarItem.backgroundColor = new vscode.ThemeColor(
      "statusBarItem.warningBackground",
    );
    this._statusBarItem.tooltip = `NeuroLint Warning: ${message}`;

    // Auto-hide warning after 5 seconds
    setTimeout(() => {
      if (this._statusBarItem.text.includes("$(warning)")) {
        this.updateStatus("Ready");
      }
    }, 5000);
  }

  public showSuccess(message: string): void {
    this._statusBarItem.text = `$(check) NeuroLint: ${message}`;
    this._statusBarItem.backgroundColor = undefined;
    this._statusBarItem.tooltip = `NeuroLint: ${message}`;

    // Auto-hide success after 3 seconds
    setTimeout(() => {
      if (this._statusBarItem.text.includes(message)) {
        this.updateStatus("Ready");
      }
    }, 3000);
  }

  public hide(): void {
    this._statusBarItem.hide();
  }

  public show(): void {
    this._statusBarItem.show();
  }

  public dispose(): void {
    this._statusBarItem.dispose();
  }

  private createTooltip(message: string, isLoading: boolean): string {
    let tooltip = `NeuroLint: ${message}`;

    if (isLoading) {
      tooltip += "\n\nAnalysis in progress...";
    } else {
      tooltip += "\n\nClick to view output panel";
      tooltip += "\nRight-click for NeuroLint commands";
    }

    // Add keyboard shortcuts
    tooltip += "\n\nKeyboard Shortcuts:";
    tooltip += "\n• Ctrl+Shift+L: Analyze current file";
    tooltip += "\n• Ctrl+Shift+F: Fix current file";
    tooltip += "\n• Ctrl+Shift+W: Analyze workspace";

    return tooltip;
  }

  private getBackgroundColor(message: string): vscode.ThemeColor | undefined {
    if (
      message.toLowerCase().includes("error") ||
      message.toLowerCase().includes("failed")
    ) {
      return new vscode.ThemeColor("statusBarItem.errorBackground");
    } else if (
      message.toLowerCase().includes("warning") ||
      message.toLowerCase().includes("issue")
    ) {
      return new vscode.ThemeColor("statusBarItem.warningBackground");
    } else if (
      message.toLowerCase().includes("analyzing") ||
      this._isAnalyzing
    ) {
      return new vscode.ThemeColor("statusBarItem.prominentBackground");
    }
    return undefined;
  }

  private createProgressBar(percentage: number): string {
    const totalBars = 10;
    const filledBars = Math.round((percentage / 100) * totalBars);
    const emptyBars = totalBars - filledBars;

    return "█".repeat(filledBars) + "░".repeat(emptyBars);
  }

  public setAnalyzing(analyzing: boolean): void {
    this._isAnalyzing = analyzing;

    if (analyzing) {
      this.updateStatus("Analyzing...", true);
    } else {
      this.updateStatus("Ready");
    }
  }

  public incrementProgress(message?: string): void {
    if (this._isAnalyzing && message) {
      this._statusBarItem.text = `$(sync~spin) NeuroLint: ${message}`;
    }
  }
}
