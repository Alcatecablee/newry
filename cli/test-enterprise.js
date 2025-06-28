#!/usr/bin/env node

/**
 * Enterprise CLI Testing Script
 *
 * This script tests all enterprise CLI commands without requiring a real server.
 * It provides a comprehensive testing harness for development and CI/CD.
 */

const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");

const CLI_PATH = path.join(__dirname, "dist", "cli.js");

class CLITester {
  constructor() {
    this.tests = [];
    this.results = { passed: 0, failed: 0 };
  }

  // Add a test case
  test(name, command, expectedOutputs = [], shouldFail = false) {
    this.tests.push({ name, command, expectedOutputs, shouldFail });
  }

  // Run all tests
  async runAll() {
    console.log("Starting NeuroLint Enterprise CLI Tests\n");

    // Check if CLI is built
    if (!fs.existsSync(CLI_PATH)) {
      console.log('❌ CLI not built. Run "npm run build" first.');
      process.exit(1);
    }

    for (const test of this.tests) {
      await this.runTest(test);
    }

    this.printResults();
  }

  // Run a single test
  async runTest({ name, command, expectedOutputs, shouldFail }) {
    return new Promise((resolve) => {
      console.log(`Testing: ${name}`);
      console.log(`   Command: neurolint ${command}`);

      const args = command.split(" ");
      const child = spawn("node", [CLI_PATH, ...args], {
        stdio: ["pipe", "pipe", "pipe"],
        timeout: 30000,
      });

      let stdout = "";
      let stderr = "";

      child.stdout.on("data", (data) => {
        stdout += data.toString();
      });

      child.stderr.on("data", (data) => {
        stderr += data.toString();
      });

      child.on("close", (code) => {
        const output = stdout + stderr;
        const failed = shouldFail ? code === 0 : code !== 0;

        let testPassed = !failed;

        // Check expected outputs
        if (expectedOutputs.length > 0) {
          for (const expected of expectedOutputs) {
            if (!output.toLowerCase().includes(expected.toLowerCase())) {
              testPassed = false;
              console.log(`   ❌ Missing expected output: "${expected}"`);
            }
          }
        }

        if (testPassed) {
          console.log(`   PASSED`);
          this.results.passed++;
        } else {
          console.log(`   FAILED`);
          console.log(`   Exit code: ${code}`);
          if (output) {
            console.log(`   Output: ${output.substring(0, 200)}...`);
          }
          this.results.failed++;
        }
        console.log("");
        resolve();
      });

      child.on("error", (error) => {
        console.log(`   ❌ ERROR: ${error.message}`);
        this.results.failed++;
        resolve();
      });

      // Send empty input to handle interactive prompts
      if (command.includes("interactive") || !command.includes("--")) {
        setTimeout(() => {
          child.stdin.write("\n");
          child.stdin.end();
        }, 1000);
      }
    });
  }

  printResults() {
    console.log("Test Results:");
    console.log(`   Passed: ${this.results.passed}`);
    console.log(`   Failed: ${this.results.failed}`);
    console.log(
      `   Success Rate: ${((this.results.passed / (this.results.passed + this.results.failed)) * 100).toFixed(1)}%`,
    );

    if (this.results.failed === 0) {
      console.log("\nAll tests passed! Your Enterprise CLI is ready.");
    } else {
      console.log("\nSome tests failed. Please check the issues above.");
    }
  }
}

// Create test instance
const tester = new CLITester();

// Basic CLI tests
tester.test("Help command", "help", [
  "NeuroLint CLI Examples",
  "Enterprise features",
]);
tester.test("Version display", "--version", ["1.0.0"]);
tester.test("Enterprise command overview", "enterprise", [
  "Enterprise Features",
  "team",
  "analytics",
]);

// Team management tests
tester.test("Team help", "team --help", ["Manage teams", "team members"]);
tester.test(
  "Team list (no auth)",
  "team --list",
  ["Enterprise authentication required"],
  true,
);

// Analytics tests
tester.test("Analytics help", "analytics --help", [
  "Enterprise analytics",
  "reporting",
]);
tester.test(
  "Analytics dashboard (no auth)",
  "analytics --dashboard",
  ["Enterprise authentication required"],
  true,
);

// Webhook tests
tester.test("Webhook help", "webhook --help", ["Manage enterprise webhooks"]);
tester.test(
  "Webhook list (no auth)",
  "webhook --list",
  ["Enterprise authentication required"],
  true,
);

// SSO tests
tester.test("SSO help", "sso --help", ["Single Sign-On", "SSO"]);
tester.test(
  "SSO list (no auth)",
  "sso --list",
  ["Enterprise authentication required"],
  true,
);

// Audit tests
tester.test("Audit help", "audit --help", ["Audit trail", "compliance"]);
tester.test(
  "Audit trail (no auth)",
  "audit --trail",
  ["Enterprise authentication required"],
  true,
);

// Configuration tests
tester.test("Config help", "config --help", ["NeuroLint configuration"]);
tester.test("Status command", "status", ["project", "NeuroLint"]);

// Interactive mode tests
tester.test("Interactive mode", "interactive", ["NeuroLint Interactive Mode"]);

// Error handling tests
tester.test("Invalid command", "invalid-command", ["unknown command"], true);
tester.test("Invalid team option", "team --invalid", ["unknown option"], true);

// File validation tests (with dummy files)
const createTestFiles = () => {
  const testDir = path.join(__dirname, "test-files");
  if (!fs.existsSync(testDir)) {
    fs.mkdirSync(testDir);
  }

  // Create a dummy TypeScript file
  fs.writeFileSync(path.join(testDir, "test.ts"), 'const hello = "world";');

  return testDir;
};

const testDir = createTestFiles();
tester.test("Analyze test files", `analyze ${testDir}/*.ts`, ["analysis"]);

// Clean up test files
const cleanup = () => {
  const testDir = path.join(__dirname, "test-files");
  if (fs.existsSync(testDir)) {
    fs.rmSync(testDir, { recursive: true, force: true });
  }
};

// Run all tests
tester
  .runAll()
  .then(() => {
    cleanup();
  })
  .catch((error) => {
    console.error("Test runner error:", error);
    cleanup();
    process.exit(1);
  });
