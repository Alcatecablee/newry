import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function LandingHero() {
  const navigate = useNavigate();

  return (
    <section className="w-full flex flex-col items-center justify-center py-10 xs:py-12 px-3 sm:py-20 bg-[#191a1f]">
      {/* Main logo */}
      <img
        src="https://cdn.builder.io/api/v1/image/assets%2Faab978f39ff64270b6e29ab49582f574%2F38b5bfac1a6242ebb67f91834016d010?format=webp&width=800"
        alt="Logo"
        className="w-32 h-auto mb-4 sm:w-40 select-none pointer-events-none"
        draggable={false}
        loading="eager"
      />
      <h1 className="text-3xl xs:text-4xl sm:text-5xl md:text-6xl font-extrabold text-white text-center leading-tight mb-4">
        Advanced Code <br className="hidden xs:block" />
        <span className="text-white">Transformation Platform</span>
      </h1>
      <div className="text-base sm:text-xl text-gray-300 font-medium mb-8 max-w-md text-center px-2">
        Currently in beta with AI-ready architecture. Advanced code analysis and
        transformation using proven rule-based techniques.
        <br />
        AI integration planned for future releases.
      </div>
      <Button
        className="w-full max-w-xs py-4 text-lg rounded-xl bg-[#292939] hover:bg-[#434455] mb-8 shadow-cursor-glass active:scale-98 transition-all touch-manipulation text-white border border-[#342d66]"
        onClick={() => navigate("/app")}
        size="lg"
      >
        <ArrowRight className="mr-2" />
        Try NeuroLint Free
      </Button>
    </section>
  );
}
