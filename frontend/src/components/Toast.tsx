import React, { createContext, useContext, useState, useCallback } from "react";
import { AlertCircle, CheckCircle, Info, AlertTriangle, X } from "lucide-react";

export type ToastType = "success" | "warning" | "error" | "info";

export interface ToastMessage {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastContextType {
  toast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const toast = useCallback((message: string, type: ToastType = "info") => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, message }]);
    
    // Auto dismiss after 4 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      {/* Toast Container */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full px-4 sm:px-0">
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onClose={() => removeToast(t.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

function ToastItem({ toast, onClose }: { toast: ToastMessage; onClose: () => void }) {
  const { type, message } = toast;

  const styles = {
    success: {
      bg: "bg-green-50 border-green-100 text-green-800",
      icon: <CheckCircle className="w-5 h-5 text-green-600 shrink-0" />,
    },
    error: {
      bg: "bg-red-50 border-red-100 text-red-800",
      icon: <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />,
    },
    warning: {
      bg: "bg-amber-50 border-amber-100 text-amber-800",
      icon: <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />,
    },
    info: {
      bg: "bg-blue-50 border-blue-100 text-blue-800",
      icon: <Info className="w-5 h-5 text-blue-600 shrink-0" />,
    },
  };

  const currentStyle = styles[type];

  return (
    <div
      role="alert"
      className={`flex items-start gap-3 p-4 rounded-md border shadow-lg ${currentStyle.bg} animate-in slide-in-from-bottom-5 fade-in duration-200`}
    >
      {currentStyle.icon}
      <div className="flex-grow font-sans text-xs font-semibold leading-normal">
        {message}
      </div>
      <button
        onClick={onClose}
        className="text-gray-400 hover:text-gray-900 transition-colors p-0.5 rounded hover:bg-black/5"
        aria-label="Dismiss notification"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
