interface FooterProps {
  onShowModal: (
    modal:
      | "research"
      | "methodology"
      | "documentation"
      | "affiliations"
      | "privacy"
      | "terms"
      | "contact"
      | null
  ) => void;
}

export default function Footer({ onShowModal }: FooterProps) {
  return (
    <footer id="app-footer" className="bg-white border-t border-gray-100 py-8 mt-auto w-full">
      <div className="flex flex-col md:flex-row justify-between items-center px-6 max-w-7xl mx-auto gap-4">
        <div className="flex flex-col gap-1">
          <div className="font-extrabold text-lg text-gray-900 tracking-tight">
            NOISE<span className="text-[#ffc000]">CLEANER</span>
          </div>
          <div className="text-xs text-gray-400 font-mono">
            NLP Preprocessing
          </div>
          <div className="text-[10px] text-gray-400 font-mono">
            Developed during an engineering internship at Harmony Technology
          </div>
        </div>

        <nav className="flex flex-wrap gap-x-6 gap-y-2 justify-center items-center">
          <button
            onClick={() => onShowModal("privacy")}
            className="font-sans text-xs font-bold text-gray-500 hover:text-black uppercase tracking-wider"
          >
            Privacy Policy
          </button>
          <span className="text-gray-300 hidden md:inline">|</span>
          <button
            onClick={() => onShowModal("terms")}
            className="font-sans text-xs font-bold text-gray-500 hover:text-black uppercase tracking-wider"
          >
            Terms of Service
          </button>
          <span className="text-gray-300 hidden md:inline">|</span>
          <button
            onClick={() => onShowModal("contact")}
            className="font-sans text-xs font-bold text-gray-500 hover:text-black uppercase tracking-wider"
          >
            Contact
          </button>
        </nav>

        <div className="font-sans text-xs text-gray-400 text-center md:text-right">
          © 2026 Harmony Technology
          <div className="text-[10px] mt-1 text-gray-300 font-mono">
            CEIRA — Harmony Technology
          </div>
        </div>
      </div>
    </footer>
  );
}
