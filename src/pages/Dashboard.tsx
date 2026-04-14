import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, Activity, DollarSign, Bot, AlertTriangle, RefreshCw, Loader2 } from "lucide-react";
import { useNotification } from "../components/NotificationProvider";
import { useAuth } from "../components/AuthProvider";
import { db } from "../firebase";
import { doc, onSnapshot } from "firebase/firestore";
import Watchlist from "../components/Watchlist";

const mockPerformanceData = [
  { time: '09:00', value: 10000 },
  { time: '10:00', value: 10150 },
  { time: '11:00', value: 10120 },
  { time: '12:00', value: 10300 },
  { time: '13:00', value: 10250 },
  { time: '14:00', value: 10400 },
  { time: '15:00', value: 10550 },
];

import { Play, Pause, Square, MoreVertical } from "lucide-react";

interface BotData {
  id: number;
  name: string;
  pair: string;
  status: 'Active' | 'Paused' | 'Stopped';
  profit: string;
  profitPercent: string;
  winRate: string;
  trades: number;
}

const initialBots: BotData[] = [
  { id: 1, name: "BTC Trend Follower", pair: "BTC/USDT", status: "Active", profit: "+$450.20", profitPercent: "+4.5%", winRate: "68%", trades: 124 },
  { id: 2, name: "ETH Mean Reversion", pair: "ETH/USDT", status: "Active", profit: "+$120.50", profitPercent: "+1.2%", winRate: "54%", trades: 89 },
  { id: 3, name: "SOL Breakout", pair: "SOL/USDT", status: "Paused", profit: "-$45.00", profitPercent: "-0.5%", winRate: "42%", trades: 34 },
];

export default function Dashboard() {
  const { user } = useAuth();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [balance, setBalance] = useState(100000);
  const [bots, setBots] = useState<BotData[]>(initialBots);
  const { notify } = useNotification();

  const handleBotAction = (id: number, action: 'pause' | 'resume' | 'stop') => {
    setBots(prev => prev.map(bot => {
      if (bot.id === id) {
        let newStatus = bot.status;
        if (action === 'pause') newStatus = 'Paused';
        if (action === 'resume') newStatus = 'Active';
        if (action === 'stop') newStatus = 'Stopped';
        
        notify('info', 'Bot Updated', `${bot.name} is now ${newStatus.toLowerCase()}.`);
        return { ...bot, status: newStatus as any };
      }
      return bot;
    }));
  };

  useEffect(() => {
    if (!user) return;
    const userRef = doc(db, 'users', user.uid);
    const unsubscribe = onSnapshot(userRef, (doc) => {
      if (doc.exists() && doc.data().balance !== undefined) {
        setBalance(doc.data().balance);
      }
    });
    return unsubscribe;
  }, [user]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    
    // Simulate API fetch delay
    await new Promise(resolve => setTimeout(resolve, 1200));

    notify('success', 'Data Updated', 'Dashboard metrics have been refreshed successfully.');
    setIsRefreshing(false);
  };

  const stats = [
    { label: "Total Balance", value: `$${balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, change: "+5.5%", icon: DollarSign, positive: true },
    { label: "Today's P&L", value: "+$250.00", change: "+2.4%", icon: TrendingUp, positive: true },
    { label: "Active Bots", value: "2", change: "0", icon: Bot, positive: true },
    { label: "Risk Level", value: "Moderate", change: "15% Exposure", icon: AlertTriangle, positive: false, isWarning: true },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          <p className="text-slate-400 mt-1">Welcome back, here's your trading overview.</p>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all disabled:opacity-50"
          >
            {isRefreshing ? <Loader2 className="w-5 h-5 animate-spin" /> : <RefreshCw className="w-5 h-5" />}
          </button>
          <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            System Operational
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {stats.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="p-4 lg:p-6 rounded-2xl bg-slate-900/50 border border-slate-800 backdrop-blur-sm relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <stat.icon className="w-12 h-12 lg:w-16 lg:h-16" />
            </div>
            <div className="relative z-10">
              <p className="text-slate-400 text-xs lg:text-sm font-medium mb-1">{stat.label}</p>
              <h3 className="text-2xl lg:text-3xl font-bold text-white mb-2">{stat.value}</h3>
              <p className={`text-xs lg:text-sm font-medium flex items-center gap-1 ${
                stat.isWarning ? 'text-yellow-400' : stat.positive ? 'text-green-400' : 'text-red-400'
              }`}>
                {stat.positive && !stat.isWarning ? <TrendingUp className="w-3 h-3 lg:w-4 lg:h-4" /> : !stat.isWarning && <TrendingDown className="w-3 h-3 lg:w-4 lg:h-4" />}
                {stat.change}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2 p-6 rounded-2xl bg-slate-900/50 border border-slate-800 backdrop-blur-sm"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white">Portfolio Performance</h3>
            <select className="bg-slate-800 border border-slate-700 text-white text-sm rounded-lg px-3 py-1.5 outline-none focus:border-cyan-500">
              <option>Today</option>
              <option>This Week</option>
              <option>This Month</option>
            </select>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mockPerformanceData}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="time" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}
                  itemStyle={{ color: '#06b6d4' }}
                />
                <Area type="monotone" dataKey="value" stroke="#06b6d4" strokeWidth={2} fillOpacity={1} fill="url(#colorValue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Market Watchlist */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className="h-full"
        >
          <Watchlist />
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Bots List */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6 }}
          className="lg:col-span-3 p-6 rounded-2xl bg-slate-900/50 border border-slate-800 backdrop-blur-sm flex flex-col"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Bot className="w-6 h-6 text-cyan-400" />
              <h3 className="text-lg font-semibold text-white">Active Trading Bots</h3>
            </div>
            <button className="text-cyan-400 text-sm hover:text-cyan-300 font-medium">Manage All</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {(bots || []).map((bot) => (
              <div key={bot.id} className="p-5 rounded-2xl bg-slate-800/30 border border-slate-700/50 hover:border-cyan-500/30 transition-all group">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${
                      bot.status === 'Active' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 
                      bot.status === 'Paused' ? 'bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.5)]' : 
                      'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]'
                    }`} />
                    <div>
                      <span className="font-bold text-slate-100 block">{bot.name}</span>
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{bot.pair}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {bot.status === 'Active' ? (
                      <button 
                        onClick={() => handleBotAction(bot.id, 'pause')}
                        className="p-2 rounded-lg bg-slate-700/50 hover:bg-yellow-500/20 text-slate-400 hover:text-yellow-400 transition-all"
                        title="Pause Bot"
                      >
                        <Pause className="w-4 h-4" />
                      </button>
                    ) : bot.status === 'Paused' ? (
                      <button 
                        onClick={() => handleBotAction(bot.id, 'resume')}
                        className="p-2 rounded-lg bg-slate-700/50 hover:bg-green-500/20 text-slate-400 hover:text-green-400 transition-all"
                        title="Resume Bot"
                      >
                        <Play className="w-4 h-4" />
                      </button>
                    ) : null}
                    {bot.status !== 'Stopped' && (
                      <button 
                        onClick={() => handleBotAction(bot.id, 'stop')}
                        className="p-2 rounded-lg bg-slate-700/50 hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-all"
                        title="Stop Bot"
                      >
                        <Square className="w-4 h-4" />
                      </button>
                    )}
                    <button className="p-2 rounded-lg bg-slate-700/50 hover:bg-slate-600 text-slate-400 hover:text-white transition-all">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-700/30">
                    <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">Total P&L</p>
                    <p className={`text-sm font-mono font-bold ${bot.profit.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>
                      {bot.profit}
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-700/30">
                    <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">Win Rate</p>
                    <p className="text-sm font-mono font-bold text-white">{bot.winRate}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  <span>Trades: {bot.trades}</span>
                  <span className={bot.profitPercent.startsWith('+') ? 'text-green-500/70' : 'text-red-500/70'}>
                    {bot.profitPercent} ROI
                  </span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
