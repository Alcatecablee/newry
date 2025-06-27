import React, { useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  FileText,
  FilePlus,
  Copy as CopyIcon,
  ArrowDown,
  Download,
} from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { copyToClipboard } from "@/lib/neurolint/clipboard";

interface CodeDiffViewerProps {
  original: string;
  transformed: string;
  loading?: boolean;
}

export function CodeDiffViewer({
  original,
  transformed,
  loading,
}: CodeDiffViewerProps) {
  const originalRef = useRef<HTMLDivElement>(null);
  const transformedRef = useRef<HTMLDivElement>(null);

  if (!original && !loading)
    return (
      <div className="h-full min-h-[300px] flex flex-col items-center justify-center text-charcoal-lighter border border-charcoal-light rounded-lg bg-charcoal/50">
        <FileText className="mb-2 opacity-40 w-12 h-12" />
        <div className="text-center">
          <div className="text-lg font-medium text-white">No file selected</div>
          <span className="text-sm text-charcoal-lighter">
            Choose or drop a file to begin transforming!
          </span>
        </div>
      </div>
    );

  if (loading)
    return (
      <div className="h-full min-h-[300px] flex items-center justify-center animate-pulse text-charcoal-lighter border border-charcoal-light rounded-lg bg-charcoal/50">
        <FilePlus className="mr-2 animate-bounce w-6 h-6" />
        <span className="text-lg">Processing...</span>
      </div>
    );

  const handleCopyOriginal = async () => {
    await copyToClipboard(original);
    toast({
      title: "Original code copied!",
      description: "The original code is now in your clipboard.",
    });
  };

  const handleCopyTransformed = async () => {
    await copyToClipboard(transformed);
    toast({
      title: "Transformed code copied!",
      description: "The transformed code is now in your clipboard.",
    });
  };

  const handleDownloadOriginal = () => {
    const blob = new Blob([original], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "original-code.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({
      title: "Original code downloaded!",
      description: "The original code has been saved to your downloads.",
    });
  };

  const handleDownloadTransformed = () => {
    const blob = new Blob([transformed], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "transformed-code.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({
      title: "Fixed code downloaded!",
      description: "The transformed code has been saved to your downloads.",
    });
  };

  return (
    <div className="h-[85vh] bg-charcoal border border-charcoal-light rounded-lg overflow-hidden transition-all font-mono backdrop-blur-xl flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-charcoal-light bg-charcoal-light rounded-t-lg backdrop-blur font-sans flex-shrink-0">
        <div className="flex gap-2 items-center">
          <FileText className="w-4 h-4 text-white" />
          <span className="text-sm font-semibold text-white">
            Code Comparison
          </span>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* Transformed Code Panel (Top Half) */}
        <div className="flex-1 border-b border-charcoal-light flex flex-col min-h-0">
          <div className="flex items-center justify-between px-4 py-2 bg-charcoal-light border-b border-charcoal-lighter flex-shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-white rounded-full"></div>
              <span className="text-sm font-medium text-white">
                Transformed
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="icon"
                variant="ghost"
                className="hover:bg-charcoal hover:text-white h-6 w-6"
                aria-label="Copy transformed code"
                onClick={handleCopyTransformed}
              >
                <CopyIcon className="w-3 h-3" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="hover:bg-charcoal hover:text-white h-6 w-6"
                aria-label="Download transformed code"
                onClick={handleDownloadTransformed}
              >
                <Download className="w-3 h-3" />
              </Button>
            </div>
          </div>
          <div className="flex-1 p-4 overflow-auto bg-charcoal-darker min-h-0">
            <pre className="text-sm text-white whitespace-pre-wrap">
              <code>{highlighted(transformed)}</code>
            </pre>
          </div>
        </div>

        {/* Transformation Arrow */}
        <div className="flex justify-center py-2 bg-charcoal-light flex-shrink-0">
          <div className="bg-white rounded-full p-2 shadow-lg backdrop-blur">
            <ArrowDown className="w-4 h-4 text-charcoal-dark" />
          </div>
        </div>

        {/* Original Code Panel (Bottom Half) */}
        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex items-center justify-between px-4 py-2 bg-charcoal-light border-b border-charcoal-lighter flex-shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-charcoal-lighter rounded-full"></div>
              <span className="text-sm font-medium text-charcoal-lighter">
                Original
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="icon"
                variant="ghost"
                className="hover:bg-charcoal hover:text-white h-6 w-6"
                aria-label="Copy original code"
                onClick={handleCopyOriginal}
              >
                <CopyIcon className="w-3 h-3" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="hover:bg-charcoal hover:text-white h-6 w-6"
                aria-label="Download original code"
                onClick={handleDownloadOriginal}
              >
                <Download className="w-3 h-3" />
              </Button>
            </div>
          </div>
          <div className="flex-1 p-4 overflow-auto bg-charcoal-darker min-h-0">
            <pre className="text-sm text-charcoal-lighter whitespace-pre-wrap">
              <code>{highlighted(original)}</code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}

// Simple syntax highlighter for charcoal theme
function highlighted(str: string | undefined) {
  if (typeof str !== "string") {
    return <span />;
  }
  // Keywords, strings, and numbers with charcoal-friendly colors
  const keywords = [
    "const",
    "let",
    "var",
    "export",
    "import",
    "function",
    "async",
    "await",
    "return",
    "if",
    "else",
    "for",
    "while",
    "switch",
    "case",
    "default",
    "new",
    "class",
    "extends",
    "super",
    "try",
    "catch",
    "typeof",
    "in",
    "instanceof",
    "this",
  ];
  let html = str
    .replace(
      /(".*?"|'.*?'|`.*?`)/g,
      (m) => `<span style="color:#e5e5e5;">${m}</span>`,
    )
    .replace(/\b\d+(\.\d+)?\b/g, '<span style="color:#a5a5a5;">$&</span>')
    .replace(
      new RegExp("\\b(" + keywords.join("|") + ")\\b", "g"),
      '<span style="color:#ffffff;">$1</span>',
    );
  return <span dangerouslySetInnerHTML={{ __html: html }} />;
}
