import * as vscode from "vscode";

export interface NeuroLintConfiguration {
  apiUrl: string;
  apiKey: string;
  enabledLayers: number[];
  autoFix: boolean;
  showInlineHints: boolean;
  diagnosticsLevel: "error" | "warning" | "info";
  timeout: number;
  enterpriseFeatures: {
    teamId?: string;
    ssoEnabled: boolean;
    auditLogging: boolean;
    complianceMode: boolean;
  };
  workspace: {
    excludePatterns: string[];
    includePatterns: string[];
    maxFileSize: number;
    maxFiles: number;
  };
}

export class ConfigurationManager {
  private configuration: NeuroLintConfiguration;
  private readonly configurationSection = "neurolint";

  constructor() {
    this.configuration = this.loadConfiguration();

    // Listen for configuration changes
    vscode.workspace.onDidChangeConfiguration((event) => {
      if (event.affectsConfiguration(this.configurationSection)) {
        this.reload();
      }
    });
  }

  public getConfiguration(): NeuroLintConfiguration {
    return this.configuration;
  }

  public getApiUrl(): string {
    return this.configuration.apiUrl;
  }

  public getApiKey(): string {
    return this.configuration.apiKey;
  }

  public getEnabledLayers(): number[] {
    return this.configuration.enabledLayers;
  }

  public getTimeout(): number {
    return this.configuration.timeout;
  }

  public isAutoFixEnabled(): boolean {
    return this.configuration.autoFix;
  }

  public isEnterpriseMode(): boolean {
    return (
      this.configuration.enterpriseFeatures.ssoEnabled ||
      this.configuration.enterpriseFeatures.complianceMode ||
      !!this.configuration.enterpriseFeatures.teamId
    );
  }

  public getTeamId(): string | undefined {
    return this.configuration.enterpriseFeatures.teamId;
  }

  public isAuditLoggingEnabled(): boolean {
    return this.configuration.enterpriseFeatures.auditLogging;
  }

  public isComplianceModeEnabled(): boolean {
    return this.configuration.enterpriseFeatures.complianceMode;
  }

  public getDiagnosticsLevel(): "error" | "warning" | "info" {
    return this.configuration.diagnosticsLevel;
  }

  public getWorkspaceSettings(): NeuroLintConfiguration["workspace"] {
    return this.configuration.workspace;
  }

  public async setApiUrl(
    url: string,
    scope: vscode.ConfigurationTarget = vscode.ConfigurationTarget.Workspace,
  ): Promise<void> {
    const config = vscode.workspace.getConfiguration(this.configurationSection);
    await config.update("apiUrl", url, scope);
    this.configuration.apiUrl = url;
  }

  public async setApiKey(
    key: string,
    scope: vscode.ConfigurationTarget = vscode.ConfigurationTarget.Global,
  ): Promise<void> {
    const config = vscode.workspace.getConfiguration(this.configurationSection);
    await config.update("apiKey", key, scope);
    this.configuration.apiKey = key;
  }

  public async setEnabledLayers(
    layers: number[],
    scope: vscode.ConfigurationTarget = vscode.ConfigurationTarget.Workspace,
  ): Promise<void> {
    const config = vscode.workspace.getConfiguration(this.configurationSection);
    await config.update("enabledLayers", layers, scope);
    this.configuration.enabledLayers = layers;
  }

  public async setTeamId(
    teamId: string,
    scope: vscode.ConfigurationTarget = vscode.ConfigurationTarget.Workspace,
  ): Promise<void> {
    const config = vscode.workspace.getConfiguration(this.configurationSection);
    await config.update("enterpriseFeatures.teamId", teamId, scope);
    this.configuration.enterpriseFeatures.teamId = teamId;
  }

  public async enableComplianceMode(
    enabled: boolean,
    scope: vscode.ConfigurationTarget = vscode.ConfigurationTarget.Workspace,
  ): Promise<void> {
    const config = vscode.workspace.getConfiguration(this.configurationSection);
    await config.update("enterpriseFeatures.complianceMode", enabled, scope);
    this.configuration.enterpriseFeatures.complianceMode = enabled;
  }

  public async enableAuditLogging(
    enabled: boolean,
    scope: vscode.ConfigurationTarget = vscode.ConfigurationTarget.Workspace,
  ): Promise<void> {
    const config = vscode.workspace.getConfiguration(this.configurationSection);
    await config.update("enterpriseFeatures.auditLogging", enabled, scope);
    this.configuration.enterpriseFeatures.auditLogging = enabled;
  }

  public reload(): void {
    this.configuration = this.loadConfiguration();
  }

  public validateConfiguration(): {
    valid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validate API URL
    if (!this.configuration.apiUrl) {
      errors.push("API URL is required");
    } else {
      try {
        const url = new URL(this.configuration.apiUrl);
        if (url.protocol !== "http:" && url.protocol !== "https:") {
          errors.push("API URL must use http:// or https:// protocol");
        }
        if (url.hostname === "localhost" || url.hostname === "127.0.0.1") {
          warnings.push(
            "Using localhost API URL - ensure NeuroLint server is running locally",
          );
        }
      } catch {
        errors.push("API URL is not a valid URL");
      }
    }

    // Validate API Key format
    if (this.configuration.apiKey) {
      if (this.configuration.apiKey.length < 8) {
        errors.push("API Key must be at least 8 characters long");
      }
      if (
        this.configuration.apiKey.includes(" ") ||
        this.configuration.apiKey.includes("\n")
      ) {
        errors.push("API Key contains invalid characters (spaces or newlines)");
      }
    }

    // Validate API Key for enterprise features
    if (this.isEnterpriseMode() && !this.configuration.apiKey) {
      errors.push("API Key is required for enterprise features");
    }

    // Validate enabled layers
    if (
      !Array.isArray(this.configuration.enabledLayers) ||
      this.configuration.enabledLayers.length === 0
    ) {
      errors.push("At least one layer must be enabled");
    } else {
      const invalidLayers = this.configuration.enabledLayers.filter(
        (layer) => !Number.isInteger(layer) || layer < 1 || layer > 6,
      );
      if (invalidLayers.length > 0) {
        errors.push(
          `Invalid layer numbers: ${invalidLayers.join(", ")}. Must be integers between 1-6`,
        );
      }

      // Warn about experimental layers
      const experimentalLayers = this.configuration.enabledLayers.filter(
        (layer) => layer > 4,
      );
      if (experimentalLayers.length > 0) {
        warnings.push(
          `Layers ${experimentalLayers.join(", ")} are experimental and may not be fully implemented`,
        );
      }
    }

    // Validate timeout with more reasonable ranges
    if (this.configuration.timeout < 5000) {
      warnings.push(
        "Timeout is very short (< 5s) - may cause frequent timeouts",
      );
    } else if (this.configuration.timeout > 120000) {
      warnings.push(
        "Timeout is very long (> 2min) - may cause poor user experience",
      );
    }

    if (
      this.configuration.timeout < 1000 ||
      this.configuration.timeout > 600000
    ) {
      errors.push("Timeout must be between 1000ms and 600000ms (10 minutes)");
    }

    // Validate workspace settings
    const maxFileSize = this.configuration.workspace.maxFileSize;
    if (maxFileSize < 1024) {
      errors.push("Maximum file size must be at least 1KB");
    } else if (maxFileSize > 50 * 1024 * 1024) {
      warnings.push(
        "Maximum file size is very large (> 50MB) - may cause performance issues",
      );
    }

    const maxFiles = this.configuration.workspace.maxFiles;
    if (maxFiles < 1) {
      errors.push("Maximum files must be at least 1");
    } else if (maxFiles > 5000) {
      warnings.push(
        "Maximum files is very large (> 5000) - may cause performance issues",
      );
    }

    // Validate patterns
    const includePatterns = this.configuration.workspace.includePatterns;
    const excludePatterns = this.configuration.workspace.excludePatterns;

    if (!Array.isArray(includePatterns) || includePatterns.length === 0) {
      errors.push("At least one include pattern must be specified");
    }

    if (!Array.isArray(excludePatterns)) {
      errors.push("Exclude patterns must be an array");
    } else if (excludePatterns.length === 0) {
      warnings.push(
        "No exclude patterns specified - may analyze unnecessary files",
      );
    }

    // Validate enterprise settings
    if (this.isEnterpriseMode()) {
      const teamId = this.configuration.enterpriseFeatures.teamId;
      if (!teamId || teamId.trim().length === 0) {
        warnings.push("Enterprise mode enabled but no team ID specified");
      }

      if (
        this.configuration.enterpriseFeatures.complianceMode &&
        !this.configuration.enterpriseFeatures.auditLogging
      ) {
        warnings.push("Compliance mode enabled but audit logging is disabled");
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  public getConfigurationForAudit(): any {
    // Return sanitized configuration for audit logging (no secrets)
    return {
      apiUrl: this.configuration.apiUrl,
      enabledLayers: this.configuration.enabledLayers,
      autoFix: this.configuration.autoFix,
      diagnosticsLevel: this.configuration.diagnosticsLevel,
      enterpriseFeatures: {
        teamId: this.configuration.enterpriseFeatures.teamId,
        ssoEnabled: this.configuration.enterpriseFeatures.ssoEnabled,
        auditLogging: this.configuration.enterpriseFeatures.auditLogging,
        complianceMode: this.configuration.enterpriseFeatures.complianceMode,
      },
      workspace: this.configuration.workspace,
      timestamp: new Date().toISOString(),
    };
  }

  private loadConfiguration(): NeuroLintConfiguration {
    const config = vscode.workspace.getConfiguration(this.configurationSection);

    return {
      apiUrl: config.get("apiUrl", "http://localhost:5000"),
      apiKey: config.get("apiKey", ""),
      enabledLayers: config.get("enabledLayers", [1, 2, 3, 4]),
      autoFix: config.get("autoFix", false),
      showInlineHints: config.get("showInlineHints", true),
      diagnosticsLevel: config.get("diagnosticsLevel", "warning"),
      timeout: config.get("timeout", 30000),
      enterpriseFeatures: {
        teamId: config.get("enterpriseFeatures.teamId"),
        ssoEnabled: config.get("enterpriseFeatures.ssoEnabled", false),
        auditLogging: config.get("enterpriseFeatures.auditLogging", false),
        complianceMode: config.get("enterpriseFeatures.complianceMode", false),
      },
      workspace: {
        excludePatterns: config.get("workspace.excludePatterns", [
          "**/node_modules/**",
          "**/dist/**",
          "**/build/**",
          "**/.next/**",
          "**/coverage/**",
        ]),
        includePatterns: config.get("workspace.includePatterns", [
          "**/*.ts",
          "**/*.tsx",
          "**/*.js",
          "**/*.jsx",
        ]),
        maxFileSize: config.get("workspace.maxFileSize", 10 * 1024 * 1024), // 10MB
        maxFiles: config.get("workspace.maxFiles", 1000),
      },
    };
  }

  public async resetToDefaults(): Promise<void> {
    const config = vscode.workspace.getConfiguration(this.configurationSection);

    // Reset all settings to defaults
    await config.update(
      "apiUrl",
      undefined,
      vscode.ConfigurationTarget.Workspace,
    );
    await config.update(
      "enabledLayers",
      undefined,
      vscode.ConfigurationTarget.Workspace,
    );
    await config.update(
      "autoFix",
      undefined,
      vscode.ConfigurationTarget.Workspace,
    );
    await config.update(
      "showInlineHints",
      undefined,
      vscode.ConfigurationTarget.Workspace,
    );
    await config.update(
      "diagnosticsLevel",
      undefined,
      vscode.ConfigurationTarget.Workspace,
    );
    await config.update(
      "timeout",
      undefined,
      vscode.ConfigurationTarget.Workspace,
    );
    await config.update(
      "enterpriseFeatures",
      undefined,
      vscode.ConfigurationTarget.Workspace,
    );
    await config.update(
      "workspace",
      undefined,
      vscode.ConfigurationTarget.Workspace,
    );

    this.reload();
  }

  public exportConfiguration(): string {
    return JSON.stringify(this.getConfigurationForAudit(), null, 2);
  }

  public async importConfiguration(configJson: string): Promise<void> {
    try {
      const importedConfig = JSON.parse(configJson);
      const config = vscode.workspace.getConfiguration(
        this.configurationSection,
      );

      // Apply imported settings
      if (importedConfig.apiUrl) {
        await config.update(
          "apiUrl",
          importedConfig.apiUrl,
          vscode.ConfigurationTarget.Workspace,
        );
      }
      if (importedConfig.enabledLayers) {
        await config.update(
          "enabledLayers",
          importedConfig.enabledLayers,
          vscode.ConfigurationTarget.Workspace,
        );
      }
      if (importedConfig.autoFix !== undefined) {
        await config.update(
          "autoFix",
          importedConfig.autoFix,
          vscode.ConfigurationTarget.Workspace,
        );
      }
      if (importedConfig.diagnosticsLevel) {
        await config.update(
          "diagnosticsLevel",
          importedConfig.diagnosticsLevel,
          vscode.ConfigurationTarget.Workspace,
        );
      }
      if (importedConfig.enterpriseFeatures) {
        await config.update(
          "enterpriseFeatures",
          importedConfig.enterpriseFeatures,
          vscode.ConfigurationTarget.Workspace,
        );
      }
      if (importedConfig.workspace) {
        await config.update(
          "workspace",
          importedConfig.workspace,
          vscode.ConfigurationTarget.Workspace,
        );
      }

      this.reload();
    } catch (error) {
      throw new Error(
        `Failed to import configuration: ${error instanceof Error ? error.message : "Invalid JSON"}`,
      );
    }
  }
}
