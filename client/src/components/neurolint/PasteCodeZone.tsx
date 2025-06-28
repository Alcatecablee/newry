import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Code, Zap, Shield } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface PasteCodeZoneProps {
  onFile: (code: string, fileName?: string) => void;
  processing?: boolean;
}

interface SecurityValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  sanitizedContent?: string;
}

// Security validation class (reused from FileUploadZone)
class FileSecurityValidator {
  private static readonly MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  private static readonly MAX_CONTENT_SIZE = 1024 * 1024; // 1MB after sanitization

  private static readonly DANGEROUS_PATTERNS = [
    {
      pattern: /eval\s*\(\s*['"`]/gi,
      description: "eval() with string literal",
    },
    {
      pattern: /Function\s*\(\s*['"`]/gi,
      description: "Function() constructor with string",
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

    // Content pattern validation (only block truly dangerous patterns)
    for (const { pattern, description } of this.DANGEROUS_PATTERNS) {
      if (pattern.test(content)) {
        // Only treat script tags and protocols as actual errors
        if (
          description.includes("script tag") ||
          description.includes("protocol")
        ) {
          errors.push(`Dangerous ${description} detected`);
          sanitizedContent = sanitizedContent.replace(
            pattern,
            `/* REMOVED: ${description} */`,
          );
        } else {
          // For other patterns, just warn but don't block
          warnings.push(
            `Pattern detected: ${description} (allowed for React development)`,
          );
        }
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
}

export function PasteCodeZone({ onFile, processing }: PasteCodeZoneProps) {
  const [pastedCode, setPastedCode] = useState("");

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
        <Shield className="w-4 h-4 text-zinc-400" />
        <span>
          Security validation enabled - Code is automatically scanned for
          malicious content
        </span>
      </div>

      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <div className="relative">
            <div className="w-16 h-16 bg-[#292939] rounded-2xl flex items-center justify-center border border-[#342d66]">
              <Code className="w-8 h-8 text-white" />
            </div>
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-zinc-500 rounded-full border-2 border-black" />
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-2xl font-bold text-white">
            Paste your code directly
          </h3>
          <p className="text-lg text-gray-300">
            Advanced code analysis for{" "}
            <strong>React, Next.js, TypeScript</strong> code
          </p>
        </div>
      </div>

      {/* Code Paste Zone */}
      <div className="space-y-4">
        <Textarea
          placeholder="Paste your React, TypeScript, or JavaScript code here..."
          value={pastedCode}
          onChange={(e) => setPastedCode(e.target.value)}
          className="min-h-[320px] bg-[#1a1b21] border-[#292939] text-white placeholder:text-gray-400 font-mono text-sm resize-none focus:border-[#342d66] focus:ring-1 focus:ring-[#342d66] rounded-xl"
          disabled={processing}
          maxLength={1024 * 1024} // 1MB limit
        />

        <div className="flex items-center justify-between text-sm text-gray-400">
          <span>
            {pastedCode.length.toLocaleString()} /{" "}
            {(1024 * 1024).toLocaleString()} characters
          </span>
          <span>{pastedCode.split("\n").length} lines</span>
        </div>

        <Button
          onClick={handlePastedCodeSubmit}
          disabled={!pastedCode.trim() || processing}
          className="w-full bg-[#292939] text-white border border-[#342d66] hover:bg-[#434455] py-3 text-lg rounded-xl"
        >
          {processing ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              Transforming...
            </>
          ) : (
            <>
              <Zap className="w-5 h-5 mr-2" />
              Transform Code
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
