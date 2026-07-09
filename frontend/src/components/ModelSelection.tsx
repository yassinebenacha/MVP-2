import { CheckCircle, Play, Cpu } from "lucide-react";
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
        "Linear decision boundary classifier trained on MiniLM semantic vectors for deterministic segment classification.",
      badge: "Deterministic Classifier",
      details:
        "Finds the optimal hyperplane that maximally separates noise from content segments in the MiniLM vector space.",
    },
    {
      id: "lr",
      name: "Logistic Regression",
      description:
        "Supervised classifier trained on MiniLM semantic embeddings that provides prediction scores for each text segment.",
      badge: "Probability Scores",
      details:
        "Uses the 384-dimensional MiniLM vector space to assign Content or Noise predictions per segment.",
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
                  ? "border-2 border-[#ffc000] bg-[#fffdf5] shadow-sm"
                  : "border-gray-200 hover:border-black hover:bg-gray-50"
              }`}
            >
              {isActive && (
                <div className="absolute top-4 right-4">
                  <CheckCircle className="text-[#ffc000] fill-[#ffc000] w-5 h-5" />
                </div>
              )}

              {/* Model name */}
              <div className="flex items-center gap-2 pr-8">
                <h3 className="font-sans font-bold text-sm text-gray-900">{m.name}</h3>
              </div>
              <p className="text-xs text-gray-500 mt-1 font-sans">{m.description}</p>

              {/* Model metadata badges */}
              <div className="mt-3 flex flex-wrap gap-2 items-center">
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
