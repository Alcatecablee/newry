#!/usr/bin/env node

/**
 * Development Mock Server for Testing Enterprise CLI
 *
 * This mock server provides realistic API responses for testing
 * all enterprise CLI features without requiring the full backend.
 */

const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.MOCK_PORT || 3001;

app.use(cors());
app.use(express.json());

// Middleware to check auth
const checkAuth = (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Authentication required" });
  }
  next();
};

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// Teams API
app.get("/api/teams", checkAuth, (req, res) => {
  res.json([
    {
      id: "team-123",
      name: "Development Team",
      members: [
        {
          id: "user-1",
          email: "dev@company.com",
          role: "admin",
          status: "active",
          lastActivity: "2024-01-15T10:00:00Z",
        },
        {
          id: "user-2",
          email: "john@company.com",
          role: "member",
          status: "active",
          lastActivity: "2024-01-14T15:30:00Z",
        },
      ],
      settings: {
        defaultRole: "member",
        requireApproval: false,
        ssoEnabled: true,
      },
    },
  ]);
});

app.get("/api/teams/:teamId/members", checkAuth, (req, res) => {
  res.json([
    {
      id: "user-1",
      email: "dev@company.com",
      role: "admin",
      status: "active",
      lastActivity: "2024-01-15T10:00:00Z",
    },
    {
      id: "user-2",
      email: "john@company.com",
      role: "member",
      status: "active",
      lastActivity: "2024-01-14T15:30:00Z",
    },
  ]);
});

app.post("/api/teams", checkAuth, (req, res) => {
  const { name } = req.body;
  res.json({ id: `team-${Date.now()}`, name, members: [], settings: {} });
});

app.post("/api/teams/:teamId/invite", checkAuth, (req, res) => {
  const { email, role } = req.body;
  res.json({ success: true, email, role, status: "invited" });
});

// Analytics API
app.get("/api/enterprise/analytics/export", checkAuth, (req, res) => {
  res.json({
    summary: {
      totalAnalyses: 1247,
      successRate: 94.2,
      averageFixTime: 12.5,
      codeQualityScore: 87,
      teamProductivity: 23,
    },
    trends: {
      dailyAnalyses: [
        { date: "2024-01-01", count: 45 },
        { date: "2024-01-02", count: 52 },
      ],
      qualityTrend: [
        { date: "2024-01-01", score: 85 },
        { date: "2024-01-02", score: 87 },
      ],
    },
    teams: [
      { name: "Frontend", members: 5, analyses: 523, quality: 89 },
      { name: "Backend", members: 3, analyses: 724, quality: 91 },
    ],
    compliance: {
      soc2: { status: "compliant", score: 96 },
      gdpr: { status: "compliant", score: 98 },
      iso27001: { status: "in-progress", score: 78 },
    },
  });
});

app.get("/api/enterprise/analytics/dashboard", checkAuth, (req, res) => {
  res.json({
    summary: {
      totalAnalyses: 1247,
      successRate: 94.2,
      averageFixTime: 12.5,
      codeQualityScore: 87,
      teamProductivity: 23,
    },
    teams: [
      { name: "Frontend", members: 5, analyses: 523, quality: 89 },
      { name: "Backend", members: 3, analyses: 724, quality: 91 },
    ],
    compliance: {
      soc2: { status: "compliant", score: 96 },
      gdpr: { status: "compliant", score: 98 },
      iso27001: { status: "in-progress", score: 78 },
    },
  });
});

// Webhooks API
app.get("/api/enterprise/webhooks", checkAuth, (req, res) => {
  res.json([
    {
      id: "webhook-123",
      url: "https://api.company.com/webhooks/neurolint",
      events: ["analysis.completed", "security.alert"],
      active: true,
      createdAt: "2024-01-01T00:00:00Z",
      lastTriggered: "2024-01-15T10:30:00Z",
      stats: {
        totalDeliveries: 245,
        successfulDeliveries: 242,
        failedDeliveries: 3,
      },
    },
  ]);
});

app.post("/api/enterprise/webhooks", checkAuth, (req, res) => {
  const { url, events, secret } = req.body;
  res.json({
    id: `webhook-${Date.now()}`,
    url,
    events,
    secret,
    active: true,
    createdAt: new Date().toISOString(),
    stats: { totalDeliveries: 0, successfulDeliveries: 0, failedDeliveries: 0 },
  });
});

app.post("/api/enterprise/webhooks/:id/test", checkAuth, (req, res) => {
  res.json({ success: true, status: 200, statusText: "OK", responseTime: 145 });
});

// SSO API
app.get("/api/enterprise/sso-providers", checkAuth, (req, res) => {
  res.json([
    {
      id: "sso-123",
      name: "Company SSO",
      type: "saml",
      domain: "company.com",
      enabled: true,
      userCount: 45,
      lastSync: "2024-01-15T08:00:00Z",
    },
  ]);
});

app.post("/api/enterprise/sso-providers", checkAuth, (req, res) => {
  const { type, domain, settings } = req.body;
  res.json({
    id: `sso-${Date.now()}`,
    name: `${domain} SSO`,
    type,
    domain,
    enabled: false,
    userCount: 0,
    settings,
  });
});

app.post("/api/enterprise/sso-providers/:id/test", checkAuth, (req, res) => {
  res.json({ success: true, status: "connected", responseTime: 256 });
});

// Audit API
app.get("/api/enterprise/audit/trail", checkAuth, (req, res) => {
  res.json([
    {
      id: "audit-1",
      timestamp: "2024-01-15T10:30:00Z",
      userId: "user-1",
      userEmail: "dev@company.com",
      action: "team.member.invite",
      resource: "team-123",
      success: true,
      riskLevel: "low",
      ipAddress: "192.168.1.100",
      userAgent: "NeuroLint CLI/1.0.0",
      details: { invitedEmail: "new@company.com", role: "member" },
    },
  ]);
});

app.get("/api/enterprise/audit/compliance", checkAuth, (req, res) => {
  res.json({
    soc2: {
      compliant: true,
      score: 96,
      lastAudit: "2024-01-01",
      nextAudit: "2024-07-01",
      violations: [],
    },
    gdpr: {
      compliant: true,
      score: 98,
      lastAudit: "2024-01-01",
      nextAudit: "2025-01-01",
      violations: [],
    },
    iso27001: {
      compliant: false,
      score: 78,
      lastAudit: "2023-12-01",
      nextAudit: "2024-06-01",
      violations: [
        {
          title: "Documentation Gap",
          description: "Missing ISMS documentation",
        },
      ],
    },
  });
});

app.get("/api/enterprise/audit/alerts", checkAuth, (req, res) => {
  res.json([
    {
      id: "alert-1",
      severity: "medium",
      title: "Multiple Failed Login Attempts",
      description: "User account has 5 failed login attempts in the last hour",
      timestamp: "2024-01-15T10:00:00Z",
      affectedUsers: 1,
      recommendations: ["Enable MFA", "Review access patterns"],
    },
  ]);
});

// Executive analytics
app.get("/api/enterprise/analytics/executive", checkAuth, (req, res) => {
  res.json([
    {
      name: "Code Quality Score",
      current: 87,
      previous: 82,
      target: 90,
      unit: "%",
      trend: "up",
      status: "on-track",
      impact: "quality",
    },
    {
      name: "Team Productivity",
      current: 23,
      previous: 18,
      target: 25,
      unit: "%",
      trend: "up",
      status: "on-track",
      impact: "efficiency",
    },
  ]);
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Internal server error" });
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({ error: "Endpoint not found" });
});

// Start server
app.listen(PORT, () => {
  console.log(`Mock Enterprise API Server running on http://localhost:${PORT}`);
  console.log(`Available endpoints:`);
  console.log(`   GET  /api/health`);
  console.log(`   GET  /api/teams`);
  console.log(`   GET  /api/enterprise/webhooks`);
  console.log(`   GET  /api/enterprise/sso-providers`);
  console.log(`   GET  /api/enterprise/audit/trail`);
  console.log(`   GET  /api/enterprise/analytics/dashboard`);
  console.log(`\nUse any Bearer token for authentication`);
  console.log(
    `\nTest with: curl -H "Authorization: Bearer test" http://localhost:${PORT}/api/health`,
  );
});
