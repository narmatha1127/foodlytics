import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import NavBar from "../components/NavBar";
import MealCard from "../components/MealCard";
import { getMenu, castVote, getStudentVote, getWinners, submitFeedback } from "../api";

const MEALS = ["breakfast", "lunch", "dinner"];
const today = () => new Date().toISOString().slice(0, 10);

export default function StudentDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("menu");
  
  // Registration Profile State
  const [studentName, setStudentName] = useState(localStorage.getItem("studentName") || "");
  const [regNumber, setRegNumber] = useState(localStorage.getItem("regNumber") || "");
  const [isProfileSaved, setIsProfileSaved] = useState(!!localStorage.getItem("regNumber"));

  const [date, setDate] = useState(today());
  const [menu, setMenu] = useState({});
  const [myVotes, setMyVotes] = useState({ breakfast: null, lunch: null, dinner: null });
  const [winners, setWinners] = useState([]);
  const [submitting, setSubmitting] = useState({});
  const [toast, setToast] = useState("");

  // Feedback State
  const [feedbackType, setFeedbackType] = useState("feedback");
  const [feedbackMsg, setFeedbackMsg] = useState("");
  const [submittingFeedback, setSubmittingFeedback] = useState(false);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const saveProfile = (e) => {
    e.preventDefault();
    if (!studentName.trim() || !regNumber.trim()) return;
    localStorage.setItem("studentName", studentName);
    localStorage.setItem("regNumber", regNumber);
    setIsProfileSaved(true);
    showToast("✅ Profile Details Saved");
  };

  const loadData = useCallback(async () => {
    try {
      const [menuData, voteData, winnerData] = await Promise.all([
        getMenu(date),
        getStudentVote(user.email, date),
        getWinners(date),
      ]);
      setMenu(menuData);
      setMyVotes(voteData);
      setWinners(winnerData);
    } catch {
      // no menu set yet
    }
  }, [date, user.email]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleVote = async (mealType, optionNumber) => {
    if (!isProfileSaved) {
      showToast("❌ Please enter your Registration Number first!");
      return;
    }
    if (myVotes[mealType] === optionNumber) return; // already selected same
    
    setSubmitting((s) => ({ ...s, [mealType]: true }));
    try {
      await castVote({
        student_email: user.email,
        reg_number: regNumber,
        date,
        meal_type: mealType,
        chosen_option: optionNumber,
      });
      setMyVotes((v) => ({ ...v, [mealType]: optionNumber }));
      showToast(`✅ Vote recorded for ${mealType}!`);
    } catch {
      showToast("❌ Failed to record vote.");
    } finally {
      setSubmitting((s) => ({ ...s, [mealType]: false }));
    }
  };

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    if (!feedbackMsg.trim()) return;
    setSubmittingFeedback(true);
    try {
      await submitFeedback({
        student_email: user.email,
        student_name: studentName,
        reg_number: regNumber,
        feedback_type: feedbackType,
        message: feedbackMsg,
      });
      setFeedbackMsg("");
      showToast(`✅ ${feedbackType === 'complaint' ? 'Complaint' : 'Feedback'} sent!`);
    } catch {
      showToast("❌ Failed to send.");
    } finally {
      setSubmittingFeedback(false);
    }
  };

  const winnerMap = winners.reduce((acc, w) => { acc[w.meal_type] = w; return acc; }, {});
  const allVoted = MEALS.every((m) => myVotes[m] !== null && myVotes[m] !== undefined);

  return (
    <div className="min-h-screen">
      <NavBar />

      {/* Toast */}
      {toast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 glass-card px-6 py-3 text-sm font-medium shadow-xl transition-all duration-300">
          {toast}
        </div>
      )}

      <main className="max-w-5xl mx-auto px-4 py-8">
        
        {/* Profile Card (Required for voting) */}
        {!isProfileSaved ? (
          <div className="glass-card p-6 mb-8 border-brand-500/50 bg-gradient-to-r from-brand-500/10 to-orange-500/10 ">
            <h2 className="font-display text-xl font-bold text-white mb-2">👋 Welcome to Foodlytics!</h2>
            <p className="text-gray-400 mb-4 text-sm">Please enter your basic details to start voting and submitting feedback.</p>
            <form onSubmit={saveProfile} className="flex flex-col sm:flex-row gap-4">
              <input
                type="text"
                placeholder="Full Name"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                className="input-field max-w-sm"
                required
              />
              <input
                type="text"
                placeholder="Register Number (e.g. 23BCE1234)"
                value={regNumber}
                onChange={(e) => setRegNumber(e.target.value)}
                className="input-field max-w-sm font-mono uppercase"
                required
              />
              <button type="submit" className="btn-primary whitespace-nowrap">Save & Continue</button>
            </form>
          </div>
        ) : (
          <div className="flex justify-between items-center mb-8">
            <div className="flex bg-white/5 p-1 rounded-xl">
              <button 
                onClick={() => setActiveTab("menu")}
                className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'menu' ? 'bg-white/5 text-brand-500 shadow' : 'text-gray-400 hover:text-white'}`}
              >
                🍽️ Daily Menu
              </button>
              <button 
                onClick={() => setActiveTab("feedback")}
                className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'feedback' ? 'bg-white/5 text-brand-500 shadow' : 'text-gray-400 hover:text-white'}`}
              >
                💬 Feedback & Complaints
              </button>
            </div>
            <button 
              onClick={() => setIsProfileSaved(false)}
              className="text-xs text-gray-400 hover:text-brand-500 underline"
            >
              Edit Reg No: {regNumber.toUpperCase()}
            </button>
          </div>
        )}

        {/* --- MENU TAB --- */}
        {activeTab === "menu" ? (
          <div className={`transition-opacity duration-500 ${!isProfileSaved ? 'opacity-40 pointer-events-none blur-[1px]' : ''}`}>
            {/* Header */}
            <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <h1 className="font-display text-3xl font-bold text-white ">
                  {activeTab === 'menu' ? '📅 Vote for your favorite menu!' : '💬 Submit Your Feedback'}
                </h1>
                <p className="text-gray-400 mt-1">
                  {new Date(date).toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
                </p>
              </div>
              
              <div className="glass-card p-2 flex items-center gap-3 w-fit">
                <label className="text-gray-400 text-sm font-medium pl-2">Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="input-field py-1.5 px-3 w-auto"
                />
              </div>
            </div>

            {/* Status Banner */}
            {allVoted && Object.keys(menu).length > 0 && (
              <div className="glass-card p-4 mb-6 border-green-500/30 bg-green-50 flex items-center gap-3 transition-transform hover:scale-[1.01]">
                <span className="text-2xl">✅</span>
                <div>
                  <p className="font-semibold text-green-700 ">All votes submitted!</p>
                  <p className="text-sm text-green-600 ">Winners will be announced once finalized by the admin.</p>
                </div>
              </div>
            )}

            {/* Winners Announcement */}
            {winners.length > 0 && (
              <div className="glass-card p-5 mb-8 border border-blue-500/30 bg-gradient-to-r from-blue-900/40 to-indigo-900/40 transition-all duration-300">
                <h2 className="font-display text-lg font-bold text-blue-300 mb-3">
                  🏆 Today's Winning Menu
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {winners.map((w) => (
                    <div key={w.meal_type} className="bg-blue-500/10 rounded-xl p-4 text-center shadow-sm border border-blue-500/20 ">
                      <p className="text-2xl mb-1">
                        {w.meal_type === "breakfast" ? "☀️" : w.meal_type === "lunch" ? "🌤️" : "🌙"}
                      </p>
                      <p className="text-xs text-gray-400 capitalize mb-1">{w.meal_type}</p>
                      <p className="font-bold text-white ">{w.winning_name}</p>
                      <p className="text-xs text-brand-500 mt-1">{w.vote_count} votes</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Meal Cards */}
            {Object.keys(menu).length === 0 ? (
              <div className="glass-card p-12 text-center border-dashed">
                <p className="text-5xl mb-4">🍽️</p>
                <p className="text-gray-400 ">No menu has been set for this date yet.</p>
                <p className="text-gray-400 text-sm mt-1">Please check back later.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {MEALS.map((meal) => (
                  <div key={meal} className="relative">
                    {submitting[meal] && (
                      <div className="absolute inset-0 bg-blue-900/40 backdrop-blur-sm rounded-2xl z-10 flex items-center justify-center">
                        <div className="w-8 h-8 border-4 border-brand-400 border-t-transparent rounded-full animate-spin shadow-lg" />
                      </div>
                    )}
                    <MealCard
                      mealType={meal}
                      options={menu[meal] || {}}
                      selectedOption={myVotes[meal]}
                      onVote={(opt) => handleVote(meal, opt)}
                      winner={winnerMap[meal] || null}
                    />
                    {myVotes[meal] && (
                      <div className="absolute top-4 right-4 bg-white rounded-full p-1 shadow-md animate-[bounce_0.3s_ease-out]">
                        <span className="text-brand-500 font-bold px-2 py-0.5 text-xs">VOTED</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* --- FEEDBACK TAB --- */
          <div className="max-w-2xl mx-auto glass-card p-6 md:p-8 animate-[fadeIn_0.3s_ease-in-out]">
            <h2 className="font-display text-2xl font-bold text-white mb-2">We value your voice 🗣️</h2>
            <p className="text-gray-400 text-sm mb-6">Let the mess administration know how they are doing or report any issues directly.</p>
            
            <form onSubmit={handleFeedbackSubmit} className="space-y-6">
              <div className="flex bg-white/5 p-1 rounded-xl w-fit border border-white/10">
                <button 
                  type="button"
                  onClick={() => setFeedbackType("feedback")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${feedbackType === 'feedback' ? 'bg-white/10 text-brand-500 shadow' : 'text-gray-400'}`}
                >
                  💡 Idea / Feedback
                </button>
                <button 
                  type="button"
                  onClick={() => setFeedbackType("complaint")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${feedbackType === 'complaint' ? 'bg-white/10 text-red-400 shadow' : 'text-gray-400'}`}
                >
                  ⚠️ Complaint
                </button>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Your Message</label>
                <textarea
                  value={feedbackMsg}
                  onChange={(e) => setFeedbackMsg(e.target.value)}
                  className="input-field min-h-[150px] resize-y"
                  placeholder={feedbackType === 'complaint' ? "Describe the issue you faced in detail..." : "What's on your mind? Suggestions for new menu items?"}
                  required
                />
              </div>

              <div className="bg-blue-500/10 p-4 rounded-xl border border-blue-500/20 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white">Submitting as:</p>
                  <p className="text-xs text-gray-400">{studentName} ({regNumber.toUpperCase()})</p>
                </div>
                <button 
                  type="submit" 
                  disabled={submittingFeedback}
                  className="btn-primary shadow-blue-500/30 hover:shadow-blue-500/40 disabled:opacity-50"
                  style={feedbackType === 'complaint' ? { background: 'linear-gradient(to right, #ef4444, #dc2626)' } : {}}
                >
                  {submittingFeedback ? 'Sending...' : 'Send Message 🚀'}
                </button>
              </div>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}
