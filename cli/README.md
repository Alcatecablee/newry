# NeuroLint CLI

Advanced code analysis and transformation command-line tool.

## Installation

```bash
npm install -g @neurolint/cli
```

Or run directly:

```bash
npx @neurolint/cli
```

## Quick Start

1. **Initialize your project:**

   ```bash
   neurolint init
   ```

2. **Analyze your code:**

   ```bash
   neurolint analyze src/
   ```

3. **Fix issues automatically:**
   ```bash
   neurolint fix src/ --dry-run  # Preview changes
   neurolint fix src/            # Apply fixes
   ```

## Commands

### `neurolint init`

Initialize NeuroLint configuration in your project.

```bash
neurolint init [options]
  -f, --force    Overwrite existing configuration
```

### `neurolint analyze [files...]`

Analyze code files for issues and improvements.

```bash
neurolint analyze src/ [options]
  -l, --layers <layers>     Layers to run (1-6) [default: 1,2,3,4]
  -o, --output <format>     Output format (json|table|summary) [default: table]
  -r, --recursive           Analyze files recursively
  --include <patterns>      Include file patterns (comma-separated)
  --exclude <patterns>      Exclude file patterns (comma-separated)
  --config <path>           Configuration file path
```

### `neurolint fix [files...]`

Fix code issues automatically.

```bash
neurolint fix src/ [options]
  -l, --layers <layers>     Layers to run (1-6) [default: 1,2,3,4]
  -r, --recursive           Fix files recursively
  --dry-run                 Preview changes without applying
  --backup                  Create backup files before fixing
  --include <patterns>      Include file patterns
  --exclude <patterns>      Exclude file patterns
```

### `neurolint status`

Show project analysis status and statistics.

```bash
neurolint status [options]
  --detailed               Show detailed statistics
```

### `neurolint interactive`

Run NeuroLint in interactive mode.

### `neurolint login`

Authenticate with NeuroLint service.

## Configuration

Create a `.neurolint.json` file in your project root:

```json
{
  "version": "1.0.0",
  "layers": {
    "enabled": [1, 2, 3, 4],
    "config": {
      "1": { "name": "Configuration Validation", "timeout": 30000 },
      "2": { "name": "Pattern & Entity Fixes", "timeout": 45000 },
      "3": { "name": "Component Best Practices", "timeout": 60000 },
      "4": { "name": "Hydration & SSR Guard", "timeout": 45000 }
    }
  },
  "files": {
    "include": ["**/*.{ts,tsx,js,jsx}"],
    "exclude": ["node_modules/**", "dist/**", "build/**"]
  },
  "output": {
    "format": "table",
    "verbose": false
  },
  "api": {
    "url": "http://localhost:5000",
    "timeout": 60000
  }
}
```

## Layers

NeuroLint uses 6 transformation layers:

1. **Configuration Validation** - TypeScript, Next.js config optimization
2. **Pattern & Entity Fixes** - HTML entities, legacy patterns
3. **Component Best Practices** - React keys, accessibility, imports
4. **Hydration & SSR Guard** - SSR protection, hydration fixes
5. **Next.js Optimization** - App Router patterns, directives
6. **Quality & Performance** - Error handling, optimizations

## Examples

```bash
# Analyze TypeScript files only
neurolint analyze --include="**/*.ts,**/*.tsx"

# Fix with specific layers
neurolint fix --layers=1,2,3 src/components/

# Preview all changes
neurolint fix --dry-run --recursive

# Get detailed project status
neurolint status --detailed

# Interactive mode
neurolint interactive
```

## CI/CD Integration

```yaml
# GitHub Actions example
- name: NeuroLint Analysis
  run: |
    npx @neurolint/cli analyze --output=json > neurolint-report.json
    npx @neurolint/cli fix --dry-run
```

## Environment Variables

- `NEUROLINT_API_URL` - API server URL
- `NEUROLINT_API_KEY` - Authentication key
- `NEUROLINT_CONFIG_PATH` - Configuration file path
