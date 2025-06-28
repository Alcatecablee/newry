import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Sparkles,
  Bot,
  Wand2,
  Lightbulb,
  Target,
  Rocket,
  Star,
  Crown,
  Zap,
  Eye,
  MessageSquare,
  Code,
  Settings,
  Play,
  Pause,
  RefreshCw,
  Download,
  Upload,
  Activity,
  BarChart3,
  TrendingUp,
  Shield,
  Users,
  Globe,
  Database,
  GitBranch,
  Award,
  Mic,
  MicOff,
  Send,
  Copy,
  ChevronRight,
  Plus,
  Minus,
  Check,
  X,
  AlertCircle,
  CheckCircle,
  Clock,
  Filter,
} from "lucide-react";

interface AIAssistant {
  id: string;
  name: string;
  personality: "expert" | "creative" | "mentor" | "optimizer" | "security";
  specialization: string[];
  avatar: string;
  status: "active" | "training" | "offline";
  confidence: number;
  successRate: number;
  totalSuggestions: number;
  learningProgress: number;
}

interface AICapability {
  id: string;
  name: string;
  description: string;
  category:
    | "code-generation"
    | "optimization"
    | "security"
    | "testing"
    | "documentation";
  maturity: "experimental" | "beta" | "stable" | "enterprise";
  enabled: boolean;
  usage: number;
  accuracy: number;
  features: string[];
}

interface ConversationMessage {
  id: string;
  type: "user" | "assistant" | "system";
  content: string;
  timestamp: string;
  assistantId?: string;
  codeBlocks?: CodeBlock[];
  suggestions?: AISuggestion[];
  confidence?: number;
}

interface CodeBlock {
  language: string;
  code: string;
  explanation: string;
  fileName?: string;
}

interface AISuggestion {
  id: string;
  type: "fix" | "optimization" | "security" | "best-practice" | "refactor";
  title: string;
  description: string;
  impact: "low" | "medium" | "high";
  confidence: number;
  codeChange: {
    before: string;
    after: string;
    explanation: string;
  };
  reasoning: string;
  tags: string[];
}

interface ModelMetrics {
  name: string;
  version: string;
  accuracy: number;
  latency: number;
  throughput: number;
  memoryUsage: number;
  trainingData: string;
  lastUpdate: string;
}

const AdvancedAI = () => {
  const [selectedAssistant, setSelectedAssistant] =
    useState<string>("ai-expert");
  const [conversationMode, setConversationMode] = useState(true);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [currentMessage, setCurrentMessage] = useState("");

  // Mock data - would come from AI service API
  const aiAssistants: AIAssistant[] = [
    {
      id: "ai-expert",
      name: "CodeSage",
      personality: "expert",
      specialization: ["Architecture", "Performance", "Best Practices"],
      avatar: "🧙‍♂️",
      status: "active",
      confidence: 94,
      successRate: 89,
      totalSuggestions: 2847,
      learningProgress: 87,
    },
    {
      id: "ai-creative",
      name: "InnovateAI",
      personality: "creative",
      specialization: ["UI/UX", "Creative Solutions", "Innovation"],
      avatar: "🎨",
      status: "active",
      confidence: 87,
      successRate: 82,
      totalSuggestions: 1923,
      learningProgress: 79,
    },
    {
      id: "ai-security",
      name: "SecureBot",
      personality: "security",
      specialization: ["Security", "Vulnerabilities", "Compliance"],
      avatar: "🛡️",
      status: "training",
      confidence: 91,
      successRate: 95,
      totalSuggestions: 1456,
      learningProgress: 92,
    },
    {
      id: "ai-mentor",
      name: "MentorAI",
      personality: "mentor",
      specialization: ["Teaching", "Code Review", "Team Development"],
      avatar: "👨‍🏫",
      status: "active",
      confidence: 88,
      successRate: 91,
      totalSuggestions: 3201,
      learningProgress: 85,
    },
  ];

  const aiCapabilities: AICapability[] = [
    {
      id: "smart-refactoring",
      name: "Smart Refactoring",
      description:
        "AI-powered code refactoring with pattern recognition and optimization suggestions",
      category: "optimization",
      maturity: "stable",
      enabled: true,
      usage: 89,
      accuracy: 94,
      features: [
        "Pattern Recognition",
        "Performance Optimization",
        "Code Simplification",
      ],
    },
    {
      id: "vulnerability-detection",
      name: "Advanced Vulnerability Detection",
      description:
        "Deep learning models for identifying security vulnerabilities and attack vectors",
      category: "security",
      maturity: "enterprise",
      enabled: true,
      usage: 76,
      accuracy: 97,
      features: ["OWASP Top 10", "Custom Patterns", "Zero-day Detection"],
    },
    {
      id: "test-generation",
      name: "Intelligent Test Generation",
      description:
        "Automatic test case generation based on code analysis and usage patterns",
      category: "testing",
      maturity: "beta",
      enabled: false,
      usage: 45,
      accuracy: 78,
      features: ["Unit Tests", "Integration Tests", "Edge Case Detection"],
    },
    {
      id: "code-completion",
      name: "Context-Aware Code Completion",
      description:
        "Advanced code completion using team patterns and project context",
      category: "code-generation",
      maturity: "stable",
      enabled: true,
      usage: 95,
      accuracy: 91,
      features: ["Team Patterns", "Project Context", "Multi-language Support"],
    },
    {
      id: "documentation-ai",
      name: "Smart Documentation",
      description: "Automatic documentation generation and maintenance",
      category: "documentation",
      maturity: "experimental",
      enabled: false,
      usage: 23,
      accuracy: 73,
      features: ["API Docs", "Code Comments", "Architecture Diagrams"],
    },
  ];

  const conversation: ConversationMessage[] = [
    {
      id: "1",
      type: "user",
      content:
        "Can you help me optimize this React component for better performance?",
      timestamp: "2024-01-20T14:30:00Z",
    },
    {
      id: "2",
      type: "assistant",
      content:
        "I'd be happy to help optimize your React component! I can see several opportunities for improvement. Let me analyze the code and provide specific suggestions.",
      timestamp: "2024-01-20T14:30:15Z",
      assistantId: "ai-expert",
      confidence: 94,
      codeBlocks: [
        {
          language: "typescript",
          code: `const OptimizedComponent = React.memo(({ data, onUpdate }) => {
  const memoizedData = useMemo(() =>
    data.filter(item => item.active), [data]
  );

  const handleUpdate = useCallback((id, newValue) => {
    onUpdate(id, newValue);
  }, [onUpdate]);

  return (
    <div>
      {memoizedData.map(item => (
        <Item
          key={item.id}
          data={item}
          onUpdate={handleUpdate}
        />
      ))}
    </div>
  );
});`,
          explanation:
            "This optimized version uses React.memo, useMemo, and useCallback to prevent unnecessary re-renders",
          fileName: "OptimizedComponent.tsx",
        },
      ],
      suggestions: [
        {
          id: "opt-1",
          type: "optimization",
          title: "Add React.memo wrapper",
          description:
            "Prevent unnecessary re-renders when props haven't changed",
          impact: "high",
          confidence: 94,
          codeChange: {
            before: "const MyComponent = ({ data, onUpdate }) => {",
            after: "const MyComponent = React.memo(({ data, onUpdate }) => {",
            explanation:
              "React.memo will shallow compare props and skip re-renders when they're the same",
          },
          reasoning: "Component re-renders frequently due to parent updates",
          tags: ["performance", "react", "memoization"],
        },
      ],
    },
    {
      id: "3",
      type: "user",
      content:
        "That looks great! Can you also check for any potential security issues?",
      timestamp: "2024-01-20T14:32:00Z",
    },
    {
      id: "4",
      type: "assistant",
      content:
        "Excellent question! Security is crucial. Let me analyze the code for potential vulnerabilities...",
      timestamp: "2024-01-20T14:32:10Z",
      assistantId: "ai-security",
      confidence: 91,
    },
  ];

  const modelMetrics: ModelMetrics[] = [
    {
      name: "CodeSage-v2.1",
      version: "2.1.0",
      accuracy: 94.2,
      latency: 245,
      throughput: 1200,
      memoryUsage: 2.3,
      trainingData: "50M+ code samples",
      lastUpdate: "2024-01-15",
    },
    {
      name: "SecureBot-v1.8",
      version: "1.8.3",
      accuracy: 97.1,
      latency: 180,
      throughput: 800,
      memoryUsage: 1.8,
      trainingData: "25M+ vulnerability patterns",
      lastUpdate: "2024-01-18",
    },
    {
      name: "TestGen-v0.9",
      version: "0.9.2",
      accuracy: 78.4,
      latency: 320,
      throughput: 600,
      memoryUsage: 3.1,
      trainingData: "15M+ test cases",
      lastUpdate: "2024-01-12",
    },
  ];

  const getMaturityColor = (maturity: string) => {
    switch (maturity) {
      case "experimental":
        return "bg-red-900 text-red-200";
      case "beta":
        return "bg-yellow-900 text-yellow-200";
      case "stable":
        return "bg-green-900 text-green-200";
      case "enterprise":
        return "bg-purple-900 text-purple-200";
      default:
        return "bg-gray-700 text-gray-200";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-900 text-green-200";
      case "training":
        return "bg-blue-900 text-blue-200";
      case "offline":
        return "bg-gray-700 text-gray-200";
      default:
        return "bg-gray-700 text-gray-200";
    }
  };

  const handleSendMessage = () => {
    if (!currentMessage.trim()) return;

    // In a real app, this would send to AI service
    console.log("Sending message:", currentMessage);
    setCurrentMessage("");
  };

  return (
    <div className="min-h-screen bg-black p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <img
                src="https://cdn.builder.io/api/v1/image/assets%2Faab978f39ff64270b6e29ab49582f574%2F38b5bfac1a6242ebb67f91834016d010?format=webp&width=800"
                alt="Logo"
                className="w-8 h-8"
              />
              <div>
                <h1 className="text-3xl font-bold text-white">
                  Advanced AI Platform
                </h1>
                <p className="text-zinc-400">
                  Next-generation development assistance platform
                </p>
              </div>
            </div>
            <Badge className="bg-zinc-900 text-zinc-200 flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              Advanced
            </Badge>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm">
              <Settings className="w-4 h-4 mr-2" />
              AI Settings
            </Button>
            <Button variant="primary" size="sm">
              <Rocket className="w-4 h-4 mr-2" />
              Train Model
            </Button>
          </div>
        </div>

        {/* AI Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-zinc-400 text-sm">Active AI Models</p>
                  <p className="text-3xl font-bold text-white">
                    {modelMetrics.length}
                  </p>
                </div>
                <Bot className="w-8 h-8 text-blue-400" />
              </div>
              <p className="text-xs text-green-400 mt-2">
                All systems operational
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-zinc-400 text-sm">Avg Accuracy</p>
                  <p className="text-3xl font-bold text-green-400">91.2%</p>
                </div>
                <Target className="w-8 h-8 text-green-400" />
              </div>
              <p className="text-xs text-green-400 mt-2">+2.1% this month</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-zinc-400 text-sm">Suggestions Made</p>
                  <p className="text-3xl font-bold text-white">9.4K</p>
                </div>
                <Lightbulb className="w-8 h-8 text-yellow-400" />
              </div>
              <p className="text-xs text-blue-400 mt-2">This week</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-zinc-400 text-sm">Success Rate</p>
                  <p className="text-3xl font-bold text-purple-400">89.7%</p>
                </div>
                <Award className="w-8 h-8 text-purple-400" />
              </div>
              <p className="text-xs text-purple-400 mt-2">Above target</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="conversation" className="space-y-6">
          <TabsList className="bg-zinc-900 border-zinc-800er">
            <TabsTrigger
              value="conversation"
              className="data-[state=active]:bg-white data-[state=active]:text-black"
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              AI Conversation
            </TabsTrigger>
            <TabsTrigger
              value="assistants"
              className="data-[state=active]:bg-white data-[state=active]:text-black"
            >
              <Bot className="w-4 h-4 mr-2" />
              AI Assistants
            </TabsTrigger>
            <TabsTrigger
              value="capabilities"
              className="data-[state=active]:bg-white data-[state=active]:text-black"
            >
              <Wand2 className="w-4 h-4 mr-2" />
              Capabilities
            </TabsTrigger>
            <TabsTrigger
              value="models"
              className="data-[state=active]:bg-white data-[state=active]:text-black"
            >
              <img
                src="https://cdn.builder.io/api/v1/image/assets%2Faab978f39ff64270b6e29ab49582f574%2F38b5bfac1a6242ebb67f91834016d010?format=webp&width=800"
                alt="Logo"
                className="w-4 h-4 mr-2"
              />
              Model Performance
            </TabsTrigger>
            <TabsTrigger
              value="training"
              className="data-[state=active]:bg-white data-[state=active]:text-black"
            >
              <Zap className="w-4 h-4 mr-2" />
              Training Center
            </TabsTrigger>
          </TabsList>

          <TabsContent value="conversation" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Chat Interface */}
              <Card className="lg:col-span-3">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="w-5 h-5" />
                      AI Assistant Conversation
                    </div>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="ghost">
                        {voiceEnabled ? (
                          <Mic className="w-4 h-4" />
                        ) : (
                          <MicOff className="w-4 h-4" />
                        )}
                      </Button>
                      <Badge className="bg-blue-900 text-blue-200">Live</Badge>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 max-h-96 overflow-y-auto mb-4">
                    {conversation.map((message) => (
                      <div
                        key={message.id}
                        className={`flex items-start gap-3 ${
                          message.type === "user" ? "flex-row-reverse" : ""
                        }`}
                      >
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            message.type === "user"
                              ? "bg-blue-500"
                              : "bg-purple-500"
                          }`}
                        >
                          {message.type === "user"
                            ? "👤"
                            : message.assistantId
                              ? aiAssistants.find(
                                  (a) => a.id === message.assistantId,
                                )?.avatar || "🤖"
                              : "🤖"}
                        </div>
                        <div
                          className={`flex-1 max-w-lg ${message.type === "user" ? "text-right" : ""}`}
                        >
                          <div
                            className={`p-3 rounded-lg ${
                              message.type === "user"
                                ? "bg-blue-900/30 border border-blue-400/30"
                                : "bg-purple-900/30 border border-purple-400/30"
                            }`}
                          >
                            <p className="text-white text-sm">
                              {message.content}
                            </p>
                            {message.confidence && (
                              <div className="flex items-center gap-1 mt-2">
                                <span className="text-xs text-zinc-400">
                                  Confidence:
                                </span>
                                <span className="text-xs text-purple-300">
                                  {message.confidence}%
                                </span>
                              </div>
                            )}
                          </div>

                          {message.codeBlocks &&
                            message.codeBlocks.map((block, index) => (
                              <div
                                key={index}
                                className="mt-3 p-3 bg-zinc-950 rounded-lg border border-zinc-800"
                              >
                                <div className="flex items-center justify-between mb-2">
                                  <Badge className="bg-zinc-900 text-zinc-400 text-xs">
                                    {block.language}
                                  </Badge>
                                  <Button size="sm" variant="ghost">
                                    <Copy className="w-3 h-3" />
                                  </Button>
                                </div>
                                <pre className="text-sm text-white overflow-x-auto">
                                  <code>{block.code}</code>
                                </pre>
                                {block.explanation && (
                                  <p className="text-xs text-zinc-400 mt-2">
                                    {block.explanation}
                                  </p>
                                )}
                              </div>
                            ))}

                          {message.suggestions && (
                            <div className="mt-3 space-y-2">
                              {message.suggestions.map((suggestion) => (
                                <div
                                  key={suggestion.id}
                                  className="p-3 bg-zinc-900 rounded-lg border border-zinc-800er"
                                >
                                  <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                      <Badge className="bg-zinc-900 text-white text-xs">
                                        {suggestion.type}
                                      </Badge>
                                      <Badge
                                        className={`text-xs ${
                                          suggestion.impact === "high"
                                            ? "bg-red-900 text-red-200"
                                            : suggestion.impact === "medium"
                                              ? "bg-yellow-900 text-yellow-200"
                                              : "bg-green-900 text-green-200"
                                        }`}
                                      >
                                        {suggestion.impact} impact
                                      </Badge>
                                    </div>
                                    <span className="text-xs text-zinc-400">
                                      {suggestion.confidence}%
                                    </span>
                                  </div>
                                  <p className="text-white text-sm font-medium mb-1">
                                    {suggestion.title}
                                  </p>
                                  <p className="text-zinc-400 text-xs">
                                    {suggestion.description}
                                  </p>
                                  <div className="flex items-center gap-2 mt-2">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="h-6 px-2"
                                    >
                                      <Check className="w-3 h-3 mr-1" />
                                      Apply
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="h-6 px-2"
                                    >
                                      <Eye className="w-3 h-3 mr-1" />
                                      Preview
                                    </Button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}

                          <p className="text-xs text-zinc-400 mt-2">
                            {new Date(message.timestamp).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Message Input */}
                  <div className="flex items-center gap-2">
                    <Input
                      value={currentMessage}
                      onChange={(e) => setCurrentMessage(e.target.value)}
                      placeholder="Ask the AI assistant anything about your code..."
                      className="bg-zinc-900 border-zinc-800 text-white"
                      onKeyPress={(e) =>
                        e.key === "Enter" && handleSendMessage()
                      }
                    />
                    <Button
                      onClick={handleSendMessage}
                      disabled={!currentMessage.trim()}
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Assistant Selector */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Select Assistant</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {aiAssistants.map((assistant) => (
                      <div
                        key={assistant.id}
                        className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                          selectedAssistant === assistant.id
                            ? "border-purple-400 bg-purple-900/20"
                            : "border-zinc-800 bg-zinc-900 hover:bg-zinc-900"
                        }`}
                        onClick={() => setSelectedAssistant(assistant.id)}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xl">{assistant.avatar}</span>
                          <div>
                            <p className="text-white font-medium text-sm">
                              {assistant.name}
                            </p>
                            <Badge className={getStatusColor(assistant.status)}>
                              {assistant.status}
                            </Badge>
                          </div>
                        </div>
                        <div className="space-y-1 text-xs">
                          <div className="flex justify-between">
                            <span className="text-zinc-400">Confidence</span>
                            <span className="text-white">
                              {assistant.confidence}%
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-zinc-400">Success Rate</span>
                            <span className="text-white">
                              {assistant.successRate}%
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="assistants" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {aiAssistants.map((assistant) => (
                <Card key={assistant.id}>
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{assistant.avatar}</span>
                      <div>
                        <CardTitle className="text-lg">
                          {assistant.name}
                        </CardTitle>
                        <Badge className={getStatusColor(assistant.status)}>
                          {assistant.status}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <p className="text-zinc-400 text-sm">Specialization:</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {assistant.specialization.map((spec) => (
                            <Badge
                              key={spec}
                              className="bg-zinc-900 text-zinc-400 text-xs"
                            >
                              {spec}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-zinc-400">Confidence</span>
                          <span className="text-white">
                            {assistant.confidence}%
                          </span>
                        </div>
                        <div className="w-full bg-zinc-900 h-2 rounded-full">
                          <div
                            className="bg-blue-400 h-2 rounded-full"
                            style={{ width: `${assistant.confidence}%` }}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-zinc-400">
                            Learning Progress
                          </span>
                          <span className="text-white">
                            {assistant.learningProgress}%
                          </span>
                        </div>
                        <div className="w-full bg-zinc-900 h-2 rounded-full">
                          <div
                            className="bg-purple-400 h-2 rounded-full"
                            style={{ width: `${assistant.learningProgress}%` }}
                          />
                        </div>
                      </div>

                      <div className="text-sm">
                        <p className="text-zinc-400">
                          Total Suggestions:{" "}
                          <span className="text-white">
                            {assistant.totalSuggestions}
                          </span>
                        </p>
                        <p className="text-zinc-400">
                          Success Rate:{" "}
                          <span className="text-white">
                            {assistant.successRate}%
                          </span>
                        </p>
                      </div>

                      <Button className="w-full" size="sm">
                        <Settings className="w-3 h-3 mr-1" />
                        Configure
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="capabilities" className="space-y-6">
            <div className="space-y-6">
              {aiCapabilities.map((capability) => (
                <Card key={capability.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-white font-semibold text-lg">
                            {capability.name}
                          </h3>
                          <Badge
                            className={getMaturityColor(capability.maturity)}
                          >
                            {capability.maturity}
                          </Badge>
                          <Badge className="bg-zinc-900 text-zinc-400 capitalize">
                            {capability.category}
                          </Badge>
                        </div>
                        <p className="text-zinc-400 mb-4">
                          {capability.description}
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          <div>
                            <p className="text-zinc-400 text-sm">Usage</p>
                            <div className="flex items-center gap-2">
                              <div className="w-16 bg-zinc-900 h-2 rounded-full">
                                <div
                                  className="bg-blue-400 h-2 rounded-full"
                                  style={{ width: `${capability.usage}%` }}
                                />
                              </div>
                              <span className="text-white text-sm">
                                {capability.usage}%
                              </span>
                            </div>
                          </div>
                          <div>
                            <p className="text-zinc-400 text-sm">Accuracy</p>
                            <div className="flex items-center gap-2">
                              <div className="w-16 bg-zinc-900 h-2 rounded-full">
                                <div
                                  className="bg-green-400 h-2 rounded-full"
                                  style={{ width: `${capability.accuracy}%` }}
                                />
                              </div>
                              <span className="text-white text-sm">
                                {capability.accuracy}%
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center">
                            <Button
                              size="sm"
                              variant={
                                capability.enabled ? "primary" : "outline"
                              }
                            >
                              {capability.enabled ? "Enabled" : "Disabled"}
                            </Button>
                          </div>
                        </div>

                        <div>
                          <p className="text-zinc-400 text-sm mb-2">
                            Features:
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {capability.features.map((feature) => (
                              <Badge
                                key={feature}
                                className="bg-zinc-900 text-white text-xs"
                              >
                                {feature}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="ml-6">
                        <Button size="sm" variant="outline">
                          <Settings className="w-3 h-3 mr-1" />
                          Configure
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="models" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {modelMetrics.map((model) => (
                <Card key={model.name}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{model.name}</span>
                      <Badge className="bg-green-900 text-green-200">
                        v{model.version}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-zinc-400">Accuracy</span>
                          <span className="text-white">{model.accuracy}%</span>
                        </div>
                        <div className="w-full bg-zinc-900 h-2 rounded-full">
                          <div
                            className="bg-green-400 h-2 rounded-full"
                            style={{ width: `${model.accuracy}%` }}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-zinc-400">Latency</span>
                          <div className="text-white">{model.latency}ms</div>
                        </div>
                        <div>
                          <span className="text-zinc-400">Throughput</span>
                          <div className="text-white">
                            {model.throughput}/min
                          </div>
                        </div>
                        <div>
                          <span className="text-zinc-400">Memory</span>
                          <div className="text-white">
                            {model.memoryUsage}GB
                          </div>
                        </div>
                        <div>
                          <span className="text-zinc-400">Training Data</span>
                          <div className="text-white">{model.trainingData}</div>
                        </div>
                      </div>

                      <div>
                        <span className="text-zinc-400 text-sm">
                          Last Updated:
                        </span>
                        <div className="text-white text-sm">
                          {model.lastUpdate}
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="flex-1">
                          <RefreshCw className="w-3 h-3 mr-1" />
                          Retrain
                        </Button>
                        <Button size="sm" variant="ghost">
                          <Eye className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="training" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-yellow-400" />
                    Training Pipeline
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      {
                        stage: "Data Collection",
                        status: "completed",
                        progress: 100,
                      },
                      {
                        stage: "Data Preprocessing",
                        status: "completed",
                        progress: 100,
                      },
                      {
                        stage: "Model Training",
                        status: "in-progress",
                        progress: 67,
                      },
                      { stage: "Validation", status: "pending", progress: 0 },
                      { stage: "Deployment", status: "pending", progress: 0 },
                    ].map((stage, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-zinc-900 rounded"
                      >
                        <span className="text-white">{stage.stage}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-20 bg-zinc-900 h-2 rounded-full">
                            <div
                              className={`h-2 rounded-full ${
                                stage.status === "completed"
                                  ? "bg-green-400"
                                  : stage.status === "in-progress"
                                    ? "bg-blue-400"
                                    : "bg-gray-400"
                              }`}
                              style={{ width: `${stage.progress}%` }}
                            />
                          </div>
                          <Badge
                            className={
                              stage.status === "completed"
                                ? "bg-green-900 text-green-200"
                                : stage.status === "in-progress"
                                  ? "bg-blue-900 text-blue-200"
                                  : "bg-gray-700 text-gray-200"
                            }
                          >
                            {stage.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-blue-400" />
                    Training Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-3 bg-zinc-900 rounded">
                      <div className="flex justify-between items-center">
                        <span className="text-white">Training Loss</span>
                        <span className="text-green-400">0.0234</span>
                      </div>
                      <div className="text-xs text-zinc-400">Decreasing ↓</div>
                    </div>

                    <div className="p-3 bg-zinc-900 rounded">
                      <div className="flex justify-between items-center">
                        <span className="text-white">Validation Accuracy</span>
                        <span className="text-blue-400">94.2%</span>
                      </div>
                      <div className="text-xs text-zinc-400">Improving ↑</div>
                    </div>

                    <div className="p-3 bg-zinc-900 rounded">
                      <div className="flex justify-between items-center">
                        <span className="text-white">Training Samples</span>
                        <span className="text-white">2.3M</span>
                      </div>
                      <div className="text-xs text-zinc-400">Current batch</div>
                    </div>

                    <div className="p-3 bg-zinc-900 rounded">
                      <div className="flex justify-between items-center">
                        <span className="text-white">ETA Completion</span>
                        <span className="text-yellow-400">2.5 hours</span>
                      </div>
                      <div className="text-xs text-zinc-400">Estimated</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdvancedAI;
