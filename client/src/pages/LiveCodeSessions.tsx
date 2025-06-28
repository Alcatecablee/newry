import { useState, useEffect } from "react";
import { useTeams, useTeam } from "@/hooks/useTeams";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { NeuroLintOrchestrator } from "@/lib/neurolint/orchestrator";
import { NeuroLintLayerResult } from "@/lib/neurolint/types";
import {
  Users,
  MessageCircle,
  Code,
  Clock,
  Play,
  Pause,
  Send,
  Mic,
  MicOff,
  Video,
  VideoOff,
  Share,
  Bot,
  ArrowLeft,
  Settings,
  Zap,
  CheckCircle,
  AlertCircle,
  Layers,
  Target,
} from "lucide-react";

interface Participant {
  id: string;
  name: string;
  role: "host" | "collaborator" | "observer";
  isOnline: boolean;
  micStatus: "on" | "off";
  videoStatus: "on" | "off";
}

interface LiveSession {
  id: string;
  name: string;
  repository: string;
  branch: string;
  participants: Participant[];
  isActive: boolean;
  startedAt: string;
  currentCode?: string;
  layerResults?: NeuroLintLayerResult[];
  isAnalyzing?: boolean;
}

interface LayerStatus {
  layerId: number;
  name: string;
  status: "pending" | "running" | "success" | "error";
  result?: NeuroLintLayerResult;
}

const LiveCodeSessions = () => {
  const [selectedTeamId, setSelectedTeamId] = useState<string>("demo-team");
  const [activeSessions, setActiveSessions] = useState<LiveSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [currentCode, setCurrentCode] = useState<string>("");
  const [layerAnalysis, setLayerAnalysis] = useState<LayerStatus[]>([
    { layerId: 1, name: "Configuration", status: "pending" },
    { layerId: 2, name: "Entity Cleanup", status: "pending" },
    { layerId: 3, name: "Component Structure", status: "pending" },
    { layerId: 4, name: "Hydration Patterns", status: "pending" },
    { layerId: 5, name: "Next.js Optimization", status: "pending" },
    { layerId: 6, name: "Testing & Quality", status: "pending" },
  ]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Fetch teams data
  const { data: teams, isLoading: teamsLoading } = useTeams();
  const { data: teamData, isLoading: teamLoading } = useTeam(selectedTeamId);

  // Show loading state
  if (teamsLoading || teamLoading) {
    return (
      <div className="min-h-screen bg-black p-6 flex items-center justify-center">
        <div className="text-white text-lg">Loading live sessions...</div>
      </div>
    );
  }

  // Real-time NeuroLint analysis
  const runLayerAnalysis = async (code: string) => {
    if (!code.trim()) return;

    setIsAnalyzing(true);
    setLayerAnalysis((prev) =>
      prev.map((layer) => ({ ...layer, status: "pending" })),
    );

    try {
      // Run NeuroLint transformation with all layers
      const { transformed, layers } = await NeuroLintOrchestrator(
        code,
        "live-session",
        true,
        [1, 2, 3, 4, 5, 6],
      );

      // Update layer status based on results
      if (layers) {
        setLayerAnalysis((prev) =>
          prev.map((layer) => {
            const result = layers.find((r) =>
              r.name.includes(layer.name.split(" ")[0]),
            );
            return {
              ...layer,
              status: result?.success ? "success" : "error",
              result: result,
            };
          }),
        );
      }
    } catch (error) {
      console.error("Layer analysis failed:", error);
      setLayerAnalysis((prev) =>
        prev.map((layer) => ({ ...layer, status: "error" })),
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Convert team members to participants (only if they have active sessions)
  const teamParticipants: Participant[] =
    teamData?.members?.map((member) => ({
      id: member.id,
      name: member.userId,
      role: member.role === "owner" ? "host" : "collaborator",
      isOnline: false, // Would come from WebSocket in real implementation
      micStatus: "off",
      videoStatus: "off",
    })) || [];

  // Handle code changes and trigger analysis
  const handleCodeChange = (newCode: string) => {
    setCurrentCode(newCode);
    // Debounce analysis to avoid too many calls
    const timeoutId = setTimeout(() => {
      runLayerAnalysis(newCode);
    }, 1000);
    return () => clearTimeout(timeoutId);
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="bg-zinc-900 border-b border-zinc-800 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.history.back()}
              className="text-zinc-400 hover:text-white"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-white">
                Live Code Sessions
              </h1>
              <p className="text-zinc-400 text-sm">
                Collaborate in real-time with your team
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {teams && teams.length > 0 && (
              <select
                value={selectedTeamId}
                onChange={(e) => setSelectedTeamId(e.target.value)}
                className="bg-zinc-800 text-white px-3 py-1 rounded border border-zinc-600 text-sm"
              >
                {teams.map((team) => (
                  <option key={team.id} value={team.id}>
                    {team.name}
                  </option>
                ))}
              </select>
            )}
            <Button
              size="sm"
              className="bg-blue-600 hover:bg-blue-700"
              onClick={() => {
                const newSession = {
                  id: `session-${Date.now()}`,
                  name: `Team Session - ${new Date().toLocaleTimeString()}`,
                  repository: "live-collaboration",
                  branch: "main",
                  participants: teamParticipants.slice(0, 3),
                  isActive: true,
                  startedAt: new Date().toISOString(),
                };
                setActiveSessions((prev) => [...prev, newSession]);
                setSelectedSession(newSession.id);
              }}
            >
              <Play className="w-4 h-4 mr-2" />
              Start Session
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Active Sessions Panel */}
          <div className="lg:col-span-1">
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Users className="w-5 h-5" />
                  Active Sessions
                </CardTitle>
              </CardHeader>
              <CardContent>
                {activeSessions.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Code className="w-8 h-8 text-zinc-600" />
                    </div>
                    <p className="text-zinc-400 text-sm">No active sessions</p>
                    <p className="text-zinc-500 text-xs mt-1">
                      Start a new session to collaborate with your team
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {activeSessions.map((session) => (
                      <div
                        key={session.id}
                        className="p-3 bg-zinc-800 rounded-lg hover:bg-zinc-750 cursor-pointer"
                        onClick={() => setSelectedSession(session.id)}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-white font-medium text-sm">
                            {session.name}
                          </span>
                          <Badge className="bg-green-900 text-green-200">
                            Live
                          </Badge>
                        </div>
                        <p className="text-zinc-400 text-xs">
                          {session.repository}/{session.branch}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <div className="flex -space-x-1">
                            {session.participants
                              .slice(0, 3)
                              .map((participant) => (
                                <Avatar
                                  key={participant.id}
                                  className="w-6 h-6 border-2 border-zinc-800"
                                >
                                  <AvatarFallback className="text-xs bg-zinc-700">
                                    {participant.name
                                      .substring(0, 2)
                                      .toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                              ))}
                          </div>
                          <span className="text-zinc-500 text-xs">
                            {session.participants.length} participants
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Team Members */}
            <Card className="bg-zinc-900 border-zinc-800 mt-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Users className="w-5 h-5" />
                  Team Members
                </CardTitle>
              </CardHeader>
              <CardContent>
                {teamParticipants.length === 0 ? (
                  <div className="text-center py-4">
                    <p className="text-zinc-400 text-sm">No team members</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {teamParticipants.map((participant) => (
                      <div
                        key={participant.id}
                        className="flex items-center justify-between p-2 rounded-lg hover:bg-zinc-800"
                      >
                        <div className="flex items-center gap-3">
                          <Avatar className="w-8 h-8">
                            <AvatarFallback className="bg-zinc-700">
                              {participant.name.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-white text-sm font-medium">
                              {participant.name}
                            </p>
                            <p className="text-zinc-400 text-xs">
                              {participant.role}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <div
                            className={`w-2 h-2 rounded-full ${
                              participant.isOnline
                                ? "bg-green-400"
                                : "bg-zinc-600"
                            }`}
                          />
                          <span className="text-xs text-zinc-500">
                            {participant.isOnline ? "Online" : "Offline"}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* NeuroLint Layers Panel */}
          <div className="lg:col-span-1">
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Layers className="w-5 h-5 text-blue-400" />
                  NeuroLint Layers
                  {isAnalyzing && (
                    <Badge className="bg-blue-900 text-blue-200 animate-pulse">
                      Analyzing
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {layerAnalysis.map((layer) => (
                    <div
                      key={layer.layerId}
                      className="p-3 bg-zinc-800 rounded-lg border-l-4 border-l-zinc-600"
                      style={{
                        borderLeftColor:
                          layer.status === "success"
                            ? "#10b981"
                            : layer.status === "error"
                              ? "#ef4444"
                              : layer.status === "running"
                                ? "#3b82f6"
                                : "#6b7280",
                      }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-white font-medium text-sm">
                          Layer {layer.layerId}: {layer.name}
                        </span>
                        <div className="flex items-center gap-1">
                          {layer.status === "success" && (
                            <CheckCircle className="w-4 h-4 text-green-400" />
                          )}
                          {layer.status === "error" && (
                            <AlertCircle className="w-4 h-4 text-red-400" />
                          )}
                          {layer.status === "running" && (
                            <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                          )}
                        </div>
                      </div>
                      {layer.result && (
                        <div className="space-y-1">
                          <p className="text-zinc-400 text-xs">
                            {layer.result.description || layer.result.message}
                          </p>
                          {layer.result.changeCount &&
                            layer.result.changeCount > 0 && (
                              <Badge className="text-xs bg-green-900 text-green-200">
                                {layer.result.changeCount} improvements
                              </Badge>
                            )}
                          {layer.result.executionTime && (
                            <span className="text-zinc-500 text-xs">
                              {layer.result.executionTime}ms
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-3 border-t border-zinc-700">
                  <Button
                    size="sm"
                    onClick={() => runLayerAnalysis(currentCode)}
                    disabled={isAnalyzing || !currentCode.trim()}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    <Zap className="w-4 h-4 mr-2" />
                    {isAnalyzing ? "Analyzing..." : "Run Analysis"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Session Area */}
          <div className="lg:col-span-2">
            {selectedSession ? (
              <Card className="bg-zinc-900 border-zinc-800 h-full">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between text-white">
                    <div className="flex items-center gap-2">
                      <Code className="w-5 h-5" />
                      Session Workspace
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          const shareUrl = `${window.location.origin}/teams/session/${selectedSession}`;
                          navigator.clipboard.writeText(shareUrl);
                          // You could add a toast notification here
                          alert("Session link copied to clipboard!");
                        }}
                      >
                        <Share className="w-4 h-4 mr-2" />
                        Share
                      </Button>
                      <Button size="sm" variant="outline">
                        <Settings className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-zinc-950 rounded-lg p-4 min-h-[400px]">
                    <div className="flex items-center justify-between mb-4 p-2 bg-zinc-900 rounded">
                      <div className="flex items-center gap-2">
                        <Code className="w-4 h-4 text-blue-400" />
                        <span className="text-white text-sm font-medium">
                          Live Code Editor
                        </span>
                        <Badge className="bg-green-900 text-green-200 text-xs">
                          NeuroLint Active
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleCodeChange(currentCode)}
                        >
                          <Target className="w-3 h-3 mr-1" />
                          Analyze
                        </Button>
                      </div>
                    </div>
                    <textarea
                      value={currentCode}
                      onChange={(e) => handleCodeChange(e.target.value)}
                      placeholder="// Start typing your code here...
// NeuroLint will analyze in real-time with 6 layers:
// 1. Configuration validation
// 2. Entity cleanup
// 3. Component structure
// 4. Hydration patterns
// 5. Next.js optimization
// 6. Testing & quality

export default function Component() {
  return <div>Hello World</div>;
}"
                      className="w-full h-80 bg-zinc-950 text-white p-4 rounded border border-zinc-700 font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <div className="mt-4 flex items-center justify-between text-xs text-zinc-500">
                      <span>
                        {currentCode.split("\n").length} lines •{" "}
                        {currentCode.length} characters
                      </span>
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          <div className="w-2 h-2 bg-green-400 rounded-full" />
                          Real-time analysis
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {teamParticipants.length} collaborators
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="bg-zinc-900 border-zinc-800 h-full">
                <CardContent className="flex items-center justify-center min-h-[500px]">
                  <div className="text-center">
                    <div className="w-20 h-20 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Play className="w-10 h-10 text-zinc-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">
                      Start Your First Live Session
                    </h3>
                    <p className="text-zinc-400 mb-6 max-w-md">
                      Collaborate with your team in real-time. Share code, debug
                      together, and boost productivity with live coding
                      sessions.
                    </p>
                    <Button
                      className="bg-blue-600 hover:bg-blue-700"
                      onClick={() => {
                        const newSession = {
                          id: `session-${Date.now()}`,
                          name: `New Session - ${new Date().toLocaleTimeString()}`,
                          repository: "live-collaboration",
                          branch: "main",
                          participants: teamParticipants.slice(0, 1),
                          isActive: true,
                          startedAt: new Date().toISOString(),
                        };
                        setActiveSessions((prev) => [...prev, newSession]);
                        setSelectedSession(newSession.id);
                      }}
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Create New Session
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Session Controls */}
        {selectedSession && (
          <Card className="bg-zinc-900 border-zinc-800 mt-6">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Button size="sm" variant="outline">
                    <Mic className="w-4 h-4 mr-2" />
                    Mic
                  </Button>
                  <Button size="sm" variant="outline">
                    <Video className="w-4 h-4 mr-2" />
                    Video
                  </Button>
                  <Button size="sm" variant="outline">
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Chat
                  </Button>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      // Toggle session pause state
                      setActiveSessions((prev) =>
                        prev.map((session) =>
                          session.id === selectedSession
                            ? { ...session, isActive: !session.isActive }
                            : session,
                        ),
                      );
                    }}
                  >
                    <Pause className="w-4 h-4 mr-2" />
                    {activeSessions.find((s) => s.id === selectedSession)
                      ?.isActive
                      ? "Pause Session"
                      : "Resume Session"}
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => {
                      if (selectedSession) {
                        setActiveSessions((prev) =>
                          prev.filter(
                            (session) => session.id !== selectedSession,
                          ),
                        );
                        setSelectedSession(null);
                        setCurrentCode("");
                        setLayerAnalysis((prev) =>
                          prev.map((layer) => ({
                            ...layer,
                            status: "pending",
                            result: undefined,
                          })),
                        );
                      }
                    }}
                  >
                    End Session
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default LiveCodeSessions;
