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
  Mic,
  MicOff,
  Video,
  VideoOff,
  Share,
  Sparkles,
  Zap,
  Target,
  Wand2,
  MousePointer,
  Cursor,
  Timer,
  Coffee,
  Award,
  Lightbulb,
  Rocket,
  Bot,
  Gamepad2,
  Crown,
  Star,
} from "lucide-react";

interface Participant {
  id: string;
  name: string;
  avatar: string;
  role: "host" | "collaborator" | "observer";
  permissions: string[];
  cursor: { line: number; column: number; color: string };
  isTyping: boolean;
  micStatus: "on" | "off" | "muted";
  videoStatus: "on" | "off";
  connectionQuality: "excellent" | "good" | "poor";
  joinedAt: string;
  contributions: number;
}

interface AIAssistant {
  id: string;
  name: string;
  personality: "helpful" | "expert" | "creative" | "strict";
  active: boolean;
  suggestions: AISuggestion[];
  currentTask?: string;
}

interface AISuggestion {
  id: string;
  type: "optimization" | "bug-fix" | "pattern" | "refactor" | "test";
  title: string;
  description: string;
  codeChange: {
    before: string;
    after: string;
    lineStart: number;
    lineEnd: number;
  };
  confidence: number;
  impact: "low" | "medium" | "high";
  reasoning: string;
  votes: { userId: string; vote: "accept" | "reject" | "modify" }[];
  status: "pending" | "accepted" | "rejected" | "modified" | "implemented";
}

interface GameElement {
  type: "challenge" | "achievement" | "powerup" | "streak";
  title: string;
  description: string;
  points: number;
  timeLimit?: number;
  participants?: string[];
  status: "active" | "completed" | "failed";
}

const LiveCodeSessions = () => {
  const [sessionMode, setSessionMode] = useState<
    "collaborate" | "compete" | "learn" | "review"
  >("collaborate");
  const [aiAssistantActive, setAiAssistantActive] = useState(true);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [gamificationActive, setGamificationActive] = useState(true);

  // Get real participants data - would come from real-time WebSocket connection
  const participants: Participant[] =
    teamData?.members?.slice(0, 3).map((member, index) => ({
      id: member.id,
      name: member.userId,
      avatar: "/avatars/default.jpg",
      role: index === 0 ? "host" : "collaborator",
      permissions:
        index === 0 ? ["edit", "invite", "moderate"] : ["edit", "comment"],
      cursor: {
        line: 20 + index * 10,
        column: 5 + index * 3,
        color: ["#ff6b6b", "#4ecdc4", "#45b7d1"][index],
      },
      isTyping: Math.random() > 0.7,
      micStatus: Math.random() > 0.5 ? "on" : "off",
      videoStatus: Math.random() > 0.6 ? "on" : "off",
      connectionQuality: ["excellent", "good", "fair"][
        Math.floor(Math.random() * 3)
      ],
      joinedAt: new Date().toISOString(),
      contributions: Math.floor(Math.random() * 30),
    })) || [];

  const aiAssistants: AIAssistant[] = [
    {
      id: "ai-1",
      name: "CodeSage",
      personality: "expert",
      active: true,
      currentTask: "Analyzing performance patterns",
      suggestions: [
        {
          id: "ai-suggestion-1",
          type: "optimization",
          title: "Memoization Opportunity",
          description:
            "This component could benefit from React.memo to prevent unnecessary re-renders",
          codeChange: {
            before: "const UserCard = ({ user, onClick }) => {",
            after: "const UserCard = React.memo(({ user, onClick }) => {",
            lineStart: 15,
            lineEnd: 15,
          },
          confidence: 94,
          impact: "medium",
          reasoning:
            "Props appear stable and component is rendered frequently in lists",
          votes: [],
          status: "pending",
        },
      ],
    },
  ];

  const gameElements: GameElement[] = [
    {
      type: "challenge",
      title: "Speed Refactor",
      description: "Refactor this function in under 5 minutes",
      points: 100,
      timeLimit: 300,
      participants: ["1", "2"],
      status: "active",
    },
    {
      type: "achievement",
      title: "Bug Hunter",
      description: "Found and fixed 3 bugs in this session",
      points: 250,
      status: "completed",
    },
  ];

  const getConnectionQualityColor = (quality: string) => {
    switch (quality) {
      case "excellent":
        return "text-green-400";
      case "good":
        return "text-yellow-400";
      case "poor":
        return "text-red-400";
      default:
        return "text-gray-400";
    }
  };

  const getCursorStyle = (participant: Participant) => ({
    background: participant.cursor.color,
    boxShadow: `0 0 10px ${participant.cursor.color}40`,
  });

  return (
    <div className="min-h-screen bg-black">
      <div className="flex h-screen">
        {/* Main Code Editor Area */}
        <div className="flex-1 flex flex-col">
          {/* Session Header */}
          <div className="bg-zinc-900 border-b border-zinc-800 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-400 rounded-full animate-pulse" />
                  <span className="text-white font-semibold">Live Session</span>
                  <Badge className="bg-green-900 text-green-200">Active</Badge>
                </div>
                <div className="flex items-center gap-2 text-zinc-400">
                  <GitBranch className="w-4 h-4" />
                  <span>frontend-app/components/UserProfile.tsx</span>
                </div>
              </div>

              <div className="flex items-center gap-4">
                {/* Session Mode Selector */}
                <div className="flex items-center gap-1">
                  {(["collaborate", "compete", "learn", "review"] as const).map(
                    (mode) => (
                      <Button
                        key={mode}
                        size="sm"
                        variant={sessionMode === mode ? "primary" : "ghost"}
                        onClick={() => setSessionMode(mode)}
                        className="capitalize"
                      >
                        {mode === "collaborate" && (
                          <Users className="w-3 h-3 mr-1" />
                        )}
                        {mode === "compete" && (
                          <Gamepad2 className="w-3 h-3 mr-1" />
                        )}
                        {mode === "learn" && (
                          <Lightbulb className="w-3 h-3 mr-1" />
                        )}
                        {mode === "review" && <Eye className="w-3 h-3 mr-1" />}
                        {mode}
                      </Button>
                    ),
                  )}
                </div>

                {/* AI Assistant Toggle */}
                <Button
                  size="sm"
                  variant={aiAssistantActive ? "primary" : "ghost"}
                  onClick={() => setAiAssistantActive(!aiAssistantActive)}
                >
                  <Bot className="w-3 h-3 mr-1" />
                  AI Assistant
                </Button>

                {/* Voice/Video Controls */}
                <div className="flex items-center gap-1">
                  <Button size="sm" variant="ghost">
                    {voiceEnabled ? (
                      <Mic className="w-3 h-3" />
                    ) : (
                      <MicOff className="w-3 h-3" />
                    )}
                  </Button>
                  <Button size="sm" variant="ghost">
                    <Video className="w-3 h-3" />
                  </Button>
                  <Button size="sm" variant="ghost">
                    <Share className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Code Editor with Real-time Cursors */}
          <div className="flex-1 bg-blacker relative">
            <div className="absolute top-4 right-4 z-10">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <span className="text-purple-400 text-sm">
                  AI actively analyzing
                </span>
              </div>
            </div>

            <div className="p-6 font-mono text-sm h-full overflow-auto">
              <div className="space-y-1 relative">
                {/* Live cursors */}
                {participants.map((participant) => (
                  <div
                    key={participant.id}
                    className="absolute pointer-events-none"
                    style={{
                      top: `${participant.cursor.line * 24}px`,
                      left: `${participant.cursor.column * 8}px`,
                    }}
                  >
                    <div
                      className="w-0.5 h-6 animate-pulse"
                      style={{ backgroundColor: participant.cursor.color }}
                    />
                    <div
                      className="absolute -top-6 left-0 px-2 py-1 rounded text-xs text-white whitespace-nowrap"
                      style={{ backgroundColor: participant.cursor.color }}
                    >
                      {participant.name}
                      {participant.isTyping && (
                        <span className="ml-1 animate-pulse">typing...</span>
                      )}
                    </div>
                  </div>
                ))}

                {/* Code content with live editing visualization */}
                {[
                  {
                    line: 1,
                    content:
                      'import React, { useState, useEffect } from "react";',
                  },
                  {
                    line: 2,
                    content: 'import { UserCard } from "./UserCard";',
                  },
                  { line: 3, content: "" },
                  { line: 4, content: "interface User {" },
                  { line: 5, content: "  id: string;" },
                  { line: 6, content: "  name: string;" },
                  { line: 7, content: "  email: string;" },
                  { line: 8, content: "}" },
                  { line: 9, content: "" },
                  { line: 10, content: "export function UserProfile() {" },
                  {
                    line: 11,
                    content:
                      "  const [users, setUsers] = useState<User[]>([]);",
                  },
                  {
                    line: 12,
                    content: "  const [loading, setLoading] = useState(true);",
                  },
                  { line: 13, content: "" },
                  {
                    line: 14,
                    content: "  // AI Suggestion: Add React.memo here",
                  },
                  {
                    line: 15,
                    content: "  const UserCard = ({ user, onClick }) => {",
                    highlight: "suggestion",
                  },
                  { line: 16, content: "    return (" },
                  {
                    line: 17,
                    content:
                      '      <div className="user-card" onClick={() => onClick(user.id)}>',
                  },
                  { line: 18, content: "        <h3>{user.name}</h3>" },
                  { line: 19, content: "        <p>{user.email}</p>" },
                  { line: 20, content: "      </div>" },
                  { line: 21, content: "    );" },
                  { line: 22, content: "  };" },
                  { line: 23, content: "" },
                  { line: 24, content: "  return (" },
                  { line: 25, content: '    <div className="user-profile">' },
                  { line: 26, content: "      {loading ? (" },
                  { line: 27, content: "        <div>Loading...</div>" },
                  {
                    line: 28,
                    content: "      ) : (",
                    highlight: "cursor-alex",
                  },
                  { line: 29, content: "        users.map(user => (" },
                  {
                    line: 30,
                    content:
                      "          <UserCard key={user.id} user={user} onClick={handleUserClick} />",
                  },
                  { line: 31, content: "        ))" },
                  { line: 32, content: "      )}" },
                  { line: 33, content: "    </div>" },
                  { line: 34, content: "  );" },
                  { line: 35, content: "}" },
                ].map((line) => (
                  <div
                    key={line.line}
                    className={`flex items-center min-h-[24px] ${
                      line.highlight === "suggestion"
                        ? "bg-blue-900/30 border-l-4 border-blue-400"
                        : line.highlight === "cursor-alex"
                          ? "bg-teal-900/20"
                          : ""
                    }`}
                  >
                    <span className="text-zinc-400 w-12 select-none text-right pr-4">
                      {line.line}
                    </span>
                    <span className="text-white flex-1">{line.content}</span>
                    {line.highlight === "suggestion" && (
                      <div className="flex items-center gap-2 pr-4">
                        <Badge className="bg-blue-900 text-blue-200 text-xs">
                          AI Suggestion
                        </Badge>
                        <Button size="sm" variant="ghost" className="h-6 px-2">
                          <Check className="w-3 h-3" />
                        </Button>
                        <Button size="sm" variant="ghost" className="h-6 px-2">
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar - Collaboration Tools */}
        <div className="w-96 bg-zinc-900 border-l border-zinc-800 flex flex-col">
          {/* Participants Panel */}
          <div className="p-4 border-b border-zinc-800">
            <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
              <Users className="w-4 h-4" />
              Participants ({participants.length})
            </h3>
            <div className="space-y-2">
              {participants.map((participant) => (
                <div
                  key={participant.id}
                  className="flex items-center gap-3 p-2 bg-zinc-900 rounded-lg"
                >
                  <div className="relative">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback>
                        {participant.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div
                      className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-zinc-800-dark"
                      style={{ backgroundColor: participant.cursor.color }}
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-white text-sm font-medium">
                        {participant.name}
                      </span>
                      <Badge className="text-xs bg-zinc-900 text-white">
                        {participant.role}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <span
                        className={getConnectionQualityColor(
                          participant.connectionQuality,
                        )}
                      >
                        ●
                      </span>
                      <span className="text-zinc-400">
                        {participant.contributions} contributions
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {participant.micStatus === "on" && (
                      <Mic className="w-3 h-3 text-green-400" />
                    )}
                    {participant.micStatus === "muted" && (
                      <MicOff className="w-3 h-3 text-red-400" />
                    )}
                    {participant.videoStatus === "on" && (
                      <Video className="w-3 h-3 text-blue-400" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Assistant Panel */}
          {aiAssistantActive && (
            <div className="p-4 border-b border-zinc-800">
              <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                <Bot className="w-4 h-4 text-blue-400" />
                AI Assistant
              </h3>
              <div className="space-y-3">
                {aiAssistants.map((ai) => (
                  <div
                    key={ai.id}
                    className="p-3 bg-blue-900/20 border border-blue-400/30 rounded-lg"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
                      <span className="text-blue-300 font-medium">
                        {ai.name}
                      </span>
                      <Badge className="bg-blue-900 text-blue-200 text-xs">
                        {ai.personality}
                      </Badge>
                    </div>
                    {ai.currentTask && (
                      <p className="text-blue-200 text-xs mb-2">
                        {ai.currentTask}
                      </p>
                    )}
                    <div className="space-y-2">
                      {ai.suggestions.map((suggestion) => (
                        <div
                          key={suggestion.id}
                          className="p-2 bg-zinc-900 rounded border border-blue-400/20"
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-white text-xs font-medium">
                              {suggestion.title}
                            </span>
                            <Badge className="text-xs bg-blue-900 text-blue-200">
                              {suggestion.confidence}%
                            </Badge>
                          </div>
                          <p className="text-zinc-400 text-xs mb-2">
                            {suggestion.description}
                          </p>
                          <div className="flex items-center gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-6 px-2 text-green-400"
                            >
                              <ThumbsUp className="w-3 h-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-6 px-2 text-red-400"
                            >
                              <ThumbsDown className="w-3 h-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-6 px-2 text-blue-400"
                            >
                              <Wand2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Gamification Panel */}
          {gamificationActive && sessionMode === "compete" && (
            <div className="p-4 border-b border-zinc-800">
              <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                <Gamepad2 className="w-4 h-4 text-purple-400" />
                Live Challenges
              </h3>
              <div className="space-y-3">
                {gameElements.map((element) => (
                  <div
                    key={element.title}
                    className="p-3 bg-purple-900/20 border border-purple-400/30 rounded-lg"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-purple-300 font-medium">
                        {element.title}
                      </span>
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-yellow-400" />
                        <span className="text-yellow-400 text-xs">
                          {element.points}
                        </span>
                      </div>
                    </div>
                    <p className="text-purple-200 text-xs mb-2">
                      {element.description}
                    </p>
                    {element.timeLimit && element.status === "active" && (
                      <div className="flex items-center gap-2">
                        <Timer className="w-3 h-3 text-orange-400" />
                        <span className="text-orange-400 text-xs">
                          4:32 remaining
                        </span>
                      </div>
                    )}
                    <Badge
                      className={`text-xs mt-1 ${
                        element.status === "active"
                          ? "bg-green-900 text-green-200"
                          : element.status === "completed"
                            ? "bg-blue-900 text-blue-200"
                            : "bg-red-900 text-red-200"
                      }`}
                    >
                      {element.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Chat/Comments Panel */}
          <div className="flex-1 flex flex-col">
            <div className="p-4 border-b border-zinc-800">
              <h3 className="text-white font-semibold flex items-center gap-2">
                <MessageCircle className="w-4 h-4" />
                Live Chat
              </h3>
            </div>
            <div className="flex-1 p-4 overflow-y-auto">
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <Avatar className="w-6 h-6">
                    <AvatarFallback className="text-xs">SC</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-white text-sm">
                      <span className="font-medium">Sarah:</span> What do you
                      think about the AI suggestion for memoization?
                    </p>
                    <p className="text-zinc-400 text-xs">2 min ago</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Avatar className="w-6 h-6">
                    <AvatarFallback className="text-xs">AK</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-white text-sm">
                      <span className="font-medium">Alex:</span> Looks good! The
                      props are stable here.
                    </p>
                    <p className="text-zinc-400 text-xs">1 min ago</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                    <Bot className="w-3 h-3 text-white" />
                  </div>
                  <div>
                    <p className="text-blue-300 text-sm">
                      <span className="font-medium">CodeSage:</span> I've
                      analyzed the render frequency - this optimization could
                      save 23% render time.
                    </p>
                    <p className="text-zinc-400 text-xs">30 sec ago</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-4 border-t border-zinc-800">
              <div className="flex items-center gap-2">
                <input
                  placeholder="Type a message..."
                  className="flex-1 bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-white text-sm"
                />
                <Button size="sm">
                  <Send className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveCodeSessions;
