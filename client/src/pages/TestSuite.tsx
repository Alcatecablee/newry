import { TestRunner } from "@/components/neurolint/TestRunner";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Brain,
  TestTube,
  ArrowLeft,
  Play,
  CheckCircle,
  Target,
  Zap,
} from "lucide-react";
import { Link } from "react-router-dom";

const TestSuite = () => {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 -left-1/4 w-1/2 h-1/2 bg-purple-900/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-blue-900/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-1/3 h-1/3 bg-zinc-900/30 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10">
        {/* Header Section */}
        <section className="py-16 px-4">
          <div className="max-w-7xl mx-auto">
            {/* Navigation */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center mb-16">
              <Link
                to="/"
                className="flex items-center gap-3 px-6 py-3 bg-zinc-900/70 rounded-2xl border-2 border-zinc-800 hover:border-zinc-600 transition-all duration-300 backdrop-blur-xl hover:bg-zinc-900/90"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="font-bold">Back to Home</span>
              </Link>

              <Link
                to="/app"
                className="px-8 py-4 bg-white text-black font-black rounded-2xl hover:bg-gray-100 transition-all duration-300 shadow-2xl hover:scale-105 flex items-center gap-3"
              >
                <Play className="w-5 h-5" />
                Try NeuroLint
              </Link>
            </div>

            {/* Hero Section */}
            <div className="text-center mb-20">
              <div className="mb-8">
                <span className="px-6 py-3 bg-zinc-900/70 rounded-2xl text-base font-bold backdrop-blur-xl border-2 border-zinc-800 hover:border-zinc-700 transition-all duration-300 inline-flex items-center gap-3">
                  <TestTube className="w-5 h-5 text-blue-400" />
                  Quality Assurance Suite
                </span>
              </div>

              <h1 className="text-5xl md:text-7xl font-black mb-8 text-white leading-tight tracking-tight">
                <span className="text-purple-400">NeuroLint</span> Test Suite
              </h1>

              <p className="text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed font-medium mb-12">
                Comprehensive automated validation of our 6-layer transformation
                pipeline.
                <br />
                <span className="text-blue-400">
                  Ensuring reliable code modernization for production use.
                </span>
              </p>

              {/* Feature Highlights */}
              <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-16">
                <div className="p-6 bg-zinc-900/50 border border-zinc-800 rounded-2xl hover:border-zinc-600 transition-all duration-300 hover:bg-zinc-900/70">
                  <Target className="w-8 h-8 text-purple-400 mx-auto mb-4" />
                  <h3 className="text-lg font-bold mb-2">Precision Testing</h3>
                  <p className="text-gray-400 text-sm">
                    Automated validation across all transformation layers
                  </p>
                </div>

                <div className="p-6 bg-zinc-900/50 border border-zinc-800 rounded-2xl hover:border-zinc-600 transition-all duration-300 hover:bg-zinc-900/70">
                  <Zap className="w-8 h-8 text-blue-400 mx-auto mb-4" />
                  <h3 className="text-lg font-bold mb-2">Real-time Results</h3>
                  <p className="text-gray-400 text-sm">
                    Instant feedback on transformation accuracy
                  </p>
                </div>

                <div className="p-6 bg-zinc-900/50 border border-zinc-800 rounded-2xl hover:border-zinc-600 transition-all duration-300 hover:bg-zinc-900/70">
                  <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-4" />
                  <h3 className="text-lg font-bold mb-2">Production Ready</h3>
                  <p className="text-gray-400 text-sm">
                    Rigorous quality checks for enterprise use
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Test Runner Section */}
        <section className="py-12 px-4">
          <div className="max-w-7xl mx-auto">
            <Card className="bg-zinc-900/80 border-2 border-zinc-700 rounded-3xl overflow-hidden backdrop-blur-xl shadow-2xl">
              <CardHeader className="bg-zinc-800/50 border-b-2 border-zinc-700 p-8">
                <CardTitle className="text-3xl font-black tracking-tight text-white flex items-center gap-4">
                  <div className="p-3 bg-purple-500/20 border-2 border-purple-500/50 rounded-2xl">
                    <Brain className="w-8 h-8 text-purple-400" />
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-purple-400">NeuroLint</span>
                    <span className="text-gray-400">×</span>
                    <TestTube className="w-6 h-6 text-blue-400" />
                    <span className="text-blue-400">Test Suite</span>
                  </div>
                </CardTitle>
                <p className="text-gray-300 mt-4 text-lg">
                  Watch our AI analyze and transform code in real-time with
                  comprehensive validation
                </p>
              </CardHeader>

              <CardContent className="p-8">
                <TestRunner />
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Information Section */}
        <section className="py-16 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="p-8 bg-zinc-900/70 border-2 border-zinc-800 rounded-3xl backdrop-blur-xl">
              <h3 className="text-2xl font-black text-white mb-6">
                Complete Testing Coverage
              </h3>
              <p className="text-gray-300 leading-relaxed">
                Our comprehensive testing suite validates NeuroLint's
                transformation accuracy across configuration updates, HTML
                entity fixes, component improvements, hydration issues, Next.js
                optimizations, and testing enhancements. Each layer is
                rigorously tested to ensure production-ready code
                transformations.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default TestSuite;
