import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useNavigate } from "react-router-dom";

interface APIEndpoint {
  method: string;
  path: string;
  summary: string;
  description: string;
  auth: boolean;
  enterprise?: boolean;
  parameters?: Array<{
    name: string;
    type: string;
    required: boolean;
    description: string;
  }>;
  requestBody?: {
    type: string;
    properties: Record<string, any>;
  };
  responses: Record<string, any>;
}

const API_ENDPOINTS: APIEndpoint[] = [
  {
    method: "POST",
    path: "/api/analyze",
    summary: "Analyze Code",
    description: "Submit code for advanced analysis across multiple layers",
    auth: true,
    parameters: [
      {
        name: "code",
        type: "string",
        required: true,
        description: "Source code to analyze",
      },
      {
        name: "filePath",
        type: "string",
        required: false,
        description: "Optional file path for context",
      },
      {
        name: "layers",
        type: "array",
        required: false,
        description: "Analysis layers to run (1-6)",
      },
    ],
    responses: {
      "200": "Analysis completed successfully",
      "400": "Invalid request parameters",
      "401": "Authentication required",
      "429": "Rate limit exceeded",
      "500": "Internal server error",
    },
  },
  {
    method: "POST",
    path: "/api/transform",
    summary: "Transform Code",
    description:
      "Apply advanced transformations to fix issues and improve code quality",
    auth: true,
    parameters: [
      {
        name: "code",
        type: "string",
        required: true,
        description: "Source code to transform",
      },
      {
        name: "filePath",
        type: "string",
        required: false,
        description: "Optional file path for context",
      },
      {
        name: "layers",
        type: "array",
        required: false,
        description: "Transformation layers to apply (1-6)",
      },
    ],
    responses: {
      "200": "Transformation completed successfully",
      "400": "Invalid request parameters",
      "401": "Authentication required",
      "429": "Rate limit exceeded",
      "500": "Internal server error",
    },
  },
  {
    method: "GET",
    path: "/api/layers",
    summary: "Get Available Layers",
    description:
      "Retrieve information about all available NeuroLint analysis layers",
    auth: false,
    responses: {
      "200": "Layers information retrieved successfully",
    },
  },
  {
    method: "GET",
    path: "/api/auth/usage",
    summary: "Get Usage Statistics",
    description: "Retrieve current usage statistics for authenticated user",
    auth: true,
    enterprise: true,
    responses: {
      "200": "Usage statistics retrieved successfully",
      "401": "Authentication required",
    },
  },
  {
    method: "GET",
    path: "/api/teams/{teamId}/audit",
    summary: "Team Audit Log",
    description: "Access comprehensive audit trail for team activities",
    auth: true,
    enterprise: true,
    parameters: [
      {
        name: "teamId",
        type: "string",
        required: true,
        description: "Team identifier",
      },
      {
        name: "startDate",
        type: "string",
        required: false,
        description: "Filter from date (ISO 8601)",
      },
      {
        name: "endDate",
        type: "string",
        required: false,
        description: "Filter to date (ISO 8601)",
      },
    ],
    responses: {
      "200": "Audit log retrieved successfully",
      "401": "Authentication required",
      "403": "Insufficient permissions",
    },
  },
  {
    method: "POST",
    path: "/api/enterprise/compliance/report",
    summary: "Generate Compliance Report",
    description:
      "Generate compliance reports for SOC2, GDPR, ISO27001 standards",
    auth: true,
    enterprise: true,
    parameters: [
      {
        name: "standard",
        type: "string",
        required: true,
        description: "Compliance standard (soc2, gdpr, iso27001)",
      },
      {
        name: "period",
        type: "string",
        required: true,
        description: "Reporting period (monthly, quarterly, annual)",
      },
    ],
    responses: {
      "200": "Compliance report generated successfully",
      "401": "Authentication required",
      "403": "Enterprise subscription required",
    },
  },
];

export default function APIDocumentation() {
  const navigate = useNavigate();
  const [selectedEndpoint, setSelectedEndpoint] = useState<APIEndpoint | null>(
    null,
  );

  const renderMethodBadge = (method: string) => {
    const colors = {
      GET: "bg-green-900 text-green-200 border-green-700",
      POST: "bg-blue-900 text-blue-200 border-blue-700",
      PUT: "bg-yellow-900 text-yellow-200 border-yellow-700",
      DELETE: "bg-red-900 text-red-200 border-red-700",
    };
    return (
      <Badge
        variant="outline"
        className={`${colors[method as keyof typeof colors]} font-mono text-xs`}
      >
        {method}
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <Button
              variant="outline"
              onClick={() => navigate(-1)}
              className="mb-4 border-zinc-700 text-zinc-300 hover:bg-zinc-800"
            >
              ← Back
            </Button>
            <h1 className="text-4xl font-bold text-white mb-2">
              NeuroLint API Documentation
            </h1>
            <p className="text-xl text-zinc-400">
              Enterprise-grade code analysis and transformation API
            </p>
          </div>
          <div className="text-right">
            <div className="text-sm text-zinc-500 mb-1">API Version</div>
            <div className="text-lg font-mono text-white">v1.0.0</div>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-zinc-900 border-zinc-700">
            <TabsTrigger
              value="overview"
              className="data-[state=active]:bg-zinc-800"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="authentication"
              className="data-[state=active]:bg-zinc-800"
            >
              Authentication
            </TabsTrigger>
            <TabsTrigger
              value="endpoints"
              className="data-[state=active]:bg-zinc-800"
            >
              Endpoints
            </TabsTrigger>
            <TabsTrigger
              value="enterprise"
              className="data-[state=active]:bg-zinc-800"
            >
              Enterprise
            </TabsTrigger>
            <TabsTrigger
              value="sdks"
              className="data-[state=active]:bg-zinc-800"
            >
              SDKs
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader>
                <CardTitle className="text-white">API Overview</CardTitle>
                <CardDescription className="text-zinc-400">
                  RESTful API for advanced code analysis and transformation with
                  enterprise-grade security and compliance
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-zinc-800 p-4 rounded-lg">
                    <h3 className="font-semibold text-white mb-2">Base URL</h3>
                    <code className="text-sm text-zinc-300 bg-zinc-900 p-2 rounded font-mono block">
                      https://api.neurolint.com/v1
                    </code>
                  </div>
                  <div className="bg-zinc-800 p-4 rounded-lg">
                    <h3 className="font-semibold text-white mb-2">
                      Content Type
                    </h3>
                    <code className="text-sm text-zinc-300 bg-zinc-900 p-2 rounded font-mono block">
                      application/json
                    </code>
                  </div>
                  <div className="bg-zinc-800 p-4 rounded-lg">
                    <h3 className="font-semibold text-white mb-2">
                      Rate Limits
                    </h3>
                    <div className="text-sm text-zinc-300">
                      <div>Free: 100 req/hour</div>
                      <div>Pro: 1,000 req/hour</div>
                      <div>Enterprise: Custom</div>
                    </div>
                  </div>
                </div>

                <Separator className="bg-zinc-700" />

                <div>
                  <h3 className="font-semibold text-white mb-3">
                    Key Features
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <ul className="space-y-2 text-zinc-300">
                      <li>• Multi-layer code analysis (Layers 1-6)</li>
                      <li>• Real-time code transformation</li>
                      <li>• TypeScript and JavaScript support</li>
                      <li>• React component optimization</li>
                    </ul>
                    <ul className="space-y-2 text-zinc-300">
                      <li>• Enterprise audit logging</li>
                      <li>• SOC2/GDPR/ISO27001 compliance</li>
                      <li>• Team collaboration features</li>
                      <li>• Custom rule configuration</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Authentication Tab */}
          <TabsContent value="authentication" className="space-y-6">
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader>
                <CardTitle className="text-white">
                  Authentication & Security
                </CardTitle>
                <CardDescription className="text-zinc-400">
                  Enterprise-grade security with multiple authentication methods
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-semibold text-white mb-3">
                    Authentication Methods
                  </h3>
                  <div className="space-y-4">
                    <div className="bg-zinc-800 p-4 rounded-lg">
                      <h4 className="font-medium text-white mb-2">
                        Bearer Token (Recommended)
                      </h4>
                      <p className="text-zinc-400 text-sm mb-3">
                        Use JWT tokens for secure API access
                      </p>
                      <code className="text-sm text-zinc-300 bg-zinc-900 p-3 rounded font-mono block">
                        Authorization: Bearer your_jwt_token_here
                      </code>
                    </div>
                    <div className="bg-zinc-800 p-4 rounded-lg">
                      <h4 className="font-medium text-white mb-2">API Key</h4>
                      <p className="text-zinc-400 text-sm mb-3">
                        Alternative authentication method
                      </p>
                      <code className="text-sm text-zinc-300 bg-zinc-900 p-3 rounded font-mono block">
                        X-API-Key: your_api_key_here
                      </code>
                    </div>
                  </div>
                </div>

                <Separator className="bg-zinc-700" />

                <div>
                  <h3 className="font-semibold text-white mb-3">
                    Enterprise Security Features
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                        <div>
                          <h4 className="font-medium text-white">
                            SSO Integration
                          </h4>
                          <p className="text-zinc-400 text-sm">
                            SAML 2.0, OAuth 2.0, OpenID Connect
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                        <div>
                          <h4 className="font-medium text-white">
                            Audit Logging
                          </h4>
                          <p className="text-zinc-400 text-sm">
                            Comprehensive activity tracking
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                        <div>
                          <h4 className="font-medium text-white">
                            IP Whitelisting
                          </h4>
                          <p className="text-zinc-400 text-sm">
                            Restrict access by IP ranges
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                        <div>
                          <h4 className="font-medium text-white">
                            Role-Based Access
                          </h4>
                          <p className="text-zinc-400 text-sm">
                            Granular permission control
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Endpoints Tab */}
          <TabsContent value="endpoints" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h2 className="text-2xl font-bold text-white mb-4">
                  API Endpoints
                </h2>
                <div className="space-y-3">
                  {API_ENDPOINTS.map((endpoint, index) => (
                    <Card
                      key={index}
                      className={`bg-zinc-900 border-zinc-800 cursor-pointer transition-colors hover:bg-zinc-800 ${
                        selectedEndpoint === endpoint
                          ? "ring-2 ring-zinc-600"
                          : ""
                      }`}
                      onClick={() => setSelectedEndpoint(endpoint)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {renderMethodBadge(endpoint.method)}
                            <span className="font-mono text-sm text-zinc-300">
                              {endpoint.path}
                            </span>
                          </div>
                          {endpoint.enterprise && (
                            <Badge
                              variant="outline"
                              className="bg-purple-900 text-purple-200 border-purple-700 text-xs"
                            >
                              Enterprise
                            </Badge>
                          )}
                        </div>
                        <h3 className="font-medium text-white">
                          {endpoint.summary}
                        </h3>
                        <p className="text-sm text-zinc-400 mt-1">
                          {endpoint.description}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              <div>
                {selectedEndpoint ? (
                  <Card className="bg-zinc-900 border-zinc-800 sticky top-6">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-white">
                          {selectedEndpoint.summary}
                        </CardTitle>
                        {renderMethodBadge(selectedEndpoint.method)}
                      </div>
                      <CardDescription className="text-zinc-400">
                        {selectedEndpoint.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h4 className="font-medium text-white mb-2">
                          Endpoint
                        </h4>
                        <code className="text-sm text-zinc-300 bg-zinc-800 p-2 rounded font-mono block">
                          {selectedEndpoint.method} {selectedEndpoint.path}
                        </code>
                      </div>

                      {selectedEndpoint.parameters && (
                        <div>
                          <h4 className="font-medium text-white mb-2">
                            Parameters
                          </h4>
                          <div className="space-y-2">
                            {selectedEndpoint.parameters.map((param, index) => (
                              <div
                                key={index}
                                className="bg-zinc-800 p-3 rounded"
                              >
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-mono text-sm text-zinc-300">
                                    {param.name}
                                  </span>
                                  <Badge
                                    variant="outline"
                                    className="text-xs bg-zinc-700 text-zinc-300"
                                  >
                                    {param.type}
                                  </Badge>
                                  {param.required && (
                                    <Badge
                                      variant="outline"
                                      className="text-xs bg-red-900 text-red-200 border-red-700"
                                    >
                                      Required
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-xs text-zinc-400">
                                  {param.description}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div>
                        <h4 className="font-medium text-white mb-2">
                          Response Codes
                        </h4>
                        <div className="space-y-1">
                          {Object.entries(selectedEndpoint.responses).map(
                            ([code, description]) => (
                              <div
                                key={code}
                                className="flex items-center gap-2 text-sm"
                              >
                                <Badge
                                  variant="outline"
                                  className="text-xs bg-zinc-800 text-zinc-300 font-mono"
                                >
                                  {code}
                                </Badge>
                                <span className="text-zinc-400">
                                  {description}
                                </span>
                              </div>
                            ),
                          )}
                        </div>
                      </div>

                      {selectedEndpoint.auth && (
                        <div className="bg-zinc-800 p-3 rounded">
                          <h4 className="font-medium text-white mb-1">
                            Authentication Required
                          </h4>
                          <p className="text-xs text-zinc-400">
                            This endpoint requires a valid Bearer token or API
                            key
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ) : (
                  <Card className="bg-zinc-900 border-zinc-800">
                    <CardContent className="p-8 text-center">
                      <h3 className="text-lg font-medium text-white mb-2">
                        Select an Endpoint
                      </h3>
                      <p className="text-zinc-400">
                        Click on an endpoint from the list to view detailed
                        documentation
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Enterprise Tab */}
          <TabsContent value="enterprise" className="space-y-6">
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader>
                <CardTitle className="text-white">
                  Enterprise Features
                </CardTitle>
                <CardDescription className="text-zinc-400">
                  Advanced capabilities for enterprise-scale deployments
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold text-white">
                      Compliance & Governance
                    </h3>
                    <div className="space-y-3">
                      <div className="bg-zinc-800 p-4 rounded-lg">
                        <h4 className="font-medium text-white mb-2">
                          SOC 2 Type II
                        </h4>
                        <p className="text-zinc-400 text-sm">
                          Security, availability, and confidentiality controls
                        </p>
                      </div>
                      <div className="bg-zinc-800 p-4 rounded-lg">
                        <h4 className="font-medium text-white mb-2">
                          GDPR Compliance
                        </h4>
                        <p className="text-zinc-400 text-sm">
                          Data protection and privacy regulations
                        </p>
                      </div>
                      <div className="bg-zinc-800 p-4 rounded-lg">
                        <h4 className="font-medium text-white mb-2">
                          ISO 27001
                        </h4>
                        <p className="text-zinc-400 text-sm">
                          Information security management standards
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-semibold text-white">
                      Advanced Capabilities
                    </h3>
                    <div className="space-y-3">
                      <div className="bg-zinc-800 p-4 rounded-lg">
                        <h4 className="font-medium text-white mb-2">
                          Custom Rate Limits
                        </h4>
                        <p className="text-zinc-400 text-sm">
                          Configurable API rate limiting per team/user
                        </p>
                      </div>
                      <div className="bg-zinc-800 p-4 rounded-lg">
                        <h4 className="font-medium text-white mb-2">
                          Dedicated Infrastructure
                        </h4>
                        <p className="text-zinc-400 text-sm">
                          Isolated processing environment
                        </p>
                      </div>
                      <div className="bg-zinc-800 p-4 rounded-lg">
                        <h4 className="font-medium text-white mb-2">
                          24/7 Support
                        </h4>
                        <p className="text-zinc-400 text-sm">
                          Priority support with guaranteed SLA
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <Separator className="bg-zinc-700" />

                <div>
                  <h3 className="font-semibold text-white mb-4">
                    Enterprise Endpoints
                  </h3>
                  <div className="space-y-3">
                    <div className="bg-zinc-800 p-4 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge
                          variant="outline"
                          className="bg-blue-900 text-blue-200 border-blue-700 font-mono text-xs"
                        >
                          GET
                        </Badge>
                        <code className="text-sm text-zinc-300 font-mono">
                          /api/enterprise/analytics
                        </code>
                      </div>
                      <p className="text-zinc-400 text-sm">
                        Advanced analytics and usage insights
                      </p>
                    </div>
                    <div className="bg-zinc-800 p-4 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge
                          variant="outline"
                          className="bg-blue-900 text-blue-200 border-blue-700 font-mono text-xs"
                        >
                          POST
                        </Badge>
                        <code className="text-sm text-zinc-300 font-mono">
                          /api/enterprise/webhooks
                        </code>
                      </div>
                      <p className="text-zinc-400 text-sm">
                        Configure and manage webhook integrations
                      </p>
                    </div>
                    <div className="bg-zinc-800 p-4 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge
                          variant="outline"
                          className="bg-blue-900 text-blue-200 border-blue-700 font-mono text-xs"
                        >
                          GET
                        </Badge>
                        <code className="text-sm text-zinc-300 font-mono">
                          /api/enterprise/audit/export
                        </code>
                      </div>
                      <p className="text-zinc-400 text-sm">
                        Export audit logs for compliance reporting
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* SDKs Tab */}
          <TabsContent value="sdks" className="space-y-6">
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader>
                <CardTitle className="text-white">SDKs & Integration</CardTitle>
                <CardDescription className="text-zinc-400">
                  Official SDKs and integration examples for popular platforms
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold text-white mb-4">
                      Official SDKs
                    </h3>
                    <div className="space-y-3">
                      <div className="bg-zinc-800 p-4 rounded-lg">
                        <h4 className="font-medium text-white mb-2">
                          JavaScript/TypeScript
                        </h4>
                        <code className="text-sm text-zinc-300 bg-zinc-900 p-2 rounded font-mono block mb-2">
                          npm install @neurolint/sdk
                        </code>
                        <p className="text-zinc-400 text-sm">
                          Full-featured SDK with TypeScript support
                        </p>
                      </div>
                      <div className="bg-zinc-800 p-4 rounded-lg">
                        <h4 className="font-medium text-white mb-2">Python</h4>
                        <code className="text-sm text-zinc-300 bg-zinc-900 p-2 rounded font-mono block mb-2">
                          pip install neurolint
                        </code>
                        <p className="text-zinc-400 text-sm">
                          Python client library for API integration
                        </p>
                      </div>
                      <div className="bg-zinc-800 p-4 rounded-lg">
                        <h4 className="font-medium text-white mb-2">Go</h4>
                        <code className="text-sm text-zinc-300 bg-zinc-900 p-2 rounded font-mono block mb-2">
                          go get github.com/neurolint/go-sdk
                        </code>
                        <p className="text-zinc-400 text-sm">
                          Go SDK for high-performance applications
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-white mb-4">
                      Quick Start Example
                    </h3>
                    <div className="bg-zinc-800 p-4 rounded-lg">
                      <h4 className="font-medium text-white mb-3">
                        JavaScript SDK
                      </h4>
                      <pre className="text-sm text-zinc-300 bg-zinc-900 p-3 rounded font-mono overflow-x-auto">
                        {`import { NeuroLint } from '@neurolint/sdk';

const client = new NeuroLint({
  apiKey: 'your_api_key',
  baseUrl: 'https://api.neurolint.com'
});

// Analyze code
const result = await client.analyze({
  code: 'const x = 1;',
  layers: [1, 2, 3]
});

console.log(result);`}
                      </pre>
                    </div>
                  </div>
                </div>

                <Separator className="bg-zinc-700" />

                <div>
                  <h3 className="font-semibold text-white mb-4">
                    CI/CD Integrations
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-zinc-800 p-4 rounded-lg">
                      <h4 className="font-medium text-white mb-2">
                        GitHub Actions
                      </h4>
                      <p className="text-zinc-400 text-sm mb-3">
                        Automated code analysis on pull requests
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-zinc-600 text-zinc-300 hover:bg-zinc-700"
                      >
                        View Setup
                      </Button>
                    </div>
                    <div className="bg-zinc-800 p-4 rounded-lg">
                      <h4 className="font-medium text-white mb-2">GitLab CI</h4>
                      <p className="text-zinc-400 text-sm mb-3">
                        Integration with GitLab pipelines
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-zinc-600 text-zinc-300 hover:bg-zinc-700"
                      >
                        View Setup
                      </Button>
                    </div>
                    <div className="bg-zinc-800 p-4 rounded-lg">
                      <h4 className="font-medium text-white mb-2">Jenkins</h4>
                      <p className="text-zinc-400 text-sm mb-3">
                        Plugin for Jenkins build processes
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-zinc-600 text-zinc-300 hover:bg-zinc-700"
                      >
                        View Setup
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Support Section */}
        <Card className="bg-zinc-900 border-zinc-800 mt-8">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-white mb-1">Need Help?</h3>
                <p className="text-zinc-400 text-sm">
                  Contact our enterprise support team for assistance
                </p>
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="border-zinc-600 text-zinc-300 hover:bg-zinc-700"
                >
                  Contact Support
                </Button>
                <Button className="bg-white text-black hover:bg-zinc-200">
                  Enterprise Demo
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
