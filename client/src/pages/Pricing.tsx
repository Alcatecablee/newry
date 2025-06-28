import { Link } from "react-router-dom";
import { PRICING_PLANS } from "@/lib/config/pricing";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Check,
  ArrowLeft,
  Zap,
  Shield,
  Users,
  Crown,
  Sparkles,
  Code,
} from "lucide-react";

const Pricing = () => {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-1/4 w-1/2 h-1/2 bg-zinc-900/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-zinc-800/20 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 px-4 py-6">
        <div className="max-w-7xl mx-auto">
          {/* Navigation */}
          <div className="flex flex-col sm:flex-row gap-3 justify-between items-center mb-8">
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-900/80 rounded-xl text-sm font-medium backdrop-blur-xl border border-zinc-800/50 hover:border-zinc-700 hover:bg-zinc-900 transition-all duration-200"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Link>

            <Link
              to="/app"
              className="inline-flex items-center px-4 py-2 bg-white text-black font-medium rounded-xl hover:bg-gray-100 transition-all duration-200 text-sm shadow-lg"
            >
              Try for Free
            </Link>
          </div>

          {/* Header */}
          <div className="text-center mb-16">
            <div className="mb-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-900/50 border border-zinc-800/50 rounded-xl backdrop-blur-sm mb-6">
                <Crown className="w-4 h-4 text-white" />
                <span className="text-sm font-medium text-zinc-400">
                  Pricing Plans
                </span>
              </div>

              <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight text-white">
                Simple, Transparent Pricing
              </h1>

              <p className="text-xl text-zinc-400 max-w-3xl mx-auto leading-relaxed">
                Transform your code with AI-powered precision. Choose the plan
                that fits your needs.
                <br />
                <span className="text-white font-semibold">
                  Start free, upgrade anytime.
                </span>
              </p>
            </div>
          </div>

          {/* Pricing Cards */}
          <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto mb-16">
            {Object.entries(PRICING_PLANS).map(([key, plan]) => {
              const planIcons = {
                free: Code,
                pro: Zap,
                enterprise: Shield,
              };
              const PlanIcon = planIcons[key as keyof typeof planIcons];

              return (
                <Card
                  key={key}
                  className={`relative ${
                    plan.popular
                      ? "border-purple-500/50 bg-zinc-900/60 shadow-2xl shadow-purple-900/20 scale-105"
                      : "border-zinc-800/50 bg-zinc-900/40"
                  } backdrop-blur-sm rounded-3xl overflow-hidden transition-all duration-300 hover:scale-105`}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-purple-500 text-white px-4 py-1 rounded-full font-semibold shadow-lg">
                        <Sparkles className="w-3 h-3 mr-1" />
                        Most Popular
                      </Badge>
                    </div>
                  )}

                  <CardHeader className="text-center pb-8 pt-8">
                    <div className="flex justify-center mb-4">
                      <div
                        className={`p-3 rounded-2xl ${
                          plan.popular ? "bg-purple-500/20" : "bg-zinc-800/50"
                        }`}
                      >
                        <PlanIcon
                          className={`w-8 h-8 ${
                            plan.popular ? "text-purple-400" : "text-zinc-400"
                          }`}
                        />
                      </div>
                    </div>

                    <CardTitle className="text-2xl font-bold text-white mb-2">
                      {plan.name}
                    </CardTitle>

                    <div className="mt-4">
                      <div className="flex items-baseline justify-center gap-1">
                        <span className="text-4xl font-bold text-white">
                          ${plan.price}
                        </span>
                        <span className="text-zinc-400 font-medium">
                          /month
                        </span>
                      </div>
                      {plan.monthlyTransformations === -1 ? (
                        <p className="text-sm text-zinc-500 mt-2">
                          Unlimited transformations
                        </p>
                      ) : (
                        <p className="text-sm text-zinc-500 mt-2">
                          {plan.monthlyTransformations} transformations/month
                        </p>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent className="px-8 pb-8">
                    <ul className="space-y-4 mb-8">
                      {plan.features.map((feature, index) => (
                        <li
                          key={index}
                          className="flex items-start gap-3 text-zinc-300"
                        >
                          <Check className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                          <span className="text-sm leading-relaxed">
                            {feature}
                          </span>
                        </li>
                      ))}
                    </ul>

                    <Button
                      asChild
                      className={`w-full py-3 text-base font-semibold rounded-xl transition-all duration-200 ${
                        plan.popular
                          ? "bg-white text-black hover:bg-gray-100 shadow-lg hover:shadow-xl"
                          : key === "free"
                            ? "bg-zinc-800 text-white hover:bg-zinc-700 border border-zinc-700"
                            : "bg-zinc-800 text-white hover:bg-zinc-700"
                      }`}
                    >
                      <Link to={key === "enterprise" ? "/contact" : "/app"}>
                        {plan.cta}
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Additional Info */}
          <div className="text-center mb-16">
            <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="p-6 bg-zinc-900/40 border border-zinc-800/50 rounded-2xl backdrop-blur-sm">
                <Shield className="w-8 h-8 text-green-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">
                  Secure & Private
                </h3>
                <p className="text-sm text-zinc-400">
                  Your code is processed securely and never stored or shared
                </p>
              </div>

              <div className="p-6 bg-zinc-900/40 border border-zinc-800/50 rounded-2xl backdrop-blur-sm">
                <Users className="w-8 h-8 text-blue-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">
                  No Hidden Fees
                </h3>
                <p className="text-sm text-zinc-400">
                  Transparent pricing with no setup fees or hidden charges
                </p>
              </div>

              <div className="p-6 bg-zinc-900/40 border border-zinc-800/50 rounded-2xl backdrop-blur-sm">
                <Zap className="w-8 h-8 text-yellow-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">
                  Cancel Anytime
                </h3>
                <p className="text-sm text-zinc-400">
                  Flexible billing with no contracts or cancellation fees
                </p>
              </div>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="max-w-3xl mx-auto text-center">
            <h3 className="text-2xl font-bold text-white mb-8">
              Frequently Asked Questions
            </h3>
            <div className="space-y-6 text-left">
              <div className="p-6 bg-zinc-900/40 border border-zinc-800/50 rounded-2xl backdrop-blur-sm">
                <h4 className="text-lg font-semibold text-white mb-2">
                  What are the 6 transformation layers?
                </h4>
                <p className="text-zinc-400 text-sm">
                  Our AI system uses 6 specialized layers: Configuration
                  Validation, Pattern & Entity Fixes, Component Best Practices,
                  Hydration & SSR Guard, Next.js Optimization, and Quality &
                  Performance improvements.
                </p>
              </div>

              <div className="p-6 bg-zinc-900/40 border border-zinc-800/50 rounded-2xl backdrop-blur-sm">
                <h4 className="text-lg font-semibold text-white mb-2">
                  Can I upgrade or downgrade my plan?
                </h4>
                <p className="text-zinc-400 text-sm">
                  Yes! You can change your plan at any time. Upgrades take
                  effect immediately, and downgrades take effect at the start of
                  your next billing cycle.
                </p>
              </div>

              <div className="p-6 bg-zinc-900/40 border border-zinc-800/50 rounded-2xl backdrop-blur-sm">
                <h4 className="text-lg font-semibold text-white mb-2">
                  Is my code secure?
                </h4>
                <p className="text-zinc-400 text-sm">
                  Absolutely. We process your code in secure, isolated
                  environments and never store, log, or share your code. All
                  processing happens in real-time and data is immediately
                  discarded.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pricing;
