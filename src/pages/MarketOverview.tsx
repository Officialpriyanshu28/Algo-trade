import React from 'react';
import { motion } from "motion/react";
import { Globe, TrendingUp, BarChart2, Zap } from "lucide-react";
import TradingViewMarketOverview from "../components/TradingViewMarketOverview";
import TradingViewStockMarket from "../components/TradingViewStockMarket";

export default function MarketOverview() {
  return (
    <div className="h-[calc(100vh-120px)] flex flex-col gap-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Globe className="w-8 h-8 text-cyan-400" />
            Global Market Overview
          </h1>
          <p className="text-slate-400 mt-1">Real-time data across all major markets and companies via TradingView.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-bold flex items-center gap-2">
            <Zap className="w-4 h-4" />
            Live Data
          </div>
          <div className="px-4 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-400 text-xs font-bold flex items-center gap-2">
            <BarChart2 className="w-4 h-4" />
            Multi-Market
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[600px]">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="rounded-3xl bg-slate-900/50 border border-slate-800 overflow-hidden backdrop-blur-sm p-1"
        >
          <TradingViewMarketOverview />
        </motion.div>
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="rounded-3xl bg-slate-900/50 border border-slate-800 overflow-hidden backdrop-blur-sm p-1"
        >
          <TradingViewStockMarket />
        </motion.div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl bg-slate-900/30 border border-slate-800 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">Global Indices</h4>
            <p className="text-xs text-slate-500">S&P 500, Nasdaq, Nifty 50</p>
          </div>
        </div>
        <div className="p-6 rounded-2xl bg-slate-900/30 border border-slate-800 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-400">
            <Globe className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">Forex Pairs</h4>
            <p className="text-xs text-slate-500">EUR/USD, GBP/USD, USD/JPY</p>
          </div>
        </div>
        <div className="p-6 rounded-2xl bg-slate-900/30 border border-slate-800 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400">
            <Zap className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">Crypto Markets</h4>
            <p className="text-xs text-slate-500">BTC, ETH, SOL Real-time</p>
          </div>
        </div>
      </div>
    </div>
  );
}
