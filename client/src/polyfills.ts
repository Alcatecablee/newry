
// Browser polyfills for Node.js globals
// This prevents "process is not defined" errors in the browser

// Polyfill for process.env
if (typeof globalThis.process === 'undefined') {
  globalThis.process = {
    env: {
      NODE_ENV: 'development'
    }
  } as any;
}

// Export to ensure this file is treated as a module
export {};
