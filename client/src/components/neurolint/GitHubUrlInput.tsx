import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Download, CheckCircle, AlertCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";

interface GitHubUrlInputProps {
  repoUrl: string;
  setRepoUrl: (url: string) => void;
  onUpload: () => void;
  uploading: boolean;
  processing?: boolean;
}

export function GitHubUrlInput({
  repoUrl,
  setRepoUrl,
  onUpload,
  uploading,
  processing,
}: GitHubUrlInputProps) {
  const [verifying, setVerifying] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<
    "none" | "valid" | "invalid"
  >("none");

  const extractRepoInfo = (url: string) => {
    const match = url.match(/github\.com\/([^\/]+)\/([^\/]+)/);
    if (!match) return null;
    return {
      owner: match[1],
      repo: match[2].replace(/\.git$/, ""),
    };
  };

  const verifyRepository = async () => {
    if (!repoUrl.trim()) {
      toast({
        title: "Error",
        description: "Please enter a GitHub repository URL",
        variant: "destructive",
      });
      return;
    }

    const repoInfo = extractRepoInfo(repoUrl);
    if (!repoInfo) {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid GitHub repository URL",
        variant: "destructive",
      });
      return;
    }

    setVerifying(true);
    setVerificationStatus("none");

    try {
      const response = await fetch(
        `https://api.github.com/repos/${repoInfo.owner}/${repoInfo.repo}`,
        {
          headers: {
            Accept: "application/vnd.github.v3+json",
          },
        },
      );

      if (response.ok) {
        const repoData = await response.json();
        if (repoData.private) {
          setVerificationStatus("invalid");
          toast({
            title: "Private Repository",
            description: `Repository "${repoInfo.owner}/${repoInfo.repo}" is private. Please make it public.`,
            variant: "destructive",
          });
        } else {
          setVerificationStatus("valid");
          toast({
            title: "Repository Found ✅",
            description: `Repository "${repoInfo.owner}/${repoInfo.repo}" is public and accessible!`,
          });
        }
      } else if (response.status === 404) {
        setVerificationStatus("invalid");
        toast({
          title: "Repository Not Found",
          description: `Repository "${repoInfo.owner}/${repoInfo.repo}" does not exist. Check the spelling and try again.`,
          variant: "destructive",
        });
      } else {
        setVerificationStatus("invalid");
        toast({
          title: "Verification Failed",
          description: `GitHub API error ${response.status}. Please try again later.`,
          variant: "destructive",
        });
      }
    } catch (error) {
      setVerificationStatus("invalid");
      toast({
        title: "Network Error",
        description:
          "Could not verify repository. Check your connection and try again.",
        variant: "destructive",
      });
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <Input
          placeholder="https://github.com/username/repository"
          value={repoUrl}
          onChange={(e) => {
            setRepoUrl(e.target.value);
            setVerificationStatus("none");
          }}
          className="bg-zinc-900 border-zinc-800 text-white placeholder:text-gray-400 flex-1"
          disabled={uploading || processing}
        />
        <Button
          onClick={verifyRepository}
          disabled={verifying || uploading || processing || !repoUrl.trim()}
          variant="outline"
          className="px-3"
        >
          {verifying ? (
            <div className="w-4 h-4 animate-spin rounded-full border-2 border-zinc-300 border-t-transparent" />
          ) : verificationStatus === "valid" ? (
            <CheckCircle className="w-4 h-4 text-zinc-400" />
          ) : verificationStatus === "invalid" ? (
            <AlertCircle className="w-4 h-4 text-zinc-400" />
          ) : (
            "Verify"
          )}
        </Button>
      </div>

      <Button
        onClick={onUpload}
        disabled={uploading || processing || !repoUrl.trim()}
        className="w-full bg-white text-black hover:bg-gray-200"
      >
        <Download className="w-4 h-4 mr-2" />
        {uploading ? "Uploading Repository..." : "Upload Repository"}
      </Button>
    </div>
  );
}
