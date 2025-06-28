import axios, { AxiosInstance } from "axios";
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
  status: "success" | "error" | "skipped";
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

export class ApiClient {
  private client: AxiosInstance;
  private authToken: string | null = null;
  private userInfo: UserInfo | null = null;
  private teamInfo: TeamInfo | null = null;

  constructor(private configManager: ConfigurationManager) {
    this.client = axios.create({
      timeout: this.configManager.getTimeout(),
      headers: {
        "Content-Type": "application/json",
        "User-Agent": `vscode-neurolint/1.0.0 (${vscode.env.appName})`,
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor for authentication and enterprise features
    this.client.interceptors.request.use((config) => {
      const apiKey = this.configManager.getApiKey();
      if (apiKey) {
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
        // Log successful enterprise requests
        if (this.configManager.isAuditLoggingEnabled()) {
          this.logApiCall(response.config, response.status, response.data);
        }
        return response;
      },
      (error) => {
        this.handleApiError(error);
        return Promise.reject(error);
      },
    );
  }

  public async analyzeCode(
    code: string,
    filePath?: string,
  ): Promise<AnalysisResult> {
    const layers = this.configManager.getEnabledLayers();

    const response = await this.client.post("/api/analyze", {
      code,
      filePath,
      layers,
      options: {
        enterprise: this.configManager.isEnterpriseMode(),
        compliance: this.configManager.isComplianceModeEnabled(),
        diagnosticsLevel: this.configManager.getDiagnosticsLevel(),
      },
    });

    return response.data;
  }

  public async transformCode(
    code: string,
    filePath?: string,
  ): Promise<TransformResult> {
    const layers = this.configManager.getEnabledLayers();

    const response = await this.client.post("/api/transform", {
      code,
      filePath,
      layers,
      options: {
        enterprise: this.configManager.isEnterpriseMode(),
        compliance: this.configManager.isComplianceModeEnabled(),
        backup: true,
      },
    });

    return response.data;
  }

  public async getLayerInfo(): Promise<any[]> {
    const response = await this.client.get("/api/layers");
    return response.data;
  }

  public async healthCheck(): Promise<boolean> {
    try {
      const response = await this.client.get("/api/health");
      return response.status === 200;
    } catch {
      return false;
    }
  }

  public async validateConfiguration(): Promise<{
    valid: boolean;
    errors: string[];
  }> {
    try {
      const response = await this.client.post("/api/validate-config", {
        layers: this.configManager.getEnabledLayers(),
        enterprise: this.configManager.isEnterpriseMode(),
      });
      return response.data;
    } catch (error) {
      return {
        valid: false,
        errors: [error instanceof Error ? error.message : "Unknown error"],
      };
    }
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

  private handleApiError(error: any): void {
    if (error.response?.status === 401) {
      vscode.window.showErrorMessage(
        "NeuroLint: Authentication failed. Please check your API key.",
      );
    } else if (error.response?.status === 403) {
      vscode.window.showErrorMessage(
        "NeuroLint: Access denied. Check your permissions.",
      );
    } else if (error.response?.status === 429) {
      vscode.window.showWarningMessage(
        "NeuroLint: Rate limit reached. Please wait before making more requests.",
      );
    } else if (error.code === "ECONNREFUSED") {
      vscode.window.showErrorMessage(
        "NeuroLint: Cannot connect to server. Make sure the NeuroLint server is running.",
      );
    } else if (error.code === "ETIMEDOUT") {
      vscode.window.showWarningMessage(
        "NeuroLint: Request timed out. The server may be overloaded.",
      );
    } else {
      const message =
        error.response?.data?.message || error.message || "Unknown error";
      vscode.window.showErrorMessage(`NeuroLint: ${message}`);
    }

    // Log error for audit if enabled
    if (this.configManager.isAuditLoggingEnabled()) {
      this.logApiError(error);
    }
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
