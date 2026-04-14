import { motion } from "motion/react";
import { ArrowRight, Play, Shield, Zap, BarChart2, History } from "lucide-react";
import Globe from "../components/3d/Globe";
import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col">
      {/* Hero Section */}
      <div className="flex-1 flex flex-col lg:flex-row items-center justify-between gap-12 py-12">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="flex-1 space-y-8 z-10"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-sm font-medium">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
            </span>
            Nexus Algo v2.0 is Live
          </div>
          
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold leading-tight tracking-tight text-center lg:text-left">
            Automate Your Trading with <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600">
              Smart Algorithms
            </span>
          </h1>
          
          <p className="text-base lg:text-lg text-slate-400 max-w-xl leading-relaxed text-center lg:text-left mx-auto lg:mx-0">
            Build, backtest, and deploy sophisticated trading strategies without writing a single line of code. Institutional-grade tools for retail traders.
          </p>
          
          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-4">
            <Link to="/login" className="px-8 py-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(34,211,238,0.3)] hover:shadow-[0_0_30px_rgba(34,211,238,0.5)]">
              Start Free <ArrowRight className="w-5 h-5" />
            </Link>
            <Link to="/paper-trading" className="px-8 py-4 rounded-xl bg-slate-800/50 hover:bg-slate-800 border border-slate-700 text-white font-medium transition-all flex items-center gap-2 backdrop-blur-sm">
              <Play className="w-5 h-5" /> Try Demo
            </Link>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="flex-1 w-full h-[500px] lg:h-[600px] relative flex items-center justify-center"
        >
          <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/20 to-blue-600/20 rounded-full blur-[100px] -z-10" />
          <Globe />
        </motion.div>
      </div>

      {/* Features Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-12 border-t border-slate-800/50">
        {[
          {
            icon: History,
            title: "Advanced Backtesting",
            description: "Test your strategies against years of historical data in seconds with tick-level precision."
          },
          {
            icon: Shield,
            title: "Risk-Free Paper Trading",
            description: "Simulate your algorithms in real-time market conditions without risking actual capital."
          },
          {
            icon: Zap,
            title: "Lightning Fast Execution",
            description: "Deploy to live markets with direct API connections to major exchanges for minimal slippage."
          }
        ].map((feature, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 + i * 0.1 }}
            className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 backdrop-blur-sm hover:border-cyan-500/30 transition-colors group"
          >
            <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center mb-6 group-hover:bg-cyan-500/20 transition-colors">
              <feature.icon className="w-6 h-6 text-cyan-400" />
            </div>
            <h3 className="text-xl font-semibold mb-3 text-slate-200">{feature.title}</h3>
            <p className="text-slate-400 leading-relaxed">{feature.description}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
