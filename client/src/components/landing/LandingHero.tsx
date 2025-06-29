import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function LandingHero() {
  const navigate = useNavigate();

  return (
    <section
      className="w-full flex flex-col items-center justify-center section-padding container-padding bg-black"
      role="banner"
      aria-labelledby="hero-heading"
    >
      {/* Main logo */}
      <img
        src="https://cdn.builder.io/api/v1/image/assets%2Faab978f39ff64270b6e29ab49582f574%2F38b5bfac1a6242ebb67f91834016d010?format=webp&width=800"
        alt="NeuroLint - Advanced Code Transformation Platform"
        className="w-32 h-auto mb-8 sm:w-40 select-none pointer-events-none hover-lift"
        draggable={false}
        loading="eager"
      />
      <h1
        id="hero-heading"
        className="text-4xl xs:text-5xl sm:text-6xl md:text-7xl font-bold text-white text-center leading-tight mb-6 tracking-tight"
      >
        Advanced Code <br className="hidden xs:block" />
        <span className="text-white">Transformation Platform</span>
      </h1>
      <p className="text-lg sm:text-xl text-gray-300 font-medium mb-12 max-w-2xl text-center px-4 leading-relaxed">
        Currently in beta with AI-ready architecture. Advanced code analysis and
        transformation using proven rule-based techniques.
        <br />
        AI integration planned for future releases.
      </p>
      <Button
        className="w-full max-w-sm py-4 px-8 text-lg font-bold rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-white hover-lift shadow-xl hover:shadow-2xl transition-all duration-300 touch-manipulation focus:ring-2 focus:ring-zinc-600 focus:ring-offset-2 focus:ring-offset-black"
        onClick={() => navigate("/app")}
        size="lg"
        aria-label="Try NeuroLint Free - Start analyzing your code"
      >
        <ArrowRight className="mr-3 w-5 h-5" aria-hidden="true" />
        Try NeuroLint Free
      </Button>
    </section>
  );
}
