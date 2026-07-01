import { CheckCircle, Play, Cpu, Trophy, ShieldCheck } from "lucide-react";
import { ModelOption } from "../types";

interface ModelSelectionProps {
  selectedModel: string;
  onSelectModel: (modelId: string) => void;
  onRunPipeline: () => void;
  isProcessing: boolean;
}

export default function ModelSelection({
  selectedModel,
  onSelectModel,
  onRunPipeline,
  isProcessing,
}: ModelSelectionProps) {
  const models: ModelOption[] = [
    {
      id: "svm",
      name: "Linear SVM",
      description:
        "High-precision linear decision boundary classifier trained on MiniLM semantic vectors for fast and deterministic segment classification.",
      accuracy: 91.03,
      badge: "Fast & Deterministic",
      details:
        "Finds the optimal hyperplane that maximally separates noise from content segments in the MiniLM vector space.",
    },
    {
      id: "lr",
      name: "Logistic Regression",
      description:
        "Probabilistic supervised classifier that outputs calibrated confidence scores for each text segment classification decision.",
      accuracy: 91.72,
      badge: "Best Model",
      details:
        "Outputs continuous probability weights that allow fine-grained confidence scoring per segment.",
      isBestModel: true,
    },
    {
      id: "gemini",
      name: "Gemini 3.5 Flash (LLM)",
      description:
        "Zero-shot semantic content extraction utilizing advanced contextual neural reasoning.",
      accuracy: 98,
      badge: "Hybrid Context Aware",
      details:
        "Best for highly unstructured layouts, parsing complex document relationships without rules.",
    },
  ];

  return (
    <div id="model-selection-panel" className="border border-gray-200 bg-white p-5 rounded-md flex flex-col h-full shadow-sm">
      <div className="mb-4 pb-2 border-b border-gray-100 flex items-center gap-2">
        <Cpu className="text-[#795900] w-5 h-5" />
        <h2 className="font-sans font-bold text-lg text-gray-900">Model Selection</h2>
      </div>

      <div className="space-y-4 flex-grow">
        {models.map((m) => {
          const isActive = selectedModel === m.id;
          return (
            <div
              key={m.id}
              onClick={() => onSelectModel(m.id)}
              className={`border rounded p-4 cursor-pointer relative transition-all ${
                isActive
                  ? m.isBestModel
                    ? "border-2 border-[#ffc000] bg-[#fffdf5] shadow-[0_0_12px_2px_rgba(255,192,0,0.18)]"
                    : "border-2 border-[#ffc000] bg-[#fffdf5] shadow-sm"
                  : m.isBestModel
                  ? "border-2 border-[#ffc000]/40 hover:border-[#ffc000] hover:bg-[#fffdf5]/60"
                  : "border-gray-200 hover:border-black hover:bg-gray-50"
              }`}
            >
              {isActive && (
                <div className="absolute top-4 right-4">
                  <CheckCircle className="text-[#ffc000] fill-[#ffc000] w-5 h-5" />
                </div>
              )}

              {/* Model name + best badge */}
              <div className="flex items-center gap-2 pr-8">
                <h3 className="font-sans font-bold text-sm text-gray-900">{m.name}</h3>
                {m.isBestModel && (
                  <span className="inline-flex items-center gap-1 bg-[#ffc000] text-black px-2 py-0.5 rounded-full font-bold text-[10px] font-mono shadow-sm">
                    <Trophy className="w-2.5 h-2.5 fill-current" />
                    Best Model
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-1 font-sans">{m.description}</p>

              {/* Accuracy badge only */}
              <div className="mt-3 flex flex-wrap gap-2 items-center">
                <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded font-mono text-[10px] font-bold border border-gray-200">
                  Accuracy: {m.accuracy.toFixed(2)}%
                </span>
                <span className="bg-[#ffdf9e] text-[#5b4300] px-2 py-0.5 rounded font-mono text-[10px] font-bold">
                  {m.badge}
                </span>
              </div>

              {isActive && (
                <p className="text-[10px] text-gray-400 font-mono mt-2 border-t border-[#ffdf9e] pt-1.5">
                  {m.details}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* Warning/Info banner for Gemini */}
      {selectedModel === "gemini" && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-100 rounded text-xs text-blue-800 flex gap-2">
          <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0" />
          <div>
            <span className="font-bold">Server-Side Proxy Active:</span> Gemini operations run securely on the server. Your API key remains private. If no key is set, the system automatically falls back to the Linear SVM model.
          </div>
        </div>
      )}

      {/* Run button */}
      <button
        onClick={onRunPipeline}
        disabled={isProcessing}
        className={`w-full bg-[#ffc000] hover:bg-[#e6ad00] text-black py-3 rounded font-bold hover:shadow mt-4 uppercase tracking-wider text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
          isProcessing ? "opacity-60 cursor-not-allowed" : ""
        }`}
      >
        {isProcessing ? (
          <>
            <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
            Processing Pipeline...
          </>
        ) : (
          <>
            <Play className="w-4 h-4 fill-current" />
            Run Cleaning Pipeline
          </>
        )}
      </button>
    </div>
  );
}
