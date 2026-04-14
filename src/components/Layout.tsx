import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { 
  LayoutDashboard, 
  Workflow, 
  History, 
  PlaySquare, 
  Activity, 
  BarChart3, 
  Home,
  LogOut,
  LogIn,
  Menu,
  X,
  ShieldCheck,
  Users,
  LineChart,
  Globe
} from "lucide-react";
import { cn } from "../lib/utils";
import { useAuth } from "./AuthProvider";
import TradingViewTickerTape from "./TradingViewTickerTape";

const navItems = [
  { name: "Home", path: "/", icon: Home },
  { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { name: "Market Overview", path: "/market-overview", icon: Globe },
  { name: "Live Markets", path: "/markets", icon: LineChart },
  { name: "Community", path: "/community", icon: Users },
  { name: "Brokers", path: "/brokers", icon: ShieldCheck },
  { name: "Strategy Builder", path: "/strategy", icon: Workflow },
  { name: "Backtesting", path: "/backtesting", icon: History },
  { name: "Paper Trading", path: "/paper-trading", icon: PlaySquare },
  { name: "Live Trading", path: "/live-trading", icon: Activity },
  { name: "Analytics", path: "/analytics", icon: BarChart3 },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const { user, login, logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Close sidebar on mobile when route changes
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname]);

  return (
    <div className="flex h-screen bg-slate-950 text-slate-50 overflow-hidden font-sans selection:bg-cyan-500/30">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/50 flex items-center justify-between px-6 z-40">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center shadow-[0_0_15px_rgba(34,211,238,0.5)]">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <span className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500 tracking-tight">
            NEXUS
          </span>
        </div>
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 hover:bg-slate-900 rounded-lg text-slate-400"
        >
          {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-40"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside 
        initial={false}
        animate={{ 
          x: isSidebarOpen ? 0 : (window.innerWidth < 1024 ? -280 : 0),
          width: window.innerWidth < 1024 ? 280 : 256
        }}
        className={cn(
          "fixed lg:relative inset-y-0 left-0 border-r border-slate-800/50 bg-slate-950/50 backdrop-blur-xl flex flex-col z-50 transition-all duration-300",
          !isSidebarOpen && "max-lg:-translate-x-full"
        )}
      >
        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center shadow-[0_0_15px_rgba(34,211,238,0.5)]">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500 tracking-tight">
            NEXUS ALGO
          </span>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group relative",
                  isActive 
                    ? "text-cyan-400 bg-cyan-950/30" 
                    : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/50 hover:translate-x-1 hover:shadow-sm"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 border border-cyan-500/30 rounded-xl bg-cyan-500/10 shadow-[inset_0_0_20px_rgba(34,211,238,0.1)]"
                    initial={false}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <Icon className={cn("w-5 h-5 relative z-10 transition-colors", isActive ? "text-cyan-400" : "group-hover:text-cyan-400")} />
                <span className="font-medium relative z-10">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800/50">
          {user ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-900/50 border border-slate-800">
                <img 
                  src={user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName || 'User'}`} 
                  alt="Profile" 
                  className="w-8 h-8 rounded-full border border-cyan-500/30"
                  referrerPolicy="no-referrer"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-200 truncate">{user.displayName || 'Trader'}</p>
                  <p className="text-xs text-slate-500 truncate">Pro Plan</p>
                </div>
              </div>
              <button 
                onClick={logout}
                className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-400/10 transition-all duration-300"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-sm font-medium">Logout</span>
              </button>
            </div>
          ) : (
            <Link 
              to="/login"
              className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold transition-all duration-300 shadow-[0_0_15px_rgba(34,211,238,0.3)]"
            >
              <LogIn className="w-5 h-5" />
              <span>Login with Google</span>
            </Link>
          )}
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 relative overflow-y-auto overflow-x-hidden pt-16 lg:pt-0">
        {/* Ticker Tape */}
        <div className="sticky top-0 z-30 bg-slate-950/50 backdrop-blur-md border-b border-slate-800/50 h-12 overflow-hidden hidden lg:block">
          <TradingViewTickerTape />
        </div>
        
        {/* Ambient Background Glow */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
        
        <div className="relative z-10 min-h-full p-4 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
