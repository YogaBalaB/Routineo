import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, 
  CheckSquare, 
  Flame, 
  BarChart3, 
  User as UserIcon, 
  LogOut, 
  Search,
  Plus
} from "lucide-react";
import { User } from "../types";
import { cn } from "../lib/utils";
import { motion } from "motion/react";
import BadgeEarnedPopup from "./BadgeEarnedPopup";

interface LayoutProps {
  user: User;
  onLogout: () => void;
}

export default function Layout({ user, onLogout }: LayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { name: "Tasks", path: "/tasks", icon: CheckSquare },
    { name: "Habits", path: "/habits", icon: Flame },
    { name: "Analytics", path: "/analytics", icon: BarChart3 },
    { name: "Profile", path: "/profile", icon: UserIcon },
  ];

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-200">
        <div className="p-6">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-neon-purple rounded-lg flex items-center justify-center">
              <Flame className="text-white w-5 h-5" />
            </div>
            <span className="font-display font-bold text-xl text-dark-navy">Routineo</span>
          </Link>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-200 group",
                  isActive 
                    ? "bg-slate-100 text-dark-navy" 
                    : "text-slate-500 hover:bg-slate-50 hover:text-dark-navy"
                )}
              >
                <Icon className={cn(
                  "w-5 h-5 transition-colors",
                  isActive ? "text-neon-purple" : "text-slate-400 group-hover:text-neon-purple"
                )} />
                <span className="font-medium">{item.name}</span>
                {item.name === "Profile" && user.earnedBadges && user.earnedBadges.length > 0 && (
                  <span className="ml-auto bg-neon-purple text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                    {user.earnedBadges.length}
                  </span>
                )}
                {isActive && !user.earnedBadges?.length && (
                  <motion.div 
                    layoutId="active-indicator"
                    className="ml-auto w-1.5 h-1.5 rounded-full bg-neon-purple"
                  />
                )}
                {isActive && user.earnedBadges && user.earnedBadges.length > 0 && item.name !== "Profile" && (
                   <motion.div 
                    layoutId="active-indicator"
                    className="ml-auto w-1.5 h-1.5 rounded-full bg-neon-purple"
                  />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-100">
          <button
            onClick={() => {
              onLogout();
              navigate("/");
            }}
            className="flex items-center gap-3 w-full px-3 py-2 text-slate-500 hover:bg-red-50 hover:text-red-600 rounded-xl transition-colors group"
          >
            <LogOut className="w-5 h-5 text-slate-400 group-hover:text-red-500" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-16 flex items-center justify-between px-6 bg-white border-b border-slate-200 shrink-0">
          <div className="flex items-center gap-4 flex-1">
            <div className="md:hidden">
              <Link to="/" className="flex items-center gap-2">
                <div className="w-8 h-8 bg-neon-purple rounded-lg flex items-center justify-center">
                  <Flame className="text-white w-5 h-5" />
                </div>
              </Link>
            </div>
            <div className="relative w-full max-w-md hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search..." 
                className="w-full pl-10 pr-4 py-2 bg-slate-100 border-transparent focus:bg-white focus:border-neon-purple focus:ring-0 rounded-xl transition-all text-sm"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-medium text-dark-navy">{user.name}</p>
                <p className="text-xs text-slate-500">{user.email}</p>
              </div>
              <div className="w-10 h-10 bg-lavender rounded-xl flex items-center justify-center text-neon-purple font-medium text-lg">
                {user.name.charAt(0).toUpperCase()}
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 pb-24 md:pb-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Outlet />
          </motion.div>
        </div>
      </main>

      {/* Bottom Mobile Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 px-2 py-3 z-50 flex items-center justify-around shadow-[0_-4px_20px_0_rgba(0,0,0,0.05)]">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex flex-col items-center gap-1 min-w-[64px] transition-all",
                isActive ? "text-neon-purple" : "text-slate-400"
              )}
            >
              <div className={cn(
                "p-1 rounded-xl transition-all",
                isActive ? "bg-neon-purple/10" : "bg-transparent"
              )}>
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-tight">{item.name}</span>
              {item.name === "Profile" && user.earnedBadges && user.earnedBadges.length > 0 && (
                <div className="absolute top-0 right-0 -translate-y-1 translate-x-1 bg-neon-purple text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center border border-white">
                  {user.earnedBadges.length}
                </div>
              )}
              {isActive && (
                <motion.div 
                  layoutId="active-indicator-mobile"
                  className="w-1 h-1 rounded-full bg-neon-purple mt-0.5"
                />
              )}
            </Link>
          );
        })}
      </nav>
      <BadgeEarnedPopup />
    </div>
  );
}
