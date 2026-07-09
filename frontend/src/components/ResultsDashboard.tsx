import { useState } from "react";
import { Copy, Check, Download, AlertTriangle, Layers } from "lucide-react";
import { CleaningResult, Segment } from "../types";

interface ResultsDashboardProps {
  result: CleaningResult | null;
  selectedModelName: string;
  warning?: string;
}

export default function ResultsDashboard({
  result,
  selectedModelName,
  warning,
}: ResultsDashboardProps) {
  const [copied, setCopied] = useState(false);

  if (!result) {
    return (
      <div id="results-placeholder" className="border border-dashed border-gray-200 bg-gray-50 rounded-md p-12 text-center flex flex-col items-center justify-center min-h-[300px]">
        <Layers className="w-8 h-8 text-gray-300 mb-3" />
        <h3 className="font-sans font-bold text-gray-700 text-sm">No Results Yet</h3>
        <p className="text-xs text-gray-400 font-mono mt-1 max-w-md">
          Paste raw text, select a classifier, and run the pipeline to see results.
        </p>
      </div>
    );
  }

  const { segments, cleanedText, metrics } = result;

  const handleCopy = () => {
    navigator.clipboard.writeText(cleanedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const element = document.createElement("a");
    const file = new Blob([cleanedText], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = `noisecleaner_output_${Date.now()}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div id="results-panel" className="border border-gray-200 rounded-md bg-white shadow-sm flex flex-col overflow-hidden">
      {/* Warning banner — only shown if the model had an issue */}
      {warning && (
        <div className="bg-amber-50 border-b border-amber-100 px-4 py-2.5 text-xs text-amber-800 flex gap-2 items-center">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
          <span className="font-medium">{warning}</span>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-5 border-b border-gray-100 bg-gray-50/70">
        <div className="border-r border-gray-100 pr-4 last:border-none">
          <div className="font-sans text-[10px] font-bold text-gray-400 uppercase tracking-wider">
            Total Segments
          </div>
          <div className="font-mono text-2xl font-bold text-gray-900 mt-1">
            {metrics.totalSegments.toLocaleString()}
          </div>
        </div>
        <div className="border-r border-gray-100 pr-4 last:border-none">
          <div className="font-sans text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
            Noise Removed
            <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
          </div>
          <div className="font-mono text-2xl font-bold text-red-600 mt-1">
            {metrics.noiseRemoved.toLocaleString()}
          </div>
        </div>
        <div className="border-r border-gray-100 pr-4 last:border-none">
          <div className="font-sans text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
            Remaining Content
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
          </div>
          <div className="font-mono text-2xl font-bold text-green-600 mt-1">
            {metrics.contentRetained.toLocaleString()}
          </div>
        </div>
        <div className="pr-4">
          <div className="font-sans text-[10px] font-bold text-gray-400 uppercase tracking-wider">
            Cleaning Ratio
          </div>
          <div className="font-mono text-2xl font-bold text-[#795900] mt-1">
            {metrics.cleaningRatio}%
          </div>
        </div>
      </div>

      {/* Split Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-100">
        {/* Left: Original with classification labels */}
        <div className="p-5 flex flex-col h-[480px]">
          <div className="flex justify-between items-center mb-3">
            <div className="flex flex-col">
              <h3 className="font-sans font-bold text-sm text-gray-900">
                Original Text with Labels
              </h3>
              <span className="text-[10px] text-gray-400 font-mono mt-0.5">
                Classified by {selectedModelName}
              </span>
            </div>
            <div className="flex gap-2">
              <span className="bg-red-50 text-red-700 px-2 py-0.5 rounded text-[10px] border border-red-100 font-semibold font-mono">
                Noise
              </span>
              <span className="bg-green-50 text-green-700 px-2 py-0.5 rounded text-[10px] border border-green-100 font-semibold font-mono">
                Content
              </span>
            </div>
          </div>

          <div className="flex-grow overflow-y-auto border border-gray-100 rounded p-3 font-mono text-[11px] leading-relaxed space-y-2 bg-gray-50/30">
            {segments.map((seg) => (
              <div key={seg.id} className="flex gap-2.5 group relative">
                {/* Visual indicator line */}
                <div
                  className={`w-1 rounded-full shrink-0 h-auto ${
                    seg.isNoise ? "bg-red-300" : "bg-green-400"
                  }`}
                />

                {/* Content Block */}
                <div
                  className={`p-2 rounded w-full flex justify-between items-start transition-colors duration-200 ${
                    seg.isNoise
                      ? "bg-red-50/50 text-red-900/60 line-through decoration-red-200/60 hover:bg-red-50"
                      : "bg-green-50/50 text-green-900 hover:bg-green-50"
                  }`}
                  title={seg.reason}
                >
                  <span className="break-all whitespace-pre-wrap pr-4">{seg.text}</span>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                        seg.isNoise
                          ? "text-red-500 bg-white border border-red-100"
                          : "text-green-600 bg-white border border-green-100"
                      }`}
                    >
                      {seg.score.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Cleaned Output */}
        <div className="p-5 flex flex-col h-[480px]">
          <div className="flex justify-between items-center mb-3">
            <div className="flex flex-col">
              <h3 className="font-sans font-bold text-sm text-gray-900">
                Clean Reconstructed Text
              </h3>
              <span className="text-[10px] text-gray-400 font-mono mt-0.5">
                Content segments retained in original order
              </span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleCopy}
                className="text-gray-500 hover:text-black hover:bg-gray-50 text-xs px-2.5 py-1.5 rounded border border-gray-200 flex items-center gap-1.5 transition-all"
                title="Copy clean text"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-green-600" />
                    <span className="text-green-600 font-bold">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>
              <button
                onClick={handleDownload}
                className="text-gray-500 hover:text-black hover:bg-gray-50 text-xs px-2.5 py-1.5 rounded border border-gray-200 flex items-center gap-1.5 transition-all"
                title="Download text corpus file"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download</span>
              </button>
            </div>
          </div>

          <div className="flex-grow overflow-y-auto border border-gray-100 rounded p-4 font-mono text-[12px] leading-relaxed bg-[#f9f9f9] text-gray-800 whitespace-pre-wrap select-text">
            {cleanedText || (
              <span className="text-gray-300 italic">No content extracted. All segments were classified as noise.</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
