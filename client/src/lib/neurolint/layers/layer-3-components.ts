
import { addMissingImports } from './layer-3-components/missing-imports';
import { fixMissingKeyProps } from './layer-3-components/missing-keys';
import { fixAccessibilityAttributes } from './layer-3-components/accessibility';
import { fixComponentPropTypes } from './layer-3-components/prop-types';

export async function transform(code: string): Promise<string> {
  let transformed = code;
  
  try {
    // Apply component-specific fixes in safe order with error recovery
    console.log("Layer 3 - Adding missing imports...");
    transformed = addMissingImports(transformed);
    
    console.log("Layer 3 - Fixing missing key props...");
    transformed = fixMissingKeyProps(transformed);
    
    console.log("Layer 3 - Fixing accessibility attributes...");
    transformed = fixAccessibilityAttributes(transformed);
    
    console.log("Layer 3 - Fixing component prop types...");
    transformed = fixComponentPropTypes(transformed);
    
    console.log("Layer 3 - Transformation completed successfully");
  } catch (error) {
    console.warn("Layer 3 - Error during transformation, returning original code:", error);
    return code;
  }
  
  return transformed;
}
