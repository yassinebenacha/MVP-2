interface FooterProps {
  onShowModal: (modal: "research" | "methodology" | "documentation" | "affiliations" | null) => void;
}

export default function Footer({ onShowModal }: FooterProps) {
  return (
    <footer id="app-footer" className="bg-white border-t border-gray-100 py-8 mt-auto w-full">
      <div className="flex flex-col md:flex-row justify-between items-center px-6 max-w-7xl mx-auto gap-4">
        {/* Brand */}
        <div className="flex flex-col gap-1">
          <div className="font-extrabold text-lg text-gray-900 tracking-tight">
            NOISE<span className="text-[#ffc000]">CLEANER</span>
          </div>
          <div className="text-xs text-gray-400 font-mono">
            High-Precision Textual Boilerplate Extractor
          </div>
        </div>

        {/* Links */}
        <nav className="flex flex-wrap gap-x-6 gap-y-2 justify-center items-center">
          <button
            onClick={() => onShowModal("research")}
            className="font-sans text-xs font-bold text-gray-500 hover:text-black uppercase tracking-wider"
          >
            Privacy Policy
          </button>
          <span className="text-gray-300 hidden md:inline">•</span>
          <button
            onClick={() => onShowModal("methodology")}
            className="font-sans text-xs font-bold text-gray-500 hover:text-black uppercase tracking-wider"
          >
            Terms of Service
          </button>
          <span className="text-gray-300 hidden md:inline">•</span>
          <button
            onClick={() => onShowModal("documentation")}
            className="font-sans text-xs font-bold text-gray-500 hover:text-black uppercase tracking-wider"
          >
            Contact Research Team
          </button>
        </nav>

        {/* Copyright */}
        <div className="font-sans text-xs text-gray-400 text-center md:text-right">
          © {new Date().getFullYear()} ENIAD Harmony Technology. All Rights Reserved.
          <div className="text-[10px] mt-1 text-gray-300 font-mono">
            Optimized for Academic NLP Corpora
          </div>
        </div>
      </div>
    </footer>
  );
}
