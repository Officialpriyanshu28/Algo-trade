import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Shield, 
  Plus, 
  Trash2, 
  RefreshCw, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  Key,
  Lock,
  ExternalLink,
  ChevronRight
} from "lucide-react";
import { useAuth } from "../components/AuthProvider";
import { useNotification } from "../components/NotificationProvider";
import { db } from "../firebase";
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  onSnapshot, 
  deleteDoc, 
  doc, 
  serverTimestamp,
  updateDoc
} from "firebase/firestore";
import { handleFirestoreError, OperationType } from "../lib/firestore-errors";

interface BrokerConnection {
  id: string;
  exchange: string;
  apiKey: string;
  apiSecret: string;
  status: 'connected' | 'failed' | 'pending';
  createdAt: any;
}

const EXCHANGES = [
  { name: "Binance", icon: "https://cryptologos.cc/logos/binance-coin-bnb-logo.png" },
  { name: "Coinbase Pro", icon: "https://cryptologos.cc/logos/coinbase-coin-logo.png" },
  { name: "Kraken", icon: "https://cryptologos.cc/logos/kraken-logo.png" },
  { name: "Bybit", icon: "https://cryptologos.cc/logos/bybit-logo.png" }
];

export default function Brokers() {
  const { user } = useAuth();
  const { notify } = useNotification();
  const [connections, setConnections] = useState<BrokerConnection[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [testingId, setTestingId] = useState<string | null>(null);
  
  // Form state
  const [selectedExchange, setSelectedExchange] = useState(EXCHANGES[0].name);
  const [apiKey, setApiKey] = useState("");
  const [apiSecret, setApiSecret] = useState("");

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "broker_connections"),
      where("userId", "==", user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = (snapshot.docs || []).map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as BrokerConnection[];
      setConnections(data);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, "broker_connections");
    });

    return unsubscribe;
  }, [user]);

  const handleAddConnection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!apiKey || !apiSecret) {
      notify("error", "Missing Fields", "Please provide both API Key and Secret.");
      return;
    }

    try {
      await addDoc(collection(db, "broker_connections"), {
        userId: user.uid,
        exchange: selectedExchange,
        apiKey: apiKey.trim(),
        apiSecret: apiSecret.trim(),
        status: 'pending',
        createdAt: serverTimestamp()
      });

      notify("success", "Connection Added", `Successfully added ${selectedExchange} connection.`);
      setIsAdding(false);
      setApiKey("");
      setApiSecret("");
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, "broker_connections");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, "broker_connections", id));
      notify("info", "Connection Removed", "The broker connection has been deleted.");
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `broker_connections/${id}`);
    }
  };

  const testConnection = async (connection: BrokerConnection) => {
    setTestingId(connection.id);
    try {
      const response = await fetch("/api/brokers/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          exchange: connection.exchange,
          apiKey: connection.apiKey,
          apiSecret: connection.apiSecret
        })
      });

      const result = await response.json();

      if (result.success) {
        await updateDoc(doc(db, "broker_connections", connection.id), {
          status: 'connected'
        });
        notify("success", "Connection Verified", result.message);
      } else {
        await updateDoc(doc(db, "broker_connections", connection.id), {
          status: 'failed'
        });
        notify("error", "Connection Failed", result.error);
      }
    } catch (error: any) {
      notify("error", "Test Failed", "Could not reach the verification server.");
    } finally {
      setTestingId(null);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Broker Connections</h1>
          <p className="text-slate-400 mt-1">Manage your exchange API keys securely for automated trading.</p>
        </div>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold transition-all shadow-[0_0_20px_rgba(34,211,238,0.3)]"
        >
          {isAdding ? <XCircle className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
          {isAdding ? "Cancel" : "Add New Connection"}
        </button>
      </div>

      <AnimatePresence>
        {isAdding && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="p-8 rounded-3xl bg-slate-900/50 border border-slate-800 backdrop-blur-xl"
          >
            <form onSubmit={handleAddConnection} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-3">Select Exchange</label>
                  <div className="grid grid-cols-2 gap-3">
                    {EXCHANGES.map((ex) => (
                      <button
                        key={ex.name}
                        type="button"
                        onClick={() => setSelectedExchange(ex.name)}
                        className={`flex items-center gap-3 p-4 rounded-xl border transition-all ${
                          selectedExchange === ex.name 
                            ? "bg-cyan-500/10 border-cyan-500 text-cyan-400" 
                            : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700"
                        }`}
                      >
                        <img src={ex.icon} alt={ex.name} className="w-6 h-6 object-contain" referrerPolicy="no-referrer" />
                        <span className="font-medium">{ex.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/20 flex gap-3">
                  <Shield className="w-5 h-5 text-blue-400 shrink-0" />
                  <p className="text-xs text-blue-300/80 leading-relaxed">
                    Your API keys are stored securely in our encrypted vault. We recommend using API keys with 
                    <strong> Read-Only</strong> or <strong>Spot Trading</strong> permissions only. Never enable Withdrawal permissions.
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">API Key</label>
                  <div className="relative">
                    <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                    <input 
                      type="text"
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      placeholder="Enter your API Key"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-12 pr-4 py-4 text-white outline-none focus:border-cyan-500/50 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">API Secret</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                    <input 
                      type="password"
                      value={apiSecret}
                      onChange={(e) => setApiSecret(e.target.value)}
                      placeholder="Enter your API Secret"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-12 pr-4 py-4 text-white outline-none focus:border-cyan-500/50 transition-all"
                    />
                  </div>
                </div>

                <button 
                  type="submit"
                  className="w-full py-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold transition-all shadow-[0_0_20px_rgba(34,211,238,0.2)]"
                >
                  Save Connection
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {connections.length === 0 && !isAdding ? (
          <div className="col-span-full py-20 text-center space-y-4 bg-slate-900/30 border border-dashed border-slate-800 rounded-3xl">
            <div className="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center mx-auto">
              <AlertCircle className="w-8 h-8 text-slate-600" />
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-semibold text-white">No Connections Found</h3>
              <p className="text-slate-500 max-w-xs mx-auto">Add your first exchange connection to start automated trading.</p>
            </div>
          </div>
        ) : (
          connections.map((conn) => (
            <motion.div 
              key={conn.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 hover:border-slate-700 transition-all group"
            >
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center p-2">
                    <img 
                      src={EXCHANGES.find(e => e.name === conn.exchange)?.icon} 
                      alt={conn.exchange} 
                      className="w-full h-full object-contain"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">{conn.exchange}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      {conn.status === 'connected' ? (
                        <span className="flex items-center gap-1 text-[10px] font-bold text-green-400 uppercase tracking-wider">
                          <CheckCircle2 className="w-3 h-3" /> Connected
                        </span>
                      ) : conn.status === 'failed' ? (
                        <span className="flex items-center gap-1 text-[10px] font-bold text-red-400 uppercase tracking-wider">
                          <XCircle className="w-3 h-3" /> Failed
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                          <RefreshCw className="w-3 h-3 animate-spin" /> Pending
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => handleDelete(conn.id)}
                  className="p-2 text-slate-600 hover:text-red-400 transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800/50 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">API Key</span>
                    <span className="text-slate-300 font-mono">
                      {conn.apiKey.substring(0, 6)}...{conn.apiKey.substring(conn.apiKey.length - 4)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">API Secret</span>
                    <span className="text-slate-300 font-mono">••••••••••••••••</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => testConnection(conn)}
                    disabled={testingId === conn.id}
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-semibold transition-all disabled:opacity-50"
                  >
                    <RefreshCw className={`w-4 h-4 ${testingId === conn.id ? 'animate-spin' : ''}`} />
                    {testingId === conn.id ? "Testing..." : "Test Connection"}
                  </button>
                  <a 
                    href={`https://www.${conn.exchange.toLowerCase().replace(' ', '')}.com`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 transition-all"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      <div className="p-8 rounded-3xl bg-gradient-to-br from-cyan-500/10 to-blue-600/10 border border-cyan-500/20">
        <div className="flex flex-col md:flex-row items-center gap-8">
          <div className="w-20 h-20 rounded-2xl bg-cyan-500/20 flex items-center justify-center shrink-0">
            <Shield className="w-10 h-10 text-cyan-400" />
          </div>
          <div className="flex-1 space-y-2 text-center md:text-left">
            <h3 className="text-xl font-bold text-white">Security is our Priority</h3>
            <p className="text-slate-400 leading-relaxed">
              We use industry-standard AES-256 encryption to protect your API keys. 
              Our servers never have withdrawal access to your funds. You maintain full control 
              through your exchange's API permission settings.
            </p>
          </div>
          <button className="px-6 py-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 font-semibold hover:bg-slate-800 transition-all flex items-center gap-2">
            Security Docs <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
