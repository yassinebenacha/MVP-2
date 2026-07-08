import React, { useRef, useState } from "react";
import { Upload, FileText, HelpCircle } from "lucide-react";

interface RawInputProps {
  text: string;
  onChangeText: (text: string) => void;
  onSelectTemplate: (template: string) => void;
}

export default function RawInput({ text, onChangeText, onSelectTemplate }: RawInputProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Plain text corpus templates — no HTML, no DOM, no markup
  const templates = {
    standard: `Breaking News - AI Revolution in Healthcare

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

Footer: About Us | Privacy Policy | Terms of Service | Contact`,

    news: `Une femme à la tête du prochain gouvernement ?

Fatima-Zahra Mansouri dénonce un double standard persistant envers les femmes leaders.

Publicité: Obtenez votre assurance premium maintenant !

La dirigeante du PAM défend son aptitude à mener la prochaine équipe gouvernementale.

Publié le 1 Février 2026 à 14:50 par Maroc Hebdo

Les intelligences artificielles transforment de nombreux secteurs économiques à travers le monde.

S'abonner pour lire la suite — à partir de 4,99€ par mois.

Des chercheurs montrent des résultats prometteurs en utilisant des architectures basées sur les transformeurs pour l'aide à la décision clinique.

Articles liés:
Top 10 des startups IA cette année.
Les meilleures innovations technologiques du mois.

Mentions légales | Politique de confidentialité | Contact`,

    research: `Natural Language Processing Advances in 2026

Advertisement: Join our premium research subscription today!

Prepared for an academic NLP engineering prototype

The field of natural language processing has seen remarkable advances in the past year, with transformer-based models achieving near-human performance on several benchmark tasks.

Newsletter signup: Stay updated with our weekly NLP digest. Enter your email below.

Supervised learning approaches are useful for domain-specific classification tasks when labeled training data is available.

Support vector machines trained on MiniLM semantic embeddings remain competitive for segment classification, especially in resource-constrained environments where inference latency is critical.

Related posts:
Comparing MiniLM embeddings with supervised classifiers for noisy corpus cleaning.
How to build a text cleaning pipeline from scratch.

Logistic regression models trained on 384-dimensional multilingual embeddings provide interpretable confidence scores that are valuable for downstream decision-making in clinical and legal NLP applications.

Copyright 2026 Harmony Technology. All rights reserved.`,
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      readFile(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      readFile(file);
    }
  };

  const readFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target && typeof event.target.result === "string") {
        onChangeText(event.target.result);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div id="raw-input-panel" className="border border-gray-200 bg-white p-5 rounded-md flex flex-col h-full shadow-sm">
      {/* Header */}
      <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <FileText className="text-[#795900] w-5 h-5" />
          <h2 className="font-sans font-bold text-lg text-gray-900">Raw Text Segments</h2>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="text-gray-500 hover:text-black hover:bg-gray-50 text-xs px-3 py-1.5 rounded border border-gray-200 flex items-center gap-1.5 transition-all"
          >
            <Upload className="w-3.5 h-3.5" /> Upload File
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".txt,.csv"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      </div>

      {/* Templates Row */}
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <span className="text-xs text-gray-400 font-mono">Sample Corpora:</span>
        <button
          onClick={() => onSelectTemplate(templates.standard)}
          className="text-xs font-semibold bg-gray-100 hover:bg-[#ffdf9e] text-gray-800 px-2 py-1 rounded transition-colors"
        >
          Blog + Ad (Default)
        </button>
        <button
          onClick={() => onSelectTemplate(templates.news)}
          className="text-xs font-semibold bg-gray-100 hover:bg-[#ffdf9e] text-gray-800 px-2 py-1 rounded transition-colors"
        >
          News Article
        </button>
        <button
          onClick={() => onSelectTemplate(templates.research)}
          className="text-xs font-semibold bg-gray-100 hover:bg-[#ffdf9e] text-gray-800 px-2 py-1 rounded transition-colors"
        >
          Research Paper
        </button>
      </div>

      {/* Text Area / Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`flex-grow relative rounded border transition-all ${
          isDragging
            ? "border-2 border-[#ffc000] bg-[#fffdf5]"
            : "border-gray-200 focus-within:border-black"
        }`}
      >
        <textarea
          value={text}
          onChange={(e) => onChangeText(e.target.value)}
          className="w-full h-full min-h-[320px] p-4 font-mono text-xs text-gray-800 bg-transparent resize-none focus:outline-none border-none"
          placeholder="Paste raw noisy text here. The system will classify each paragraph as content or noise, then reconstruct a clean version. You can also drag and drop a .txt file directly."
        />

        {isDragging && (
          <div className="absolute inset-0 bg-[#fffdf5] bg-opacity-95 flex flex-col items-center justify-center p-4 pointer-events-none text-center">
            <Upload className="w-12 h-12 text-[#ffc000] animate-bounce mb-2" />
            <p className="font-sans font-bold text-gray-800">Drop your file here</p>
            <p className="text-xs text-gray-400 font-mono mt-1">Accepting .txt, .csv formats</p>
          </div>
        )}
      </div>

      <div className="mt-2 flex items-center gap-1.5 text-xs text-gray-400 font-mono">
        <HelpCircle className="w-3.5 h-3.5 text-gray-400" />
        <span>Each paragraph is embedded with MiniLM, then classified as Content or Noise.</span>
      </div>
    </div>
  );
}
