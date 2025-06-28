import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ClerkProvider } from "@/providers/ClerkProvider";
import Index from "./pages/Index";
import AppPage from "./pages/AppPage";
import TestSuite from "./pages/TestSuite";
import Docs from "./pages/Docs";
import Features from "./pages/Features";
import Pricing from "./pages/Pricing";

import TeamDashboard from "./pages/TeamDashboard";
import TeamSettings from "./pages/TeamSettings";
import LiveCollaboration from "./pages/LiveCollaboration";
import EnhancedTeamDashboard from "./pages/EnhancedTeamDashboard";
import LiveCodeSessions from "./pages/LiveCodeSessions";
import TeamAnalytics from "./pages/TeamAnalytics";
import SSOIntegration from "./pages/enterprise/SSOIntegration";
import WebhookSystem from "./pages/enterprise/WebhookSystem";
import EnterpriseAnalytics from "./pages/enterprise/EnterpriseAnalytics";
import AdvancedAI from "./pages/enterprise/AdvancedAI";
import MarketPositioning from "./pages/enterprise/MarketPositioning";
import AdminDashboard from "./pages/AdminDashboard";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import { SiteHeader } from "./components/SiteHeader";
import { SiteFooter } from "./components/SiteFooter";
import { BetaBanner } from "./components/BetaBanner";
import ScrollToTop from "./components/ScrollToTop";

const queryClient = new QueryClient();

const App = () => (
  <ClerkProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ScrollToTop />
          <div className="min-h-screen bg-black text-white">
            <BetaBanner />
            <SiteHeader />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/app" element={<AppPage />} />
              <Route path="/test" element={<TestSuite />} />
              <Route path="/docs" element={<Docs />} />
              <Route path="/features" element={<Features />} />
              <Route path="/pricing" element={<Pricing />} />

              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/admin" element={<AdminDashboard />} />

              <Route path="/teams" element={<EnhancedTeamDashboard />} />
              <Route path="/team" element={<EnhancedTeamDashboard />} />
              <Route path="/team/basic" element={<TeamDashboard />} />
              <Route path="/team/settings" element={<TeamSettings />} />
              <Route path="/team/collaborate" element={<LiveCollaboration />} />
              <Route
                path="/team/live-sessions"
                element={<LiveCodeSessions />}
              />
              <Route path="/team/analytics" element={<TeamAnalytics />} />
              <Route path="/enterprise/sso" element={<SSOIntegration />} />
              <Route path="/enterprise/webhooks" element={<WebhookSystem />} />
              <Route
                path="/enterprise/analytics"
                element={<EnterpriseAnalytics />}
              />
              <Route path="/enterprise/ai" element={<AdvancedAI />} />
              <Route
                path="/enterprise/market"
                element={<MarketPositioning />}
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
            <SiteFooter />
          </div>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ClerkProvider>
);

export default App;
