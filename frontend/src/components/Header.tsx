import { useState } from "react";
import { User as UserIcon, LogOut, Menu, X } from "lucide-react";
import { User } from "firebase/auth";

interface HeaderProps {
  onShowModal: (modal: "research" | "methodology" | "documentation" | "affiliations" | "privacy" | "terms" | "contact" | null) => void;
  user: User | null;
  onSignInClick: () => void;
  onSignOut: () => void;
}

export default function Header({ onShowModal, user, onSignInClick, onSignOut }: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleMobileNavClick = (modal: "research" | "methodology" | "documentation" | "affiliations") => {
    onShowModal(modal);
    setIsMobileMenuOpen(false);
  };

  return (
    <header id="app-header" className="bg-white border-b border-gray-100 sticky top-0 z-40">
      <div className="flex justify-between items-center h-16 px-4 md:px-6 max-w-7xl mx-auto">
        {/* Logo/Brand */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#ffc000] rounded flex items-center justify-center font-bold text-black text-lg shadow-sm">
            N
          </div>
          <span className="font-sans font-extrabold text-xl md:text-2xl tracking-tight text-gray-950">
            NOISE<span className="text-[#ffc000]">CLEANER</span>
          </span>
          <span className="hidden md:inline bg-gray-100 text-gray-600 font-mono text-[10px] px-2 py-0.5 rounded border border-gray-200 ml-2">
            v2.0
          </span>
        </div>

        {/* Middle Navigation — Desktop only */}
        <nav className="hidden md:flex gap-8 items-center">
          <button
            onClick={() => onShowModal("research")}
            className="font-sans text-sm font-semibold text-[#795900] border-b-2 border-[#ffc000] pb-1 hover:text-black transition-colors"
          >
            Research
          </button>
          <button
            onClick={() => onShowModal("methodology")}
            className="font-sans text-sm font-semibold text-gray-500 hover:text-black hover:border-b-2 hover:border-[#ffc000] pb-1 transition-all"
          >
            Methodology
          </button>
          <button
            onClick={() => onShowModal("documentation")}
            className="font-sans text-sm font-semibold text-gray-500 hover:text-black hover:border-b-2 hover:border-[#ffc000] pb-1 transition-all"
          >
            Documentation
          </button>
        </nav>

        {/* Actions */}
        <div className="flex gap-2 md:gap-3 items-center">
          {/* Affiliations — Desktop only */}
          <button
            onClick={() => onShowModal("affiliations")}
            className="hidden md:flex bg-transparent border border-gray-300 text-gray-700 px-4 py-2 rounded font-semibold hover:bg-gray-50 transition-all text-sm h-9 items-center justify-center"
          >
            Affiliations
          </button>
          
          {user ? (
            <div className="flex items-center gap-2 md:gap-3">
              {/* User profile info */}
              <div className="hidden sm:flex items-center gap-1.5 bg-gray-50 border border-gray-200 text-gray-700 px-3 py-1.5 rounded text-xs font-mono">
                <UserIcon className="w-3.5 h-3.5 text-gray-400" />
                <span>{user.email}</span>
              </div>
              <button
                onClick={onSignOut}
                className="bg-black hover:bg-gray-800 text-white px-3.5 py-2 rounded font-bold transition-all text-xs h-9 flex items-center justify-center gap-1.5 shadow-sm"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          ) : (
            <button
              onClick={onSignInClick}
              className="bg-[#ffc000] hover:bg-[#e6ad00] text-black px-4 py-2 rounded font-bold transition-all text-sm h-9 flex items-center justify-center shadow-sm"
            >
              Sign In
            </button>
          )}

          {/* Hamburger menu — Mobile only */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden flex items-center justify-center w-11 h-11 text-gray-600 hover:text-black hover:bg-gray-50 rounded transition-colors"
            aria-label={isMobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <nav
          className="md:hidden border-t border-gray-100 bg-white px-4 py-2 space-y-1"
          aria-label="Mobile navigation"
        >
          <button
            onClick={() => handleMobileNavClick("research")}
            className="w-full text-left font-sans text-sm font-semibold text-gray-700 hover:text-black hover:bg-gray-50 px-3 py-3 rounded transition-colors"
          >
            Research
          </button>
          <button
            onClick={() => handleMobileNavClick("methodology")}
            className="w-full text-left font-sans text-sm font-semibold text-gray-700 hover:text-black hover:bg-gray-50 px-3 py-3 rounded transition-colors"
          >
            Methodology
          </button>
          <button
            onClick={() => handleMobileNavClick("documentation")}
            className="w-full text-left font-sans text-sm font-semibold text-gray-700 hover:text-black hover:bg-gray-50 px-3 py-3 rounded transition-colors"
          >
            Documentation
          </button>
          <div className="border-t border-gray-100 pt-1 mt-1">
            <button
              onClick={() => handleMobileNavClick("affiliations")}
              className="w-full text-left font-sans text-sm font-semibold text-gray-700 hover:text-black hover:bg-gray-50 px-3 py-3 rounded transition-colors"
            >
              Affiliations
            </button>
          </div>
        </nav>
      )}
    </header>
  );
}
