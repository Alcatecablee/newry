
export class ASTOrchestrator {
  async process(code: string, filePath?: string, enabledLayers: number[] = []): Promise<string> {
    // For now, return the code as-is since AST processing is complex
    // This prevents the orchestrator from crashing
    return code;
  }
}
