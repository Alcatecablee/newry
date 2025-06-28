#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const glob = require("glob");

/**
 * Enterprise CLI Cleanup Script
 * Removes emojis and converts colorful chalk to neutral white/gray colors
 */

function cleanupFile(filePath) {
  console.log(`Cleaning: ${filePath}`);

  let content = fs.readFileSync(filePath, "utf8");

  // Remove common emojis
  const emojis = [
    "🧠",
    "🔐",
    "✅",
    "❌",
    "💡",
    "🚀",
    "🔄",
    "📊",
    "🎯",
    "⚠",
    "🔍",
    "🔧",
    "📋",
    "🛠️",
    "🧪",
    "🔓",
    "⏱",
    "🚦",
    "📁",
    "📖",
    "🔗",
    "👤",
    "👋",
    "✓",
    "✗",
    "⚠",
  ];

  emojis.forEach((emoji) => {
    content = content.replace(new RegExp(emoji, "g"), "");
  });

  // Replace colorful chalk with neutral colors
  content = content.replace(/chalk\.blue\.bold/g, "chalk.white.bold");
  content = content.replace(/chalk\.blue\(/g, "chalk.white(");
  content = content.replace(/chalk\.green\(/g, "chalk.white(");
  content = content.replace(/chalk\.red\(/g, "chalk.white(");
  content = content.replace(/chalk\.yellow\(/g, "chalk.white(");
  content = content.replace(/chalk\.cyan\(/g, "chalk.white(");

  // Replace status icons with text
  content = content.replace(
    /statusIcon = event\.success \? '✓' : '✗'/g,
    "statusIcon = event.success ? 'SUCCESS' : 'FAILED'",
  );
  content = content.replace(
    /statusIcon = req\.status === "met" \? "✓" : req\.status === "partial" \? "⚠" : "✗"/g,
    'statusIcon = req.status === "met" ? "MET" : req.status === "partial" ? "PARTIAL" : "NOT MET"',
  );

  fs.writeFileSync(filePath, content, "utf8");
}

// Find all TypeScript files in src directory
const files = glob.sync("cli/src/**/*.ts", { absolute: true });

console.log("Starting enterprise CLI cleanup...");
console.log(`Found ${files.length} TypeScript files to clean`);

files.forEach(cleanupFile);

console.log("Enterprise cleanup complete!");
console.log("All emojis removed and colors converted to neutral white/gray.");
