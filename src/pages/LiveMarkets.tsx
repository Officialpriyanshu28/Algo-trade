import { motion } from "motion/react";
import { TrendingUp, TrendingDown, Activity, Search, Star, ChevronRight, ShoppingCart, BarChart2 } from "lucide-react";
import TradingViewWidget from "../components/TradingViewWidget";
import MarketDepthChart from "../components/MarketDepthChart";
import { useEffect, useState, useRef } from "react";
import { useNotification } from "../components/NotificationProvider";

interface MarketItem {
  symbol: string;
  price: string;
  change: string;
  positive: boolean;
  type: string;
}

interface DepthLevel {
  price: string;
  amount: string;
}

const initialMarkets: MarketItem[] = [
  { symbol: "NIFTY 50", price: "22,453.20", change: "+0.45%", positive: true, type: "Index" },
  { symbol: "BANK NIFTY", price: "47,832.15", change: "-0.12%", positive: false, type: "Index" },
  { symbol: "RELIANCE", price: "2,945.60", change: "+1.25%", positive: true, type: "Stock" },
  { symbol: "TCS", price: "3,982.40", change: "+0.85%", positive: true, type: "Stock" },
  { symbol: "HDFCBANK", price: "1,432.10", change: "-0.55%", positive: false, type: "Stock" },
  { symbol: "INFY", price: "1,485.20", change: "+1.10%", positive: true, type: "Stock" },
  { symbol: "ICICIBANK", price: "1,085.60", change: "+0.30%", positive: true, type: "Stock" },
  { symbol: "SBIN", price: "745.20", change: "-0.20%", positive: false, type: "Stock" },
  { symbol: "BHARTIARTL", price: "1,120.40", change: "+1.50%", positive: true, type: "Stock" },
  { symbol: "LT", price: "3,450.80", change: "+0.90%", positive: true, type: "Stock" },
  { symbol: "ITC", price: "428.30", change: "-0.85%", positive: false, type: "Stock" },
  { symbol: "BTC/USDT", price: "64,230.50", change: "+2.45%", positive: true, type: "Crypto" },
  { symbol: "ETH/USDT", price: "3,450.20", change: "+1.12%", positive: true, type: "Crypto" },
];

export default function LiveMarkets() {
  const [markets, setMarkets] = useState<MarketItem[]>(initialMarkets);
  const [depth, setDepth] = useState<{ bids: DepthLevel[], asks: DepthLevel[] }>({ bids: [], asks: [] });
  const [isConnected, setIsConnected] = useState(false);
  const [selectedSymbol, setSelectedSymbol] = useState("BTC/USDT");
  const [selectedInterval, setSelectedInterval] = useState("15m");
  const [orderSide, setOrderSide] = useState<'buy' | 'sell'>('buy');
  const [orderAmount, setOrderAmount] = useState('');
  const [orderPrice, setOrderPrice] = useState('');
  const { notify } = useNotification();
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    // Binance WebSocket for BTC and ETH ticker + BTC depth + BTC kline
    const streams = [
      'btcusdt@ticker',
      'ethusdt@ticker',
      'btcusdt@depth20@100ms',
      'btcusdt@kline_1m'
    ];
    
    const ws = new WebSocket(`wss://stream.binance.com:9443/stream?streams=${streams.join('/')}`);
    wsRef.current = ws;

    ws.onopen = () => {
      setIsConnected(true);
      console.log('Market WebSocket Connected');
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      const stream = data.stream;
      const payload = data.data;

      if (!payload) return;

      if (stream.includes('@ticker')) {
        const symbol = payload.s; // e.g. BTCUSDT
        const price = parseFloat(payload.c).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        const change = parseFloat(payload.P).toFixed(2);
        const isPositive = parseFloat(payload.P) >= 0;

        setMarkets(prev => prev.map(m => {
          const mSymbol = m.symbol.replace('/', '');
          if (mSymbol === symbol) {
            return {
              ...m,
              price,
              change: `${isPositive ? '+' : ''}${change}%`,
              positive: isPositive
            };
          }
          return m;
        }));
      } else if (stream.includes('@depth')) {
        setDepth({
          bids: (payload.b || []).map((b: string[]) => ({ price: parseFloat(b[0]).toFixed(2), amount: parseFloat(b[1]).toFixed(4) })),
          asks: (payload.a || []).map((a: string[]) => ({ price: parseFloat(a[0]).toFixed(2), amount: parseFloat(a[1]).toFixed(4) }))
        });
      } else if (stream.includes('@kline')) {
        // We could update the chart here if TradingChart supported real-time updates via props
        // For now, the ticker updates already make the header feel live
      }
    };

    ws.onclose = () => {
      setIsConnected(false);
      console.log('Market WebSocket Disconnected');
    };

    ws.onerror = (error) => {
      console.error('Market WebSocket Error:', error);
      setIsConnected(false);
    };

    // Simulate some jitter for non-crypto markets
    const jitterInterval = setInterval(() => {
      setMarkets(prev => prev.map(m => {
        if (m.type !== 'Crypto') {
          const currentPrice = parseFloat(m.price.replace(/,/g, ''));
          const jitter = (Math.random() - 0.5) * (currentPrice * 0.0001);
          const newPrice = (currentPrice + jitter).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
          return { ...m, price: newPrice };
        }
        return m;
      }));
    }, 2000);

    return () => {
      ws.close();
      clearInterval(jitterInterval);
    };
  }, []);

  const activeMarket = markets.find(m => m.symbol === selectedSymbol) || initialMarkets[11]; // Default to BTC/USDT

  useEffect(() => {
    if (activeMarket) {
      setOrderPrice(activeMarket.price.replace(/,/g, ''));
    }
  }, [activeMarket.symbol]);

  return (
    <div className="h-[calc(100vh-120px)] flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Live Markets</h1>
          <p className="text-slate-400 mt-1">Real-time market data and advanced charting.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input 
              type="text"
              placeholder="Search markets..."
              className="bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-sm text-white outline-none focus:border-cyan-500/50 transition-all"
            />
          </div>
          <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all ${isConnected ? 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-cyan-500 animate-pulse' : 'bg-red-500'}`} />
            {isConnected ? 'Live Feed Active' : 'Connecting...'}
          </div>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-6 min-h-0">
        <div className="lg:col-span-3 rounded-3xl bg-slate-900/50 border border-slate-800 overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/30">
            <div className="flex items-center gap-4">
              <h2 className="text-xl font-bold text-white">{activeMarket.symbol}</h2>
              <div className="flex items-center gap-2">
                <span className="text-lg font-mono text-cyan-400">${activeMarket.price}</span>
                <span className={`text-xs font-bold ${activeMarket.positive ? 'text-green-400' : 'text-red-400'}`}>
                  {activeMarket.change}
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              {['1m', '5m', '15m', '1h', '4h', '1D', '1W'].map(tf => (
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
          <div className="flex-1 min-h-0">
            <TradingViewWidget symbol={activeMarket.symbol} interval={selectedInterval} />
          </div>
        </div>

        <div className="space-y-6 overflow-y-auto pr-2 custom-scrollbar">
          {/* Order Entry Form */}
          <div className="p-6 rounded-3xl bg-slate-900/50 border border-slate-800 backdrop-blur-sm">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <ShoppingCart className="w-4 h-4 text-cyan-400" /> Order Entry
            </h3>
            
            <div className="flex bg-slate-950 rounded-xl p-1 mb-4">
              <button 
                onClick={() => setOrderSide('buy')}
                className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${orderSide === 'buy' ? 'bg-green-500 text-slate-950' : 'text-slate-400 hover:text-white'}`}
              >
                Buy
              </button>
              <button 
                onClick={() => setOrderSide('sell')}
                className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${orderSide === 'sell' ? 'bg-red-500 text-slate-950' : 'text-slate-400 hover:text-white'}`}
              >
                Sell
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Price ({activeMarket.type === 'Crypto' ? 'USDT' : 'INR'})</label>
                <input 
                  type="number" 
                  value={orderPrice}
                  onChange={(e) => setOrderPrice(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-white outline-none focus:border-cyan-500/50 transition-all font-mono text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Amount</label>
                <input 
                  type="number" 
                  value={orderAmount}
                  onChange={(e) => setOrderAmount(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-white outline-none focus:border-cyan-500/50 transition-all font-mono text-sm"
                  placeholder="0.00"
                />
              </div>
              
              <div className="pt-2 border-t border-slate-800 flex justify-between items-center">
                <span className="text-xs text-slate-500">Total Value</span>
                <span className="text-sm font-bold text-white font-mono">
                  {activeMarket.type === 'Crypto' ? '$' : '₹'}
                  {((parseFloat(orderPrice) || 0) * (parseFloat(orderAmount) || 0)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>

              <button 
                onClick={() => {
                  if (!orderAmount || parseFloat(orderAmount) <= 0) {
                    notify('error', 'Invalid Amount', 'Please enter a valid amount greater than 0.');
                    return;
                  }
                  notify('success', 'Order Placed', `Simulated ${orderSide.toUpperCase()} order for ${orderAmount} ${activeMarket.symbol} at ${orderPrice} placed successfully.`);
                  setOrderAmount('');
                }}
                className={`w-full py-3 rounded-xl font-bold text-slate-950 transition-all shadow-lg ${
                  orderSide === 'buy' 
                    ? 'bg-green-500 hover:bg-green-400 shadow-[0_0_15px_rgba(34,197,94,0.3)]' 
                    : 'bg-red-500 hover:bg-red-400 shadow-[0_0_15px_rgba(239,68,68,0.3)]'
                }`}
              >
                {orderSide === 'buy' ? 'Buy' : 'Sell'} {activeMarket.symbol.split('/')[0]}
              </button>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-slate-900/50 border border-slate-800 backdrop-blur-sm">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Star className="w-4 h-4 text-yellow-500" /> Watchlist
            </h3>
            <div className="space-y-4">
              {markets.map((market) => (
                <div 
                  key={market.symbol} 
                  onClick={() => setSelectedSymbol(market.symbol)}
                  className={`flex items-center justify-between p-3 rounded-2xl border transition-all cursor-pointer group ${
                    selectedSymbol === market.symbol 
                      ? 'bg-cyan-500/10 border-cyan-500/50' 
                      : 'bg-slate-950/50 border-slate-800/50 hover:border-cyan-500/30'
                  }`}
                >
                  <div>
                    <span className="block text-sm font-bold text-white group-hover:text-cyan-400 transition-colors">{market.symbol}</span>
                    <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">{market.type}</span>
                  </div>
                  <div className="text-right">
                    <span className="block text-sm font-mono text-white">
                      {market.type === 'Crypto' ? '$' : '₹'}{market.price}
                    </span>
                    <span className={`text-[10px] font-bold ${market.positive ? 'text-green-400' : 'text-red-400'}`}>
                      {market.change}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full mt-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-all flex items-center justify-center gap-2">
              Manage Watchlist <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="p-6 rounded-3xl bg-slate-900/50 border border-slate-800 backdrop-blur-sm flex flex-col h-[300px]">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-cyan-400" /> Market Depth
            </h3>
            <div className="flex-1 min-h-0">
              {activeMarket.symbol === 'BTC/USDT' ? (
                <MarketDepthChart bids={depth.bids} asks={depth.asks} />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-500 text-sm text-center px-4">
                  Live depth data is currently only available for BTC/USDT in this demo.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

