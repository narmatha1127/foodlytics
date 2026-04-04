import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";

const MEAL_ICONS = {
  breakfast: "☀️",
  lunch: "🌤️",
  dinner: "🌙",
};

export default function NavBar() {
  const { user, role, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <nav className="sticky top-0 z-50 glass-card rounded-none border-x-0 border-t-0 px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate("/")}>
          <div className="w-10 h-10 rounded-full flex items-center justify-center overflow-hidden border-2 border-brand-500/50 p-0.5 bg-white ">
            <img src="/logo.png" alt="Logo" className="w-full h-full object-cover rounded-full" />
          </div>
          <span className="font-display text-xl font-bold text-white">
            Food<span className="text-brand-500 ">lytics</span>
          </span>
        </div>

        {/* Right side actions */}
        <div className="flex items-center gap-4">

          {/* User Info */}
          {user && (
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-sm font-medium text-white truncate max-w-[200px]">
                {user.displayName || user.email}
              </span>
              <span
                className={`meal-badge text-xs mt-0.5 ${
                  role === "admin"
                    ? "bg-brand-500/20 text-brand-300"
                    : "bg-blue-500/20 text-blue-300"
                }`}
              >
                {role}
              </span>
            </div>

            {/* Avatar */}
            <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-brand-500/40">
              {user.photoURL ? (
                <img src={user.photoURL} alt="avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-brand-500 flex items-center justify-center text-white font-bold text-sm">
                  {(user.email || "?")[0].toUpperCase()}
                </div>
              )}
            </div>



            <button onClick={handleLogout} className="btn-ghost text-sm py-2 px-4">
              Sign Out
            </button>
          </div>
          )}
        </div>
      </div>
    </nav>
  );
}
