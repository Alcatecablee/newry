import { useState } from "react";
import { toast } from "@/hooks/use-toast";

interface RepoFile {
  path: string;
  content: string;
}

interface GitHubContent {
  name: string;
  path: string;
  type: "file" | "dir";
  download_url: string | null;
  url: string;
}

// Rate limiting utility
class GitHubRateLimit {
  private static requestCount = 0;
  private static resetTime = Date.now() + 60 * 60 * 1000; // 1 hour from now
  private static readonly MAX_REQUESTS = 55; // Leave buffer for other requests

  static async checkRateLimit(): Promise<void> {
    const now = Date.now();

    // Reset counter if hour has passed
    if (now > this.resetTime) {
      this.requestCount = 0;
      this.resetTime = now + 60 * 60 * 1000;
    }

    // Check if we're approaching limit
    if (this.requestCount >= this.MAX_REQUESTS) {
      const waitTime = Math.ceil((this.resetTime - now) / 60000);
      throw new Error(
        `Rate limit exceeded. Please wait ${waitTime} minutes before trying again.`,
      );
    }

    this.requestCount++;
  }

  static async delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// Request cache to avoid duplicate API calls
const requestCache = new Map<string, any>();

// Demo repository data for when rate limits are hit
const DEMO_REPO_FILES = [
  {
    path: "src/components/Button.tsx",
    content: `import React from 'react';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary';
}

export const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  disabled = false,
  variant = 'primary'
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={\`btn btn-\${variant}\`}
    >
      {children}
    </button>
  );
};`,
  },
  {
    path: "src/components/Modal.tsx",
    content: `import React, { useState } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{title}</h2>
          <button onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          {children}
        </div>
      </div>
    </div>
  );
}`,
  },
  {
    path: "src/hooks/useAuth.ts",
    content: `import { useState, useEffect } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      // Simulate API call
      setTimeout(() => {
        setUser({
          id: '1',
          email: 'user@example.com',
          name: 'Demo User'
        });
        setLoading(false);
      }, 1000);
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    // Simulate login
    setTimeout(() => {
      const user = { id: '1', email, name: 'Demo User' };
      setUser(user);
      localStorage.setItem('auth_token', 'demo_token');
      setLoading(false);
    }, 1000);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('auth_token');
  };

  return { user, loading, login, logout };
}`,
  },
  {
    path: "src/utils/api.ts",
    content: `const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

export class ApiClient {
  private baseURL: string;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  async get(endpoint: string) {
    const response = await fetch(\`\${this.baseURL}\${endpoint}\`);
    if (!response.ok) {
      throw new Error(\`HTTP error! status: \${response.status}\`);
    }
    return response.json();
  }

  async post(endpoint: string, data: any) {
    const response = await fetch(\`\${this.baseURL}\${endpoint}\`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error(\`HTTP error! status: \${response.status}\`);
    }
    return response.json();
  }
}

export const apiClient = new ApiClient();`,
  },
  {
    path: "package.json",
    content: `{
  "name": "demo-react-app",
  "version": "1.0.0",
  "private": true,
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "typescript": "^4.9.0"
  },
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject"
  }
}`,
  },
];

export function useGitHubUpload() {
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<UploadStatus | null>(null);
  const [demoMode, setDemoMode] = useState(false);

  const isValidGitHubUrl = (url: string) => {
    const githubRegex = /^https:\/\/github\.com\/[\w\-\.]+\/[\w\-\.]+\/?$/;
    return githubRegex.test(url.replace(/\.git$/, ""));
  };

  const suggestCorrections = (owner: string, repo: string) => {
    const suggestions = [];

    // Common username variations
    if (owner.toLowerCase().includes("alcatecable")) {
      suggestions.push(`• Try "alcatecable" instead of "${owner}"`);
    }

    // Common repository name patterns
    if (repo.includes("-")) {
      suggestions.push(`• Try "${repo.replace(/-/g, "_")}" (with underscores)`);
      suggestions.push(`• Try "${repo.replace(/-/g, "")}" (no separators)`);
    }

    if (repo.includes("_")) {
      suggestions.push(`• Try "${repo.replace(/_/g, "-")}" (with hyphens)`);
    }

    return suggestions.length > 0
      ? suggestions
      : [`• Double-check the repository name on GitHub`];
  };

  const extractRepoInfo = (url: string) => {
    const match = url.match(/github\.com\/([^\/]+)\/([^\/]+)/);
    if (!match) return null;
    return {
      owner: match[1],
      repo: match[2].replace(/\.git$/, ""),
    };
  };

  const validateRepository = async (
    owner: string,
    repo: string,
  ): Promise<boolean> => {
    try {
      // Check rate limit before making request
      await GitHubRateLimit.checkRateLimit();

      console.log(`Validating repository: ${owner}/${repo}`);

      const response = await fetch(
        `https://api.github.com/repos/${owner}/${repo}`,
        {
          headers: {
            Accept: "application/vnd.github.v3+json",
            "User-Agent": "NeuroLint-App/1.0",
          },
        },
      );

      // Check rate limit headers
      const remainingRequests = response.headers.get("x-ratelimit-remaining");
      console.log(
        `GitHub API requests remaining: ${remainingRequests || "unknown"}`,
      );

      if (response.ok) {
        const repoData = await response.json();
        if (repoData.private) {
          throw new Error(
            `Repository "${owner}/${repo}" is private. Please make it public or use a public repository.`,
          );
        }
        console.log(`✓ Repository validated: ${owner}/${repo}`);
        return true;
      }

      if (response.status === 404) {
        const suggestions = suggestCorrections(owner, repo);
        throw new Error(`Repository "${owner}/${repo}" not found. Please check:
• Repository name spelling is correct
• Repository exists on GitHub
• You have the correct owner/username
• Try visiting: https://github.com/${owner}/${repo}

Suggestions:
${suggestions.join("\n")}`);
      }

      if (response.status === 403) {
        const rateLimitReset = response.headers.get("x-ratelimit-reset");
        const resetTime = rateLimitReset
          ? new Date(parseInt(rateLimitReset) * 1000)
          : null;
        const waitTime = resetTime
          ? Math.ceil((resetTime.getTime() - Date.now()) / 60000)
          : 60;

        throw new Error(
          `GitHub API rate limit exceeded. Please wait ${waitTime} minutes before trying again, or use the demo mode below.`,
        );
      }

      throw new Error(
        `GitHub API error ${response.status}: Unable to access repository`,
      );
    } catch (error) {
      console.error("Error validating repository:", error);
      throw error;
    }
  };

  const fetchRepoContents = async (
    owner: string,
    repo: string,
    path = "",
    retryCount = 0,
  ): Promise<RepoFile[]> => {
    const cacheKey = `${owner}/${repo}/${path}`;

    // Check cache first
    if (requestCache.has(cacheKey)) {
      console.log(`Cache hit for ${cacheKey}`);
      return requestCache.get(cacheKey);
    }

    try {
      // Check rate limit before making request
      await GitHubRateLimit.checkRateLimit();

      // Add delay between requests to be respectful
      if (retryCount > 0) {
        await GitHubRateLimit.delay(1000 * retryCount); // Exponential backoff
      }

      console.log(
        `Fetching GitHub API: ${cacheKey} (attempt ${retryCount + 1})`,
      );

      const response = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/contents/${path}`,
        {
          headers: {
            Accept: "application/vnd.github.v3+json",
            "User-Agent": "NeuroLint-App/1.0",
          },
        },
      );

      // Check rate limit headers
      const remainingRequests = response.headers.get("x-ratelimit-remaining");
      const resetTime = response.headers.get("x-ratelimit-reset");

      if (remainingRequests) {
        console.log(`GitHub API requests remaining: ${remainingRequests}`);
        if (parseInt(remainingRequests) < 5) {
          console.warn("Approaching GitHub API rate limit!");
        }
      }

      if (!response.ok) {
        if (response.status === 404) {
          if (path === "") {
            throw new Error(
              `Repository "${owner}/${repo}" not found or is private.`,
            );
          } else {
            throw new Error(
              `Path "${path}" not found in repository "${owner}/${repo}".`,
            );
          }
        }

        if (response.status === 403) {
          const rateLimitReset = resetTime
            ? new Date(parseInt(resetTime) * 1000)
            : null;
          const waitTime = rateLimitReset
            ? Math.ceil((rateLimitReset.getTime() - Date.now()) / 60000)
            : 60;
          throw new Error(
            `GitHub API rate limit exceeded. Please wait ${waitTime} minutes and try again.`,
          );
        }

        if (response.status === 500 && retryCount < 2) {
          console.warn(`Server error, retrying... (attempt ${retryCount + 1})`);
          await GitHubRateLimit.delay(2000);
          return fetchRepoContents(owner, repo, path, retryCount + 1);
        }

        throw new Error(
          `GitHub API error ${response.status}: Unable to fetch repository contents`,
        );
      }

      const data = await response.json();

      // Cache the result for 5 minutes
      requestCache.set(cacheKey, data);
      setTimeout(() => requestCache.delete(cacheKey), 5 * 60 * 1000);

      return data;
    } catch (error) {
      console.error("Error fetching repo contents:", error);
      throw error;
    }
  };

  const downloadFile = async (downloadUrl: string): Promise<string> => {
    const response = await fetch(downloadUrl);
    if (!response.ok) {
      throw new Error(`Failed to download file: ${response.status}`);
    }
    return await response.text();
  };

  const getAllFiles = async (
    owner: string,
    repo: string,
    path = "",
    maxFiles = 50, // Reduced limit to avoid rate limits
  ): Promise<{ path: string; content: string }[]> => {
    const contents = await fetchRepoContents(owner, repo, path);
    const files: { path: string; content: string }[] = [];

    // More comprehensive file filtering
    const supportedExtensions = [".js", ".jsx", ".ts", ".tsx", ".json", ".md"];
    const excludePatterns = [
      "node_modules",
      ".git",
      "dist",
      "build",
      ".next",
      "coverage",
      "__pycache__",
      ".vscode",
      ".idea",
    ];

    // Filter contents first to reduce API calls
    const filteredContents = contents.filter((item) => {
      if (excludePatterns.some((pattern) => item.path.includes(pattern))) {
        return false;
      }

      if (item.type === "file") {
        const hasValidExtension = supportedExtensions.some((ext) =>
          item.name.endsWith(ext),
        );
        const isImportantFile = [
          "package.json",
          "tsconfig.json",
          "README.md",
        ].includes(item.name);
        return hasValidExtension || isImportantFile;
      }

      return true; // Include directories
    });

    console.log(
      `Processing ${filteredContents.length} filtered items in ${path || "root"}`,
    );

    // Process items with better rate limiting
    for (
      let i = 0;
      i < filteredContents.length && files.length < maxFiles;
      i++
    ) {
      const item = filteredContents[i];

      // Add delay between items to respect rate limits
      if (i > 0) {
        await GitHubRateLimit.delay(200);
      }

      if (item.type === "file") {
        if (item.download_url) {
          try {
            const content = await downloadFile(item.download_url);

            // Skip extremely large files
            if (content.length > 300 * 1024) {
              // 300KB limit
              console.warn(
                `Skipping large file: ${item.path} (${Math.round(content.length / 1024)}KB)`,
              );
              continue;
            }

            files.push({
              path: item.path,
              content,
            });

            setUploadStatus((prev) =>
              prev
                ? {
                    ...prev,
                    processed: files.length,
                    files: [...prev.files, item.path],
                  }
                : null,
            );

            console.log(`✓ Downloaded: ${item.path}`);
          } catch (error) {
            console.warn(`Failed to download ${item.path}:`, error);
          }
        }
      } else if (item.type === "dir" && files.length < maxFiles) {
        try {
          const remainingQuota = maxFiles - files.length;
          const subFiles = await getAllFiles(
            owner,
            repo,
            item.path,
            remainingQuota,
          );
          files.push(...subFiles);
        } catch (error) {
          console.warn(`Failed to process directory ${item.path}:`, error);
          // Continue with other items instead of failing completely
        }
      }
    }

    return files.slice(0, maxFiles);
  };

  const uploadRepository = async (
    repoUrl: string,
    onRepoUpload: (files: { path: string; content: string }[]) => void,
  ) => {
    if (!repoUrl.trim()) {
      toast({
        title: "Error",
        description: "Please enter a GitHub repository URL",
        variant: "destructive",
      });
      return;
    }

    // Validate GitHub URL
    if (!isValidGitHubUrl(repoUrl)) {
      toast({
        title: "Invalid GitHub URL",
        description: "Please enter a valid GitHub repository URL",
        variant: "destructive",
      });
      return;
    }

    const repoInfo = extractRepoInfo(repoUrl);
    if (!repoInfo) {
      toast({
        title: "Error",
        description: "Could not extract repository information from URL",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    setUploadStatus({ total: 0, processed: 0, files: [] });

    try {
      // Show initial progress
      toast({
        title: "Starting Repository Import",
        description: `Fetching files from ${repoInfo.owner}/${repoInfo.repo}...`,
      });

      // First validate the repository exists and is accessible
      try {
        await validateRepository(repoInfo.owner, repoInfo.repo);
      } catch (validationError) {
        // If validation fails due to rate limit, immediately switch to demo mode
        if (
          validationError instanceof Error &&
          validationError.message.toLowerCase().includes("rate limit")
        ) {
          console.log(
            "Rate limit detected during validation, switching to demo mode",
          );

          toast({
            title: "Rate Limit Detected",
            description: "Switching to demo repository automatically...",
          });

          await loadDemoRepository(onRepoUpload);
          return; // Exit early with demo mode
        } else {
          throw validationError; // Re-throw non-rate-limit errors
        }
      }

      const initialContents = await fetchRepoContents(
        repoInfo.owner,
        repoInfo.repo,
      );

      const estimatedFiles = initialContents.filter(
        (item) =>
          item.type === "file" &&
          [".js", ".jsx", ".ts", ".tsx", ".json", ".md"].some((ext) =>
            item.name.endsWith(ext),
          ),
      ).length;

      console.log(
        `Found ${initialContents.length} items, estimated ${estimatedFiles} relevant files`,
      );

      setUploadStatus((prev) =>
        prev
          ? { ...prev, total: Math.min(Math.max(estimatedFiles, 10), 50) }
          : null,
      );

      // Show progress update
      toast({
        title: "Repository Analysis",
        description: `Found ${estimatedFiles} relevant files. Starting download...`,
      });

      const files = await getAllFiles(repoInfo.owner, repoInfo.repo);

      if (files.length === 0) {
        toast({
          title: "No Supported Files Found",
          description:
            "Repository contains no .js, .jsx, .ts, .tsx, or .json files to analyze. NeuroLint only processes JavaScript/TypeScript files.",
          variant: "destructive",
        });
        return;
      }

      setUploadStatus({
        total: files.length,
        processed: files.length,
        files: files.map((f) => f.path),
      });

      toast({
        title: "Repository Imported Successfully",
        description: `Analyzed ${files.length} files from ${repoInfo.owner}/${repoInfo.repo}. Ready for transformation.`,
      });

      if (typeof onRepoUpload === "function") {
        onRepoUpload(files);
      }
    } catch (error) {
      console.error("Upload error:", error);
      let errorMessage = "Failed to upload repository";
      let isRateLimit = false;

      if (error instanceof Error) {
        errorMessage = error.message;
        // More comprehensive rate limit detection
        isRateLimit =
          errorMessage.toLowerCase().includes("rate limit") ||
          errorMessage.includes("403") ||
          errorMessage.includes("API rate limit exceeded") ||
          (errorMessage.includes("wait") && errorMessage.includes("minutes"));
        console.log("Rate limit check:", { errorMessage, isRateLimit });
      } else if (typeof error === "object" && error !== null) {
        errorMessage =
          "Network error or repository access issue. Please check your connection and try again.";
      }
      // If it's a rate limit error, offer demo mode
      if (isRateLimit) {
        toast({
          title: "Rate Limit Reached",
          description:
            "GitHub API limit exceeded. Using demo repository instead...",
        });

        // Use demo mode
        setDemoMode(true);
        setUploadStatus({
          total: DEMO_REPO_FILES.length,
          processed: 0,
          files: [],
        });

        // Simulate upload progress for demo
        for (let i = 0; i < DEMO_REPO_FILES.length; i++) {
          await new Promise((resolve) => setTimeout(resolve, 300)); // Simulate delay
          setUploadStatus((prev) =>
            prev
              ? {
                  ...prev,
                  processed: i + 1,
                  files: [...prev.files, DEMO_REPO_FILES[i].path],
                }
              : null,
          );
        }

        toast({
          title: "Demo Repository Loaded",
          description: `Loaded ${DEMO_REPO_FILES.length} demo files. You can now test the analysis features!`,
        });

        if (typeof onRepoUpload === "function") {
          onRepoUpload(DEMO_REPO_FILES);
        }
      } else {
        toast({
          title: "Upload Failed",
          description: errorMessage,
          variant: "destructive",
        });
      }
    } finally {
      setUploading(false);
      setUploadStatus(null);
    }
  };

  const loadDemoRepository = async (
    onRepoUpload: (files: { path: string; content: string }[]) => void,
  ) => {
    setUploading(true);
    setDemoMode(true);
    setUploadStatus({
      total: DEMO_REPO_FILES.length,
      processed: 0,
      files: [],
    });

    toast({
      title: "Loading Demo Repository",
      description: "Simulating repository import with demo files...",
    });

    // Simulate upload progress
    for (let i = 0; i < DEMO_REPO_FILES.length; i++) {
      await new Promise((resolve) => setTimeout(resolve, 400));
      setUploadStatus((prev) =>
        prev
          ? {
              ...prev,
              processed: i + 1,
              files: [...prev.files, DEMO_REPO_FILES[i].path],
            }
          : null,
      );
    }

    toast({
      title: "Demo Repository Ready",
      description: `Loaded ${DEMO_REPO_FILES.length} demo files. Try the analysis features!`,
    });

    if (typeof onRepoUpload === "function") {
      onRepoUpload(DEMO_REPO_FILES);
    }

    setUploading(false);
  };

  return {
    uploading,
    uploadStatus,
    demoMode,
    uploadRepository,
    loadDemoRepository,
  };
}
