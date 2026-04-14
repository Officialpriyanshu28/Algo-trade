import { motion } from "motion/react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Target, TrendingUp, AlertOctagon, Activity } from "lucide-react";

const monthlyReturns = [
  { month: 'Jan', return: 4.5 },
  { month: 'Feb', return: -1.2 },
  { month: 'Mar', return: 6.8 },
  { month: 'Apr', return: 2.1 },
  { month: 'May', return: 8.4 },
  { month: 'Jun', return: -3.5 },
  { month: 'Jul', return: 5.2 },
];

const assetAllocation = [
  { name: 'BTC', value: 45 },
  { name: 'ETH', value: 30 },
  { name: 'SOL', value: 15 },
  { name: 'USDT', value: 10 },
];
const COLORS = ['#06b6d4', '#3b82f6', '#8b5cf6', '#64748b'];

export default function Analytics() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Analytics & Performance</h1>
          <p className="text-slate-400 mt-1">Deep dive into your trading metrics.</p>
        </div>
        <select className="bg-slate-800 border border-slate-700 text-white rounded-lg px-4 py-2 outline-none focus:border-cyan-500">
          <option>Year to Date</option>
          <option>Last 6 Months</option>
          <option>All Time</option>
        </select>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Sharpe Ratio", value: "1.85", icon: Target, desc: "Excellent" },
          { label: "Profit Factor", value: "2.14", icon: TrendingUp, desc: "Gross Profit / Gross Loss" },
          { label: "Max Drawdown", value: "12.4%", icon: AlertOctagon, desc: "Peak to trough drop" },
          { label: "Trade Frequency", value: "4.2", icon: Activity, desc: "Trades per day" },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 backdrop-blur-sm"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-slate-800 text-cyan-400">
                <stat.icon className="w-5 h-5" />
              </div>
              <span className="text-slate-400 font-medium">{stat.label}</span>
            </div>
            <h3 className="text-3xl font-bold text-white mb-1">{stat.value}</h3>
            <p className="text-sm text-slate-500">{stat.desc}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Returns Chart */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 backdrop-blur-sm"
        >
          <h3 className="text-lg font-semibold text-white mb-6">Monthly Returns (%)</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyReturns}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="month" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  cursor={{ fill: '#1e293b' }}
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}
                />
                <Bar dataKey="return" radius={[4, 4, 0, 0]}>
                  {monthlyReturns.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.return >= 0 ? '#22c55e' : '#ef4444'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Asset Allocation */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 backdrop-blur-sm flex flex-col"
        >
          <h3 className="text-lg font-semibold text-white mb-6">Asset Allocation</h3>
          <div className="flex-1 flex items-center justify-center">
            <div className="h-[250px] w-full max-w-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={assetAllocation}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {assetAllocation.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}
                    itemStyle={{ color: '#fff' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-3">
              {assetAllocation.map((asset, index) => (
                <div key={asset.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index] }} />
                  <span className="text-slate-300 font-medium">{asset.name}</span>
                  <span className="text-slate-500 ml-auto">{asset.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
