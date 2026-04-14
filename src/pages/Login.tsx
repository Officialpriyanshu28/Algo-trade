import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../components/AuthProvider";
import { motion } from "motion/react";
import { LogIn, ShieldCheck, Globe, UserCircle, Mail, Lock, User as UserIcon } from "lucide-react";

export default function Login() {
  const { user, login, loginAsGuest, loginWithEmail, signupWithEmail, loading } = useAuth();
  const navigate = useNavigate();
  
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user && !loading) {
      navigate("/dashboard");
    }
  }, [user, loading, navigate]);

  const handleLogin = async () => {
    await login();
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || (isSignUp && !name)) return;
    
    setIsSubmitting(true);
    try {
      if (isSignUp) {
        await signupWithEmail(email, password, name);
      } else {
        await loginWithEmail(email, password);
      }
    } catch (error) {
      // Error is handled in AuthProvider
    } finally {
      setIsSubmitting(false);
    }
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
            <h1 className="text-3xl font-bold text-white">{isSignUp ? 'Create Account' : 'Welcome Back'}</h1>
            <p className="text-slate-400">{isSignUp ? 'Sign up to start your trading journey.' : 'Sign in to access your trading dashboard.'}</p>
          </div>

          <form onSubmit={handleEmailAuth} className="w-full space-y-4">
            {isSignUp && (
              <div className="relative">
                <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input 
                  type="text" 
                  placeholder="Full Name" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl pl-12 pr-4 py-3 outline-none focus:border-cyan-500 transition-all"
                  required
                />
              </div>
            )}
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <input 
                type="email" 
                placeholder="Email Address" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl pl-12 pr-4 py-3 outline-none focus:border-cyan-500 transition-all"
                required
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <input 
                type="password" 
                placeholder="Password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl pl-12 pr-4 py-3 outline-none focus:border-cyan-500 transition-all"
                required
                minLength={6}
              />
            </div>
            <button 
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:bg-cyan-500/50 text-slate-950 font-bold transition-all shadow-[0_0_15px_rgba(34,211,238,0.2)]"
            >
              {isSubmitting ? 'Processing...' : (isSignUp ? 'Sign Up' : 'Log In')}
            </button>
          </form>

          <div className="w-full text-sm text-slate-400">
            {isSignUp ? "Already have an account? " : "Don't have an account? "}
            <button 
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-cyan-400 hover:text-cyan-300 font-bold transition-colors"
            >
              {isSignUp ? 'Log In' : 'Sign Up'}
            </button>
          </div>

          <div className="pt-2 flex items-center gap-4 w-full">
            <div className="h-px flex-1 bg-slate-800"></div>
            <span className="text-xs text-slate-500 uppercase tracking-widest font-bold">Or continue with</span>
            <div className="h-px flex-1 bg-slate-800"></div>
          </div>

          <div className="w-full pt-2 space-y-3">
            <button 
              onClick={handleLogin}
              className="w-full py-3 rounded-xl bg-white hover:bg-slate-100 text-slate-950 font-bold transition-all flex items-center justify-center gap-3 shadow-[0_0_20px_rgba(255,255,255,0.1)]"
            >
              <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" referrerPolicy="no-referrer" />
              Google
            </button>

            <button 
              onClick={loginAsGuest}
              className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold transition-all flex items-center justify-center gap-3 border border-slate-700 hover:border-slate-600"
            >
              <UserCircle className="w-5 h-5 text-slate-400" />
              Guest (Free)
            </button>
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
