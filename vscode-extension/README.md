# NeuroLint for Visual Studio Code

AI-powered code analysis and transformation directly in your editor.

## Features

- **Real-time Analysis**: Instant code quality feedback as you type
- **Smart Diagnostics**: Contextual error and warning detection
- **One-click Fixes**: Apply transformations with code actions
- **Multi-layer Processing**: 6 specialized analysis layers
- **Interactive Previews**: See changes before applying
- **Workspace Integration**: Analyze entire projects
- **Configurable**: Customize layers and behavior

## Installation

1. Install from VS Code Marketplace: Search for "NeuroLint"
2. Or install via command line:
   ```bash
   code --install-extension neurolint.neurolint-vscode
   ```

## Quick Start

1. **Configure NeuroLint**:
   - Open Command Palette (`Ctrl+Shift+P`)
   - Run "NeuroLint: Configure"
   - Set your API URL and authentication

2. **Analyze Current File**:
   - Right-click in editor → "NeuroLint: Analyze Current File"
   - Or use Command Palette: "NeuroLint: Analyze Current File"

3. **Fix Issues**:
   - Click on lightbulb icons for quick fixes
   - Or use "NeuroLint: Fix Current File"

## Commands

| Command | Description | Shortcut |
|---------|-------------|----------|
| `NeuroLint: Analyze Current File` | Analyze the active file | |
| `NeuroLint: Analyze Entire Workspace` | Analyze all files in workspace | |
| `NeuroLint: Fix Current File` | Apply fixes to active file | |
| `NeuroLint: Fix Entire Workspace` | Apply fixes to all files | |
| `NeuroLint: Configure` | Open configuration dialog | |
| `NeuroLint: Show Output Panel` | View detailed logs | |
| `NeuroLint: Login` | Authenticate with NeuroLint | |

## Configuration

Configure NeuroLint through VS Code settings:

```json
{
  "neurolint.apiUrl": "http://localhost:5000",
  "neurolint.apiKey": "your-api-key",
  "neurolint.enabledLayers": [1, 2, 3, 4],
  "neurolint.autoFix": false,
  "neurolint.showInlineHints": true,
  "neurolint.diagnosticsLevel": "warning",
  "neurolint.timeout": 30000
}
```

### Settings

- **`neurolint.apiUrl`**: NeuroLint server URL
- **`neurolint.apiKey`**: Authentication key
- **`neurolint.enabledLayers`**: Which layers to run (1-6)
- **`neurolint.autoFix`**: Automatically fix on save
- **`neurolint.showInlineHints`**: Show inline suggestions
- **`neurolint.diagnosticsLevel`**: Diagnostic severity level
- **`neurolint.timeout`**: Request timeout (ms)

## Layers

NeuroLint processes code through 6 specialized layers:

### Layer 1: Configuration Validation
- TypeScript configuration optimization
- Next.js config improvements
- Package.json script enhancements

### Layer 2: Pattern & Entity Fixes
- HTML entity cleanup
- Legacy pattern modernization
- Code structure improvements

### Layer 3: Component Best Practices
- Missing React keys
- Accessibility attributes
- Import optimization
- Prop type validation

### Layer 4: Hydration & SSR Guard
- Server-side rendering protection
- Hydration mismatch prevention
- Client-side guards

### Layer 5: Next.js Optimization
- App Router patterns
- 'use client' directives
- Import order optimization

### Layer 6: Quality & Performance
- Error handling improvements
- Performance optimizations
- Code quality enhancements

## Usage Examples

### Real-time Analysis
The extension automatically analyzes TypeScript and JavaScript files as you edit them, showing diagnostics in the Problems panel.

### Code Actions
1. Place cursor on a highlighted issue
2. Click the lightbulb icon or press `Ctrl+.`
3. Select "NeuroLint: Fix this issue"

### Workspace Analysis
1. Open Command Palette (`Ctrl+Shift+P`)
2. Run "NeuroLint: Analyze Entire Workspace"
3. View results in the NeuroLint output panel

### Configuration
1. Open VS Code settings (`Ctrl+,`)
2. Search for "neurolint"
3. Configure your preferences

## Supported Languages

- TypeScript (`.ts`, `.tsx`)
- JavaScript (`.js`, `.jsx`)
- React components
- Next.js applications

## Requirements

- VS Code 1.74.0 or higher
- NeuroLint server running (local or remote)
- Node.js 16+ (for local server)

## Troubleshooting

### Connection Issues
1. Verify NeuroLint server is running
2. Check `neurolint.apiUrl` setting
3. Verify network connectivity

### Authentication Issues
1. Set valid `neurolint.apiKey`
2. Use "NeuroLint: Login" command
3. Check API key permissions

### Performance Issues
1. Reduce `neurolint.enabledLayers`
2. Increase `neurolint.timeout`
3. Disable `neurolint.autoFix` for large projects

### View Logs
1. Open Command Palette
2. Run "NeuroLint: Show Output Panel"
3. Check for error messages

## Release Notes

### 1.0.0
- Initial release
- Real-time diagnostics
- Code actions integration
- Workspace analysis
- Configurable layers
- Authentication support

## Contributing

Report issues and contribute at: https://github.com/neurolint/neurolint-vscode

## License

MIT License - see LICENSE file for details.