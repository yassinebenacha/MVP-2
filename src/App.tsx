import { useState, useEffect, useRef } from "react";
import {
  Sparkles,
  BookOpen,
  X,
  Bot,
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

Published on June 2026

Artificial intelligence is transforming healthcare diagnostics by enabling faster image analysis and predictive monitoring.

Subscribe now to unlock the full article. Only $9.99/month.

Related articles:
Top 10 AI startups this year.
Best hospitals using machine learning.

Researchers show promising results using transformer-based architectures for clinical decision support systems.

Cookie policy: We use cookies to improve your experience. Accept or decline below.

AI-powered diagnostic tools can support clinicians by accelerating document review and highlighting relevant information.

Footer: About Us | Privacy Policy | Terms of Service | Contact`;

  const [inputText, setInputText] = useState(defaultText);
  const [selectedModel, setSelectedModel] = useState("svm");
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeStepIndex, setActiveStepIndex] = useState(-1);
  const [cleaningResult, setCleaningResult] = useState<CleaningResult | null>(null);
  const [warning, setWarning] = useState<string | undefined>(undefined);
  const [activeModal, setActiveModal] = useState<"research" | "methodology" | "documentation" | "affiliations" | "privacy" | "terms" | "contact" | null>(null);
  
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
            <span>Academic NLP Cleaning Prototype</span>
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
            NOISECLEANER removes noisy web content by segmenting raw text, encoding each segment with MiniLM, classifying it with Linear SVM or Logistic Regression, and reconstructing clean text for downstream NLP systems.
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
              Raw text is split into paragraph-level segments, each processed independently before embedding and classification.
            </p>
          </div>

          <div className="space-y-2">
            <div className="w-10 h-10 rounded-lg bg-[#fffdf5] border border-[#ffdf9e] flex items-center justify-center">
              <Bot className="text-[#795900] w-5 h-5" />
            </div>
            <h4 className="font-sans font-bold text-gray-900 text-sm">MiniLM Embedding</h4>
            <p className="text-xs text-gray-500 font-sans leading-relaxed">
              Each segment is encoded into a 384-dimensional multilingual semantic embedding using paraphrase-multilingual-MiniLM-L12-v2.
            </p>
          </div>

          <div className="space-y-2">
            <div className="w-10 h-10 rounded-lg bg-[#fffdf5] border border-[#ffdf9e] flex items-center justify-center">
              <BarChart2 className="text-[#795900] w-5 h-5" />
            </div>
            <h4 className="font-sans font-bold text-gray-900 text-sm">Supervised Classification</h4>
            <p className="text-xs text-gray-500 font-sans leading-relaxed">
              Trained Linear SVM and Logistic Regression models classify MiniLM embeddings as Content or Noise while preserving retained segment order.
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
                  {activeModal === "research" && "Research Context"}
                  {activeModal === "methodology" && "NLP Pipeline Methodology"}
                  {activeModal === "documentation" && "Technical Documentation"}
                  {activeModal === "affiliations" && "Affiliations"}
                  {activeModal === "privacy" && "Privacy Policy"}
                  {activeModal === "terms" && "Terms of Service"}
                  {activeModal === "contact" && "Contact"}
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
                    <strong>NOISECLEANER</strong> is an academic engineering project developed during an internship at Harmony Technology within CEIRA (Centre d'Excellence en Innovation et Recherche Appliquée), Harmony Technology.
                  </p>
                  <p>
                    The objective is to remove noisy web content such as navigation text, advertisements, subscription prompts, and footer material from raw text collected from web pages.
                  </p>
                  <p>
                    Cleaning noisy text improves the quality of downstream NLP workflows by providing more focused input for indexing, embedding generation, classification, summarization, or model training.
                  </p>
                </>
              )}

              {activeModal === "methodology" && (
                <>
                  <p>
                    The implemented pipeline follows the same stages used by the backend prediction service:
                  </p>
                  <div className="space-y-4">
                    <div className="flex gap-3">
                      <div className="w-6 h-6 rounded-full bg-[#fffdf5] border border-[#ffdf9e] flex items-center justify-center font-mono text-[10px] font-bold text-[#795900] shrink-0">1</div>
                      <div>
                        <strong className="text-gray-900">Raw Text:</strong>
                        <p className="text-xs text-gray-500 mt-0.5">
                          The system receives raw text extracted from web pages or documents.
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="w-6 h-6 rounded-full bg-[#fffdf5] border border-[#ffdf9e] flex items-center justify-center font-mono text-[10px] font-bold text-[#795900] shrink-0">2</div>
                      <div>
                        <strong className="text-gray-900">Text Segmentation:</strong>
                        <p className="text-xs text-gray-500 mt-0.5">
                          The input document is split into paragraph-level text segments. Each segment is processed independently.
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="w-6 h-6 rounded-full bg-[#fffdf5] border border-[#ffdf9e] flex items-center justify-center font-mono text-[10px] font-bold text-[#795900] shrink-0">3</div>
                      <div>
                        <strong className="text-gray-900">MiniLM Embedding:</strong>
                        <p className="text-xs text-gray-500 mt-0.5">
                          Each segment is encoded into a 384-dimensional multilingual semantic embedding using SentenceTransformer with paraphrase-multilingual-MiniLM-L12-v2.
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="w-6 h-6 rounded-full bg-[#fffdf5] border border-[#ffdf9e] flex items-center justify-center font-mono text-[10px] font-bold text-[#795900] shrink-0">4</div>
                      <div>
                        <strong className="text-gray-900">Supervised Classification:</strong>
                        <p className="text-xs text-gray-500 mt-0.5">
                          The generated embeddings are passed to a trained Linear SVM or Logistic Regression classifier. Each segment is classified as Content or Noise.
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="w-6 h-6 rounded-full bg-[#fffdf5] border border-[#ffdf9e] flex items-center justify-center font-mono text-[10px] font-bold text-[#795900] shrink-0">5</div>
                      <div>
                        <strong className="text-gray-900">Noise Filtering:</strong>
                        <p className="text-xs text-gray-500 mt-0.5">
                          Segments classified as Noise are removed from the output.
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="w-6 h-6 rounded-full bg-[#fffdf5] border border-[#ffdf9e] flex items-center justify-center font-mono text-[10px] font-bold text-[#795900] shrink-0">6</div>
                      <div>
                        <strong className="text-gray-900">Clean Text Reconstruction:</strong>
                        <p className="text-xs text-gray-500 mt-0.5">
                          Retained Content segments are concatenated in their original order to produce the cleaned document.
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {activeModal === "documentation" && (
                <>
                  <p>
                    The frontend sends raw text and the selected classifier identifier to the cleaning API:
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
                    The API returns paragraph-level segments, Content/Noise predictions, confidence scores when available, aggregate metrics, and the reconstructed clean text.
                  </p>
                </>
              )}

              {activeModal === "affiliations" && (
                <div className="space-y-4">
                  <ul className="list-disc pl-5 space-y-1.5 text-xs">
                    <li><strong>Harmony Technology</strong></li>
                    <li><strong>CEIRA</strong> (Centre d'Excellence en Innovation et Recherche Appliquée)</li>
                  </ul>
                </div>
              )}

              {activeModal === "privacy" && (
                <ul className="list-disc pl-5 space-y-1.5 text-xs">
                  <li>Uploaded text is processed for prediction.</li>
                  <li>No personal data is intentionally collected.</li>
                  <li>User content is not permanently stored.</li>
                </ul>
              )}

              {activeModal === "terms" && (
                <p>
                  This software is an academic engineering prototype developed during an internship at Harmony Technology within CEIRA (Centre d'Excellence en Innovation et Recherche Appliquée). It is intended exclusively for research, demonstration, and educational purposes.
                </p>
              )}

              {activeModal === "contact" && (
                <p>
                  For project-related questions, contact Harmony Technology or CEIRA (Centre d'Excellence en Innovation et Recherche Appliquée), Harmony Technology.
                </p>
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
