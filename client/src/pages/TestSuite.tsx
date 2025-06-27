import { TestRunner } from "@/components/neurolint/TestRunner";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { TestTube, ArrowLeft } from "lucide-react";
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

      <div className="relative z-10 py-8 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Navigation - small modern buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-between items-center mb-12">
            <Link
              to="/"
              className="px-4 py-2 bg-zinc-900/70 rounded-lg text-sm font-medium backdrop-blur-xl border border-zinc-800 hover:border-zinc-700 transition-all duration-300 flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Link>

            <Link
              to="/app"
              className="px-4 py-2 bg-white text-black font-medium rounded-lg hover:bg-gray-100 transition-all duration-300 text-sm"
            >
              Try NeuroLint
            </Link>
          </div>

          {/* Hero Section - clean and simple */}
          <div className="text-center mb-16">
            <div className="mb-6">
              <span className="px-4 py-2 bg-zinc-900/70 rounded-lg text-sm font-medium backdrop-blur-xl border border-zinc-800 hover:border-zinc-700 transition-all duration-300">
                Quality Assurance Suite
              </span>
            </div>

            <h1 className="text-4xl md:text-6xl font-black mb-6 tracking-tight text-white">
              Test Suite
            </h1>

            <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto font-medium mb-12">
              Automated validation of NeuroLint's 6-layer transformation
              pipeline
            </p>
          </div>

          {/* Test Runner Card - clean and minimal */}
          <Card className="w-full bg-zinc-900/80 border border-zinc-700 rounded-2xl backdrop-blur-xl shadow-2xl">
            <CardHeader>
              <CardTitle className="text-2xl font-bold tracking-tight text-white flex items-center gap-3">
                <TestTube className="w-6 h-6 text-white" />
                <span>Test Suite</span>
              </CardTitle>
            </CardHeader>

            <CardContent>
              <TestRunner />
            </CardContent>
          </Card>

          {/* Info Section - same style as landing page */}
          <div className="mt-12 text-center">
            <p className="text-lg text-gray-300 max-w-2xl mx-auto font-medium">
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
