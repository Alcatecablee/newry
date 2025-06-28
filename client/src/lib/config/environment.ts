/**
 * Environment configuration management with validation
 */

interface EnvironmentConfig {
  // App configuration
  NODE_ENV: 'development' | 'production' | 'test';
  VITE_APP_ENV: 'development' | 'production' | 'staging';

  // Database (server-side only)
  DATABASE_URL?: string;

  // PayPal
  VITE_PAYPAL_CLIENT_ID: string;
  PAYPAL_CLIENT_SECRET?: string;

  // Security
  JWT_SECRET?: string;
  ENCRYPTION_KEY?: string;

  // Features
  VITE_ENABLE_ANALYTICS?: string;
  VITE_ENABLE_MONITORING?: string;
  VITE_MAX_FILE_SIZE?: string;
  VITE_MAX_TRANSFORMATIONS_FREE?: string;
}

class EnvironmentManager {
  private config: Partial<EnvironmentConfig> = {};
  private validated = false;

  constructor() {
    this.loadConfig();
  }

  private loadConfig(): void {
    // Load from import.meta.env (Vite environment) - this is the primary source for client-side
    if (typeof globalThis !== 'undefined' && globalThis.import?.meta?.env) {
      this.config = { ...globalThis.import.meta.env };
    } else if (typeof import !== 'undefined' && typeof import.meta !== 'undefined' && import.meta.env) {
      this.config = { ...import.meta.env };
    }
  }

  validate(): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Required environment variables
    const required: (keyof EnvironmentConfig)[] = [
      'VITE_PAYPAL_CLIENT_ID',
    ];

    for (const key of required) {
      if (!this.config[key]) {
        errors.push(`Missing required environment variable: ${key}`);
      }
    }

    // Validate environment values
    if (this.config.NODE_ENV && !['development', 'production', 'test'].includes(this.config.NODE_ENV)) {
      errors.push('NODE_ENV must be development, production, or test');
    }

    if (this.config.VITE_APP_ENV && !['development', 'production', 'staging'].includes(this.config.VITE_APP_ENV)) {
      errors.push('VITE_APP_ENV must be development, production, or staging');
    }

    // Production-specific validations
    if (this.isProd()) {
      const prodRequired: (keyof EnvironmentConfig)[] = [
        'PAYPAL_CLIENT_SECRET',
        'JWT_SECRET',
        'ENCRYPTION_KEY',
        'DATABASE_URL',
      ];

      for (const key of prodRequired) {
        if (!this.config[key]) {
          errors.push(`Missing required production environment variable: ${key}`);
        }
      }

      // Check for default/example values in production

      if (this.config.JWT_SECRET && this.config.JWT_SECRET.length < 32) {
        errors.push('JWT_SECRET must be at least 32 characters in production');
      }
    }

    this.validated = errors.length === 0;
    return { isValid: this.validated, errors };
  }

  get<K extends keyof EnvironmentConfig>(key: K): EnvironmentConfig[K] | undefined {
    if (!this.validated) {
      console.warn('Environment not validated. Call validate() first.');
    }
    return this.config[key] as EnvironmentConfig[K];
  }

  getRequired<K extends keyof EnvironmentConfig>(key: K): EnvironmentConfig[K] {
    const value = this.get(key);
    if (value === undefined || value === '') {
      throw new Error(`Required environment variable ${key} is not set`);
    }
    return value;
  }

  isDev(): boolean {
    return this.config.NODE_ENV === 'development' || this.config.VITE_APP_ENV === 'development';
  }

  isProd(): boolean {
    return this.config.NODE_ENV === 'production' || this.config.VITE_APP_ENV === 'production';
  }

  isTest(): boolean {
    return this.config.NODE_ENV === 'test';
  }

  private isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  // Get sanitized config for client-side (excluding secrets)
  getClientConfig(): Partial<EnvironmentConfig> {
    return {
      NODE_ENV: this.config.NODE_ENV,
      VITE_APP_ENV: this.config.VITE_APP_ENV,
      VITE_PAYPAL_CLIENT_ID: this.config.VITE_PAYPAL_CLIENT_ID,
      VITE_ENABLE_ANALYTICS: this.config.VITE_ENABLE_ANALYTICS,
      VITE_ENABLE_MONITORING: this.config.VITE_ENABLE_MONITORING,
      VITE_MAX_FILE_SIZE: this.config.VITE_MAX_FILE_SIZE,
      VITE_MAX_TRANSFORMATIONS_FREE: this.config.VITE_MAX_TRANSFORMATIONS_FREE,
    };
  }

  // Generate secure defaults for missing keys
  generateSecrets(): { [key: string]: string } {
    const secrets: { [key: string]: string } = {};

    if (!this.config.JWT_SECRET) {
      secrets.JWT_SECRET = this.generateRandomString(64);
    }

    if (!this.config.ENCRYPTION_KEY) {
      secrets.ENCRYPTION_KEY = this.generateRandomString(32);
    }

    return secrets;
  }

  private generateRandomString(length: number): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }
}

// Singleton instance
export const env = new EnvironmentManager();

// Validate on import (only show warnings in development)
const validation = env.validate();
if (!validation.isValid) {
  if (env.isDev()) {
    console.warn('Environment validation failed:', validation.errors);
  }
}

export { EnvironmentConfig };