import axios, { AxiosInstance, AxiosRequestConfig, AxiosError } from "axios";
import * as vscode from "vscode";
import { ConfigurationManager } from "./ConfigurationManager";

export interface AnalysisResult {
  layers: LayerResult[];
  performance: {
    totalTime: number;
    layerTimes: Record<number, number>;
  };
  errors: any[];
  metadata?: {
    fileSize: number;
    lineCount: number;
    analysisId: string;
    timestamp: string;
  };
}

export interface LayerResult {
  id: number;
  name: string;
  status: "success" | "error" | "skipped" | "not_implemented";
  changes: number;
  insights?: Insight[];
  error?: string;
  performance?: {
    startTime: number;
    endTime: number;
    duration: number;
  };
}

export interface Insight {
  layerId: number;
  ruleId?: string;
  message: string;
  severity: "error" | "warning" | "info" | "hint";
  line?: number;
  column?: number;
  length?: number;
  pattern?: string;
  fix?: string;
  category?: string;
  documentation?: string;
}

export interface TransformResult {
  transformed: string;
  layers: LayerResult[];
  performance: {
    totalTime: number;
    layerTimes: Record<number, number>;
  };
  summary: {
    totalChanges: number;
    linesAdded: number;
    linesRemoved: number;
    linesModified: number;
  };
}

export interface TeamInfo {
  id: string;
  name: string;
  members: number;
  subscription: string;
  features: string[];
}

export interface UserInfo {
  id: string;
  email: string;
  name: string;
  role: string;
  teams: string[];
  permissions: string[];
}

interface RetryConfig {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
}

export class ApiClient {
  private client: AxiosInstance;
  private authToken: string | null = null;
  private userInfo: UserInfo | null = null;
  private teamInfo: TeamInfo | null = null;
  private isOnline: boolean = true;
  private connectionStatus:
    | "connected"
    | "connecting"
    | "disconnected"
    | "error" = "disconnected";
  private abortControllers: Map<string, AbortController> = new Map();
  private retryConfig: RetryConfig = {
    maxRetries: 3,
    baseDelay: 1000,
    maxDelay: 10000,
  };

  constructor(private configManager: ConfigurationManager) {
    this.client = axios.create({
      timeout: this.configManager.getTimeout(),
      headers: {
        "Content-Type": "application/json",
        "User-Agent": `vscode-neurolint/1.0.0 (${vscode.env.appName})`,
      },
    });

    this.setupInterceptors();
    this.initializeConnection();
  }

  private async initializeConnection(): Promise<void> {
    try {
      this.connectionStatus = "connecting";
      await this.healthCheck();
      this.connectionStatus = "connected";
      this.isOnline = true;
    } catch (error) {
      this.connectionStatus = "error";
      this.isOnline = false;
      // Don't show error immediately on initialization, let user trigger actions first
    }
  }

  private setupInterceptors(): void {
    // Request interceptor for authentication and enterprise features
    this.client.interceptors.request.use((config) => {
      const apiKey = this.configManager.getApiKey();
      if (apiKey && this.isValidApiKey(apiKey)) {
        config.headers.Authorization = `Bearer ${apiKey}`;
      }

      config.baseURL = this.configManager.getApiUrl();

      // Add enterprise headers
      if (this.configManager.isEnterpriseMode()) {
        const teamId = this.configManager.getTeamId();
        if (teamId) {
          config.headers["X-NeuroLint-Team"] = teamId;
        }

        if (this.configManager.isComplianceModeEnabled()) {
          config.headers["X-NeuroLint-Compliance"] = "true";
        }

        if (this.configManager.isAuditLoggingEnabled()) {
          config.headers["X-NeuroLint-Audit"] = "true";
        }
      }

      // Add request ID for tracking
      config.headers["X-NeuroLint-Request-ID"] = this.generateRequestId();

      return config;
    });

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => {
        this.connectionStatus = "connected";
        this.isOnline = true;

        // Log successful enterprise requests
        if (this.configManager.isAuditLoggingEnabled()) {
          this.logApiCall(response.config, response.status, response.data);
        }
        return response;
      },
      (error) => {
        this.updateConnectionStatus(error);
        this.handleApiError(error);
        return Promise.reject(error);
      },
    );
  }

  public async analyzeCode(
    code: string,
    filePath?: string,
  ): Promise<AnalysisResult> {
    const requestId = this.generateRequestId();

    // Cancel any existing analysis for this file
    if (filePath) {
      const existingController = this.abortControllers.get(filePath);
      if (existingController) {
        existingController.abort();
      }
    }

    // Create new abort controller
    const abortController = new AbortController();
    if (filePath) {
      this.abortControllers.set(filePath, abortController);
    }

    try {
      const layers = this.configManager.getEnabledLayers();

      const response = await this.retryRequest(async () => {
        return await this.client.post(
          "/api/analyze",
          {
            code,
            filePath,
            layers,
            options: {
              enterprise: this.configManager.isEnterpriseMode(),
              compliance: this.configManager.isComplianceModeEnabled(),
              diagnosticsLevel: this.configManager.getDiagnosticsLevel(),
            },
          },
          {
            signal: abortController.signal,
          },
        );
      });

      // Handle "not implemented" response gracefully
      if (
        response.data.layers?.some(
          (layer: LayerResult) => layer.status === "not_implemented",
        )
      ) {
        return this.createFallbackAnalysisResult(code, filePath, layers);
      }

      return response.data;
    } catch (error) {
      // If offline or API unavailable, return fallback result
      if (!this.isOnline || this.connectionStatus === "error") {
        return this.createFallbackAnalysisResult(
          code,
          filePath,
          this.configManager.getEnabledLayers(),
        );
      }
      throw error;
    } finally {
      if (filePath) {
        this.abortControllers.delete(filePath);
      }
    }
  }

  public async transformCode(
    code: string,
    filePath?: string,
  ): Promise<TransformResult> {
    const requestId = this.generateRequestId();

    try {
      const layers = this.configManager.getEnabledLayers();

      const response = await this.retryRequest(async () => {
        return await this.client.post("/api/transform", {
          code,
          filePath,
          layers,
          options: {
            enterprise: this.configManager.isEnterpriseMode(),
            compliance: this.configManager.isComplianceModeEnabled(),
            backup: true,
          },
        });
      });

      // Handle "not implemented" response gracefully
      if (
        response.data.layers?.some(
          (layer: LayerResult) => layer.status === "not_implemented",
        )
      ) {
        return this.createFallbackTransformResult(code, layers);
      }

      return response.data;
    } catch (error) {
      // If offline or API unavailable, return original code
      if (!this.isOnline || this.connectionStatus === "error") {
        return this.createFallbackTransformResult(
          code,
          this.configManager.getEnabledLayers(),
        );
      }
      throw error;
    }
  }

  public async getLayerInfo(): Promise<any[]> {
    try {
      const response = await this.retryRequest(async () => {
        return await this.client.get("/api/layers");
      });
      return response.data;
    } catch (error) {
      // Return fallback layer info if API is unavailable
      return this.getFallbackLayerInfo();
    }
  }

  public async healthCheck(): Promise<boolean> {
    try {
      const response = await this.client.get("/api/health", { timeout: 5000 });
      const isHealthy = response.status === 200;
      if (isHealthy) {
        this.connectionStatus = "connected";
        this.isOnline = true;
      }
      return isHealthy;
    } catch (error) {
      this.connectionStatus = "error";
      this.isOnline = false;
      return false;
    }
  }

  public async validateConfiguration(): Promise<{
    valid: boolean;
    errors: string[];
    warnings: string[];
  }> {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validate configuration locally first
    const configValidation = this.configManager.validateConfiguration();
    errors.push(...configValidation.errors);

    // Test API connection
    const apiUrl = this.configManager.getApiUrl();
    try {
      new URL(apiUrl);
    } catch {
      errors.push("API URL is not a valid URL");
      return { valid: false, errors, warnings };
    }

    // Test actual API connectivity
    const isConnected = await this.healthCheck();
    if (!isConnected) {
      warnings.push("Cannot connect to NeuroLint API server");
    }

    // Validate API key if provided
    const apiKey = this.configManager.getApiKey();
    if (apiKey && !this.isValidApiKey(apiKey)) {
      errors.push("API key format is invalid");
    }

    // Test API endpoints if connected
    if (isConnected) {
      try {
        const response = await this.client.post(
          "/api/validate-config",
          {
            layers: this.configManager.getEnabledLayers(),
            enterprise: this.configManager.isEnterpriseMode(),
          },
          { timeout: 10000 },
        );

        if (response.data && !response.data.valid) {
          errors.push(...(response.data.errors || []));
        }
      } catch (error) {
        warnings.push("Could not validate configuration with API server");
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  // Enterprise-specific methods
  public async authenticateEnterprise(apiKey: string): Promise<UserInfo> {
    const response = await this.client.post("/api/enterprise/auth", {
      apiKey,
      source: "vscode-extension",
    });

    this.authToken = response.data.token;
    this.userInfo = response.data.user;

    return this.userInfo;
  }

  public async getTeamInfo(): Promise<TeamInfo | null> {
    if (!this.configManager.isEnterpriseMode()) {
      return null;
    }

    try {
      const teamId = this.configManager.getTeamId();
      if (!teamId) {
        return null;
      }

      const response = await this.client.get(`/api/enterprise/teams/${teamId}`);
      this.teamInfo = response.data;
      return this.teamInfo;
    } catch (error) {
      return null;
    }
  }

  public async getTeamMembers(): Promise<any[]> {
    const teamId = this.configManager.getTeamId();
    if (!teamId) {
      return [];
    }

    const response = await this.client.get(
      `/api/enterprise/teams/${teamId}/members`,
    );
    return response.data;
  }

  public async getAnalyticsData(period: string = "week"): Promise<any> {
    const response = await this.client.get(
      `/api/enterprise/analytics?period=${period}`,
    );
    return response.data;
  }

  public async exportAnalytics(format: string = "json"): Promise<any> {
    const response = await this.client.get(
      `/api/enterprise/analytics/export?format=${format}`,
    );
    return response.data;
  }

  public async getAuditTrail(days: number = 30): Promise<any[]> {
    if (!this.configManager.isAuditLoggingEnabled()) {
      return [];
    }

    const response = await this.client.get(
      `/api/enterprise/audit/trail?days=${days}`,
    );
    return response.data;
  }

  public async getComplianceReport(framework?: string): Promise<any> {
    const params = framework ? `?framework=${framework}` : "";
    const response = await this.client.get(
      `/api/enterprise/compliance${params}`,
    );
    return response.data;
  }

  public async createWebhook(url: string, events: string[]): Promise<any> {
    const response = await this.client.post("/api/enterprise/webhooks", {
      url,
      events,
      source: "vscode-extension",
    });
    return response.data;
  }

  public async getWebhooks(): Promise<any[]> {
    const response = await this.client.get("/api/enterprise/webhooks");
    return response.data;
  }

  public async testWebhook(webhookId: string): Promise<any> {
    const response = await this.client.post(
      `/api/enterprise/webhooks/${webhookId}/test`,
    );
    return response.data;
  }

  public async setupSSO(
    type: string,
    domain: string,
    settings: any,
  ): Promise<any> {
    const response = await this.client.post("/api/enterprise/sso", {
      type,
      domain,
      settings,
    });
    return response.data;
  }

  public async getSSOProviders(): Promise<any[]> {
    const response = await this.client.get("/api/enterprise/sso");
    return response.data;
  }

  // Workspace analysis methods
  public async analyzeWorkspace(
    files: { path: string; content: string }[],
  ): Promise<any> {
    const response = await this.client.post("/api/analyze/workspace", {
      files,
      layers: this.configManager.getEnabledLayers(),
      options: {
        enterprise: this.configManager.isEnterpriseMode(),
        maxFiles: this.configManager.getWorkspaceSettings().maxFiles,
      },
    });
    return response.data;
  }

  public async getWorkspaceStats(): Promise<any> {
    const response = await this.client.get("/api/workspace/stats");
    return response.data;
  }

  // Utility methods
  public getUserInfo(): UserInfo | null {
    return this.userInfo;
  }

  public getTeamInfoCached(): TeamInfo | null {
    return this.teamInfo;
  }

  public isAuthenticated(): boolean {
    return !!this.authToken || !!this.configManager.getApiKey();
  }

  public isEnterpriseUser(): boolean {
    return this.configManager.isEnterpriseMode() && this.isAuthenticated();
  }

  private generateRequestId(): string {
    return `vscode-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private handleApiError(error: AxiosError): void {
    // Don't show errors for aborted requests
    if (error.code === "ERR_CANCELED") {
      return;
    }

    const errorMessage = this.getDetailedErrorMessage(error);
    const actionButton = this.getErrorActionButton(error);

    if (error.response?.status === 401) {
      vscode.window
        .showErrorMessage(
          "NeuroLint: Authentication failed. Please check your API key.",
          "Configure API Key",
        )
        .then((action) => {
          if (action === "Configure API Key") {
            vscode.commands.executeCommand("neurolint.configure");
          }
        });
    } else if (error.response?.status === 403) {
      vscode.window
        .showErrorMessage(
          "NeuroLint: Access denied. Check your permissions or upgrade your plan.",
          "View Documentation",
        )
        .then((action) => {
          if (action === "View Documentation") {
            vscode.env.openExternal(
              vscode.Uri.parse("https://docs.neurolint.com/permissions"),
            );
          }
        });
    } else if (error.response?.status === 429) {
      vscode.window
        .showWarningMessage(
          "NeuroLint: Rate limit reached. Please wait before making more requests.",
          "Check Usage",
        )
        .then((action) => {
          if (action === "Check Usage") {
            vscode.commands.executeCommand("neurolint.showOutput");
          }
        });
    } else if (error.code === "ECONNREFUSED" || error.code === "ENOTFOUND") {
      vscode.window
        .showErrorMessage(
          `NeuroLint: Cannot connect to server at ${this.configManager.getApiUrl()}. Please check the server URL and ensure it's running.`,
          "Configure Server",
          "Test Connection",
        )
        .then((action) => {
          if (action === "Configure Server") {
            vscode.commands.executeCommand("neurolint.configure");
          } else if (action === "Test Connection") {
            this.testConnection();
          }
        });
    } else if (error.code === "ETIMEDOUT") {
      vscode.window
        .showWarningMessage(
          "NeuroLint: Request timed out. The server may be overloaded or your network is slow.",
          "Increase Timeout",
          "Try Again",
        )
        .then((action) => {
          if (action === "Increase Timeout") {
            vscode.commands.executeCommand("neurolint.configure");
          }
        });
    } else if (error.response?.status === 500) {
      vscode.window
        .showErrorMessage(
          "NeuroLint: Server error. The analysis service may be temporarily unavailable.",
          "View Logs",
          "Report Issue",
        )
        .then((action) => {
          if (action === "View Logs") {
            vscode.commands.executeCommand("neurolint.showOutput");
          } else if (action === "Report Issue") {
            vscode.env.openExternal(
              vscode.Uri.parse(
                "https://github.com/neurolint/neurolint-vscode/issues",
              ),
            );
          }
        });
    } else {
      const message = errorMessage || "Unknown error occurred";
      vscode.window
        .showErrorMessage(`NeuroLint: ${message}`, "View Details")
        .then((action) => {
          if (action === "View Details") {
            vscode.commands.executeCommand("neurolint.showOutput");
          }
        });
    }

    // Log error for audit if enabled
    if (this.configManager.isAuditLoggingEnabled()) {
      this.logApiError(error);
    }
  }

  private getDetailedErrorMessage(error: AxiosError): string {
    if (error.response?.data && typeof error.response.data === "object") {
      const data = error.response.data as any;
      return data.message || data.error || data.details || error.message;
    }
    return error.message;
  }

  private getErrorActionButton(error: AxiosError): string | null {
    if (error.response?.status === 401) return "Configure API Key";
    if (error.response?.status === 403) return "View Documentation";
    if (error.response?.status === 429) return "Check Usage";
    if (error.code === "ECONNREFUSED") return "Configure Server";
    if (error.code === "ETIMEDOUT") return "Increase Timeout";
    if (error.response?.status === 500) return "View Logs";
    return "View Details";
  }

  private async testConnection(): Promise<void> {
    const isConnected = await this.healthCheck();
    if (isConnected) {
      vscode.window.showInformationMessage("NeuroLint: Connection successful!");
    } else {
      vscode.window.showErrorMessage(
        "NeuroLint: Connection failed. Please check your settings.",
      );
    }
  }

  private updateConnectionStatus(error: AxiosError): void {
    if (error.code === "ECONNREFUSED" || error.code === "ENOTFOUND") {
      this.connectionStatus = "error";
      this.isOnline = false;
    } else if (error.code === "ETIMEDOUT") {
      this.connectionStatus = "connecting";
    } else if (error.response?.status && error.response.status >= 500) {
      this.connectionStatus = "error";
    }
  }

  private isValidApiKey(apiKey: string): boolean {
    // Basic API key format validation
    if (!apiKey || apiKey.length < 8) return false;
    if (apiKey.includes(" ") || apiKey.includes("\n")) return false;
    // Add more specific validation based on your API key format
    return true;
  }

  private async retryRequest<T>(
    requestFn: () => Promise<T>,
    retryCount: number = 0,
  ): Promise<T> {
    try {
      return await requestFn();
    } catch (error) {
      const isRetryableError = this.isRetryableError(error as AxiosError);

      if (isRetryableError && retryCount < this.retryConfig.maxRetries) {
        const delay = Math.min(
          this.retryConfig.baseDelay * Math.pow(2, retryCount),
          this.retryConfig.maxDelay,
        );

        await new Promise((resolve) => setTimeout(resolve, delay));
        return this.retryRequest(requestFn, retryCount + 1);
      }

      throw error;
    }
  }

  private isRetryableError(error: AxiosError): boolean {
    // Retry on network errors, timeouts, and server errors (5xx)
    if (error.code === "ETIMEDOUT" || error.code === "ECONNRESET") return true;
    if (error.response?.status && error.response.status >= 500) return true;
    if (error.response?.status === 429) return true; // Rate limit
    return false;
  }

  private createFallbackAnalysisResult(
    code: string,
    filePath?: string,
    layers: number[] = [],
  ): AnalysisResult {
    return {
      layers: layers.map((id) => ({
        id,
        name: `Layer ${id}`,
        status: "skipped" as const,
        changes: 0,
        insights: [
          {
            layerId: id,
            message: "Analysis unavailable - API server not connected",
            severity: "info" as const,
            line: 1,
            column: 1,
          },
        ],
      })),
      performance: {
        totalTime: 0,
        layerTimes: {},
      },
      errors: [],
      metadata: {
        fileSize: code.length,
        lineCount: code.split("\n").length,
        analysisId: "offline-" + Date.now(),
        timestamp: new Date().toISOString(),
      },
    };
  }

  private createFallbackTransformResult(
    code: string,
    layers: number[] = [],
  ): TransformResult {
    return {
      transformed: code, // Return original code unchanged
      layers: layers.map((id) => ({
        id,
        name: `Layer ${id}`,
        status: "skipped" as const,
        changes: 0,
        error: "Transform unavailable - API server not connected",
      })),
      performance: {
        totalTime: 0,
        layerTimes: {},
      },
      summary: {
        totalChanges: 0,
        linesAdded: 0,
        linesRemoved: 0,
        linesModified: 0,
      },
    };
  }

  private getFallbackLayerInfo(): any[] {
    return [
      {
        id: 1,
        name: "Configuration Validation",
        description:
          "Optimizes TypeScript, Next.js config, and package.json with modern settings.",
        timeout: 30000,
        enabled: true,
      },
      {
        id: 2,
        name: "Pattern & Entity Fixes",
        description:
          "Cleans up HTML entities, old patterns, and modernizes JS/TS code.",
        timeout: 45000,
        enabled: true,
      },
      {
        id: 3,
        name: "Component Best Practices",
        description:
          "Solves missing key props, accessibility, prop types, and missing imports.",
        timeout: 60000,
        enabled: true,
      },
      {
        id: 4,
        name: "Hydration & SSR Guard",
        description:
          "Fixes hydration bugs and adds SSR/localStorage protection.",
        timeout: 45000,
        enabled: true,
      },
      {
        id: 5,
        name: "Next.js Optimization",
        description:
          "Optimizes Next.js App Router patterns, 'use client' directives, and import order.",
        timeout: 30000,
        enabled: false,
      },
      {
        id: 6,
        name: "Quality & Performance",
        description:
          "Adds error handling, performance optimizations, and code quality improvements.",
        timeout: 30000,
        enabled: false,
      },
    ];
  }

  public getConnectionStatus(): string {
    return this.connectionStatus;
  }

  public isConnectionHealthy(): boolean {
    return this.isOnline && this.connectionStatus === "connected";
  }

  public cancelAllRequests(): void {
    this.abortControllers.forEach((controller) => controller.abort());
    this.abortControllers.clear();
  }

  private logApiCall(config: any, status: number, data: any): void {
    const logEntry = {
      timestamp: new Date().toISOString(),
      method: config.method?.toUpperCase(),
      url: config.url,
      status,
      requestId: config.headers["X-NeuroLint-Request-ID"],
      user: this.userInfo?.email || "unknown",
      team: this.configManager.getTeamId(),
      enterprise: this.configManager.isEnterpriseMode(),
    };

    // Send to audit log (in production this would go to a proper logging service)
    console.log("API_AUDIT:", JSON.stringify(logEntry));
  }

  private logApiError(error: any): void {
    const logEntry = {
      timestamp: new Date().toISOString(),
      error: error.message,
      status: error.response?.status,
      url: error.config?.url,
      user: this.userInfo?.email || "unknown",
      team: this.configManager.getTeamId(),
    };

    console.log("API_ERROR:", JSON.stringify(logEntry));
  }
}
