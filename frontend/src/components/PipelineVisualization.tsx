import { useEffect, useState } from "react";
import {
  FileText,
  Layers,
  Bot,
  Cpu,
  Eraser,
  CheckCircle,
} from "lucide-react";

interface PipelineVisualizationProps {
  isProcessing: boolean;
  activeStepIndex: number; // 0 to 5, or -1 when idle
}

export default function PipelineVisualization({
  isProcessing,
  activeStepIndex,
}: PipelineVisualizationProps) {
  const steps = [
    { name: "Raw Text", desc: "Text ingestion", icon: FileText },
    { name: "Segmentation", desc: "Split into segments", icon: Layers },
    { name: "MiniLM Embedding", desc: "384-d multilingual semantic vectors", icon: Bot },
    { name: "Classification", desc: "SVM / Logistic Regression decision", icon: Cpu },
    { name: "Noise Removal", desc: "Filter noise segments", icon: Eraser },
    { name: "Clean Output", desc: "Reconstructed text", icon: CheckCircle },
  ];

  return (
    <div id="pipeline-panel" className="border border-gray-200 p-6 rounded-md bg-white shadow-sm overflow-hidden">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="font-sans font-extrabold text-xs text-gray-400 tracking-widest uppercase">
            Processing Pipeline
          </h2>
          <p className="text-xs text-gray-500 font-mono mt-0.5">
            Segmentation → MiniLM Embedding → Classification → Filtering → Reconstruction
          </p>
        </div>
        {isProcessing && (
          <span className="flex items-center gap-1.5 bg-[#fffdf5] border border-[#ffdf9e] text-[#795900] px-2.5 py-1 rounded-full text-xs font-mono font-bold animate-pulse">
            <span className="w-2 h-2 bg-[#ffc000] rounded-full"></span>
            Processing Stage: {steps[activeStepIndex]?.name || "Initializing"}
          </span>
        )}
      </div>

      <div className="relative flex items-center justify-between overflow-x-auto py-4 px-2 select-none min-w-[750px]">
        {steps.map((step, idx) => {
          const StepIcon = step.icon;
          const isCompleted = activeStepIndex > idx || (activeStepIndex === -1 && !isProcessing);
          const isActive = activeStepIndex === idx;
          const isFuture = activeStepIndex < idx && isProcessing;

          return (
            <div key={idx} className="flex items-center flex-1 last:flex-none">
              {/* Step Node */}
              <div className="flex flex-col items-center text-center relative z-10 shrink-0">
                <div
                  className={`w-12 h-12 rounded-lg border-2 flex items-center justify-center transition-all duration-300 relative ${
                    isActive
                      ? "border-black bg-white ring-4 ring-[#ffdf9e] scale-110"
                      : isCompleted
                      ? "border-[#ffc000] bg-[#fffdf5] text-black"
                      : "border-gray-200 bg-white text-gray-400"
                  }`}
                >
                  <StepIcon
                    className={`w-5 h-5 transition-colors ${
                      isActive
                        ? "text-[#795900]"
                        : isCompleted
                        ? "text-[#795900]"
                        : "text-gray-400"
                    }`}
                  />
                  {isActive && (
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-[#ffc000] rounded-full ring-2 ring-white animate-ping"></span>
                  )}
                </div>
                <div className="mt-2">
                  <span
                    className={`block font-sans text-xs font-bold transition-colors ${
                      isActive
                        ? "text-black font-extrabold"
                        : isCompleted
                        ? "text-gray-900"
                        : "text-gray-400"
                    }`}
                  >
                    {step.name}
                  </span>
                  <span className="block font-mono text-[9px] text-gray-400 mt-0.5">
                    {step.desc}
                  </span>
                </div>
              </div>

              {/* Connecting Line */}
              {idx < steps.length - 1 && (
                <div className="flex-grow mx-4 relative h-1 bg-gray-100 rounded overflow-hidden">
                  <div
                    className={`absolute inset-0 h-full transition-all duration-1000 ${
                      isCompleted
                        ? "bg-[#ffc000] w-full"
                        : isActive
                        ? "bg-gradient-to-r from-[#ffc000] to-gray-200 w-full animate-pulse"
                        : "w-0"
                    }`}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
