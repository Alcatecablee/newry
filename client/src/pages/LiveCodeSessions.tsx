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
  Play,
  Pause,
  Mic,
  MicOff,
  Video,
  VideoOff,
  Share,
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

interface SessionSettings {
  maxParticipants: number;
  allowGuestAccess: boolean;
  analysisDelay: number;
  autoSave: boolean;
}

const LiveCodeSessions = () => {
  const [selectedTeamId, setSelectedTeamId] = useState<string>("");
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
  const [micEnabled, setMicEnabled] = useState(false);
  const [videoEnabled, setVideoEnabled] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [autoAnalysis, setAutoAnalysis] = useState(true);
  const [sessionSettings, setSessionSettings] = useState<SessionSettings>({
    maxParticipants: 10,
    allowGuestAccess: false,
    analysisDelay: 1000,
    autoSave: true,
  });

  // Fetch teams data
  const { data: teams, isLoading: teamsLoading } = useTeams();
  const { data: teamData, isLoading: teamLoading } = useTeam(selectedTeamId);

  // Auto-select first team when teams are loaded
  useEffect(() => {
    if (teams && teams.length > 0 && !selectedTeamId) {
      setSelectedTeamId(teams[0].id);
    }
  }, [teams, selectedTeamId]);

  // Convert team members to participants
  const teamParticipants: Participant[] =
    teamData?.members?.map((member) => ({
      id: member.id,
      name: member.userId,
      role: member.role === "owner" ? "host" : "collaborator",
      isOnline: false,
      micStatus: "off",
      videoStatus: "off",
    })) || [];

  // Enhanced real-time analysis with error handling
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    if (autoAnalysis && currentCode.trim() && selectedSession) {
      timeoutId = setTimeout(() => {
        runLayerAnalysis(currentCode);
      }, sessionSettings.analysisDelay);
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [
    currentCode,
    autoAnalysis,
    sessionSettings.analysisDelay,
    selectedSession,
  ]);

  // Real-time NeuroLint analysis with error boundaries
  const runLayerAnalysis = async (code: string) => {
    if (!code.trim()) return;

    setIsAnalyzing(true);
    setLayerAnalysis((prev) =>
      prev.map((layer) => ({ ...layer, status: "running" as const })),
    );

    try {
      const { transformed, layers } = await NeuroLintOrchestrator(
        code,
        "live-session",
        true,
        [1, 2, 3, 4, 5, 6],
      );

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

  const processCodeWithNeuroLint = async (code: string) => {
    try {
      const { transformed, layers } = await NeuroLintOrchestrator.processCode(
        code,
        "session.tsx",
        true,
        [1, 2, 3, 4],
      );

      const results = layers.map((r: any) => ({
        layer: r.name,
        success: r.success,
        changes: r.changeCount || 0,
      }));

      return {
        transformedCode: transformed,
        results,
      };
    } catch (error) {
      console.error("NeuroLint processing failed:", error);
      return {
        transformedCode: code,
        results: [],
      };
    }
  };

  // Enhanced session creation with validation
  const createSession = (sessionData: Partial<LiveSession>) => {
    try {
      if (activeSessions.length >= sessionSettings.maxParticipants) {
        alert(`Maximum ${sessionSettings.maxParticipants} sessions allowed`);
        return;
      }

      const newSession: LiveSession = {
        id: `session-${Date.now()}`,
        name:
          sessionData.name || `Session - ${new Date().toLocaleTimeString()}`,
        repository: sessionData.repository || "live-collaboration",
        branch: sessionData.branch || "main",
        participants: teamParticipants.slice(
          0,
          Math.min(3, sessionSettings.maxParticipants),
        ),
        isActive: true,
        startedAt: new Date().toISOString(),
        currentCode: sessionData.currentCode || "",
      };

      setActiveSessions((prev) => [...prev, newSession]);
      setSelectedSession(newSession.id);

      if (newSession.currentCode) {
        setCurrentCode(newSession.currentCode);
      }
    } catch (error) {
      console.error("Failed to create session:", error);
      alert("Failed to create session. Please try again.");
    }
  };

  // Handle code changes with session persistence
  const handleCodeChange = (newCode: string) => {
    setCurrentCode(newCode);

    if (sessionSettings.autoSave && selectedSession) {
      setActiveSessions((prev) =>
        prev.map((session) =>
          session.id === selectedSession
            ? { ...session, currentCode: newCode }
            : session,
        ),
      );
    }
  };

  // Show loading state
  if (teamsLoading || teamLoading) {
    return (
      <div className="min-h-screen bg-black p-6 flex items-center justify-center">
        <div className="text-white text-lg">Loading live sessions...</div>
      </div>
    );
  }

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
                Collaborate in real-time with NeuroLint integration
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
              className="bg-white text-black hover:bg-zinc-200"
              onClick={() =>
                createSession({
                  name: `Team Session - ${new Date().toLocaleTimeString()}`,
                })
              }
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
                  Active Sessions ({activeSessions.length})
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
                      Start a new session to collaborate
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {activeSessions.map((session) => (
                      <div
                        key={session.id}
                        className={`p-3 rounded-lg border cursor-pointer transition-all ${
                          selectedSession === session.id
                            ? "bg-zinc-700 border-white"
                            : "bg-zinc-800 border-zinc-700 hover:bg-zinc-750"
                        }`}
                        onClick={() => setSelectedSession(session.id)}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-white font-medium text-sm">
                            {session.name}
                          </span>
                          <Badge
                            className={
                              session.isActive
                                ? "bg-zinc-900 text-zinc-200"
                                : "bg-zinc-900 text-zinc-200"
                            }
                          >
                            {session.isActive ? "Live" : "Paused"}
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
                            className={`w-2 h-2 rounded-full ${participant.isOnline ? "bg-green-400" : "bg-zinc-600"}`}
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
                  <Layers className="w-5 h-5 text-white" />
                  NeuroLint Analysis
                  {isAnalyzing && (
                    <Badge className="bg-zinc-800 text-white animate-pulse">
                      Running
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {layerAnalysis.map((layer) => (
                    <div
                      key={layer.layerId}
                      className="p-3 bg-zinc-800 rounded-lg border-l-4"
                      style={{
                        borderLeftColor:
                          layer.status === "success"
                            ? "#10b981"
                            : layer.status === "error"
                              ? "#ef4444"
                              : layer.status === "running"
                                ? "#ffffff"
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
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
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
                <div className="mt-4 pt-3 border-t border-zinc-700 space-y-2">
                  <Button
                    size="sm"
                    onClick={() => runLayerAnalysis(currentCode)}
                    disabled={isAnalyzing || !currentCode.trim()}
                    className="w-full bg-white text-black hover:bg-zinc-200"
                  >
                    <Zap className="w-4 h-4 mr-2" />
                    {isAnalyzing ? "Analyzing..." : "Run Analysis"}
                  </Button>
                  <div className="flex items-center gap-2 text-xs">
                    <input
                      type="checkbox"
                      checked={autoAnalysis}
                      onChange={(e) => setAutoAnalysis(e.target.checked)}
                      className="w-3 h-3"
                    />
                    <label className="text-zinc-400">Auto-run analysis</label>
                  </div>
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
                          alert("Session link copied to clipboard!");
                        }}
                      >
                        <Share className="w-4 h-4 mr-2" />
                        Share
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSettingsOpen(true)}
                      >
                        <Settings className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-zinc-950 rounded-lg p-4 min-h-[400px]">
                    <div className="flex items-center justify-between mb-4 p-2 bg-zinc-900 rounded">
                      <div className="flex items-center gap-2">
                        <Code className="w-4 h-4 text-white" />
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
                          onClick={() => runLayerAnalysis(currentCode)}
                          disabled={isAnalyzing || !currentCode.trim()}
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
                      className="w-full h-80 bg-zinc-950 text-white p-4 rounded border border-zinc-700 font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-white"
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
                      className="bg-white text-black hover:bg-zinc-200"
                      onClick={() =>
                        createSession({
                          name: `New Session - ${new Date().toLocaleTimeString()}`,
                        })
                      }
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
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setMicEnabled(!micEnabled)}
                    className={
                      micEnabled ? "bg-green-900 border-green-700" : ""
                    }
                  >
                    {micEnabled ? (
                      <Mic className="w-4 h-4 mr-2" />
                    ) : (
                      <MicOff className="w-4 h-4 mr-2" />
                    )}
                    {micEnabled ? "Mic On" : "Mic Off"}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setVideoEnabled(!videoEnabled)}
                    className={
                      videoEnabled ? "bg-green-900 border-green-700" : ""
                    }
                  >
                    {videoEnabled ? (
                      <Video className="w-4 h-4 mr-2" />
                    ) : (
                      <VideoOff className="w-4 h-4 mr-2" />
                    )}
                    {videoEnabled ? "Video On" : "Video Off"}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setChatOpen(!chatOpen)}
                    className={chatOpen ? "bg-zinc-700 border-zinc-600" : ""}
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    {chatOpen ? "Hide Chat" : "Show Chat"}
                  </Button>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
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

        {/* Settings Modal */}
        {settingsOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="bg-zinc-900 border-zinc-800 max-w-md w-full mx-4">
              <CardHeader>
                <CardTitle className="text-white">Session Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-white text-sm font-medium">
                    Max Participants
                  </label>
                  <input
                    type="number"
                    value={sessionSettings.maxParticipants}
                    onChange={(e) =>
                      setSessionSettings((prev) => ({
                        ...prev,
                        maxParticipants: parseInt(e.target.value) || 10,
                      }))
                    }
                    className="w-full mt-1 p-2 bg-zinc-800 text-white rounded border border-zinc-600"
                    min="1"
                    max="50"
                  />
                </div>
                <div>
                  <label className="text-white text-sm font-medium">
                    Analysis Delay (ms)
                  </label>
                  <input
                    type="number"
                    value={sessionSettings.analysisDelay}
                    onChange={(e) =>
                      setSessionSettings((prev) => ({
                        ...prev,
                        analysisDelay: parseInt(e.target.value) || 1000,
                      }))
                    }
                    className="w-full mt-1 p-2 bg-zinc-800 text-white rounded border border-zinc-600"
                    min="100"
                    max="5000"
                    step="100"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={sessionSettings.autoSave}
                    onChange={(e) =>
                      setSessionSettings((prev) => ({
                        ...prev,
                        autoSave: e.target.checked,
                      }))
                    }
                    className="w-4 h-4"
                  />
                  <label className="text-white text-sm">
                    Auto-save code to session
                  </label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={autoAnalysis}
                    onChange={(e) => setAutoAnalysis(e.target.checked)}
                    className="w-4 h-4"
                  />
                  <label className="text-white text-sm">
                    Auto-run NeuroLint analysis
                  </label>
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setSettingsOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button onClick={() => setSettingsOpen(false)}>
                    Save Settings
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default LiveCodeSessions;
