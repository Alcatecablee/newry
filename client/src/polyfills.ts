// Browser polyfills for Node.js globals
// This prevents "process is not defined" errors in the browser

declare global {
  var process: any;
}

// Polyfill for process.env
if (typeof globalThis.process === 'undefined') {
  globalThis.process = {
    env: {
      NODE_ENV: 'development'
    }
  };
}

// Export to ensure this file is treated as a module
export {};