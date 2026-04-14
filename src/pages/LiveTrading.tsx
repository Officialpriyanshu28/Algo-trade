import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { ShieldAlert, Link as LinkIcon, AlertTriangle, Power, Loader2, Activity, TrendingUp, TrendingDown, Wifi } from "lucide-react";
import { useNotification } from "../components/NotificationProvider";

export default function LiveTrading() {
  const [isConnected, setIsConnected] = useState(false);
  const [isBotActive, setIsBotActive] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [apiSecret, setApiSecret] = useState("");
  const [pnl, setPnl] = useState(0);
  const [activeTrades, setActiveTrades] = useState(0);
  const [ping, setPing] = useState(45);
  const { notify } = useNotification();

  useEffect(() => {
    if (!isBotActive) return;
    const interval = setInterval(() => {
      setPnl(prev => prev + (Math.random() - 0.45) * 12.5);
      setPing(Math.floor(30 + Math.random() * 25));
      if (Math.random() > 0.8) {
        setActiveTrades(Math.floor(Math.random() * 4) + 1);
      }
    }, 1500);
    return () => clearInterval(interval);
  }, [isBotActive]);

  const handleConnect = async () => {
    if (!apiKey || !apiSecret) {
      notify('error', 'Missing Credentials', 'Please enter both API Key and API Secret.');
      return;
    }

    setIsConnecting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    if (apiKey.length < 8) {
      notify('error', 'Connection Failed', 'Invalid API Key format. Please check your credentials.');
      setIsConnecting(false);
      return;
    }

    if (Math.random() > 0.8) {
      notify('error', 'Exchange Error', 'The exchange API is currently unresponsive. Please try again later.');
      setIsConnecting(false);
      return;
    }

    setIsConnected(true);
    setIsConnecting(false);
    notify('success', 'Exchange Connected', 'Successfully connected to Binance. Your bots are ready.');
  };

  const toggleBot = () => {
    if (!isBotActive) {
      notify('info', 'Bot Starting', 'Initializing strategy and connecting to WebSocket...');
      setTimeout(() => {
        setIsBotActive(true);
        notify('success', 'Bot Active', 'MACD Trend Follower is now monitoring live markets.');
      }, 1000);
    } else {
      setIsBotActive(false);
      notify('warning', 'Bot Paused', 'Trading activity has been suspended.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            Live Trading <span className="px-2 py-1 rounded bg-red-500/20 text-red-400 text-xs font-bold uppercase tracking-wider border border-red-500/30">Real Money</span>
          </h1>
          <p className="text-slate-400 mt-1">Connect to your broker and deploy strategies to live markets.</p>
        </div>
      </div>

      {!isConnected ? (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto mt-12 p-8 rounded-2xl bg-slate-900/50 border border-slate-800 backdrop-blur-sm text-center"
        >
          <div className="w-16 h-16 mx-auto bg-slate-800 rounded-full flex items-center justify-center mb-6">
            <LinkIcon className="w-8 h-8 text-slate-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Connect Your Exchange</h2>
          <p className="text-slate-400 mb-8">Securely connect your Binance, Coinbase, or Kraken account via API keys to start live trading.</p>
          
          <div className="space-y-4 text-left max-w-md mx-auto">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Exchange</label>
              <select className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-4 py-3 outline-none focus:border-cyan-500">
                <option>Binance</option>
                <option>Coinbase Pro</option>
                <option>Kraken</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">API Key</label>
              <input 
                type="password" 
                placeholder="Enter API Key" 
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-4 py-3 outline-none focus:border-cyan-500" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">API Secret</label>
              <input 
                type="password" 
                placeholder="Enter API Secret" 
                value={apiSecret}
                onChange={(e) => setApiSecret(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-4 py-3 outline-none focus:border-cyan-500" 
              />
            </div>
            
            <button 
              onClick={handleConnect}
              disabled={isConnecting}
              className="w-full py-3 mt-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:bg-cyan-500/50 disabled:cursor-not-allowed text-slate-950 font-bold transition-all shadow-[0_0_15px_rgba(34,211,238,0.2)] flex items-center justify-center gap-2"
            >
              {isConnecting ? <><Loader2 className="w-4 h-4 animate-spin" /> Connecting...</> : "Connect Exchange"}
            </button>
          </div>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 backdrop-blur-sm"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-white">Live Execution Control</h3>
                <div className="flex items-center gap-2 px-3 py-1 rounded bg-green-500/10 border border-green-500/20 text-green-400 text-sm">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  Binance Connected
                </div>
              </div>

              <div className="flex items-center justify-between p-6 rounded-xl bg-slate-800/50 border border-slate-700">
                <div>
                  <h4 className="text-xl font-bold text-white mb-1">MACD Trend Follower</h4>
                  <p className="text-slate-400 text-sm">Trading Pair: BTC/USDT | Risk: 2% per trade</p>
                </div>
                
                <button 
                  onClick={toggleBot}
                  className={`px-8 py-4 rounded-xl font-bold flex items-center gap-3 transition-all shadow-lg ${
                    isBotActive 
                      ? 'bg-slate-800 text-white hover:bg-slate-700 border border-slate-600' 
                      : 'bg-cyan-500 text-slate-950 hover:bg-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.4)]'
                  }`}
                >
                  <Power className="w-5 h-5" />
                  {isBotActive ? 'Pause Bot' : 'Activate Bot'}
                </button>
              </div>
            </motion.div>

            {/* Real-Time Bot Status Section */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.05 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-4"
            >
              <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-700 backdrop-blur-sm flex flex-col justify-between shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  {pnl >= 0 ? <TrendingUp className="w-12 h-12 text-green-500" /> : <TrendingDown className="w-12 h-12 text-red-500" />}
                </div>
                <span className="text-slate-400 text-sm font-bold uppercase tracking-wider">Session P&L</span>
                <span className={`text-3xl font-bold font-mono mt-3 ${pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {pnl >= 0 ? '+' : '-'}${Math.abs(pnl).toFixed(2)}
                </span>
              </div>
              
              <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-700 backdrop-blur-sm flex flex-col justify-between shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <Activity className="w-12 h-12 text-cyan-500" />
                </div>
                <span className="text-slate-400 text-sm font-bold uppercase tracking-wider">Active Trades</span>
                <span className="text-3xl font-bold text-white mt-3">{isBotActive ? activeTrades : 0}</span>
              </div>
              
              <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-700 backdrop-blur-sm flex flex-col justify-between shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <Wifi className="w-12 h-12 text-blue-500" />
                </div>
                <span className="text-slate-400 text-sm font-bold uppercase tracking-wider">Exchange Ping</span>
                <div className="flex items-center gap-2 mt-3">
                  <div className={`w-3 h-3 rounded-full ${ping < 60 ? 'bg-green-500' : 'bg-yellow-500'} animate-pulse`} />
                  <span className="text-3xl font-bold font-mono text-white">{ping}ms</span>
                </div>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 backdrop-blur-sm min-h-[300px]"
            >
              <h3 className="text-lg font-semibold text-white mb-4">Live Terminal</h3>
              <div className="bg-slate-950 rounded-xl p-4 font-mono text-sm h-64 overflow-y-auto border border-slate-800">
                <div className="text-slate-500 mb-2">System initialized. Awaiting commands...</div>
                {isBotActive && (
                  <>
                    <div className="text-cyan-400 mb-1">[10:00:01] Bot activated. Subscribing to market data streams...</div>
                    <div className="text-green-400 mb-1">[10:00:02] Connected to Binance WebSocket.</div>
                    <div className="text-slate-300 mb-1 animate-pulse">[10:00:05] Analyzing market conditions...</div>
                  </>
                )}
              </div>
            </motion.div>
          </div>

          <div className="space-y-6">
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="p-6 rounded-2xl bg-red-500/10 border border-red-500/30 backdrop-blur-sm"
            >
              <div className="flex items-center gap-3 mb-4 text-red-400">
                <ShieldAlert className="w-6 h-6" />
                <h3 className="text-lg font-bold">Emergency Stop</h3>
              </div>
              <p className="text-sm text-red-200/70 mb-6">
                Immediately halts all trading activity, cancels all open orders, and closes all open positions at market price.
              </p>
              <button className="w-full py-4 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold tracking-wider transition-colors shadow-[0_0_20px_rgba(220,38,38,0.4)]">
                KILL SWITCH
              </button>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 backdrop-blur-sm"
            >
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-yellow-500" /> Risk Limits
              </h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-400">Daily Loss Limit</span>
                    <span className="text-white">-$500.00</span>
                  </div>
                  <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-yellow-500 w-[30%]" />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-400">Max Open Positions</span>
                    <span className="text-white">3 / 5</span>
                  </div>
                  <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-cyan-500 w-[60%]" />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </div>
  );
}
