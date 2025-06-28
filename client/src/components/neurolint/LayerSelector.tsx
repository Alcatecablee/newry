import React from "react";
import { LAYER_LIST } from "@/lib/neurolint/orchestrator";
import { Toggle } from "@/components/ui/toggle";
import { Badge } from "@/components/ui/badge";
import { Settings, Wrench, ShieldCheck, Layers, Star } from "lucide-react";

interface LayerSelectorProps {
  enabledLayers: number[];
  setEnabledLayers: (ids: number[]) => void;
}

export function LayerSelector({
  enabledLayers,
  setEnabledLayers,
}: LayerSelectorProps) {
  const onToggle = (id: number) => {
    setEnabledLayers(
      enabledLayers.includes(id)
        ? enabledLayers.filter((l) => l !== id)
        : [...enabledLayers, id].sort(),
    );
  };

  const keyLayers = [1, 2, 4]; // Config, Pattern, Hydration

  const getLayerIcon = (layerId: number) => {
    switch (layerId) {
      case 1:
        return <Settings className="w-4 h-4" />;
      case 2:
        return <Wrench className="w-4 h-4" />;
      case 4:
        return <ShieldCheck className="w-4 h-4" />;
      default:
        return <Layers className="w-4 h-4" />;
    }
  };

  const getLayerDescription = (layerId: number) => {
    switch (layerId) {
      case 1:
        return "TypeScript & Next.js configuration optimization";
      case 2:
        return "HTML entities, patterns & code modernization";
      case 4:
        return "SSR guards & hydration safety";
      default:
        return "";
    }
  };

  return (
    <div className="w-full flex flex-col items-center gap-3">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-lg font-bold text-white tracking-tight">
          NeuroLint Layers
        </span>
      </div>

      {/* Key Layers Section */}
      <div className="w-full max-w-4xl">
        <div className="flex items-center gap-2 mb-3">
          <Star className="w-4 h-4 text-zinc-400" />
          <span className="text-sm font-medium text-white">
            Key Testing Layers
          </span>
          <Badge variant="outline" className="text-xs">
            Priority
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
          {LAYER_LIST.filter((layer) => keyLayers.includes(layer.id)).map(
            (layer) => {
              const isOn = enabledLayers.includes(layer.id);
              return (
                <Toggle
                  key={layer.id}
                  pressed={isOn}
                  onPressedChange={() => onToggle(layer.id)}
                  className={`group relative flex flex-col items-start w-full p-4 rounded-xl border transition-all duration-200
                  text-sm
                  ${
                    isOn
                      ? "bg-[#292939] border-zinc-600 shadow-lg shadow-zinc-900/20"
                      : "bg-[#1a1b21] border-[#292939] hover:border-[#3a3a45] hover:bg-[#232329]"
                  }
                  touch-manipulation select-none
                  focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-900
                  active:scale-[0.98] transform
                  min-h-[80px]
                  `}
                  aria-pressed={isOn}
                  type="button"
                  tabIndex={0}
                >
                  <div className="flex items-center gap-3 mb-2 w-full">
                    <span
                      className={`inline-flex items-center justify-center w-8 h-8 text-sm font-bold rounded-lg border transition-all duration-200
                      ${
                        isOn
                          ? "bg-zinc-600 text-white border-zinc-500"
                          : "bg-zinc-800/50 text-gray-400 border-zinc-700 group-hover:bg-zinc-700 group-hover:text-gray-300"
                      }
                      `}
                    >
                      {layer.id}
                    </span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        {getLayerIcon(layer.id)}
                        <span className="font-semibold">{layer.name}</span>
                      </div>
                    </div>
                    <Star
                      className={`w-4 h-4 ${isOn ? "text-zinc-400" : "text-gray-500"}`}
                    />
                  </div>
                  <p className="text-xs text-left opacity-75 leading-relaxed">
                    {getLayerDescription(layer.id)}
                  </p>
                  <div
                    className={`absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-zinc-900 ${
                      isOn ? "bg-zinc-400" : "bg-zinc-600"
                    }`}
                  />
                </Toggle>
              );
            },
          )}
        </div>

        {/* Other Layers Section */}
        <div className="flex items-center gap-2 mb-3">
          <Layers className="w-4 h-4 text-gray-400" />
          <span className="text-sm font-medium text-gray-400">
            Additional Layers
          </span>
        </div>

        <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 gap-3">
          {LAYER_LIST.filter((layer) => !keyLayers.includes(layer.id)).map(
            (layer) => {
              const isOn = enabledLayers.includes(layer.id);
              return (
                <Toggle
                  key={layer.id}
                  pressed={isOn}
                  onPressedChange={() => onToggle(layer.id)}
                  className={`group relative flex items-center w-full px-4 py-3 rounded-xl border transition-all duration-200
                  text-sm font-semibold
                  ${
                    isOn
                      ? "bg-[#292939] border-zinc-600 shadow-lg shadow-zinc-900/20"
                      : "bg-[#1a1b21] border-[#292939] hover:border-[#3a3a45] hover:bg-[#232329]"
                  }
                  touch-manipulation select-none
                  focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-900
                  active:scale-[0.98] transform
                  min-h-[56px]
                  `}
                  aria-pressed={isOn}
                  type="button"
                  tabIndex={0}
                >
                  <span
                    className={`inline-flex items-center justify-center w-8 h-8 text-sm font-bold rounded-lg mr-3 border transition-all duration-200
                    ${
                      isOn
                        ? "bg-zinc-600 text-white border-zinc-500"
                        : "bg-zinc-800/50 text-gray-400 border-zinc-700 group-hover:bg-zinc-700 group-hover:text-gray-300"
                    }
                    `}
                  >
                    {layer.id}
                  </span>
                  <span className="whitespace-nowrap truncate text-left flex-1">
                    {layer.name}
                  </span>
                  <div
                    className={`absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-zinc-900 ${
                      isOn ? "bg-zinc-400" : "bg-zinc-600"
                    }`}
                  />
                </Toggle>
              );
            },
          )}
        </div>
      </div>
    </div>
  );
}
