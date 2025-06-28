/**
 * Format execution time for clean display
 * @param ms - Time in milliseconds
 * @returns Formatted time string
 */
export function formatExecutionTime(ms: number): string {
  if (ms < 1000) {
    // For milliseconds, round to 1 decimal place or whole number for cleaner display
    return ms % 1 === 0
      ? `${Math.round(ms)}ms`
      : `${Math.round(ms * 10) / 10}ms`;
  }
  // For seconds, show 1 decimal place
  return `${(ms / 1000).toFixed(1)}s`;
}

/**
 * Format processing time specifically for stats displays
 * @param ms - Time in milliseconds
 * @returns Formatted time string optimized for large displays
 */
export function formatProcessingTime(ms: number): string {
  if (ms < 1000) {
    // Round to nearest whole number for stats cards
    return `${Math.round(ms)}ms`;
  }
  // For seconds, show 1 decimal place
  return `${(ms / 1000).toFixed(1)}s`;
}
