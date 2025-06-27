import { TestRunner } from "@/components/neurolint/TestRunner";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Brain, TestTube, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const TestSuite = () => {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Background Effects - exactly like landing page */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 -left-1/4 w-1/2 h-1/2 bg-zinc-900/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-zinc-800/30 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-1/3 h-1/3 bg-zinc-900/20 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 py-16 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Navigation - same style as landing page */}
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-center mb-16">
            <Link
              to="/"
              className="px-6 py-3 bg-zinc-900/70 rounded-2xl text-base font-bold backdrop-blur-xl border-2 border-zinc-800 hover:border-zinc-700 transition-all duration-300 flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Link>

            <Link
              to="/app"
              className="px-6 py-3 bg-white text-black font-bold rounded-2xl hover:bg-gray-100 transition-all duration-300"
            >
              Try NeuroLint
            </Link>
          </div>

          {/* Hero Section - matching landing page style */}
          <div className="text-center mb-20">
            <div className="mb-8">
              <span className="px-6 py-3 bg-zinc-900/70 rounded-2xl text-base font-bold backdrop-blur-xl border-2 border-zinc-800 hover:border-zinc-700 transition-all duration-300">
                Quality Assurance Suite
              </span>
            </div>

            <h1 className="text-5xl md:text-7xl font-black mb-8 tracking-tight text-white">
              Test Suite
            </h1>

            <p className="text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto font-medium mb-16">
              Automated validation of NeuroLint's 6-layer transformation
              pipeline
            </p>
          </div>

          {/* Test Runner Card - clean and minimal */}
          <Card className="w-full bg-zinc-900/80 border-2 border-zinc-700 rounded-3xl backdrop-blur-xl shadow-2xl">
            <CardHeader>
              <CardTitle className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
                <Brain className="w-8 h-8 text-white" />
                <span>NeuroLint</span>
                <TestTube className="w-6 h-6 text-white" />
                <span className="font-normal text-xl text-gray-400">
                  Test Suite
                </span>
              </CardTitle>
            </CardHeader>

            <CardContent>
              <TestRunner />
            </CardContent>
          </Card>

          {/* Info Section - same style as landing page */}
          <div className="mt-16 text-center">
            <p className="text-xl text-gray-300 max-w-3xl mx-auto font-medium">
              Comprehensive testing suite validating transformation accuracy
              across configuration updates, HTML entity fixes, component
              improvements, hydration issues, and more.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestSuite;
