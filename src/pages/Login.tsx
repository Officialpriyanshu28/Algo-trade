import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../components/AuthProvider";
import { motion } from "motion/react";
import { LogIn, ShieldCheck, Globe } from "lucide-react";

export default function Login() {
  const { user, login, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && !loading) {
      navigate("/dashboard");
    }
  }, [user, loading, navigate]);

  const handleLogin = async () => {
    await login();
  };

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-slate-900/50 border border-slate-800 rounded-3xl p-8 backdrop-blur-xl shadow-2xl"
      >
        <div className="flex flex-col items-center text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20">
            <ShieldCheck className="w-8 h-8 text-cyan-400" />
          </div>
          
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-white">Welcome Back</h1>
            <p className="text-slate-400">Sign in to access your trading dashboard and algorithms.</p>
          </div>

          <div className="w-full pt-4">
            <button 
              onClick={handleLogin}
              className="w-full py-4 rounded-xl bg-white hover:bg-slate-100 text-slate-950 font-bold transition-all flex items-center justify-center gap-3 shadow-[0_0_20px_rgba(255,255,255,0.1)]"
            >
              <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" referrerPolicy="no-referrer" />
              Continue with Google
            </button>
          </div>

          <div className="pt-6 flex items-center gap-4 w-full">
            <div className="h-px flex-1 bg-slate-800"></div>
            <span className="text-xs text-slate-500 uppercase tracking-widest font-bold">Secure Access</span>
            <div className="h-px flex-1 bg-slate-800"></div>
          </div>

          <div className="grid grid-cols-2 gap-4 w-full pt-2">
            <div className="p-4 rounded-2xl bg-slate-800/30 border border-slate-800 flex flex-col items-center gap-2">
              <LogIn className="w-5 h-5 text-cyan-400" />
              <span className="text-[10px] text-slate-400 uppercase font-bold">Fast Login</span>
            </div>
            <div className="p-4 rounded-2xl bg-slate-800/30 border border-slate-800 flex flex-col items-center gap-2">
              <Globe className="w-5 h-5 text-purple-400" />
              <span className="text-[10px] text-slate-400 uppercase font-bold">Global Data</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
