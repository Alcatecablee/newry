import React from "react";
import { LAYER_LIST } from "@/lib/neurolint/orchestrator";
import { Toggle } from "@/components/ui/toggle";
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
  return (
    <div className="w-full flex flex-col items-center gap-3">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-lg font-bold text-white tracking-tight">
          NeuroLint
        </span>
      </div>
      <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 gap-3 w-full max-w-4xl">
        {LAYER_LIST.map((layer) => {
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
                    ? "bg-[#292939] text-white border-[#342d66] shadow-lg shadow-purple-900/20"
                    : "bg-[#1a1b21] text-gray-300 border-[#292939] hover:bg-[#232329] hover:border-[#3a3a45]"
                }
                touch-manipulation select-none
                focus-visible:ring-2 focus-visible:ring-purple-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#191a1f]
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
                      ? "bg-purple-600 text-white border-purple-500"
                      : "bg-[#292939] text-gray-400 border-[#3a3a45] group-hover:bg-[#343445] group-hover:text-gray-300"
                  }
                  `}
              >
                {layer.id}
              </span>
              <span className="whitespace-nowrap truncate text-left flex-1">
                {layer.name}
              </span>
              {isOn && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-purple-500 rounded-full border-2 border-[#191a1f]" />
              )}
            </Toggle>
          );
        })}
      </div>
    </div>
  );
}
