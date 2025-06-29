import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Users,
  MessageCircle,
  Check,
  X,
  Eye,
  Code,
  GitBranch,
  Clock,
  Play,
  Pause,
  Send,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react";
import { UserCard } from "@/components/UserCard";

interface CollaborationSession {
  id: string;
  fileName: string;
  repository: string;
  startedAt: string;
  participants: Participant[];
  suggestedFixes: SuggestedFix[];
  comments: Comment[];
  status: "active" | "reviewing" | "completed";
}

interface Participant {
  id: string;
  name: string;
  avatar: string;
  role: "reviewer" | "collaborator";
  isOnline: boolean;
  cursor?: { line: number; column: number };
}

interface SuggestedFix {
  id: string;
  layer: number;
  type: string;
  description: string;
  codeChange: {
    before: string;
    after: string;
    lineStart: number;
    lineEnd: number;
  };
  status: "pending" | "approved" | "rejected" | "applied";
  votes: { userId: string; vote: "approve" | "reject" }[];
  suggestedBy: string;
  timestamp: string;
}

interface Comment {
  id: string;
  userId: string;
  userName: string;
  content: string;
  timestamp: string;
  lineNumber?: number;
  fixId?: string;
}

const LiveCollaboration = () => {
  const [session, setSession] = useState<CollaborationSession>({
    id: "1",
    fileName: "UserProfile.tsx",
    repository: "company/frontend-app",
    startedAt: "2024-01-20T10:30:00Z",
    status: "active",
    participants: [
      {
        id: "1",
        name: "Sarah Chen",
        avatar: "/avatars/sarah.jpg",
        role: "reviewer",
        isOnline: true,
        cursor: { line: 42, column: 15 },
      },
      {
        id: "2",
        name: "Alex Kim",
        avatar: "/avatars/alex.jpg",
        role: "collaborator",
        isOnline: true,
        cursor: { line: 28, column: 8 },
      },
      {
        id: "3",
        name: "Mike Rodriguez",
        avatar: "/avatars/mike.jpg",
        role: "collaborator",
        isOnline: false,
      },
    ],
    suggestedFixes: [
      {
        id: "1",
        layer: 3,
        type: "Missing Key Prop",
        description: "Add key prop to mapped list items",
        codeChange: {
          before: "users.map(user => <UserCard user={user} />)",
          after: "users.map(user => <UserCard key={user.id} user={user} />)",
          lineStart: 28,
          lineEnd: 28,
        },
        status: "approved",
        votes: [
          { userId: "1", vote: "approve" },
          { userId: "2", vote: "approve" },
        ],
        suggestedBy: "NeuroLint AI",
        timestamp: "2024-01-20T10:32:00Z",
      },
      {
        id: "2",
        layer: 2,
        type: "HTML Entity",
        description: "Replace HTML entities with proper characters",
        codeChange: {
          before: "const title = &quot;User Profile&quot;;",
          after: 'const title = "User Profile";',
          lineStart: 15,
          lineEnd: 15,
        },
        status: "pending",
        votes: [{ userId: "1", vote: "approve" }],
        suggestedBy: "NeuroLint AI",
        timestamp: "2024-01-20T10:34:00Z",
      },
      {
        id: "3",
        layer: 4,
        type: "SSR Guard",
        description: "Add SSR guard for localStorage usage",
        codeChange: {
          before: 'const theme = localStorage.getItem("theme");',
          after:
            'const theme = typeof window !== "undefined" ? localStorage.getItem("theme") : null;',
          lineStart: 42,
          lineEnd: 42,
        },
        status: "pending",
        votes: [],
        suggestedBy: "NeuroLint AI",
        timestamp: "2024-01-20T10:35:00Z",
      },
    ],
    comments: [
      {
        id: "1",
        userId: "1",
        userName: "Sarah Chen",
        content:
          "This key prop fix looks good, but should we use a more unique key?",
        timestamp: "2024-01-20T10:33:00Z",
        lineNumber: 28,
        fixId: "1",
      },
      {
        id: "2",
        userId: "2",
        userName: "Alex Kim",
        content: "user.id should be unique enough for this case",
        timestamp: "2024-01-20T10:33:30Z",
        lineNumber: 28,
        fixId: "1",
      },
    ],
  });

  const [newComment, setNewComment] = useState("");
  const [selectedFix, setSelectedFix] = useState<string | null>(null);

  const handleVote = (fixId: string, vote: "approve" | "reject") => {
    setSession((prev) => ({
      ...prev,
      suggestedFixes: prev.suggestedFixes.map((fix) =>
        fix.id === fixId
          ? {
              ...fix,
              votes: [
                ...fix.votes.filter((v) => v.userId !== "2"), // Remove existing vote from current user
                { userId: "2", vote },
              ],
            }
          : fix,
      ),
    }));
  };

  const handleApplyFix = (fixId: string) => {
    setSession((prev) => ({
      ...prev,
      suggestedFixes: prev.suggestedFixes.map((fix) =>
        fix.id === fixId ? { ...fix, status: "applied" as const } : fix,
      ),
    }));
  };

  const handleAddComment = (fixId?: string) => {
    if (!newComment.trim()) return;

    const comment: Comment = {
      id: Date.now().toString(),
      userId: "2",
      userName: "Alex Kim",
      content: newComment,
      timestamp: new Date().toISOString(),
      fixId,
    };

    setSession((prev) => ({
      ...prev,
      comments: [...prev.comments, comment],
    }));

    setNewComment("");
  };

  const getFixStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-900 text-green-200";
      case "rejected":
        return "bg-red-900 text-red-200";
      case "applied":
        return "bg-blue-900 text-blue-200";
      default:
        return "bg-yellow-900 text-yellow-200";
    }
  };

  const getVoteCount = (fix: SuggestedFix, voteType: "approve" | "reject") => {
    return fix.votes.filter((v) => v.vote === voteType).length;
  };

  return (
    <div className="min-h-screen bg-black p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-white">
                Live Collaboration
              </h1>
              <div className="flex items-center gap-2 text-zinc-400">
                <GitBranch className="w-4 h-4" />
                <span>{session.repository}</span>
                <span>/</span>
                <span>{session.fileName}</span>
              </div>
            </div>
            <Badge
              className={`${session.status === "active" ? "bg-green-900 text-green-200" : "bg-yellow-900 text-yellow-200"}`}
            >
              {session.status}
            </Badge>
          </div>

          <div className="flex items-center gap-4">
            {/* Participants */}
            <div className="flex items-center gap-2">
              {session.participants.map((participant) => (
                <div key={participant.id} className="relative">
                  <Avatar className="w-8 h-8">
                    <AvatarImage
                      src={participant.avatar}
                      alt={participant.name}
                    />
                    <AvatarFallback>
                      {participant.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div
                    className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-zinc-800-dark ${
                      participant.isOnline ? "bg-green-400" : "bg-gray-400"
                    }`}
                  />
                </div>
              ))}
            </div>

            <Button variant="primary" size="sm">
              <Play className="w-4 h-4 mr-2" />
              Apply All Approved
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Code View & Fixes */}
          <div className="lg:col-span-2 space-y-6">
            {/* Code Editor Simulation */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="w-5 h-5" />
                  {session.fileName}
                  <div className="flex items-center gap-2 ml-auto">
                    {session.participants
                      .filter((p) => p.cursor)
                      .map((participant) => (
                        <div
                          key={participant.id}
                          className="flex items-center gap-1 text-xs"
                        >
                          <div className="w-2 h-2 rounded-full bg-blue-400" />
                          <span className="text-zinc-400">
                            {participant.name} (line {participant.cursor?.line})
                          </span>
                        </div>
                      ))}
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-blacker p-4 rounded-lg font-mono text-sm">
                  <div className="space-y-1">
                    {/* Simulated code lines */}
                    <div className="flex">
                      <span className="text-zinc-400 w-8">10</span>
                      <span className="text-white">
                        import React from 'react';
                      </span>
                    </div>
                    <div className="flex">
                      <span className="text-zinc-400 w-8">11</span>
                      <span className="text-white">
                        import {UserCard} from './UserCard';
                      </span>
                    </div>
                    <div className="flex">
                      <span className="text-zinc-400 w-8">12</span>
                      <span className="text-white"></span>
                    </div>
                    <div className="flex">
                      <span className="text-zinc-400 w-8">13</span>
                      <span className="text-white">
                        export function UserProfile() {"{"}
                      </span>
                    </div>
                    <div className="flex">
                      <span className="text-zinc-400 w-8">14</span>
                      <span className="text-white">
                        {" "}
                        const users = getUsers();
                      </span>
                    </div>
                    <div className="flex bg-red-900/30 border-l-4 border-red-400">
                      <span className="text-zinc-400 w-8">15</span>
                      <span className="text-white">
                        {" "}
                        const title = &quot;User Profile&quot;;
                      </span>
                      <Badge className="ml-2 bg-red-900 text-red-200 text-xs">
                        Fix #2
                      </Badge>
                    </div>
                    <div className="flex">
                      <span className="text-zinc-400 w-8">16</span>
                      <span className="text-white"></span>
                    </div>
                    <div className="flex">
                      <span className="text-zinc-400 w-8">17</span>
                      <span className="text-white"> return (</span>
                    </div>
                    <div className="flex">
                      <span className="text-zinc-400 w-8">18</span>
                      <span className="text-white"> &lt;div&gt;</span>
                    </div>
                    <div className="flex bg-green-900/30 border-l-4 border-green-400">
                      <span className="text-zinc-400 w-8">28</span>
                      <span className="text-white">
                        {" "}
                        {`{users.map(user => <UserCard key={user.id} user={user} />)}`}
                      </span>
                      <Badge className="ml-2 bg-green-900 text-green-200 text-xs">
                        Fixed #1
                      </Badge>
                    </div>
                    <div className="flex bg-yellow-900/30 border-l-4 border-yellow-400">
                      <span className="text-zinc-400 w-8">42</span>
                      <span className="text-white">
                        {" "}
                        const theme = localStorage.getItem("theme");
                      </span>
                      <Badge className="ml-2 bg-yellow-900 text-yellow-200 text-xs">
                        Fix #3
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Suggested Fixes */}
            <Card>
              <CardHeader>
                <CardTitle>Suggested Fixes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {session.suggestedFixes.map((fix) => (
                    <div
                      key={fix.id}
                      className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                        selectedFix === fix.id
                          ? "border-blue-400 bg-blue-900/20"
                          : "border-zinc-800 bg-zinc-900 hover:bg-zinc-900"
                      }`}
                      onClick={() => setSelectedFix(fix.id)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge className="bg-zinc-900 text-white">
                              Layer {fix.layer}
                            </Badge>
                            <span className="text-white font-medium">
                              {fix.type}
                            </span>
                            <Badge className={getFixStatusColor(fix.status)}>
                              {fix.status}
                            </Badge>
                          </div>
                          <p className="text-zinc-400 text-sm mb-3">
                            {fix.description}
                          </p>

                          {/* Code diff */}
                          <div className="bg-blacker rounded p-3 font-mono text-xs">
                            <div className="text-red-300 mb-1">
                              - {fix.codeChange.before}
                            </div>
                            <div className="text-green-300">
                              + {fix.codeChange.after}
                            </div>
                          </div>

                          <div className="flex items-center gap-4 mt-3">
                            <div className="flex items-center gap-1">
                              <ThumbsUp className="w-4 h-4 text-green-400" />
                              <span className="text-green-400">
                                {getVoteCount(fix, "approve")}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <ThumbsDown className="w-4 h-4 text-red-400" />
                              <span className="text-red-400">
                                {getVoteCount(fix, "reject")}
                              </span>
                            </div>
                            <span className="text-zinc-400 text-xs">
                              Line {fix.codeChange.lineStart}
                            </span>
                          </div>
                        </div>

                        {fix.status === "pending" && (
                          <div className="flex items-center gap-2 ml-4">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleVote(fix.id, "approve");
                              }}
                              className="text-green-400 border-green-400 hover:bg-green-900/20"
                            >
                              <Check className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleVote(fix.id, "reject");
                              }}
                              className="text-red-400 border-red-400 hover:bg-red-900/20"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        )}

                        {fix.status === "approved" && (
                          <Button
                            size="sm"
                            variant="primary"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleApplyFix(fix.id);
                            }}
                          >
                            Apply Fix
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Comments & Activity */}
          <div className="space-y-6">
            {/* Session Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Session Info
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-400">Started</span>
                    <span className="text-white">25 min ago</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-400">Participants</span>
                    <span className="text-white">
                      {session.participants.length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-400">
                      Fixes Suggested
                    </span>
                    <span className="text-white">
                      {session.suggestedFixes.length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-400">Approved</span>
                    <span className="text-green-400">
                      {
                        session.suggestedFixes.filter(
                          (f) => f.status === "approved",
                        ).length
                      }
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Comments */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="w-5 h-5" />
                  Comments
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {session.comments.map((comment) => (
                    <div key={comment.id} className="flex gap-3">
                      <Avatar className="w-6 h-6">
                        <AvatarFallback className="text-xs">
                          {comment.userName
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-white text-sm font-medium">
                            {comment.userName}
                          </span>
                          <span className="text-zinc-400 text-xs">
                            {new Date(comment.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                        <p className="text-zinc-400 text-sm">
                          {comment.content}
                        </p>
                        {comment.lineNumber && (
                          <span className="text-zinc-400 text-xs">
                            Line {comment.lineNumber}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add Comment */}
                <div className="flex gap-2 mt-4">
                  <input
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add a comment..."
                    className="flex-1 bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-white text-sm"
                    onKeyPress={(e) =>
                      e.key === "Enter" &&
                      handleAddComment(selectedFix || undefined)
                    }
                  />
                  <Button
                    size="sm"
                    onClick={() => handleAddComment(selectedFix || undefined)}
                    disabled={!newComment.trim()}
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Participants */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Participants
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {session.participants.map((participant) => (
                    <div
                      key={participant.id}
                      className="flex items-center gap-3"
                    >
                      <div className="relative">
                        <Avatar className="w-8 h-8">
                          <AvatarImage
                            src={participant.avatar}
                            alt={participant.name}
                          />
                          <AvatarFallback>
                            {participant.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div
                          className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-zinc-800-dark ${
                            participant.isOnline
                              ? "bg-green-400"
                              : "bg-gray-400"
                          }`}
                        />
                      </div>
                      <div className="flex-1">
                        <p className="text-white text-sm font-medium">
                          {participant.name}
                        </p>
                        <p className="text-zinc-400 text-xs">
                          {participant.role}
                        </p>
                      </div>
                      {participant.cursor && (
                        <Badge className="bg-zinc-900 text-zinc-400 text-xs">
                          Line {participant.cursor.line}
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveCollaboration;
