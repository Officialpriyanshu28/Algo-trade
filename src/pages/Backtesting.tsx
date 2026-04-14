import { motion } from "motion/react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Play, Settings2, Calendar, TrendingUp, Percent, AlertCircle } from "lucide-react";

const mockBacktestData = Array.from({ length: 50 }).map((_, i) => ({
  day: i,
  value: 10000 + Math.sin(i * 0.2) * 1000 + i * 50 + Math.random() * 200
}));

export default function Backtesting() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Backtesting Engine</h1>
          <p className="text-slate-400 mt-1">Test your strategies against historical data.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Configuration Panel */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-1 space-y-6"
        >
          <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 backdrop-blur-sm space-y-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <Settings2 className="w-5 h-5 text-cyan-400" /> Configuration
            </h3>
            
            <div className="space-y-2">
              <label className="text-sm text-slate-400">Strategy</label>
              <select className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2 outline-none focus:border-cyan-500">
                <option>RSI Mean Reversion</option>
                <option>MACD Trend Follower</option>
                <option>Custom Strategy 1</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-slate-400">Asset Pair</label>
              <select className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2 outline-none focus:border-cyan-500">
                <option>BTC/USDT</option>
                <option>ETH/USDT</option>
                <option>SOL/USDT</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-slate-400">Timeframe</label>
              <select className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2 outline-none focus:border-cyan-500">
                <option>1 Hour</option>
                <option>4 Hours</option>
                <option>1 Day</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-slate-400">Date Range</label>
              <div className="flex items-center gap-2 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2">
                <Calendar className="w-4 h-4 text-slate-400" />
                <span className="text-sm text-white">Last 6 Months</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-slate-400">Initial Capital</label>
              <input 
                type="text" 
                defaultValue="$10,000" 
                className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-3 py-2 outline-none focus:border-cyan-500"
              />
            </div>

            <button className="w-full py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold flex items-center justify-center gap-2 transition-colors mt-4 shadow-[0_0_15px_rgba(34,211,238,0.2)]">
              <Play className="w-4 h-4" /> Run Simulation
            </button>
          </div>
        </motion.div>

        {/* Results Area */}
        <div className="lg:col-span-3 space-y-6">
          {/* Stats Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { label: "Net Profit", value: "+$2,450.00", sub: "+24.5%", icon: TrendingUp, color: "text-green-400" },
              { label: "Win Rate", value: "68.5%", sub: "45W / 21L", icon: Percent, color: "text-cyan-400" },
              { label: "Max Drawdown", value: "-8.2%", sub: "-$820.00", icon: AlertCircle, color: "text-red-400" },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.1 }}
                className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800 backdrop-blur-sm"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-slate-400 text-sm">{stat.label}</span>
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                <h3 className="text-2xl font-bold text-white">{stat.value}</h3>
                <p className="text-sm text-slate-500 mt-1">{stat.sub}</p>
              </motion.div>
            ))}
          </div>

          {/* Chart */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
            className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 backdrop-blur-sm h-[400px]"
          >
            <h3 className="text-lg font-semibold text-white mb-6">Equity Curve</h3>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mockBacktestData}>
                <defs>
                  <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="day" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `Day ${val}`} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} domain={['dataMin - 500', 'dataMax + 500']} tickFormatter={(val) => `$${val}`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}
                  itemStyle={{ color: '#22c55e' }}
                  formatter={(value: number) => [`$${value.toFixed(2)}`, 'Equity']}
                  labelFormatter={(label) => `Day ${label}`}
                />
                <Area type="monotone" dataKey="value" stroke="#22c55e" strokeWidth={2} fillOpacity={1} fill="url(#colorProfit)" />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
