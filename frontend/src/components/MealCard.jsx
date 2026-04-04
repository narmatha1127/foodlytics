const MEAL_META = {
  breakfast: { icon: "☀️", color: "from-amber-500/20 to-yellow-500/10", border: "border-amber-500/30", badge: "bg-amber-500/20 text-amber-300" },
  lunch:     { icon: "🌤️", color: "from-sky-500/20 to-blue-500/10",   border: "border-sky-500/30",   badge: "bg-sky-500/20 text-sky-300" },
  dinner:    { icon: "🌙", color: "from-violet-500/20 to-purple-500/10", border: "border-violet-500/30", badge: "bg-violet-500/20 text-violet-300" },
};

/**
 * MealCard — used in both admin and student view.
 *
 * Props:
 *   mealType: "breakfast" | "lunch" | "dinner"
 *   options: { "1": "Idli", "2": "Dosa", "3": "Upma" }
 *   voteCounts: { 1: 5, 2: 3, 3: 2 }   (admin view)
 *   selectedOption: number | null       (student view)
 *   onVote: (optionNumber) => void      (student view)
 *   winner: { winning_option, winning_name, vote_count } | null
 *   readOnly: bool
 */
export default function MealCard({
  mealType,
  options = {},
  voteCounts = {},
  selectedOption,
  onVote,
  winner,
  readOnly = false,
}) {
  const meta = MEAL_META[mealType];
  const totalVotes = Object.values(voteCounts).reduce((a, b) => a + b, 0);

  return (
    <div className={`glass-card bg-gradient-to-br ${meta.color} border ${meta.border} p-6`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{meta.icon}</span>
          <h3 className="font-display text-lg font-bold capitalize text-white ">{mealType}</h3>
        </div>
        {winner && (
          <span className={`meal-badge ${meta.badge} flex items-center gap-1`}>
            🏆 {winner.winning_name}
          </span>
        )}
      </div>

      {/* Options */}
      <div className="space-y-3">
        {[1, 2, 3].map((num) => {
          const name = options[String(num)] || options[num] || "";
          const count = voteCounts[num] || 0;
          const pct = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;
          const isWinner = winner?.winning_option === num;
          const isSelected = selectedOption === num;

          return (
            <div
              key={num}
              onClick={() => !readOnly && onVote && name && onVote(num)}
              className={`relative rounded-xl border p-4 transition-all duration-200
                ${name && !readOnly ? "cursor-pointer hover:scale-[1.01] shadow-sm hover:shadow" : "cursor-default"}
                ${isSelected ? "border-brand-500 bg-brand-500/30 " : "border-blue-500/40 bg-blue-500/15 "}
                ${isWinner ? "border-yellow-400 bg-yellow-500/20" : ""}
                ${!name ? "opacity-30" : ""}
              `}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  {/* Radio / Check indicator */}
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0
                    ${isSelected ? "border-brand-500 bg-brand-500" : "border-blue-500/40"}`}>
                    {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                    {isWinner && !isSelected && <span className="text-xs">🏆</span>}
                  </div>
                  <span className="font-medium text-white text-sm">
                    {name || `Option ${num}`}
                  </span>
                </div>
                {totalVotes > 0 && (
                  <span className="text-xs text-gray-400 font-mono">{count} votes</span>
                )}
              </div>

              {/* Progress bar (visible when there are votes) */}
              {totalVotes > 0 && (
                <div className="w-full h-1.5 bg-blue-500/10 rounded-full overflow-hidden mt-1">
                  <div
                    className={`h-full rounded-full transition-all duration-500
                      ${isWinner ? "bg-yellow-400" : "bg-brand-500"}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {totalVotes > 0 && (
        <p className="text-xs text-gray-400 mt-3 text-right">{totalVotes} total votes</p>
      )}
    </div>
  );
}
