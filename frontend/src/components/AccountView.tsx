import { useState, useEffect, useCallback } from "react";
import { User } from "firebase/auth";
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  limit, 
  getDocs, 
  deleteDoc, 
  doc, 
  getCountFromServer 
} from "firebase/firestore";
import { db } from "../../firebase";
import { useToast } from "./Toast";
import { Trash2, User as UserIcon, History, Loader2, ArrowLeft } from "lucide-react";

interface AccountViewProps {
  user: User;
  onSignOut: () => void;
  onNavigateHome: () => void;
  onTriggerClearHistoryModal: () => void;
  // A trigger prop to reload history after Clear All is confirmed in parent modal
  clearHistoryTrigger: number;
}

interface HistoryItem {
  id: string;
  model: string;
  createdAt: any;
  processingTime: number;
  segmentCount: number;
  cleaningRatio: number;
}

export default function AccountView({
  user,
  onSignOut,
  onNavigateHome,
  onTriggerClearHistoryModal,
  clearHistoryTrigger
}: AccountViewProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalAnalyses, setTotalAnalyses] = useState<number | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeletingItem, setIsDeletingItem] = useState(false);
  const { toast } = useToast();

  const fetchAccountData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Fetch total count of analyses via aggregation query
      const historyColl = collection(db, "analysisHistory");
      const qCount = query(historyColl, where("userId", "==", user.uid));
      const countSnapshot = await getCountFromServer(qCount);
      setTotalAnalyses(countSnapshot.data().count);

      // 2. Fetch last 50 analyses ordered by creation time descending
      const qHistory = query(
        historyColl,
        where("userId", "==", user.uid),
        orderBy("createdAt", "desc"),
        limit(50)
      );
      const historySnapshot = await getDocs(qHistory);
      const items: HistoryItem[] = [];
      historySnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        items.push({
          id: docSnap.id,
          model: data.model,
          createdAt: data.createdAt,
          processingTime: data.processingTime,
          segmentCount: data.segmentCount,
          cleaningRatio: data.cleaningRatio
        });
      });
      setHistory(items);
    } catch (err: any) {
      console.error("Failed to load account data:", err);
      const isDev = import.meta.env.DEV;
      setError(
        isDev
          ? `Firebase Error [${err.code || "unknown"}]: ${err.message || String(err)}`
          : "Failed to load analysis history. Please check your network connection or refresh the page."
      );
      toast("Error loading history. Please check connection and refresh.", "error");
    } finally {
      setLoading(false);
    }
  }, [user.uid, toast]);

  useEffect(() => {
    fetchAccountData();
  }, [fetchAccountData, clearHistoryTrigger]);

  const handleDeleteItem = async (itemId: string) => {
    setIsDeletingItem(true);
    try {
      await deleteDoc(doc(db, "analysisHistory", itemId));
      setHistory((prev) => prev.filter((item) => item.id !== itemId));
      setTotalAnalyses((prev) => (prev !== null ? Math.max(0, prev - 1) : null));
      toast("Item deleted successfully.", "success");
    } catch (err) {
      console.error("Delete history item error:", err);
      toast("Failed to delete history item.", "error");
    } finally {
      setDeletingId(null);
      setIsDeletingItem(false);
    }
  };

  const getModelLabel = (modelId: string) => {
    return modelId === "svm" ? "Linear SVM" : modelId === "lr" ? "Logistic Regression" : "ML Classifier";
  };

  return (
    <div className="max-w-4xl mx-auto w-full px-4 py-6 md:py-10 space-y-6 md:space-y-8 animate-in fade-in duration-200">
      {/* Back button */}
      <button
        onClick={onNavigateHome}
        className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-black font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-[#ffc000] focus-visible:outline-none rounded px-2 py-1 cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Workspace
      </button>

      {/* Section A: Account Block */}
      <section className="border border-gray-200 rounded-md bg-white p-4 md:p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-100">
          <UserIcon className="text-[#795900] w-5 h-5" />
          <h2 className="font-sans font-bold text-lg text-gray-900">Account Details</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider font-mono">
              Email Address
            </span>
            <span className="block text-sm font-semibold text-gray-900 mt-1 break-all">
              {user.email}
            </span>
          </div>

          <div>
            <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider font-mono">
              Member Since
            </span>
            <span className="block text-sm font-semibold text-gray-900 mt-1">
              {user.metadata.creationTime 
                ? new Date(user.metadata.creationTime).toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })
                : "N/A"}
            </span>
          </div>

          <div>
            <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider font-mono">
              Total Analyses
            </span>
            <span className="block text-sm font-semibold text-gray-900 mt-1">
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin text-gray-400 mt-0.5" />
              ) : (
                totalAnalyses !== null ? totalAnalyses.toLocaleString() : "N/A"
              )}
            </span>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-gray-100 flex justify-end">
          <button
            onClick={onSignOut}
            className="bg-black hover:bg-gray-800 text-white px-4 py-2 rounded font-bold transition-all text-xs focus-visible:ring-2 focus-visible:ring-[#ffc000] focus-visible:outline-none cursor-pointer"
          >
            Sign Out
          </button>
        </div>
      </section>

      {/* Section B: History Block */}
      <section className="border border-gray-200 rounded-md bg-white p-4 md:p-6 shadow-sm flex flex-col">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 pb-2 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <History className="text-[#795900] w-5 h-5" />
            <h2 className="font-sans font-bold text-lg text-gray-900">Analysis History</h2>
          </div>
          
          {history.length > 0 && (
            <button
              onClick={onTriggerClearHistoryModal}
              className="text-red-600 hover:text-red-700 border border-red-200 hover:border-red-300 hover:bg-red-50 text-xs px-3 py-1.5 rounded transition-all focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:outline-none cursor-pointer font-bold"
            >
              Delete All History
            </button>
          )}
        </div>

        {loading && history.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-400">
            <Loader2 className="w-8 h-8 animate-spin mb-2" />
            <span className="text-xs font-mono">Loading history log...</span>
          </div>
        ) : error ? (
          <div className="py-12 text-center text-red-500 font-mono text-xs">
            {error}
          </div>
        ) : history.length === 0 ? (
          <div className="py-12 text-center">
            <span className="text-xs text-gray-400 font-mono">
              Your completed analyses will appear here.
            </span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-gray-100 text-[10px] text-gray-400 font-mono uppercase tracking-wider">
                  <th className="py-3 px-2 font-bold">Date & Time</th>
                  <th className="py-3 px-2 font-bold">Model</th>
                  <th className="py-3 px-2 font-bold text-right">Processing Time</th>
                  <th className="py-3 px-2 font-bold text-right">Segments</th>
                  <th className="py-3 px-2 font-bold text-right">Ratio</th>
                  <th className="py-3 px-2 font-bold text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 font-sans">
                {history.map((item) => {
                  const dateObj = item.createdAt?.toDate ? item.createdAt.toDate() : null;
                  const formattedDate = dateObj 
                    ? dateObj.toLocaleDateString() + " " + dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    : "Pending...";

                  return (
                    <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="py-3.5 px-2 font-mono text-gray-600">{formattedDate}</td>
                      <td className="py-3.5 px-2 font-semibold text-gray-900">{getModelLabel(item.model)}</td>
                      <td className="py-3.5 px-2 text-right font-mono text-gray-600">{item.processingTime} ms</td>
                      <td className="py-3.5 px-2 text-right font-mono text-gray-600">{item.segmentCount}</td>
                      <td className="py-3.5 px-2 text-right font-mono font-bold text-[#795900]">{item.cleaningRatio}%</td>
                      <td className="py-3.5 px-2 text-center">
                        <button
                          disabled={isDeletingItem}
                          onClick={() => handleDeleteItem(item.id)}
                          className="text-gray-400 hover:text-red-600 p-1.5 rounded hover:bg-gray-100 transition-colors inline-flex items-center justify-center focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:outline-none disabled:opacity-50"
                          title="Delete this analysis record"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            
            <p className="text-[10px] text-gray-400 font-mono mt-4 text-center">
              Displaying the last 50 analysis runs. Document history is stored locally in your session's metadata.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
