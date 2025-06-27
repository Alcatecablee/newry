import { TestRunner } from "@/components/neurolint/TestRunner";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { TestTube, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const TestSuite = () => {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-1/4 w-1/2 h-1/2 bg-zinc-900/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-zinc-800/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-1/3 h-1/3 bg-zinc-900/15 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 py-6 px-4">
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
              Try NeuroLint
            </Link>
          </div>

          {/* Hero Section */}
          <div className="text-center mb-16">
            <div className="mb-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-900/50 border border-zinc-800/50 rounded-xl backdrop-blur-sm mb-6">
                <TestTube className="w-4 h-4 text-zinc-400" />
                <span className="text-sm font-medium text-zinc-400">
                  Quality Assurance Suite
                </span>
              </div>

              <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight text-white">
                Test Suite
              </h1>

              <p className="text-xl text-zinc-400 max-w-3xl mx-auto leading-relaxed">
                Automated validation of NeuroLint's 6-layer transformation
                pipeline. Real-time testing for code quality and transformation
                accuracy.
              </p>
            </div>
          </div>

          {/* Test Runner Card */}
          <Card className="w-full bg-zinc-900/40 border border-zinc-800/50 rounded-3xl backdrop-blur-sm shadow-2xl overflow-hidden">
            <CardContent className="p-0">
              <TestRunner />
            </CardContent>
          </Card>

          {/* Info Section */}
          <div className="mt-16 text-center">
            <div className="max-w-4xl mx-auto">
              <h3 className="text-2xl font-bold text-white mb-4">
                Comprehensive Validation
              </h3>
              <p className="text-lg text-zinc-400 leading-relaxed">
                Our test suite validates transformation accuracy across
                configuration updates, pattern detection, component
                improvements, hydration fixes, and performance optimizations.
                Each test ensures AI recommendations maintain code quality and
                functionality.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestSuite;
