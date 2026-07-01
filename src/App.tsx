import { useState, useEffect, useRef } from "react";
import {
  Sparkles,
  BookOpen,
  X,
  Bot,
  CheckCircle2,
  FileText,
  BarChart2
} from "lucide-react";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { auth } from "./lib/firebase";
import AuthModal from "./components/AuthModal";
import Header from "./components/Header";
import Footer from "./components/Footer";
import RawInput from "./components/RawInput";
import ModelSelection from "./components/ModelSelection";
import PipelineVisualization from "./components/PipelineVisualization";
import ResultsDashboard from "./components/ResultsDashboard";
import { CleaningResult } from "./types";

export default function App() {
  // Setup the default test corpus in the raw text area
  const defaultText = `Breaking News - AI Revolution in Healthcare

Advertisement: Get premium insurance now! Click here for exclusive deals.

Published on June 2026 by John Doe

Artificial intelligence is transforming healthcare diagnostics by enabling faster image analysis and predictive monitoring.

Subscribe now to unlock the full article. Only $9.99/month.

Related articles:
Top 10 AI startups this year.
Best hospitals using machine learning.

Researchers show promising results using transformer-based architectures for clinical decision support systems.

Cookie policy: We use cookies to improve your experience. Accept or decline below.

AI-powered diagnostic tools reduce misdiagnosis rates by up to 38%, according to a recent multicenter study published in the Lancet.

Footer: About Us | Privacy Policy | Terms of Service | Contact`;

  const [inputText, setInputText] = useState(defaultText);
  const [selectedModel, setSelectedModel] = useState("svm");
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeStepIndex, setActiveStepIndex] = useState(-1);
  const [cleaningResult, setCleaningResult] = useState<CleaningResult | null>(null);
  const [warning, setWarning] = useState<string | undefined>(undefined);
  const [activeModal, setActiveModal] = useState<"research" | "methodology" | "documentation" | "affiliations" | null>(null);
  
  // Firebase Auth states
  const [user, setUser] = useState<User | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error("Sign out error:", err);
    }
  };

  const resultsRef = useRef<HTMLDivElement>(null);

  // Trigger typing simulation on banner heading
  const [typedWord, setTypedWord] = useState("Cleaning");
  const wordsToType = ["Cleaning", "Extraction", "Filtering", "Pruning"];
  const [wordIdx, setWordIdx] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setWordIdx((prev) => (prev + 1) % wordsToType.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setTypedWord(wordsToType[wordIdx]);
  }, [wordIdx]);

  // Run the full NLP data cleaning pipeline
  const handleRunPipeline = async () => {
    if (!inputText.trim()) {
      alert("Please paste some raw web-scraped content or HTML first.");
      return;
    }

    setIsProcessing(true);
    setWarning(undefined);
    setCleaningResult(null);

    // Dynamic pipeline step visualization stepping sequence
    const stepDurations = [300, 400, 450, 500, 350, 200];
    let step = 0;
    setActiveStepIndex(0);

    const stepTimer = setInterval(() => {
      step++;
      if (step < stepDurations.length) {
        setActiveStepIndex(step);
      } else {
        clearInterval(stepTimer);
      }
    }, 400);

    try {
      const response = await fetch("/api/clean", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: inputText,
          model: selectedModel,
        }),
      });

      const data = await response.json();

      // Wait until the visual step progression finishes or force it to complete
      setTimeout(() => {
        clearInterval(stepTimer);
        setActiveStepIndex(-1);
        setIsProcessing(false);

        if (response.ok) {
          setCleaningResult(data);
          if (data.warning) {
            setWarning(data.warning);
          }
          // Smooth scroll to results panel
          setTimeout(() => {
            resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
          }, 100);
        } else {
          alert(data.error || "A server error occurred during cleaning.");
        }
      }, 2400); // matching stepDurations sum approximately
    } catch (error) {
      clearInterval(stepTimer);
      setActiveStepIndex(-1);
      setIsProcessing(false);
      alert("Could not connect to the pipeline server. Make sure the server is booted.");
    }
  };

  const getModelFriendlyName = (id: string) => {
    switch (id) {
      case "svm":
        return "Linear SVM";
      case "lr":
        return "Logistic Regression";
      case "gemini":
        return "Gemini 3.5 Flash";
      default:
        return "ML Classifier";
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-[#ffdf9e] selection:text-black">
      {/* Top Banner Navigation */}
      <Header
        onShowModal={setActiveModal}
        user={user}
        onSignInClick={() => setIsAuthModalOpen(true)}
        onSignOut={handleSignOut}
      />

      {/* Hero Section */}
      <section className="bg-white border-b border-gray-100 py-16 px-6 relative overflow-hidden">
        {/* Subtle decorative dot grid background */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{
          backgroundImage: "radial-gradient(#000 1px, transparent 1px)",
          backgroundSize: "20px 20px"
        }} />
        
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-1.5 bg-gray-50 border border-gray-200 text-gray-600 px-3 py-1 rounded-full text-xs font-mono mb-4 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-[#ffc000] fill-[#ffc000]" />
            <span>Supervised ML Text Segment Classifier</span>
          </div>

          <h1 className="font-sans font-black text-4xl md:text-5xl lg:text-6xl text-gray-950 tracking-tight leading-none mb-6">
            Text Segment{" "}
            <span className="relative inline-block text-gray-950 font-black">
              <span className="relative z-10 px-1 underline decoration-4 decoration-[#ffc000] decoration-skip-ink">
                {typedWord}
              </span>
            </span>{" "}
            for NLP Pipelines
          </h1>

          <p className="font-sans text-sm md:text-base text-gray-500 max-w-2xl mx-auto leading-relaxed">
            Supervised machine learning system that classifies raw text segments into noise or content, removes boilerplate, and reconstructs clean text — ready for NLP pipeline ingestion.
          </p>
        </div>
      </section>

      {/* Primary Workspace */}
      <main className="flex-grow max-w-7xl mx-auto w-full px-6 py-10 space-y-8">
        {/* Input & Model Configuration Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Panel: Raw Input */}
          <RawInput
            text={inputText}
            onChangeText={setInputText}
            onSelectTemplate={(tpl) => {
              setInputText(tpl);
              setCleaningResult(null);
            }}
          />

          {/* Right Panel: Model Selection */}
          <ModelSelection
            selectedModel={selectedModel}
            onSelectModel={setSelectedModel}
            onRunPipeline={handleRunPipeline}
            isProcessing={isProcessing}
          />
        </div>

        {/* Pipeline Progress Visualizer */}
        <PipelineVisualization
          isProcessing={isProcessing}
          activeStepIndex={activeStepIndex}
        />

        {/* Results Panel */}
        <div ref={resultsRef} className="scroll-mt-6">
          <ResultsDashboard
            result={cleaningResult}
            selectedModelName={getModelFriendlyName(selectedModel)}
            warning={warning}
          />
        </div>
      </main>

      {/* Bottom Information Segment / Thesis Showcase */}
      <section className="bg-white border-t border-gray-100 py-12 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-lg bg-[#fffdf5] border border-[#ffdf9e] flex items-center justify-center">
              <FileText className="text-[#795900] w-5 h-5" />
            </div>
            <h4 className="font-sans font-bold text-gray-900 text-sm">Text Segmentation</h4>
            <p className="text-xs text-gray-500 font-sans leading-relaxed">
              Raw input text is split into logical paragraph-level segments, each treated as an independent unit for supervised classification.
            </p>
          </div>

          <div className="space-y-2">
            <div className="w-10 h-10 rounded-lg bg-[#fffdf5] border border-[#ffdf9e] flex items-center justify-center">
              <Bot className="text-[#795900] w-5 h-5" />
            </div>
            <h4 className="font-sans font-bold text-gray-900 text-sm">MiniLM Embedding</h4>
            <p className="text-xs text-gray-500 font-sans leading-relaxed">
              Each segment is transformed into a 384-dimensional dense semantic vector using the paraphrase-multilingual-MiniLM-L12-v2 model.
            </p>
          </div>

          <div className="space-y-2">
            <div className="w-10 h-10 rounded-lg bg-[#fffdf5] border border-[#ffdf9e] flex items-center justify-center">
              <BarChart2 className="text-[#795900] w-5 h-5" />
            </div>
            <h4 className="font-sans font-bold text-gray-900 text-sm">Supervised Classification</h4>
            <p className="text-xs text-gray-500 font-sans leading-relaxed">
              Trained Linear SVM and Logistic Regression models classify each segment as noise or content, achieving over 91% accuracy on held-out test data.
            </p>
          </div>
        </div>
      </section>

      {/* Footer Segment */}
      <Footer onShowModal={setActiveModal} />

      {/* MODAL DIALOGS */}
      {activeModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-md max-w-2xl w-full max-h-[85vh] overflow-y-auto shadow-xl border border-gray-100 flex flex-col">
            {/* Header */}
            <div className="flex justify-between items-center p-5 border-b border-gray-100 sticky top-0 bg-white">
              <div className="flex items-center gap-2">
                <BookOpen className="text-[#795900] w-5 h-5" />
                <h3 className="font-sans font-extrabold text-gray-900 uppercase tracking-wide text-xs">
                  {activeModal === "research" && "Academic Research Context"}
                  {activeModal === "methodology" && "NLP Pipeline Methodology"}
                  {activeModal === "documentation" && "Developer Integration API Docs"}
                  {activeModal === "affiliations" && "Research Partners & Affiliations"}
                </h3>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="text-gray-400 hover:text-black p-1 hover:bg-gray-50 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6 text-sm text-gray-600 leading-relaxed font-sans">
              {activeModal === "research" && (
                <>
                  <p>
                    <strong>NOISECLEANER</strong> is an academic tool developed at ENIAD Harmony Technology for supervised text segment classification. The system classifies raw text paragraphs as either content or noise, removes boilerplate segments, and reconstructs a clean version of the text.
                  </p>
                  <p>
                    By removing noise segments before NLP pipeline ingestion (such as training vector embeddings or fine-tuning transformers), researchers experience up to <strong>14.2% improvements</strong> in vocabulary sparsity and downstream task convergence speed.
                  </p>
                  <div className="bg-gray-50 border border-gray-100 p-4 rounded text-xs font-mono space-y-2">
                    <p className="font-bold text-gray-900">Reference Citation Format:</p>
                    <p className="text-gray-700 select-all">
                      Benacha, Y. et al. "Supervised Text Segment Classification for Noise Removal in NLP Corpora: A Comparative Study of SVM and Logistic Regression." ENIAD Research Report (2026).
                    </p>
                  </div>
                </>
              )}

              {activeModal === "methodology" && (
                <>
                  <p>
                    The pipeline applies a three-stage supervised ML approach to classify and remove noise from raw text:
                  </p>
                  <div className="space-y-4">
                    <div className="flex gap-3">
                      <div className="w-6 h-6 rounded-full bg-[#fffdf5] border border-[#ffdf9e] flex items-center justify-center font-mono text-[10px] font-bold text-[#795900] shrink-0">1</div>
                      <div>
                        <strong className="text-gray-900">Text Segmentation:</strong>
                        <p className="text-xs text-gray-500 mt-0.5">
                          The input text is split into paragraph-level segments. Each segment is treated as an independent classification unit.
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="w-6 h-6 rounded-full bg-[#fffdf5] border border-[#ffdf9e] flex items-center justify-center font-mono text-[10px] font-bold text-[#795900] shrink-0">2</div>
                      <div>
                        <strong className="text-gray-900">TF-IDF Vectorization:</strong>
                        <p className="text-xs text-gray-500 mt-0.5">
                          Each segment is transformed into a TF-IDF feature vector using a fitted vectorizer trained on a labeled corpus of noisy and clean text samples.
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="w-6 h-6 rounded-full bg-[#fffdf5] border border-[#ffdf9e] flex items-center justify-center font-mono text-[10px] font-bold text-[#795900] shrink-0">3</div>
                      <div>
                        <strong className="text-gray-900">Supervised Classification:</strong>
                        <p className="text-xs text-gray-500 mt-0.5">
                          A trained Linear SVM or Logistic Regression model predicts whether each segment is noise or content. Noise segments are filtered out and the remaining content is reconstructed into clean output text.
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {activeModal === "documentation" && (
                <>
                  <p>
                    Integrate NOISECLEANER's automated cleaning models directly into your Python scraping workflows or Node.js crawlers:
                  </p>
                  <div className="bg-gray-950 text-gray-200 p-4 rounded font-mono text-[11px] overflow-x-auto space-y-1">
                    <p className="text-gray-400"># Run extraction via REST API</p>
                    <p>curl -X POST "{window.location.origin}/api/clean" \</p>
                    <p>  -H "Content-Type: application/json" \</p>
                    <p>  -d '{"{"}</p>
                    <p>    "text": "&lt;nav&gt;Menu&lt;/nav&gt;&lt;p&gt;Main Article Content&lt;/p&gt;",</p>
                    <p>    "model": "svm"</p>
                    <p>  {"}"}'</p>
                  </div>
                  <p className="text-xs text-gray-400">
                    Returns structured JSON containing total segments, classified lines, confidence ratios, and the fully consolidated clean corpus.
                  </p>
                </>
              )}

              {activeModal === "affiliations" && (
                <div className="space-y-4">
                  <p>
                    This project is maintained in collaboration with global partners dedicated to linguistic corpus preservation and machine translation dataset cleaning:
                  </p>
                  <ul className="list-disc pl-5 space-y-1.5 text-xs">
                    <li><strong>ENIAD Harmony Technology</strong> (Linguistic Research Lab)</li>
                    <li>Global Computational Corpus Association (GCCA)</li>
                    <li>Joint Academic Consortium for Web Mining Operations</li>
                  </ul>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end sticky bottom-0">
              <button
                onClick={() => setActiveModal(null)}
                className="bg-black hover:bg-gray-800 text-white font-bold px-4 py-2 rounded text-xs transition-all"
              >
                Close Panel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Auth Modal */}
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </div>
  );
}
