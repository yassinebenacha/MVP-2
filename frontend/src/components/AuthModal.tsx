import React, { useState, useRef } from "react";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword
} from "firebase/auth";
import { auth } from "../../firebase";
import { X, Mail, Lock, AlertCircle, Loader2 } from "lucide-react";
import { useFocusTrap } from "../hooks/useFocusTrap";
import { useToast } from "./Toast";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const modalRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Attach focus trap
  useFocusTrap(isOpen, modalRef, onClose);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }

    if (isSignUp && password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setIsLoading(true);

    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password);
        toast("Account created successfully!", "success");
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        toast("Signed in successfully!", "success");
      }
      onClose();
      // Reset form fields
      setEmail("");
      setPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      console.error("Firebase auth error:", err);
      // Clean error messages from Firebase
      let userFriendlyMessage = err.message;
      if (err.code === "auth/invalid-credential") {
        userFriendlyMessage = "Invalid email or password.";
      } else if (err.code === "auth/email-already-in-use") {
        userFriendlyMessage = "This email is already in use.";
      } else if (err.code === "auth/invalid-email") {
        userFriendlyMessage = "Please enter a valid email address.";
      } else if (err.code === "auth/weak-password") {
        userFriendlyMessage = "Password should be at least 6 characters.";
      }
      setError(userFriendlyMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs transition-opacity duration-300">
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-modal-title"
        tabIndex={-1}
        className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-100 flex flex-col relative animate-in fade-in zoom-in-95 duration-200 outline-none"
      >
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-black p-1 hover:bg-gray-50 rounded transition-all focus-visible:ring-2 focus-visible:ring-[#ffc000] focus-visible:outline-none"
          aria-label="Close authentication modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="p-6 pb-2">
          <div className="w-10 h-10 bg-[#ffc000] rounded flex items-center justify-center font-bold text-black text-xl mb-4 shadow-sm">
            N
          </div>
          <h3 id="auth-modal-title" className="font-sans font-black text-2xl text-gray-900 tracking-tight">
            {isSignUp ? "Create your account" : "Welcome back"}
          </h3>
          <p className="text-xs text-gray-500 font-sans mt-1">
            {isSignUp
              ? "Create an account to access NOISECLEANER."
              : "Sign in to your account."}
          </p>
        </div>

        {/* Auth form */}
        <form onSubmit={handleSubmit} className="p-6 pt-2 space-y-4">
          
          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-100 rounded-md text-xs text-red-800 flex gap-2 items-center">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Email Input */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-700 font-sans" htmlFor="email">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
              <input
                id="email"
                type="email"
                placeholder="you@university.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:border-black transition-all bg-gray-50/50 focus-visible:ring-2 focus-visible:ring-[#ffc000] focus-visible:outline-none"
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-700 font-sans" htmlFor="password">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:border-black transition-all bg-gray-50/50 focus-visible:ring-2 focus-visible:ring-[#ffc000] focus-visible:outline-none"
              />
            </div>
          </div>

          {/* Confirm Password Input (Sign Up only) */}
          {isSignUp && (
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-700 font-sans" htmlFor="confirmPassword">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                <input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={isLoading}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:border-black transition-all bg-gray-50/50 focus-visible:ring-2 focus-visible:ring-[#ffc000] focus-visible:outline-none"
                />
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#ffc000] hover:bg-[#e6ad00] text-black py-2.5 rounded font-bold hover:shadow uppercase tracking-wider text-xs flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed mt-2 focus-visible:ring-2 focus-visible:ring-[#ffc000] focus-visible:outline-none"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Processing...
              </>
            ) : isSignUp ? (
              "Create Account"
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        {/* Footer/Toggle */}
        <div className="p-4 bg-gray-50/80 border-t border-gray-100 rounded-b-lg flex justify-center text-xs font-sans text-gray-500">
          {isSignUp ? (
            <span>
              Already have an account?{" "}
              <button
                onClick={() => {
                  setIsSignUp(false);
                  setError(null);
                }}
                className="text-black font-bold hover:underline focus-visible:ring-2 focus-visible:ring-[#ffc000] focus-visible:outline-none rounded px-1"
              >
                Sign In
              </button>
            </span>
          ) : (
            <span>
              Don't have an account?{" "}
              <button
                onClick={() => {
                  setIsSignUp(true);
                  setError(null);
                }}
                className="text-black font-bold hover:underline focus-visible:ring-2 focus-visible:ring-[#ffc000] focus-visible:outline-none rounded px-1"
              >
                Create Account
              </button>
            </span>
          )}
        </div>

      </div>
    </div>
  );
}
