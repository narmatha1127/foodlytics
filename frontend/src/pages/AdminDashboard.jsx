import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import NavBar from "../components/NavBar";
import MealCard from "../components/MealCard";
import {
  getMenu, saveMenu, getVotes, finalizeWinners, getWinners, getExportUrl, getFeedback, deleteFeedback
} from "../api";

const MEALS = ["breakfast", "lunch", "dinner"];
const today = () => new Date().toISOString().slice(0, 10);

export default function AdminDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("menu");

  const [date, setDate] = useState(today());
  const [menu, setMenu] = useState({
    breakfast: { 1: "", 2: "", 3: "" },
    lunch:     { 1: "", 2: "", 3: "" },
    dinner:    { 1: "", 2: "", 3: "" },
  });
  const [votes, setVotes] = useState({});
  const [winners, setWinners] = useState([]);
  
  const [feedbacks, setFeedbacks] = useState([]);
  
  const [saving, setSaving] = useState(false);
  const [finalizing, setFinalizing] = useState(false);
  const [toast, setToast] = useState("");

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const loadData = useCallback(async () => {
    // 1. Load context-independent feedback data
    try {
      const fb = await getFeedback();
      setFeedbacks(fb || []);
    } catch (err) {
      console.error("Feedback Load Error:", err);
    }

    // 2. Load date-specific menu data (isolated catch to prevent blocking)
    try {
      const [menuData, voteData, winnerData] = await Promise.all([
        getMenu(date),
        getVotes(date),
        getWinners(date)
      ]);

      const merged = { 
        breakfast: { 1: "", 2: "", 3: "" }, 
        lunch: { 1: "", 2: "", 3: "" }, 
        dinner: { 1: "", 2: "", 3: "" } 
      };

      for (const meal of MEALS) {
        if (menuData[meal]) {
          for (const k of [1, 2, 3]) {
            merged[meal][k] = menuData[meal][String(k)] || "";
          }
        }
      }
      setMenu(merged);
      setVotes(voteData);
      setWinners(winnerData);
    } catch (err) {
      console.warn("Date-specific data Not Found for:", date);
      // Reset Menu/Votes for the new date if not found
      setMenu({
        breakfast: { 1: "", 2: "", 3: "" },
        lunch:     { 1: "", 2: "", 3: "" },
        dinner:    { 1: "", 2: "", 3: "" },
      });
      setVotes({});
      setWinners([]);
    }
  }, [date]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleMenuChange = (meal, opt, value) => {
    setMenu((prev) => ({ ...prev, [meal]: { ...prev[meal], [opt]: value } }));
  };

  const handleSaveMenu = async () => {
    setSaving(true);
    try {
      const payload = { date };
      for (const meal of MEALS) {
        payload[meal] = {};
        for (const k of [1, 2, 3]) {
          if (menu[meal][k]) payload[meal][k] = menu[meal][k];
        }
      }
      await saveMenu(payload);
      showToast("✅ Menu saved successfully!");
    } catch {
      showToast("❌ Failed to save menu.");
    } finally {
      setSaving(false);
    }
  };

  const handleFinalize = async () => {
    setFinalizing(true);
    try {
      await finalizeWinners(date);
      const winnerData = await getWinners(date);
      setWinners(winnerData);
      showToast("🏆 Winners finalized!");
    } catch {
      showToast("❌ Failed to finalize.");
    } finally {
      setFinalizing(false);
    }
  };

  const winnerMap = winners.reduce((acc, w) => { acc[w.meal_type] = w; return acc; }, {});

  const handleDeleteFeedback = async (id) => {
    if (!window.confirm("Are you sure you want to delete this feedback?")) return;
    try {
      await deleteFeedback(id);
      setFeedbacks((prev) => prev.filter((f) => f.id !== id));
      showToast("🗑️ Feedback deleted");
    } catch {
      showToast("❌ Failed to delete feedback");
    }
  };

  return (
    <div className="min-h-screen">
      <NavBar />

      {/* Toast */}
      {toast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 glass-card px-6 py-3 text-sm font-medium shadow-xl">
          {toast}
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 py-8">
        
        {/* Header & Tabs */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold text-white ">Admin Dashboard</h1>
            <p className="text-gray-400 mt-1">Manage daily menu and track student feedback</p>
          </div>
          
          <div className="flex bg-white/5 p-1 rounded-xl">
            <button 
              onClick={() => setActiveTab("menu")}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'menu' ? 'bg-white/5 text-brand-500 shadow' : 'text-gray-400 hover:text-white'}`}
            >
              📋 Menu Management
            </button>
            <button 
              onClick={() => setActiveTab("feedback")}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${activeTab === 'feedback' ? 'bg-white/5 text-brand-500 shadow' : 'text-gray-400 hover:text-white'}`}
            >
              💬 Student Voices
              {feedbacks.length > 0 && (
                <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">{feedbacks.length}</span>
              )}
            </button>
          </div>
        </div>

        {activeTab === "menu" ? (
          <div className="animate-[fadeIn_0.3s_ease-in-out]">
            {/* Date + Actions Bar */}
            <div className="glass-card p-4 mb-8 flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-3">
                <label className="text-gray-400 text-sm font-medium">Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="input-field py-2 px-3 w-44"
                />
              </div>
              <div className="flex gap-3 ml-auto flex-wrap">
                <button onClick={loadData} className="btn-ghost py-2 px-4 text-sm">
                  🔄 Refresh
                </button>
                <button onClick={handleSaveMenu} disabled={saving} className="btn-primary py-2 px-5 text-sm disabled:opacity-50">
                  {saving ? "Saving..." : "💾 Save Menu"}
                </button>
                <button onClick={handleFinalize} disabled={finalizing} className="btn-primary py-2 px-5 text-sm bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 disabled:opacity-50 border-none">
                  {finalizing ? "Finalizing..." : "🏆 Finalize Winners"}
                </button>
                <a
                  href={getExportUrl(date)}
                  download
                  className="btn-ghost py-2 px-4 text-sm flex items-center gap-2"
                >
                  ⬇️ Export CSV
                </a>
              </div>
            </div>

            {/* Winners Banner */}
            {winners.length > 0 && (
              <div className="glass-card p-5 mb-8 border border-blue-500/30 bg-gradient-to-r from-blue-900/40 to-indigo-900/40 text-white">
                <h2 className="font-display text-lg font-bold text-blue-300 mb-3">🏆 Today's Winners</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {winners.map((w) => (
                    <div key={w.meal_type} className="bg-blue-500/10 rounded-xl p-4 shadow-sm border border-blue-500/20 ">
                      <p className="text-xs text-gray-400 capitalize mb-1">{w.meal_type}</p>
                      <p className="font-semibold text-white ">{w.winning_name}</p>
                      <p className="text-xs text-gray-400 mt-1">{w.vote_count} votes</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Menu Editor + Vote Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Menu Editor */}
              <div>
                <h2 className="font-display text-xl font-bold text-white mb-4">📋 Menu Editor</h2>
                <div className="space-y-4">
                  {MEALS.map((meal) => (
                    <div key={meal} className="glass-card p-5">
                      <h3 className="font-semibold capitalize text-white mb-3 flex items-center gap-2">
                        {meal === "breakfast" ? "☀️" : meal === "lunch" ? "🌤️" : "🌙"} {meal}
                      </h3>
                      <div className="space-y-2">
                        {[1, 2, 3].map((opt) => (
                          <input
                            key={opt}
                            type="text"
                            placeholder={`Option ${opt} (e.g. Idli, Dosa...)`}
                            value={menu[meal][opt]}
                            onChange={(e) => handleMenuChange(meal, opt, e.target.value)}
                            className="input-field text-sm py-2.5"
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Live Vote View */}
              <div>
                <h2 className="font-display text-xl font-bold text-white mb-4">📊 Live Vote Counts</h2>
                <div className="space-y-4">
                  {MEALS.map((meal) => (
                    <MealCard
                      key={meal}
                      mealType={meal}
                      options={menu[meal]}
                      voteCounts={votes[meal] || {}}
                      winner={winnerMap[meal] || null}
                      readOnly
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* --- FEEDBACK TAB --- */
          <div className="animate-[fadeIn_0.3s_ease-in-out]">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-xl font-bold text-white ">Student Feedback & Complaints</h2>
              <button onClick={loadData} className="btn-ghost py-1.5 px-3 text-xs">🔄 Refresh List</button>
            </div>
            
            {feedbacks.length === 0 ? (
              <div className="glass-card p-12 text-center border-dashed">
                <p className="text-4xl mb-3">📬</p>
                <p className="text-gray-400 font-medium">Inbox is empty</p>
                <p className="text-xs text-gray-400 mt-1">No feedback or complaints have been submitted yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {feedbacks.map((f) => (
                  <div key={f.id} className="glass-card p-5 border-l-4" style={{ borderLeftColor: f.feedback_type === 'complaint' ? '#ef4444' : '#3b82f6' }}>
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-white ">{f.student_name}</span>
                          <span className="text-xs bg-white/10 text-gray-400 px-2 py-0.5 rounded uppercase font-mono border border-white/10">
                            {f.reg_number}
                          </span>
                        </div>
                        <p className="text-xs text-gray-400">{f.student_email}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-2 py-1 rounded font-medium capitalize ${
                          f.feedback_type === 'complaint' 
                            ? 'bg-red-500/20 text-red-300 ' 
                            : 'bg-blue-500/20 text-blue-300 '
                        }`}>
                          {f.feedback_type === 'complaint' ? '⚠️ Complaint' : '💡 Feedback'}
                        </span>
                        <button 
                          onClick={() => handleDeleteFeedback(f.id)}
                          className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all"
                          title="Delete message"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                    
                    <div className="bg-blue-500/10 p-4 rounded-xl text-sm text-white whitespace-pre-wrap border border-blue-500/20 ">
                      {f.message}
                    </div>
                    
                    <p className="text-right text-[10px] text-gray-400 mt-3 font-mono">
                      {new Date(f.timestamp).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
