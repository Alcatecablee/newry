/**
 * Performance monitoring and tracking utilities
 */

interface PerformanceMetric {
  name: string;
  value: number;
  unit: "ms" | "bytes" | "count";
  timestamp: number;
  tags?: Record<string, string>;
}

interface ErrorEvent {
  error: Error;
  context: string;
  timestamp: number;
  userId?: string;
  metadata?: Record<string, any>;
}

interface UsageEvent {
  action: string;
  userId?: string;
  timestamp: number;
  metadata?: Record<string, any>;
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private errors: ErrorEvent[] = [];
  private usage: UsageEvent[] = [];
  private readonly maxStoredItems = 1000;

  // Performance tracking
  measureAsync<T>(
    name: string,
    operation: () => Promise<T>,
    tags?: Record<string, string>,
  ): Promise<T> {
    const startTime = performance.now();
    const startMemory = (performance as any).memory?.usedJSHeapSize || 0;

    return operation()
      .then((result) => {
        this.recordMetric({
          name: `${name}_duration`,
          value: performance.now() - startTime,
          unit: "ms",
          timestamp: Date.now(),
          tags,
        });

        const endMemory = (performance as any).memory?.usedJSHeapSize || 0;
        if (endMemory > startMemory) {
          this.recordMetric({
            name: `${name}_memory`,
            value: endMemory - startMemory,
            unit: "bytes",
            timestamp: Date.now(),
            tags,
          });
        }

        return result;
      })
      .catch((error) => {
        this.recordError({
          error,
          context: name,
          timestamp: Date.now(),
          metadata: { tags },
        });
        throw error;
      });
  }

  measure<T>(
    name: string,
    operation: () => T,
    tags?: Record<string, string>,
  ): T {
    const startTime = performance.now();
    const startMemory = (performance as any).memory?.usedJSHeapSize || 0;

    try {
      const result = operation();

      this.recordMetric({
        name: `${name}_duration`,
        value: performance.now() - startTime,
        unit: "ms",
        timestamp: Date.now(),
        tags,
      });

      const endMemory = (performance as any).memory?.usedJSHeapSize || 0;
      if (endMemory > startMemory) {
        this.recordMetric({
          name: `${name}_memory`,
          value: endMemory - startMemory,
          unit: "bytes",
          timestamp: Date.now(),
          tags,
        });
      }

      return result;
    } catch (error) {
      this.recordError({
        error: error instanceof Error ? error : new Error(String(error)),
        context: name,
        timestamp: Date.now(),
        metadata: { tags },
      });
      throw error;
    }
  }

  // Metric recording
  recordMetric(metric: PerformanceMetric): void {
    this.metrics.push(metric);
    this.cleanup();

    // Alert on performance issues
    if (metric.name.includes("duration") && metric.value > 10000) {
      // 10 seconds
      console.warn(
        `Slow operation detected: ${metric.name} took ${metric.value.toFixed(2)}ms`,
      );
    }

    if (metric.name.includes("memory") && metric.value > 50 * 1024 * 1024) {
      // 50MB
      console.warn(
        `High memory usage: ${metric.name} used ${(metric.value / 1024 / 1024).toFixed(2)}MB`,
      );
    }
  }

  recordError(errorEvent: ErrorEvent): void {
    this.errors.push(errorEvent);
    this.cleanup();

    console.error(`Error in ${errorEvent.context}:`, errorEvent.error);

    // In production, send to error tracking service
    if (import.meta.env.PROD) {
      this.sendToErrorTracking(errorEvent);
    }
  }

  recordUsage(usageEvent: UsageEvent): void {
    this.usage.push(usageEvent);
    this.cleanup();

    // In production, send to analytics service
    if (
      import.meta.env.PROD &&
      import.meta.env.VITE_ENABLE_ANALYTICS === "true"
    ) {
      this.sendToAnalytics(usageEvent);
    }
  }

  // Data retrieval
  getMetrics(since?: number): PerformanceMetric[] {
    const cutoff = since || Date.now() - 24 * 60 * 60 * 1000; // 24 hours
    return this.metrics.filter((m) => m.timestamp >= cutoff);
  }

  getErrors(since?: number): ErrorEvent[] {
    const cutoff = since || Date.now() - 24 * 60 * 60 * 1000; // 24 hours
    return this.errors.filter((e) => e.timestamp >= cutoff);
  }

  getUsageStats(since?: number): UsageEvent[] {
    const cutoff = since || Date.now() - 24 * 60 * 60 * 1000; // 24 hours
    return this.usage.filter((u) => u.timestamp >= cutoff);
  }

  // Performance analysis
  getPerformanceReport(): {
    avgResponseTime: number;
    errorRate: number;
    memoryUsage: { avg: number; peak: number };
    topErrors: { error: string; count: number }[];
    slowOperations: { name: string; avgDuration: number }[];
  } {
    const recent = this.getMetrics();
    const recentErrors = this.getErrors();

    // Calculate average response time
    const durations = recent.filter((m) => m.name.includes("duration"));
    const avgResponseTime =
      durations.length > 0
        ? durations.reduce((sum, m) => sum + m.value, 0) / durations.length
        : 0;

    // Calculate error rate
    const totalOperations = durations.length;
    const errorRate =
      totalOperations > 0 ? (recentErrors.length / totalOperations) * 100 : 0;

    // Memory usage stats
    const memoryMetrics = recent.filter((m) => m.name.includes("memory"));
    const avgMemory =
      memoryMetrics.length > 0
        ? memoryMetrics.reduce((sum, m) => sum + m.value, 0) /
          memoryMetrics.length
        : 0;
    const peakMemory =
      memoryMetrics.length > 0
        ? Math.max(...memoryMetrics.map((m) => m.value))
        : 0;

    // Top errors
    const errorCounts = new Map<string, number>();
    recentErrors.forEach((e) => {
      const key = e.error.message;
      errorCounts.set(key, (errorCounts.get(key) || 0) + 1);
    });
    const topErrors = Array.from(errorCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([error, count]) => ({ error, count }));

    // Slow operations
    const operationTimes = new Map<string, number[]>();
    durations.forEach((m) => {
      const operation = m.name.replace("_duration", "");
      if (!operationTimes.has(operation)) {
        operationTimes.set(operation, []);
      }
      operationTimes.get(operation)!.push(m.value);
    });

    const slowOperations = Array.from(operationTimes.entries())
      .map(([name, times]) => ({
        name,
        avgDuration: times.reduce((sum, t) => sum + t, 0) / times.length,
      }))
      .filter((op) => op.avgDuration > 1000) // Operations slower than 1 second
      .sort((a, b) => b.avgDuration - a.avgDuration)
      .slice(0, 5);

    return {
      avgResponseTime,
      errorRate,
      memoryUsage: { avg: avgMemory, peak: peakMemory },
      topErrors,
      slowOperations,
    };
  }

  // Cleanup old data
  private cleanup(): void {
    if (this.metrics.length > this.maxStoredItems) {
      this.metrics = this.metrics.slice(-this.maxStoredItems);
    }
    if (this.errors.length > this.maxStoredItems) {
      this.errors = this.errors.slice(-this.maxStoredItems);
    }
    if (this.usage.length > this.maxStoredItems) {
      this.usage = this.usage.slice(-this.maxStoredItems);
    }
  }

  private sendToErrorTracking(errorEvent: ErrorEvent): void {
    // Placeholder for error tracking service integration
    // Example: Sentry, LogRocket, Bugsnag, etc.
    if (import.meta.env.VITE_ERROR_TRACKING_URL) {
      fetch(import.meta.env.VITE_ERROR_TRACKING_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          error: {
            message: errorEvent.error.message,
            stack: errorEvent.error.stack,
            name: errorEvent.error.name,
          },
          context: errorEvent.context,
          timestamp: errorEvent.timestamp,
          userId: errorEvent.userId,
          metadata: errorEvent.metadata,
          userAgent: navigator.userAgent,
          url: window.location.href,
        }),
      }).catch(console.error);
    }
  }

  private sendToAnalytics(usageEvent: UsageEvent): void {
    // Placeholder for analytics service integration
    // Example: Google Analytics, Mixpanel, Amplitude, etc.
    if (import.meta.env.VITE_ANALYTICS_URL) {
      fetch(import.meta.env.VITE_ANALYTICS_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event: usageEvent.action,
          timestamp: usageEvent.timestamp,
          userId: usageEvent.userId,
          properties: usageEvent.metadata,
          userAgent: navigator.userAgent,
          url: window.location.href,
        }),
      }).catch(console.error);
    }
  }

  // Health check
  getHealthStatus(): {
    status: "healthy" | "warning" | "critical";
    issues: string[];
    uptime: number;
  } {
    const issues: string[] = [];
    const report = this.getPerformanceReport();

    // Check error rate
    if (report.errorRate > 10) {
      issues.push(`High error rate: ${report.errorRate.toFixed(1)}%`);
    }

    // Check response time
    if (report.avgResponseTime > 5000) {
      issues.push(
        `Slow average response time: ${report.avgResponseTime.toFixed(0)}ms`,
      );
    }

    // Check memory usage
    if (report.memoryUsage.peak > 100 * 1024 * 1024) {
      issues.push(
        `High memory usage: ${(report.memoryUsage.peak / 1024 / 1024).toFixed(0)}MB`,
      );
    }

    let status: "healthy" | "warning" | "critical" = "healthy";
    if (issues.length > 0) {
      status =
        report.errorRate > 20 || report.avgResponseTime > 10000
          ? "critical"
          : "warning";
    }

    return {
      status,
      issues,
      uptime: performance.now(), // Simplified uptime
    };
  }
}

// Singleton instance
export const performanceMonitor = new PerformanceMonitor();

// Convenience functions
export function measurePerformance<T>(name: string, operation: () => T): T {
  return performanceMonitor.measure(name, operation);
}

export function measurePerformanceAsync<T>(
  name: string,
  operation: () => Promise<T>,
): Promise<T> {
  return performanceMonitor.measureAsync(name, operation);
}

export function trackError(
  error: Error,
  context: string,
  userId?: string,
): void {
  performanceMonitor.recordError({
    error,
    context,
    timestamp: Date.now(),
    userId,
  });
}

export function trackUsage(
  action: string,
  userId?: string,
  metadata?: Record<string, any>,
): void {
  performanceMonitor.recordUsage({
    action,
    userId,
    timestamp: Date.now(),
    metadata,
  });
}

// React hook for component performance tracking
export function usePerformanceTracking(componentName: string) {
  const trackRender = () => {
    performanceMonitor.recordUsage({
      action: "component_render",
      timestamp: Date.now(),
      metadata: { component: componentName },
    });
  };

  const trackInteraction = (
    interactionType: string,
    metadata?: Record<string, any>,
  ) => {
    performanceMonitor.recordUsage({
      action: "user_interaction",
      timestamp: Date.now(),
      metadata: {
        component: componentName,
        interaction: interactionType,
        ...metadata,
      },
    });
  };

  return { trackRender, trackInteraction };
}
