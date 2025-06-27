import axios, { AxiosInstance } from 'axios';
import * as vscode from 'vscode';
import { ConfigurationManager } from './ConfigurationManager';

export interface AnalysisResult {
    layers: LayerResult[];
    performance: {
        totalTime: number;
        layerTimes: Record<number, number>;
    };
    errors: any[];
}

export interface LayerResult {
    id: number;
    name: string;
    status: 'success' | 'error' | 'skipped';
    changes: number;
    insights?: Insight[];
    error?: string;
}

export interface Insight {
    layerId: number;
    ruleId?: string;
    message: string;
    severity: 'error' | 'warning' | 'info' | 'hint';
    line?: number;
    column?: number;
    length?: number;
    pattern?: string;
    fix?: string;
}

export interface TransformResult {
    transformed: string;
    layers: LayerResult[];
    performance: {
        totalTime: number;
        layerTimes: Record<number, number>;
    };
}

export class ApiClient {
    private client: AxiosInstance;

    constructor(private configManager: ConfigurationManager) {
        this.client = axios.create({
            timeout: this.configManager.getTimeout(),
            headers: {
                'Content-Type': 'application/json'
            }
        });

        // Add request interceptor for authentication
        this.client.interceptors.request.use((config) => {
            const apiKey = this.configManager.getApiKey();
            if (apiKey) {
                config.headers.Authorization = `Bearer ${apiKey}`;
            }
            config.baseURL = this.configManager.getApiUrl();
            return config;
        });

        // Add response interceptor for error handling
        this.client.interceptors.response.use(
            (response) => response,
            (error) => {
                if (error.response?.status === 401) {
                    vscode.window.showErrorMessage('NeuroLint: Authentication failed. Please check your API key.');
                } else if (error.code === 'ECONNREFUSED') {
                    vscode.window.showErrorMessage('NeuroLint: Cannot connect to server. Make sure the NeuroLint server is running.');
                }
                return Promise.reject(error);
            }
        );
    }

    public async analyzeCode(code: string, filePath?: string): Promise<AnalysisResult> {
        const layers = this.configManager.getEnabledLayers();
        
        const response = await this.client.post('/api/analyze', {
            code,
            filePath,
            layers
        });

        return response.data;
    }

    public async transformCode(code: string, filePath?: string): Promise<TransformResult> {
        const layers = this.configManager.getEnabledLayers();
        
        const response = await this.client.post('/api/transform', {
            code,
            filePath,
            layers
        });

        return response.data;
    }

    public async getLayerInfo(): Promise<any[]> {
        const response = await this.client.get('/api/layers');
        return response.data;
    }

    public async healthCheck(): Promise<boolean> {
        try {
            const response = await this.client.get('/health');
            return response.status === 200;
        } catch {
            return false;
        }
    }

    public async validateConfiguration(): Promise<{ valid: boolean; errors: string[] }> {
        try {
            const response = await this.client.post('/api/validate-config', {
                layers: this.configManager.getEnabledLayers()
            });
            return response.data;
        } catch (error) {
            return {
                valid: false,
                errors: [error instanceof Error ? error.message : 'Unknown error']
            };
        }
    }
}