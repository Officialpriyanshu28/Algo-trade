import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Play, Square, Activity, DollarSign, RefreshCw, AlertCircle, Edit3, X, Check, TrendingUp, TrendingDown, ChevronDown } from "lucide-react";
import { useNotification } from "../components/NotificationProvider";
import { useAuth } from "../components/AuthProvider";
import { db } from "../firebase";
import { doc, updateDoc, onSnapshot } from "firebase/firestore";
import TradingViewWidget from "../components/TradingViewWidget";

const paperMarkets = [
  { symbol: "BTC/USDT", basePrice: 64230.50, type: "Crypto", currency: "$" },
  { symbol: "ETH/USDT", basePrice: 3450.20, type: "Crypto", currency: "$" },
  { symbol: "NIFTY 50", basePrice: 22453.20, type: "Index", currency: "₹" },
  { symbol: "BANK NIFTY", basePrice: 47832.15, type: "Index", currency: "₹" },
  { symbol: "RELIANCE", basePrice: 2945.60, type: "Stock", currency: "₹" },
  { symbol: "TCS", basePrice: 3982.40, type: "Stock", currency: "₹" },
  { symbol: "HDFCBANK", basePrice: 1432.10, type: "Stock", currency: "₹" },
  { symbol: "INFY", basePrice: 1485.20, type: "Stock", currency: "₹" },
];

export default function PaperTrading() {
  const { user } = useAuth();
  const [isRunning, setIsRunning] = useState(false);
  const [balance, setBalance] = useState(100000);
  const [selectedMarket, setSelectedMarket] = useState(paperMarkets[0]);
  const [selectedInterval, setSelectedInterval] = useState("15m");
  const [price, setPrice] = useState(paperMarkets[0].basePrice);
  const [priceChange, setPriceChange] = useState(0);
  const [isError, setIsError] = useState(false);
  const [showBalanceModal, setShowBalanceModal] = useState(false);
  const [showMarketDropdown, setShowMarketDropdown] = useState(false);
  const [newBalanceInput, setNewBalanceInput] = useState("100000");
  const { notify } = useNotification();

  // Sync balance with Firestore
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

  // Reset price when market changes
  useEffect(() => {
    setPrice(selectedMarket.basePrice);
    setPriceChange(0);
  }, [selectedMarket]);

  // Mock price feed
  useEffect(() => {
    if (!isRunning || isError) return;
    
    const interval = setInterval(() => {
      // Scale change based on asset price (approx 0.05% volatility)
      const volatility = selectedMarket.basePrice * 0.0005;
      const change = (Math.random() - 0.5) * volatility;
      setPrice(prev => prev + change);
      setPriceChange(change);
      
      if (Math.random() > 0.8) {
        setBalance(prev => prev + (Math.random() - 0.4) * 100);
      }
    }, 1000);
    
    return () => clearInterval(interval);
  }, [isRunning, isError]);

  const toggleSimulation = () => {
    if (isError) {
      setIsError(false);
      setIsRunning(true);
      notify('info', 'Simulation Restarted', 'Re-establishing data feed connection...');
    } else {
      setIsRunning(!isRunning);
      if (!isRunning) {
        notify('success', 'Simulation Started', 'Real-time market simulation is now active.');
      } else {
        notify('warning', 'Simulation Stopped', 'Market simulation has been paused.');
      }
    }
  };

  const resetAccount = async () => {
    const initialBalance = 100000;
    setBalance(initialBalance);
    setPrice(selectedMarket.basePrice);
    setPriceChange(0);
    setIsError(false);
    setIsRunning(false);
    
    if (user) {
      try {
        await updateDoc(doc(db, 'users', user.uid), { balance: initialBalance });
      } catch (e) {
        console.error("Error resetting balance:", e);
      }
    }
    
    notify('info', 'Account Reset', 'Balance and history have been cleared.');
  };

  const handleUpdateBalance = async () => {
    const val = parseFloat(newBalanceInput);
    if (isNaN(val) || val < 0) {
      notify('error', 'Invalid Amount', 'Please enter a valid positive number.');
      return;
    }

    setBalance(val);
    if (user) {
      try {
        await updateDoc(doc(db, 'users', user.uid), { balance: val });
        notify('success', 'Balance Updated', `Your virtual balance is now $${val.toLocaleString()}.`);
      } catch (e) {
        console.error("Error updating balance:", e);
        notify('error', 'Update Failed', 'Could not save balance to cloud.');
      }
    } else {
      notify('success', 'Balance Set', `Virtual balance set to $${val.toLocaleString()}.`);
    }
    setShowBalanceModal(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Paper Trading</h1>
          <p className="text-slate-400 mt-1">Simulate live trading with virtual funds.</p>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => {
              setNewBalanceInput(balance.toString());
              setShowBalanceModal(true);
            }}
            className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors text-sm font-medium"
          >
            <Edit3 className="w-4 h-4" /> Customize Balance
          </button>
          <button 
            onClick={resetAccount}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-medium"
          >
            <RefreshCw className="w-4 h-4" /> Reset
          </button>
          <button 
            onClick={toggleSimulation}
            className={`px-6 py-2 rounded-lg font-bold flex items-center gap-2 transition-all shadow-lg ${
              isRunning && !isError
                ? 'bg-red-500/10 text-red-500 border border-red-500/50 hover:bg-red-500/20' 
                : 'bg-cyan-500 text-slate-950 hover:bg-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.3)]'
            }`}
          >
            {isRunning && !isError ? (
              <><Square className="w-4 h-4 fill-current" /> Stop Simulation</>
            ) : (
              <><Play className="w-4 h-4 fill-current" /> {isError ? 'Restart Simulation' : 'Start Simulation'}</>
            )}
          </button>
        </div>
      </div>

      {/* Balance Customization Modal */}
      <AnimatePresence>
        {showBalanceModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl"
            >
              <div className="p-6 border-b border-slate-800 flex justify-between items-center">
                <h2 className="text-xl font-bold text-white">Customize Balance</h2>
                <button onClick={() => setShowBalanceModal(false)} className="text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-400">Initial Virtual Funds ($)</label>
                  <div className="relative">
                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                    <input 
                      type="number" 
                      value={newBalanceInput}
                      onChange={(e) => setNewBalanceInput(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-12 pr-4 py-4 text-white outline-none focus:border-cyan-500/50 transition-all font-mono text-lg"
                      placeholder="100000"
                    />
                  </div>
                </div>
                <div className="p-4 rounded-2xl bg-cyan-500/5 border border-cyan-500/10 flex gap-3">
                  <AlertCircle className="w-5 h-5 text-cyan-400 shrink-0" />
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Setting a custom balance allows you to simulate trading with a specific capital size. This will reset your current paper trading session.
                  </p>
                </div>
                <button 
                  onClick={handleUpdateBalance}
                  className="w-full py-4 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(34,211,238,0.2)]"
                >
                  <Check className="w-5 h-5" /> Update Balance
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {isError && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center gap-3"
        >
          <AlertCircle className="w-5 h-5" />
          <span className="text-sm font-medium">Critical Error: Data stream disconnected. Check your network or restart.</span>
        </motion.div>
      )}
      {/* ... rest of the component ... */}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-2 p-6 rounded-3xl bg-slate-900/50 border border-slate-800 backdrop-blur-sm overflow-hidden"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400">
                <Activity className="w-6 h-6" />
              </div>
              <div>
                <div className="relative">
                  <button 
                    onClick={() => setShowMarketDropdown(!showMarketDropdown)}
                    className="flex items-center gap-2 text-lg font-bold text-white hover:text-cyan-400 transition-colors"
                  >
                    {selectedMarket.symbol} Live Chart <ChevronDown className="w-4 h-4" />
                  </button>
                  
                  <AnimatePresence>
                    {showMarketDropdown && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute top-full left-0 mt-2 w-56 bg-slate-900 border border-slate-800 rounded-xl shadow-xl z-50 overflow-hidden"
                      >
                        {paperMarkets.map(market => (
                          <button
                            key={market.symbol}
                            onClick={() => {
                              setSelectedMarket(market);
                              setShowMarketDropdown(false);
                            }}
                            className={`w-full text-left px-4 py-3 text-sm font-medium transition-colors hover:bg-slate-800 flex justify-between items-center ${selectedMarket.symbol === market.symbol ? 'text-cyan-400 bg-slate-800/50' : 'text-slate-300'}`}
                          >
                            <span>{market.symbol}</span>
                            <span className="text-[10px] text-slate-500 uppercase tracking-wider">{market.type}</span>
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-2xl font-mono font-bold text-white">
                    {selectedMarket.currency}{price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                  <span className={`flex items-center text-xs font-bold ${priceChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {priceChange >= 0 ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                    {Math.abs(priceChange).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              {['1m', '5m', '15m', '1h', '4h', '1D'].map(tf => (
                <button 
                  key={tf} 
                  onClick={() => setSelectedInterval(tf)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${tf === selectedInterval ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
                >
                  {tf}
                </button>
              ))}
            </div>
          </div>
          <div className="h-[400px] w-full rounded-2xl overflow-hidden border border-slate-800 bg-slate-950/50">
            <TradingViewWidget symbol={selectedMarket.symbol} interval={selectedInterval} />
          </div>
        </motion.div>

        <div className="space-y-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 rounded-3xl bg-slate-900/50 border border-slate-800 backdrop-blur-sm"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
                <DollarSign className="w-6 h-6" />
              </div>
              <span className="text-slate-400 font-bold uppercase tracking-wider text-xs">Virtual Balance</span>
            </div>
            <h2 className="text-4xl font-bold text-white">
              ${balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h2>
            <div className="mt-4 pt-4 border-t border-slate-800 flex justify-between items-center">
              <span className="text-xs text-slate-500">Today's Profit</span>
              <span className="text-sm font-bold text-green-400">+$1,240.50</span>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="p-6 rounded-3xl bg-slate-900/50 border border-slate-800 backdrop-blur-sm"
          >
            <div className="flex items-center justify-between mb-6">
              <span className="text-slate-400 font-bold uppercase tracking-wider text-xs">Active Strategy</span>
              <span className="px-2 py-1 rounded text-[10px] font-bold bg-cyan-500/10 text-cyan-400 uppercase tracking-widest">RSI Reversion</span>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-500">Status</span>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${isRunning ? "bg-green-500 animate-pulse" : "bg-slate-600"}`} />
                  <span className={`text-sm font-bold ${isRunning ? "text-green-400" : "text-slate-400"}`}>
                    {isRunning ? "Running" : "Idle"}
                  </span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-500">Trades Executed</span>
                <span className="text-sm font-bold text-white">12</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-500">Win Rate</span>
                <span className="text-sm font-bold text-cyan-400">75%</span>
              </div>
            </div>
            <button className="w-full mt-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm transition-all">
              Strategy Settings
            </button>
          </motion.div>
        </div>
      </div>

      {/* Mock Trade Log */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3 }}
        className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 backdrop-blur-sm min-h-[300px]"
      >
        <h3 className="text-lg font-semibold text-white mb-4">Execution Log</h3>
        {isRunning ? (
          <div className="space-y-3 font-mono text-sm">
            <div className="flex gap-4 text-slate-400">
              <span>[10:45:22]</span>
              <span className="text-cyan-400">INFO</span>
              <span>Monitoring RSI on 5m timeframe...</span>
            </div>
            <div className="flex gap-4 text-slate-400">
              <span>[10:46:05]</span>
              <span className="text-green-400">BUY</span>
              <span>Executed market order for {selectedMarket.symbol} @ {selectedMarket.currency}{price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
            <div className="flex gap-4 text-slate-400">
              <span>[10:46:06]</span>
              <span className="text-cyan-400">INFO</span>
              <span>Stop loss set at {selectedMarket.currency}{(price * 0.98).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
            <div className="flex gap-4 text-slate-400 animate-pulse">
              <span>[{new Date().toLocaleTimeString()}]</span>
              <span className="text-yellow-400">WAIT</span>
              <span>Awaiting exit condition...</span>
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-slate-500 py-12">
            <Activity className="w-12 h-12 mb-4 opacity-20" />
            <p>Start the simulation to view live logs.</p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
