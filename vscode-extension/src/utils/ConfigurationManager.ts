import * as vscode from 'vscode';

export class ConfigurationManager {
    private config: vscode.WorkspaceConfiguration;

    constructor() {
        this.config = vscode.workspace.getConfiguration('neurolint');
    }

    public reload(): void {
        this.config = vscode.workspace.getConfiguration('neurolint');
    }

    public getApiUrl(): string {
        return this.config.get('apiUrl', 'http://localhost:5000');
    }

    public getApiKey(): string {
        return this.config.get('apiKey', '');
    }

    public getEnabledLayers(): number[] {
        return this.config.get('enabledLayers', [1, 2, 3, 4]);
    }

    public getTimeout(): number {
        return this.config.get('timeout', 30000);
    }

    public isAutoFixEnabled(): boolean {
        return this.config.get('autoFix', false);
    }

    public shouldShowInlineHints(): boolean {
        return this.config.get('showInlineHints', true);
    }

    public getDiagnosticsLevel(): string {
        return this.config.get('diagnosticsLevel', 'warning');
    }

    public async setApiKey(apiKey: string): Promise<void> {
        await this.config.update('apiKey', apiKey, vscode.ConfigurationTarget.Global);
        this.reload();
    }

    public async setApiUrl(apiUrl: string): Promise<void> {
        await this.config.update('apiUrl', apiUrl, vscode.ConfigurationTarget.Workspace);
        this.reload();
    }

    public async setEnabledLayers(layers: number[]): Promise<void> {
        await this.config.update('enabledLayers', layers, vscode.ConfigurationTarget.Workspace);
        this.reload();
    }

    public async toggleAutoFix(): Promise<void> {
        const current = this.isAutoFixEnabled();
        await this.config.update('autoFix', !current, vscode.ConfigurationTarget.Workspace);
        this.reload();
    }

    public getConfiguration(): any {
        return {
            apiUrl: this.getApiUrl(),
            enabledLayers: this.getEnabledLayers(),
            autoFix: this.isAutoFixEnabled(),
            showInlineHints: this.shouldShowInlineHints(),
            diagnosticsLevel: this.getDiagnosticsLevel(),
            timeout: this.getTimeout()
        };
    }
}