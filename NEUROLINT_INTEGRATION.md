# NeuroLint Integration Documentation

## Overview
This document details the integration of the NeuroLint engine from the Indie project into our main application. The NeuroLint engine is a sophisticated code transformation system that uses a 4-layer approach to analyze and improve code.

## Core Components

### 1. Engine Components
Located in `src/lib/neurolint/`:
- `orchestrator.ts` - Main transformation orchestrator
- `types.ts` - TypeScript interfaces and types
- `clipboard.ts` - Clipboard utilities
- `ast/` - AST transformation utilities
- `layers/` - Individual transformation layers
- `validation/` - Code validation utilities

### 2. UI Components
Located in `src/components/neurolint/`:
- `CodeDiffViewer.tsx` - Displays code differences
- `FileUploadZone.tsx` - Handles file uploads
- `LayerSelector.tsx` - Layer selection interface
- `TransformationInsights.tsx` - Shows transformation results
- `HowToDropDown.tsx` - Usage instructions
- `TestRunner.tsx` - Testing utilities

### 3. Layer System
The transformation process consists of 4 layers:
1. Configuration Validation
   - Optimizes TypeScript and Next.js configurations
   - Updates package.json with modern settings

2. Pattern & Entity Fixes
   - Cleans up HTML entities
   - Modernizes JS/TS patterns
   - Handles code structure improvements

3. Component Best Practices
   - Fixes missing key props
   - Improves accessibility
   - Handles prop types
   - Manages imports

4. Hydration & SSR Guard
   - Fixes hydration bugs
   - Adds SSR protection
   - Handles localStorage guards

## Dependencies
Required UI components from shadcn/ui:
- Button
- Toast
- Toggle
- Badge
- Textarea

## Integration Steps

### 1. File Structure
```
src/
├── lib/
│   └── neurolint/
│       ├── orchestrator.ts
│       ├── types.ts
│       ├── clipboard.ts
│       ├── ast/
│       ├── layers/
│       └── validation/
└── components/
    └── neurolint/
        ├── CodeDiffViewer.tsx
        ├── FileUploadZone.tsx
        ├── LayerSelector.tsx
        └── TransformationInsights.tsx
```

### 2. Component Usage
```typescript
// Example usage in a page
import { NeuroLintOrchestrator } from '@/lib/neurolint/orchestrator';

const result = await NeuroLintOrchestrator(
  code,           // Source code
  fileName,       // Optional filename
  true,          // Use AST
  enabledLayers  // Array of layer IDs [1,2,3,4]
);
```

### 3. Layer Results
The orchestrator returns:
```typescript
{
  transformed: string;        // Transformed code
  layers: NeuroLintLayerResult[]; // Results per layer
  layerOutputs: string[];    // Code state after each layer
}
```

## Error Handling
- Each layer has built-in validation
- Failed transformations are reverted
- AST transformations fallback to regex when needed
- Layer results include detailed error information

## Best Practices
1. Always validate transformed code before applying changes
2. Use AST transformations when possible
3. Enable layers sequentially (1→2→3→4)
4. Handle large files in chunks
5. Validate dependencies before transformation

## Migration from Indie
1. Copy core engine files from Indie
2. Set up UI components and dependencies
3. Integrate with existing dark theme
4. Connect to database for result storage
5. Add error handling and logging

## Future Improvements
1. Add more language support
2. Enhance AST transformations
3. Add custom rule definitions
4. Improve performance for large files
5. Add real-time transformation preview

## Original Indie Reference
The original Indie implementation served as the foundation for this integration. Key differences in our implementation:
- Custom dark theme
- Modified UI components
- Enhanced error handling
- Additional validation layers
- Custom database integration

## Troubleshooting
Common issues and solutions:
1. Missing UI components
   - Ensure all shadcn/ui components are installed
   - Check component paths in imports

2. AST Transformation Failures
   - Check file size limits
   - Validate syntax before transformation
   - Use fallback transformations

3. Layer Execution Issues
   - Verify layer order
   - Check layer dependencies
   - Validate input code format

4. Integration Problems
   - Verify file paths
   - Check component interfaces
   - Validate state management

## Maintenance
Regular maintenance tasks:
1. Update dependencies
2. Test layer transformations
3. Validate AST parsing
4. Check performance metrics
5. Update documentation 