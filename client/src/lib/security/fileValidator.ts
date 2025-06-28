/**
 * File security validation and sanitization
 */

export interface FileValidationResult {
  isValid: boolean;
  errors: string[];
  sanitizedContent?: string;
  metadata: {
    size: number;
    type: string;
    encoding: string;
  };
}

export class FileValidator {
  private static readonly MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  private static readonly ALLOWED_EXTENSIONS = [
    ".js",
    ".jsx",
    ".ts",
    ".tsx",
    ".json",
  ];
  private static readonly DANGEROUS_PATTERNS = [
    /eval\s*\(\s*['"`]/gi, // Only eval with direct string literals
    /Function\s*\(\s*['"`]/gi, // Only Function constructor with string literals
    /<script[\s\S]*?>[\s\S]*?<\/script>/gi,
    /javascript\s*:/gi,
    /data\s*:\s*text\/html/gi,
    /vbscript\s*:/gi,
    /on\w+\s*=\s*['"`]/gi, // Only inline event handlers with strings
  ];

  private static readonly MALICIOUS_IMPORTS = [
    "child_process",
    "fs/promises",
    "vm",
    "cluster",
    "worker_threads",
  ];

  static validateFile(
    filename: string,
    content: string,
    size: number,
  ): FileValidationResult {
    const errors: string[] = [];

    // Size validation
    if (size > this.MAX_FILE_SIZE) {
      errors.push(
        `File size ${size} exceeds maximum allowed size ${this.MAX_FILE_SIZE}`,
      );
    }

    // Extension validation
    const extension = this.getFileExtension(filename);
    if (!this.ALLOWED_EXTENSIONS.includes(extension)) {
      errors.push(`File extension '${extension}' is not allowed`);
    }

    // Content validation
    const contentValidation = this.validateContent(content);
    errors.push(...contentValidation.errors);

    return {
      isValid: errors.length === 0,
      errors,
      sanitizedContent: contentValidation.sanitizedContent,
      metadata: {
        size,
        type: extension,
        encoding: "utf-8",
      },
    };
  }

  private static validateContent(content: string): {
    errors: string[];
    sanitizedContent: string;
  } {
    const errors: string[] = [];
    let sanitizedContent = content;

    // Check for dangerous patterns (only truly dangerous ones)
    for (const pattern of this.DANGEROUS_PATTERNS) {
      if (pattern.test(content)) {
        console.warn(
          `Potentially dangerous pattern detected: ${pattern.source}`,
        );
        // Don't treat as error for React/TS code, just warn
        // errors.push(`Potentially dangerous pattern detected: ${pattern.source}`);
      }
    }

    // Check for malicious imports (server-side only modules that shouldn't be in frontend)
    for (const maliciousImport of this.MALICIOUS_IMPORTS) {
      const importPattern = new RegExp(
        `import.*['"\`]${maliciousImport}['"\`]`,
        "gi",
      );
      const requirePattern = new RegExp(
        `require\\s*\\(\\s*['"\`]${maliciousImport}['"\`]\\s*\\)`,
        "gi",
      );

      if (importPattern.test(content) || requirePattern.test(content)) {
        errors.push(
          `Server-side module import detected (not allowed in frontend): ${maliciousImport}`,
        );
      }
    }

    // Sanitize content by removing dangerous patterns
    for (const pattern of this.DANGEROUS_PATTERNS) {
      sanitizedContent = sanitizedContent.replace(
        pattern,
        "/* REMOVED: Potentially dangerous code */",
      );
    }

    // Check file size after sanitization
    if (sanitizedContent.length > 1024 * 1024) {
      // 1MB max for content
      errors.push("File content too large after sanitization");
    }

    return { errors, sanitizedContent };
  }

  private static getFileExtension(filename: string): string {
    const lastDot = filename.lastIndexOf(".");
    return lastDot === -1 ? "" : filename.substring(lastDot).toLowerCase();
  }

  static validateProject(files: { path: string; content: string }[]): {
    isValid: boolean;
    errors: string[];
    validFiles: { path: string; content: string }[];
  } {
    const errors: string[] = [];
    const validFiles: { path: string; content: string }[] = [];

    // Check total project size
    const totalSize = files.reduce((sum, file) => sum + file.content.length, 0);
    if (totalSize > 50 * 1024 * 1024) {
      // 50MB max for entire project
      errors.push("Project size exceeds maximum allowed size (50MB)");
    }

    // Check number of files
    if (files.length > 1000) {
      errors.push("Project contains too many files (max 1000)");
    }

    // Validate each file
    for (const file of files) {
      const validation = this.validateFile(
        file.path,
        file.content,
        file.content.length,
      );
      if (validation.isValid) {
        validFiles.push({
          path: file.path,
          content: validation.sanitizedContent || file.content,
        });
      } else {
        errors.push(`File ${file.path}: ${validation.errors.join(", ")}`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      validFiles,
    };
  }
}
