import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Upload,
  FileCode,
  Zap,
  Code,
  Shield,
  AlertTriangle,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface FileUploadZoneProps {
  onFile: (code: string, fileName?: string) => void;
  processing?: boolean;
}

interface SecurityValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  sanitizedContent?: string;
}

// Security validation class
class FileSecurityValidator {
  private static readonly MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  private static readonly MAX_CONTENT_SIZE = 1024 * 1024; // 1MB after sanitization
  private static readonly ALLOWED_EXTENSIONS = [
    ".js",
    ".jsx",
    ".ts",
    ".tsx",
    ".json",
  ];

  private static readonly DANGEROUS_PATTERNS = [
    { pattern: /eval\s*\(/gi, description: "eval() function call" },
    { pattern: /Function\s*\(/gi, description: "Function() constructor" },
    {
      pattern: /setTimeout\s*\(\s*['"`][^'"`]*['"`]/gi,
      description: "setTimeout with string",
    },
    {
      pattern: /setInterval\s*\(\s*['"`][^'"`]*['"`]/gi,
      description: "setInterval with string",
    },
    {
      pattern: /<script[\s\S]*?>[\s\S]*?<\/script>/gi,
      description: "script tag",
    },
    { pattern: /javascript\s*:/gi, description: "javascript: protocol" },
    {
      pattern: /data\s*:\s*text\/html/gi,
      description: "data:text/html protocol",
    },
    { pattern: /vbscript\s*:/gi, description: "vbscript: protocol" },
    { pattern: /on\w+\s*=/gi, description: "event handler attributes" },
  ];

  private static readonly SUSPICIOUS_IMPORTS = [
    "child_process",
    "fs", 
    "path",
    "os",
    "crypto",
    "http",
    "https",
    "net",
    "cluster",
    "worker_threads",
  ];

  static validate(
    filename: string,
    content: string,
    size: number,
  ): SecurityValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    let sanitizedContent = content;

    // Size validation
    if (size > this.MAX_FILE_SIZE) {
      errors.push(
        `File size (${Math.round(size / 1024 / 1024)}MB) exceeds limit (10MB)`,
      );
    }

    // Extension validation
    const extension = this.getFileExtension(filename);
    if (!this.ALLOWED_EXTENSIONS.includes(extension)) {
      errors.push(
        `File type '${extension}' not allowed. Use .js, .jsx, .ts, .tsx, or .json`,
      );
    }

    // Content pattern validation
    for (const { pattern, description } of this.DANGEROUS_PATTERNS) {
      if (pattern.test(content)) {
        errors.push(`Potentially dangerous ${description} detected`);
        sanitizedContent = sanitizedContent.replace(
          pattern,
          `/* REMOVED: ${description} */`,
        );
      }
    }

    // Import validation
    for (const suspiciousImport of this.SUSPICIOUS_IMPORTS) {
      const importPattern = new RegExp(
        `import.*['"\`]${suspiciousImport}['"\`]`,
        "gi",
      );
      const requirePattern = new RegExp(
        `require\\s*\\(\\s*['"\`]${suspiciousImport}['"\`]\\s*\\)`,
        "gi",
      );

      if (importPattern.test(content) || requirePattern.test(content)) {
        warnings.push(
          `Potentially sensitive import detected: ${suspiciousImport}`,
        );
      }
    }

    // Final size check
    if (sanitizedContent.length > this.MAX_CONTENT_SIZE) {
      errors.push("Content too large after sanitization (max 1MB)");
    }

    // Check for empty content
    if (sanitizedContent.trim().length === 0) {
      errors.push(
        "File appears to be empty or entirely removed by security filters",
      );
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      sanitizedContent: errors.length === 0 ? sanitizedContent : undefined,
    };
  }

  private static getFileExtension(filename: string): string {
    const lastDot = filename.lastIndexOf(".");
    return lastDot === -1 ? "" : filename.substring(lastDot).toLowerCase();
  }
}

export function FileUploadZone({ onFile, processing }: FileUploadZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [pastedCode, setPastedCode] = useState("");

  function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    const file = files[0];

    // Pre-validation
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: `File size (${Math.round(file.size / 1024 / 1024)}MB) exceeds 10MB limit`,
        variant: "destructive",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      if (typeof ev.target?.result === "string") {
        const content = ev.target.result;

        // Security validation
        const validation = FileSecurityValidator.validate(
          file.name,
          content,
          file.size,
        );

        if (!validation.isValid) {
          toast({
            title: "Security validation failed",
            description: validation.errors[0],
            variant: "destructive",
          });
          return;
        }

        // Show warnings if any
        if (validation.warnings.length > 0) {
          toast({
            title: "Security warnings",
            description: `${validation.warnings.length} potential issues detected. Proceeding with caution.`,
            variant: "default",
          });
        }

        onFile(validation.sanitizedContent || content, file.name);
        setPastedCode(""); // Clear textarea when file is uploaded

        toast({
          title: "File uploaded successfully",
          description: `${file.name} validated and ready for transformation`,
        });
      }
    };

    reader.onerror = () => {
      toast({
        title: "File read error",
        description: "Failed to read the uploaded file",
        variant: "destructive",
      });
    };

    reader.readAsText(file);
  }

  const handlePastedCodeSubmit = () => {
    if (!pastedCode.trim()) return;

    // Security validation for pasted content
    const validation = FileSecurityValidator.validate(
      "pasted-code.tsx",
      pastedCode,
      pastedCode.length,
    );

    if (!validation.isValid) {
      toast({
        title: "Security validation failed",
        description: validation.errors[0],
        variant: "destructive",
      });
      return;
    }

    // Show warnings if any
    if (validation.warnings.length > 0) {
      toast({
        title: "Security warnings",
        description: `${validation.warnings.length} potential issues detected. Code sanitized.`,
        variant: "default",
      });
    }

    onFile(validation.sanitizedContent || pastedCode, "pasted-code.tsx");
    setPastedCode("");

    toast({
      title: "Code processed successfully",
      description: "Pasted code validated and ready for transformation",
    });
  };

  return (
    <div className="space-y-6">
      {/* Security Status Indicator */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Shield className="w-4 h-4 text-green-500" />
        <span>
          Security validation enabled - Files are automatically scanned for
          malicious content
        </span>
      </div>

      {/* File Upload Zone */}
      <div
        className={`border-2 border-dashed border-zinc-800er rounded-lg bg-charcoal/30 py-8 flex flex-col items-center justify-center text-center shadow hover:border-white/50 transition-all cursor-pointer ${
          processing ? "opacity-50 pointer-events-none animate-pulse" : ""
        }`}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
        }}
        onDrop={(e) => {
          e.preventDefault();
          handleFiles(e.dataTransfer.files);
        }}
        tabIndex={0}
        role="button"
        aria-label="Upload code file for transformation"
      >
        <input
          type="file"
          ref={inputRef}
          className="hidden"
          accept=".js,.jsx,.ts,.tsx,.json"
          onChange={(e) => handleFiles(e.target.files)}
          disabled={processing}
          aria-label="Upload JS, JSX, TS, TSX, or JSON file"
        />

        <div className="flex items-center gap-3 mb-3">
          {processing ? (
            <Zap className="w-6 h-6 text-white animate-pulse" />
          ) : (
            <FileCode className="w-6 h-6 text-white" />
          )}
          <div className="text-xl font-semibold mb-0 select-none text-white">
            {processing
              ? "Transforming with AI..."
              : "Drop your code file here"}
          </div>
        </div>

        <div className="text-sm text-muted-foreground mb-3 select-none max-w-md">
          {processing ? (
            <div className="flex items-center gap-2 justify-center">
              <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
              <div
                className="w-2 h-2 bg-white/80 rounded-full animate-bounce"
                style={{ animationDelay: "0.1s" }}
              ></div>
              <div
                className="w-2 h-2 bg-white/60 rounded-full animate-bounce"
                style={{ animationDelay: "0.2s" }}
              ></div>
              <span className="ml-2">
                Running 6-layer transformation pipeline
              </span>
            </div>
          ) : (
            <>
              Advanced AI analysis for{" "}
              <strong>React, Next.js, TypeScript</strong> files
              <br />
              <span className="text-xs">
                (.js, .jsx, .ts, .tsx, .json supported • Max 10MB)
              </span>
            </>
          )}
        </div>

        {!processing && (
          <Button
            onClick={() => inputRef.current?.click()}
            disabled={processing}
            variant="outline"
            className="border-zinc-800er text-white hover:bg-white/10 hover:text-white"
          >
            <Upload className="w-4 h-4 mr-2" />
            Select File
          </Button>
        )}
      </div>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-zinc-800er" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-[#22242B] px-2 text-muted-foreground">Or</span>
        </div>
      </div>

      {/* Code Paste Zone */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-white">
          <Code className="w-5 h-5 text-white" />
          <span className="font-semibold">Paste your code directly</span>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Shield className="w-3 h-3" />
            <span>Auto-validated</span>
          </div>
        </div>

        <Textarea
          placeholder="Paste your React, TypeScript, or JavaScript code here..."
          value={pastedCode}
          onChange={(e) => setPastedCode(e.target.value)}
          className="min-h-[120px] bg-charcoal/90 border-zinc-800er text-white placeholder:text-muted-foreground font-mono text-sm resize-none focus:border-white/50"
          disabled={processing}
          maxLength={1024 * 1024} // 1MB limit
        />

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>
            {pastedCode.length.toLocaleString()} /{" "}
            {(1024 * 1024).toLocaleString()} characters
          </span>
          <span>{pastedCode.split("\n").length} lines</span>
        </div>

        <Button
          onClick={handlePastedCodeSubmit}
          disabled={!pastedCode.trim() || processing}
          className="w-full bg-white text-charcoal-dark hover:bg-white/90"
        >
          <Zap className="w-4 h-4 mr-2" />
          Transform Code
        </Button>
      </div>
    </div>
  );
}
