import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Plus, Trash2, TrendingUp, TrendingDown, Loader2, Star } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer, YAxis } from 'recharts';
import { useNotification } from './NotificationProvider';
import { useAuth } from './AuthProvider';
import { db } from '../firebase';
import { doc, getDoc, updateDoc, onSnapshot } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '../lib/firestore-errors';

interface AssetData {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  price_change_percentage_24h: number;
  type: 'crypto' | 'stock' | 'index';
  sparkline_in_7d?: {
    price: number[];
  };
}

const STOCK_ASSETS: AssetData[] = [
  { id: 'nifty50', symbol: 'NIFTY 50', name: 'Nifty 50 Index', image: 'https://cdn-icons-png.flaticon.com/512/2534/2534351.png', current_price: 22453.20, price_change_percentage_24h: 0.45, type: 'index' },
  { id: 'banknifty', symbol: 'BANK NIFTY', name: 'Nifty Bank Index', image: 'https://cdn-icons-png.flaticon.com/512/2830/2830284.png', current_price: 47832.15, price_change_percentage_24h: -0.12, type: 'index' },
  { id: 'nifty200', symbol: 'NIFTY 200', name: 'Nifty 200 Index', image: 'https://cdn-icons-png.flaticon.com/512/2534/2534351.png', current_price: 12140.50, price_change_percentage_24h: 0.32, type: 'index' },
  { id: 'reliance', symbol: 'RELIANCE', name: 'Reliance Industries', image: 'https://logo.clearbit.com/reliance.com', current_price: 2945.60, price_change_percentage_24h: 1.25, type: 'stock' },
  { id: 'itc', symbol: 'ITC', name: 'ITC Limited', image: 'https://logo.clearbit.com/itcportal.com', current_price: 428.30, price_change_percentage_24h: -0.85, type: 'stock' },
  { id: 'tcs', symbol: 'TCS', name: 'Tata Consultancy Services', image: 'https://logo.clearbit.com/tcs.com', current_price: 3980.15, price_change_percentage_24h: 0.15, type: 'stock' },
  { id: 'infy', symbol: 'INFY', name: 'Infosys Limited', image: 'https://logo.clearbit.com/infosys.com', current_price: 1480.40, price_change_percentage_24h: -1.45, type: 'stock' },
];

export default function Watchlist() {
  const { user } = useAuth();
  const { notify } = useNotification();
  const [watchlistIds, setWatchlistIds] = useState<string[]>(['bitcoin', 'ethereum', 'nifty50', 'banknifty', 'reliance']);
  const [assets, setAssets] = useState<AssetData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  // Sync with Firestore if user is logged in
  useEffect(() => {
    if (!user) return;

    const userDocRef = doc(db, 'users', user.uid);
    const unsubscribe = onSnapshot(userDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.watchlist) {
          setWatchlistIds(data.watchlist);
        }
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `users/${user.uid}`);
    });

    return unsubscribe;
  }, [user]);

  const fetchMarketData = async () => {
    const cryptoIds = watchlistIds.filter(id => !STOCK_ASSETS.find(s => s.id === id));
    const stockIds = watchlistIds.filter(id => STOCK_ASSETS.find(s => s.id === id));

    setLoading(true);
    try {
      let cryptoData: AssetData[] = [];
      if (cryptoIds.length > 0) {
        const ids = cryptoIds.join(',');
        const response = await fetch(
          `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${ids}&order=market_cap_desc&sparkline=true&price_change_percentage=24h`
        );
        
        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data)) {
            cryptoData = data.map((c: any) => ({
              ...c,
              type: 'crypto'
            }));
          }
        }
      }

      const stockData = STOCK_ASSETS.filter(s => stockIds.includes(s.id)).map(s => ({
        ...s,
        // Simulate slight price movement for stocks
        current_price: s.current_price + (Math.random() - 0.5) * 5,
        price_change_percentage_24h: s.price_change_percentage_24h + (Math.random() - 0.5) * 0.1,
        sparkline_in_7d: {
          price: Array.from({ length: 20 }, () => s.current_price + (Math.random() - 0.5) * 50)
        }
      }));

      setAssets([...cryptoData, ...stockData]);
    } catch (error) {
      console.error('Watchlist fetch error:', error);
      notify('error', 'Market Data Error', 'Could not update watchlist prices.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMarketData();
    const interval = setInterval(fetchMarketData, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, [watchlistIds]);

  const addToWatchlist = async (assetId: string) => {
    const cleanId = assetId.toLowerCase().trim();
    if (watchlistIds.includes(cleanId)) {
      notify('info', 'Already Tracked', 'This asset is already in your watchlist.');
      return;
    }

    const newIds = [...watchlistIds, cleanId];
    setWatchlistIds(newIds);
    setSearchQuery('');
    setIsAdding(false);

    if (user) {
      const path = `users/${user.uid}`;
      try {
        await updateDoc(doc(db, 'users', user.uid), { watchlist: newIds });
      } catch (e) {
        handleFirestoreError(e, OperationType.UPDATE, path);
      }
    }
    
    notify('success', 'Added to Watchlist', `Started tracking ${cleanId}.`);
  };

  const removeFromWatchlist = async (assetId: string) => {
    const newIds = watchlistIds.filter(id => id !== assetId);
    setWatchlistIds(newIds);

    if (user) {
      const path = `users/${user.uid}`;
      try {
        await updateDoc(doc(db, 'users', user.uid), { watchlist: newIds });
      } catch (e) {
        handleFirestoreError(e, OperationType.UPDATE, path);
      }
    }
    
    notify('info', 'Removed', `Stopped tracking ${assetId}.`);
  };

  const searchResults = STOCK_ASSETS.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    s.symbol.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 backdrop-blur-sm flex flex-col h-full">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
          <h3 className="text-lg font-semibold text-white">Market Watchlist</h3>
        </div>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-400 transition-colors"
        >
          <Plus className={`w-5 h-5 transition-transform ${isAdding ? 'rotate-45' : ''}`} />
        </button>
      </div>

      <AnimatePresence>
        {isAdding && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="mb-6 overflow-hidden"
          >
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input 
                type="text"
                placeholder="Search stocks, indices or crypto..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-sm outline-none focus:border-cyan-500/50 transition-colors"
              />
            </div>
            
            {searchQuery && (
              <div className="mt-2 max-h-40 overflow-y-auto rounded-xl border border-slate-800 bg-slate-950 p-2 space-y-1">
                {searchResults.map(asset => (
                  <button
                    key={asset.id}
                    onClick={() => addToWatchlist(asset.id)}
                    className="w-full flex items-center justify-between p-2 hover:bg-slate-900 rounded-lg transition-colors text-left"
                  >
                    <div className="flex items-center gap-3">
                      <img src={asset.image} className="w-6 h-6 rounded-full" />
                      <div>
                        <div className="text-xs font-bold text-white">{asset.symbol}</div>
                        <div className="text-[10px] text-slate-500">{asset.name}</div>
                      </div>
                    </div>
                    <Plus className="w-3 h-3 text-cyan-400" />
                  </button>
                ))}
                <button
                  onClick={() => addToWatchlist(searchQuery)}
                  className="w-full p-2 text-center text-[10px] text-slate-500 hover:text-cyan-400 transition-colors border-t border-slate-800 mt-1"
                >
                  Add custom ID: "{searchQuery}"
                </button>
              </div>
            )}
            <p className="text-[10px] text-slate-500 mt-2 px-1">Tip: Search for Nifty, Reliance, or use Crypto IDs.</p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-1 space-y-3 overflow-y-auto pr-2 custom-scrollbar">
        {loading && assets.length === 0 ? (
          <div className="h-full flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-cyan-500 animate-spin" />
          </div>
        ) : assets.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            <p className="text-sm">Your watchlist is empty.</p>
            <button 
              onClick={() => setIsAdding(true)}
              className="text-cyan-400 text-xs mt-2 hover:underline"
            >
              Add your first asset
            </button>
          </div>
        ) : (
          assets.map((asset) => (
            <motion.div 
              key={asset.id}
              layout
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="group p-4 rounded-xl bg-slate-800/30 border border-slate-700/50 hover:border-slate-600 transition-all flex items-center gap-4"
            >
              <div className="relative">
                <img src={asset.image} alt={asset.name} className="w-8 h-8 rounded-full bg-slate-900 p-1" />
                <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-slate-900 ${
                  asset.type === 'crypto' ? 'bg-orange-500' : asset.type === 'index' ? 'bg-blue-500' : 'bg-green-500'
                }`} />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white uppercase text-xs lg:text-sm">{asset.symbol}</span>
                  <span className="text-[10px] lg:text-xs text-slate-500 truncate">{asset.name}</span>
                </div>
                <div className="text-xs lg:text-sm font-medium text-slate-200 mt-0.5">
                  ₹{asset.current_price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </div>
              </div>

              <div className="hidden sm:block w-24 h-10">
                {asset.sparkline_in_7d && (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={asset.sparkline_in_7d?.price?.map((p, i) => ({ p, i })) || []}>
                      <YAxis domain={['auto', 'auto']} hide />
                      <Line 
                        type="monotone" 
                        dataKey="p" 
                        stroke={asset.price_change_percentage_24h >= 0 ? '#22c55e' : '#ef4444'} 
                        strokeWidth={1.5} 
                        dot={false} 
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>

              <div className="text-right min-w-[70px]">
                <div className={`text-xs font-bold flex items-center justify-end gap-1 ${
                  asset.price_change_percentage_24h >= 0 ? 'text-green-400' : 'text-red-400'
                }`}>
                  {asset.price_change_percentage_24h >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {Math.abs(asset.price_change_percentage_24h).toFixed(2)}%
                </div>
                <button 
                  onClick={() => removeFromWatchlist(asset.id)}
                  className="mt-1 p-1 text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
