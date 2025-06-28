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

export function useGitHubUpload() {
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<UploadStatus | null>(null);

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
      // First check if the repository exists by accessing the repository info endpoint
      const response = await fetch(
        `https://api.github.com/repos/${owner}/${repo}`,
        {
          headers: {
            Accept: "application/vnd.github.v3+json",
          },
        },
      );

      if (response.ok) {
        const repoData = await response.json();
        if (repoData.private) {
          throw new Error(
            `Repository "${owner}/${repo}" is private. Please make it public or use a public repository.`,
          );
        }
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
        throw new Error(
          "GitHub API rate limit exceeded. Please try again later.",
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
  ): Promise<{ path: string; content: string }[]> => {
    const contents = await fetchRepoContents(owner, repo, path);
    const files: { path: string; content: string }[] = [];

    const supportedExtensions = [".js", ".jsx", ".ts", ".tsx", ".json"];
    const excludePatterns = ["node_modules", ".git", "dist", "build", ".next"];

    for (const item of contents) {
      if (excludePatterns.some((pattern) => item.path.includes(pattern))) {
        continue;
      }

      if (item.type === "file") {
        const hasValidExtension = supportedExtensions.some((ext) =>
          item.name.endsWith(ext),
        );

        if (hasValidExtension && item.download_url) {
          try {
            const content = await downloadFile(item.download_url);
            files.push({
              path: item.path,
              content,
            });

            setUploadStatus((prev) =>
              prev
                ? {
                    ...prev,
                    processed: prev.processed + 1,
                    files: [...prev.files, item.path],
                  }
                : null,
            );
          } catch (error) {
            console.warn(`Failed to download ${item.path}:`, error);
          }
        }
      } else if (item.type === "dir") {
        const subFiles = await getAllFiles(owner, repo, item.path);
        files.push(...subFiles);
      }
    }

    return files;
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
      // First validate the repository exists and is accessible
      await validateRepository(repoInfo.owner, repoInfo.repo);

      const initialContents = await fetchRepoContents(
        repoInfo.owner,
        repoInfo.repo,
      );
      const estimatedFiles = initialContents.filter(
        (item) =>
          item.type === "file" &&
          [".js", ".jsx", ".ts", ".tsx", ".json"].some((ext) =>
            item.name.endsWith(ext),
          ),
      ).length;

      setUploadStatus((prev) =>
        prev ? { ...prev, total: Math.max(estimatedFiles, 10) } : null,
      );

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

      setUploadStatus((prev) =>
        prev ? { ...prev, total: files.length } : null,
      );

      toast({
        title: "Repository Uploaded",
        description: `Successfully uploaded ${files.length} files from ${repoInfo.owner}/${repoInfo.repo}`,
      });

      if (typeof onRepoUpload === "function") {
        onRepoUpload(files);
      }
    } catch (error) {
      console.error("Upload error:", error);
      let errorMessage = "Failed to upload repository";

      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === "object" && error !== null) {
        errorMessage =
          "Network error or repository access issue. Please check your connection and try again.";
      }

      toast({
        title: "Upload Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      setUploadStatus(null);
    }
  };

  return {
    uploading,
    uploadStatus,
    uploadRepository,
  };
}
