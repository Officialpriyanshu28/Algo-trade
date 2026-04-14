import { useState, useEffect } from "react";
import { motion, AnimatePresence, Reorder } from "motion/react";
import { 
  Plus, 
  Settings, 
  Play, 
  Save, 
  GripVertical, 
  ArrowRight, 
  BookOpen, 
  Trash2, 
  CheckCircle2,
  X,
  ChevronRight,
  Info,
  Zap,
  Activity,
  Sparkles,
  MessageSquare
} from "lucide-react";
import { cn } from "../lib/utils";
import { useNotification } from "../components/NotificationProvider";
import { useAuth } from "../components/AuthProvider";
import { db } from "../firebase";
import { collection, addDoc } from "firebase/firestore";
import { GoogleGenAI, Type } from "@google/genai";

const blockTypes = {
  condition: 'bg-blue-500/20 border-blue-500/50 text-blue-400',
  indicator: 'bg-purple-500/20 border-purple-500/50 text-purple-400',
  action: 'bg-green-500/20 border-green-500/50 text-green-400',
  exit: 'bg-orange-500/20 border-orange-500/50 text-orange-400',
  stop: 'bg-red-500/20 border-red-500/50 text-red-400',
  smc: 'bg-cyan-500/20 border-cyan-500/50 text-cyan-400',
};

const toolboxItems = [
  { id: 'ob', type: 'smc', label: 'Order Block', description: 'Institutional supply/demand zone' },
  { id: 'fvg', type: 'smc', label: 'Fair Value Gap', description: 'Price imbalance/inefficiency' },
  { id: 'bos', type: 'smc', label: 'BOS / CHoCH', description: 'Market structure shift' },
  { id: 'liq', type: 'smc', label: 'Liquidity Sweep', description: 'Stop hunting zone' },
  { id: 'rsi', type: 'indicator', label: 'RSI', description: 'Relative Strength Index' },
  { id: 'macd', type: 'indicator', label: 'MACD', description: 'Moving Average Convergence Divergence' },
  { id: 'ema', type: 'indicator', label: 'Moving Average', description: 'Exponential Moving Average' },
  { id: 'buy', type: 'action', label: 'Buy / Long', description: 'Execute long position' },
  { id: 'sell', type: 'action', label: 'Sell / Short', description: 'Execute short position' },
  { id: 'sl', type: 'stop', label: 'Stop Loss', description: 'Risk management exit' },
  { id: 'tp', type: 'exit', label: 'Take Profit', description: 'Target profit exit' },
];

const templates = [
  {
    id: 'smc-ob',
    name: 'SMC: Order Block Reversal',
    description: 'High probability reversal strategy using OB and BOS.',
    blocks: [
      { id: 'smc-1', type: 'smc', label: 'Identify H4 Order Block', settings: { timeframe: '4h' } },
      { id: 'smc-2', type: 'smc', label: 'Wait for M15 BOS', settings: { timeframe: '15m' } },
      { id: 'smc-3', type: 'smc', label: 'Entry at FVG Retest', settings: { type: 'FVG' } },
      { id: 'act-1', type: 'action', label: 'Buy Long (1% Risk)', settings: { risk: '1%' } },
      { id: 'stop-1', type: 'stop', label: 'SL below OB Low', settings: { buffer: '5 pips' } }
    ]
  },
  {
    id: 'smc-liq',
    name: 'SMC: Liquidity Sweep',
    description: 'Trading the stop-run and change of character.',
    blocks: [
      { id: 'smc-4', type: 'smc', label: 'Sweep Buy-Side Liquidity', settings: { session: 'London' } },
      { id: 'smc-5', type: 'smc', label: 'M5 CHoCH Confirmed', settings: { timeframe: '5m' } },
      { id: 'act-2', type: 'action', label: 'Sell Short', settings: { risk: '2%' } },
      { id: 'stop-2', type: 'stop', label: 'SL above Sweep High', settings: { buffer: '2 pips' } }
    ]
  }
];

export default function StrategyBuilder() {
  const { user } = useAuth();
  const { notify } = useNotification();
  const [activeBlocks, setActiveBlocks] = useState<any[]>(templates[0].blocks);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showAI, setShowAI] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedBlockIndex, setSelectedBlockIndex] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'toolbox' | 'canvas' | 'settings'>('canvas');

  // Automatically switch to settings tab when a block is selected on mobile
  useEffect(() => {
    if (selectedBlockIndex !== null && window.innerWidth < 1024) {
      setActiveTab('settings');
    }
  }, [selectedBlockIndex]);

  const loadTemplate = (template: any) => {
    setActiveBlocks(template.blocks.map((b: any) => ({ ...b, id: Math.random().toString(36).substr(2, 9) })));
    setShowTemplates(false);
    setActiveTab('canvas');
    notify('success', 'Template Loaded', `${template.name} strategy has been applied.`);
  };

  const addBlock = (item: any) => {
    const newBlock = {
      id: Math.random().toString(36).substr(2, 9),
      type: item.type,
      label: item.label,
      settings: {}
    };
    setActiveBlocks([...activeBlocks, newBlock]);
    if (window.innerWidth < 1024) setActiveTab('canvas');
    notify('info', 'Block Added', `${item.label} added to canvas.`);
  };

  const removeBlock = (index: number) => {
    setActiveBlocks(prev => prev.filter((_, i) => i !== index));
    if (selectedBlockIndex === index) setSelectedBlockIndex(null);
  };

  const updateBlockSetting = (index: number, key: string, value: any) => {
    const newBlocks = [...activeBlocks];
    if (!newBlocks[index].settings) newBlocks[index].settings = {};
    newBlocks[index].settings[key] = value;
    setActiveBlocks(newBlocks);
  };

  const saveStrategy = async () => {
    if (!user) {
      notify('warning', 'Login Required', 'Please login to save your strategies.');
      return;
    }

    setIsSaving(true);
    try {
      await addDoc(collection(db, 'strategies'), {
        userId: user.uid,
        name: 'My Custom Strategy',
        blocks: activeBlocks,
        createdAt: new Date().toISOString()
      });
      notify('success', 'Strategy Saved', 'Your custom algorithm has been stored in the cloud.');
    } catch (error) {
      console.error('Save error:', error);
      notify('error', 'Save Failed', 'Could not save strategy to database.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAISuggestion = async () => {
    if (!aiPrompt.trim()) return;
    setIsGenerating(true);
    
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("Gemini API Key is missing. Please configure it in the AI Studio settings.");
      }
      
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: "gemini-3.1-pro-preview",
        contents: `Generate a trading strategy based on this description: "${aiPrompt}". 
        
        Available Block Types:
        - smc: Use for concepts like Order Blocks (OB), Fair Value Gaps (FVG), BOS, CHoCH, Liquidity.
        - indicator: Use for RSI, MACD, EMA, Bollinger Bands, etc.
        - action: Use for Buy/Long or Sell/Short execution.
        - stop: Use for Stop Loss.
        - exit: Use for Take Profit.

        Each block MUST have:
        - type: one of the types above.
        - label: a descriptive name (e.g., "H4 Order Block", "RSI Oversold").
        - settings: an object with relevant parameters (e.g., { timeframe: "1h", period: 14, risk: "1%" }).

        Return a JSON array of blocks that represent the logical flow of the strategy.`,
        config: {
          systemInstruction: "You are an expert algorithmic trading strategist specializing in Smart Money Concepts (SMC) and technical analysis. Generate logical, high-probability trading strategies as a sequence of blocks. Ensure the flow makes sense: identify context (SMC/Indicators), wait for confirmation, then execute an action with risk management (Stop Loss/Take Profit).",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                type: { type: Type.STRING, enum: ['smc', 'indicator', 'action', 'stop', 'exit'] },
                label: { type: Type.STRING },
                settings: { 
                  type: Type.OBJECT,
                  properties: {
                    timeframe: { type: Type.STRING },
                    period: { type: Type.NUMBER },
                    risk: { type: Type.STRING },
                    buffer: { type: Type.STRING },
                    type: { type: Type.STRING },
                    session: { type: Type.STRING }
                  }
                }
              },
              required: ['type', 'label']
            }
          }
        }
      });

      if (!response.text) {
        throw new Error("No response from AI");
      }

      const parsed = JSON.parse(response.text);
      if (!Array.isArray(parsed)) {
        throw new Error("AI generated an invalid strategy format. Please try again.");
      }

      const suggestedBlocks = parsed.map((b: any) => ({
        ...b,
        id: Math.random().toString(36).substr(2, 9),
        settings: b.settings || {}
      }));

      setActiveBlocks(suggestedBlocks);
      setShowAI(false);
      setAiPrompt("");
      notify('success', 'AI Strategy Generated', 'The AI has built a strategy based on your description.');
    } catch (error: any) {
      console.error('AI error:', error);
      const errorMessage = error.message || 'Could not generate strategy. Please try again.';
      notify('error', 'AI Generation Failed', errorMessage);
    } finally {
      setIsGenerating(false);
    }
  };

  const aiExamples = [
    "Buy when price hits a Daily Order Block and RSI is below 30 on 15m chart.",
    "Sell at a 1h Fair Value Gap after a 15m CHoCH. Set SL above the high.",
    "Trend following: Buy when 50 EMA crosses above 200 EMA with 2% risk.",
    "Liquidity sweep strategy: Buy after a sweep of previous day low and a 5m BOS."
  ];

  const selectedBlock = selectedBlockIndex !== null ? activeBlocks[selectedBlockIndex] : null;

  return (
    <div className="h-[calc(100vh-10rem)] lg:h-[calc(100vh-6rem)] flex flex-col">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-white">Strategy Builder</h1>
          <p className="text-slate-400 text-sm mt-1">Visual algorithm creator.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button 
            onClick={() => setShowAI(true)}
            className="flex-1 sm:flex-none px-3 py-2 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 flex items-center justify-center gap-2 transition-colors border border-cyan-500/30 text-sm"
          >
            <Sparkles className="w-4 h-4" /> AI Assistant
          </button>
          <button 
            onClick={() => setShowTemplates(true)}
            className="flex-1 sm:flex-none px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center gap-2 transition-colors border border-slate-700 text-sm"
          >
            <BookOpen className="w-4 h-4" /> Templates
          </button>
          <button 
            onClick={saveStrategy}
            disabled={isSaving}
            className="flex-1 sm:flex-none px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center gap-2 transition-colors border border-slate-700 disabled:opacity-50 text-sm"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save
          </button>
          <button className="w-full sm:w-auto px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold flex items-center justify-center gap-2 transition-colors shadow-[0_0_15px_rgba(34,211,238,0.3)] text-sm">
            <Play className="w-4 h-4" /> Test
          </button>
        </div>
      </div>

      {/* Mobile Tab Navigation */}
      <div className="lg:hidden flex bg-slate-900/50 border border-slate-800 rounded-xl p-1 mb-4">
        <button 
          onClick={() => setActiveTab('toolbox')}
          className={cn(
            "flex-1 py-2 text-xs font-bold rounded-lg transition-all",
            activeTab === 'toolbox' ? "bg-cyan-500 text-slate-950" : "text-slate-400"
          )}
        >
          Toolbox
        </button>
        <button 
          onClick={() => setActiveTab('canvas')}
          className={cn(
            "flex-1 py-2 text-xs font-bold rounded-lg transition-all",
            activeTab === 'canvas' ? "bg-cyan-500 text-slate-950" : "text-slate-400"
          )}
        >
          Canvas
        </button>
        <button 
          onClick={() => setActiveTab('settings')}
          disabled={selectedBlockIndex === null}
          className={cn(
            "flex-1 py-2 text-xs font-bold rounded-lg transition-all disabled:opacity-30",
            activeTab === 'settings' ? "bg-cyan-500 text-slate-950" : "text-slate-400"
          )}
        >
          Settings
        </button>
      </div>

      <div className="flex-1 flex gap-6 overflow-hidden relative">
        {/* Sidebar Toolbox */}
        <div className={cn(
          "w-72 bg-slate-900/50 border border-slate-800 rounded-2xl p-4 flex flex-col gap-4 overflow-y-auto backdrop-blur-sm transition-all lg:flex",
          activeTab === 'toolbox' ? "fixed inset-0 z-30 m-4 lg:relative lg:m-0" : "hidden"
        )}>
          <div className="flex items-center justify-between lg:hidden mb-2">
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Toolbox</h3>
            <button onClick={() => setActiveTab('canvas')} className="p-1"><X className="w-5 h-5" /></button>
          </div>
          <h3 className="hidden lg:block text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2">Toolbox</h3>
          
          <div className="space-y-6">
            <section>
              <p className="text-[10px] text-slate-500 mb-3 uppercase font-bold tracking-[0.2em]">SMC Concepts</p>
              <div className="grid grid-cols-1 gap-2">
                {toolboxItems.filter(i => i.type === 'smc').map(item => (
                  <button 
                    key={item.id}
                    onClick={() => addBlock(item)}
                    className="p-3 rounded-xl bg-cyan-500/5 border border-cyan-500/20 text-cyan-400 text-xs flex items-center justify-between group hover:bg-cyan-500/10 transition-all text-left"
                  >
                    <div className="flex items-center gap-3">
                      <Zap className="w-3.5 h-3.5 opacity-50" />
                      <span>{item.label}</span>
                    </div>
                    <Plus className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))}
              </div>
            </section>

            <section>
              <p className="text-[10px] text-slate-500 mb-3 uppercase font-bold tracking-[0.2em]">Technical</p>
              <div className="grid grid-cols-1 gap-2">
                {toolboxItems.filter(i => i.type === 'indicator').map(item => (
                  <button 
                    key={item.id}
                    onClick={() => addBlock(item)}
                    className="p-3 rounded-xl bg-purple-500/5 border border-purple-500/20 text-purple-400 text-xs flex items-center justify-between group hover:bg-purple-500/10 transition-all text-left"
                  >
                    <div className="flex items-center gap-3">
                      <Activity className="w-3.5 h-3.5 opacity-50" />
                      <span>{item.label}</span>
                    </div>
                    <Plus className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))}
              </div>
            </section>

            <section>
              <p className="text-[10px] text-slate-500 mb-3 uppercase font-bold tracking-[0.2em]">Execution</p>
              <div className="grid grid-cols-1 gap-2">
                {toolboxItems.filter(i => ['action', 'stop', 'exit'].includes(i.type)).map(item => (
                  <button 
                    key={item.id}
                    onClick={() => addBlock(item)}
                    className={`p-3 rounded-xl text-xs flex items-center justify-between group transition-all text-left ${
                      item.type === 'action' ? 'bg-green-500/5 border-green-500/20 text-green-400 hover:bg-green-500/10' :
                      item.type === 'stop' ? 'bg-red-500/5 border-red-500/20 text-red-400 hover:bg-red-500/10' :
                      'bg-orange-500/5 border-orange-500/20 text-orange-400 hover:bg-orange-500/10'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <ChevronRight className="w-3.5 h-3.5 opacity-50" />
                      <span>{item.label}</span>
                    </div>
                    <Plus className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))}
              </div>
            </section>
          </div>
        </div>

        {/* Canvas Area */}
        <div className={cn(
          "flex-1 bg-slate-900/30 border border-slate-800 rounded-2xl relative overflow-hidden backdrop-blur-sm lg:block",
          activeTab === 'canvas' ? "block" : "hidden"
        )}>
          <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(#1e293b 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>
          
          <div className="absolute inset-0 p-6 lg:p-12 overflow-auto flex flex-col items-center">
            <Reorder.Group axis="y" values={activeBlocks} onReorder={setActiveBlocks} className="space-y-0 flex flex-col items-center w-full">
              {activeBlocks.map((block, index) => (
                <Reorder.Item 
                  key={block.id} 
                  value={block}
                  className="relative flex flex-col items-center w-full"
                >
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={`w-full max-w-[320px] p-4 lg:p-5 rounded-2xl border bg-slate-900/90 backdrop-blur-xl shadow-2xl flex items-center justify-between group cursor-grab active:cursor-grabbing transition-all hover:ring-2 hover:ring-cyan-500/30 ${
                      selectedBlockIndex === index ? 'ring-2 ring-cyan-500 border-cyan-500/50' : blockTypes[block.type as keyof typeof blockTypes]
                    }`}
                  >
                    <div className="flex items-center gap-3 lg:gap-4">
                      <div className="p-2 rounded-lg bg-white/5">
                        <GripVertical className="w-4 h-4 opacity-30" />
                      </div>
                      <div>
                        <span className="font-bold text-xs lg:text-sm block truncate max-w-[120px] lg:max-w-none">{block.label}</span>
                        <span className="text-[10px] opacity-50 uppercase tracking-widest">{block.type}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 lg:gap-2">
                      <button 
                        onClick={() => setSelectedBlockIndex(index)}
                        className="p-2 hover:bg-white/10 rounded-xl transition-colors"
                      >
                        <Settings className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => removeBlock(index)}
                        className="p-2 hover:bg-red-500/20 rounded-xl transition-colors text-red-400"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                  
                  {index < activeBlocks.length - 1 && (
                    <div className="h-10 lg:h-12 w-px bg-gradient-to-b from-slate-700 to-transparent relative">
                      <div className="absolute -bottom-1 -left-[3px] w-2 h-2 rounded-full bg-slate-700" />
                    </div>
                  )}
                </Reorder.Item>
              ))}
            </Reorder.Group>

            {activeBlocks.length === 0 && (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-500 py-24">
                <Zap className="w-12 h-12 mb-4 opacity-10" />
                <p className="text-sm text-center px-6">Your canvas is empty. Add blocks from the toolbox.</p>
              </div>
            )}
          </div>
        </div>

        {/* Settings Panel */}
        <AnimatePresence>
          {selectedBlockIndex !== null && (
            <motion.div 
              initial={{ x: 300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 300, opacity: 0 }}
              className={cn(
                "w-80 bg-slate-900 border-l border-slate-800 p-6 flex flex-col gap-6 z-40 shadow-2xl lg:flex",
                activeTab === 'settings' ? "fixed inset-0 m-4 rounded-2xl border lg:relative lg:m-0 lg:rounded-none lg:border-l" : "hidden"
              )}
            >
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-white flex items-center gap-2">
                  <Settings className="w-4 h-4 text-cyan-400" /> Block Settings
                </h3>
                <button 
                  onClick={() => {
                    setSelectedBlockIndex(null);
                    if (window.innerWidth < 1024) setActiveTab('canvas');
                  }} 
                  className="p-2 hover:bg-slate-800 rounded-lg"
                >
                  <X className="w-4 h-4 text-slate-400" />
                </button>
              </div>

              <div className="space-y-6 overflow-y-auto">
                <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700">
                  <p className="text-xs text-slate-400 mb-1">Block Type</p>
                  <p className="text-sm font-bold text-white uppercase tracking-wider">{selectedBlock?.type}</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-2 uppercase tracking-widest">Label</label>
                    <input 
                      type="text" 
                      value={selectedBlock?.label}
                      onChange={(e) => {
                        const newBlocks = [...activeBlocks];
                        newBlocks[selectedBlockIndex!].label = e.target.value;
                        setActiveBlocks(newBlocks);
                      }}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-cyan-500/50"
                    />
                  </div>

                  {selectedBlock?.type === 'smc' && (
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-2 uppercase tracking-widest">Timeframe</label>
                      <select 
                        value={selectedBlock?.settings?.timeframe || '1h'}
                        onChange={(e) => updateBlockSetting(selectedBlockIndex!, 'timeframe', e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-cyan-500/50"
                      >
                        <option>1m</option>
                        <option>5m</option>
                        <option>15m</option>
                        <option>1h</option>
                        <option>4h</option>
                        <option>Daily</option>
                      </select>
                    </div>
                  )}

                  {selectedBlock?.type === 'indicator' && (
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-2 uppercase tracking-widest">Period</label>
                      <input 
                        type="number" 
                        value={selectedBlock?.settings?.period || 14}
                        onChange={(e) => updateBlockSetting(selectedBlockIndex!, 'period', parseInt(e.target.value))}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-cyan-500/50" 
                      />
                    </div>
                  )}

                  {selectedBlock?.type === 'action' && (
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-2 uppercase tracking-widest">Risk %</label>
                      <input 
                        type="text" 
                        value={selectedBlock?.settings?.risk || '1%'}
                        onChange={(e) => updateBlockSetting(selectedBlockIndex!, 'risk', e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-cyan-500/50" 
                      />
                    </div>
                  )}
                </div>

                <div className="p-4 rounded-2xl bg-cyan-500/5 border border-cyan-500/10 flex gap-3">
                  <Info className="w-4 h-4 text-cyan-400 shrink-0" />
                  <p className="text-[10px] text-slate-400 leading-relaxed">
                    Settings are applied in real-time. Use the "Test Strategy" button to verify logic against historical data.
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* AI Assistant Modal */}
        <AnimatePresence>
          {showAI && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-6"
            >
              <motion.div 
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl"
              >
                <div className="p-6 border-b border-slate-800 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-cyan-500/20">
                      <Sparkles className="w-5 h-5 text-cyan-400" />
                    </div>
                    <h2 className="text-xl font-bold text-white">AI Strategy Assistant</h2>
                  </div>
                  <button onClick={() => setShowAI(false)} className="text-slate-400 hover:text-white">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-slate-400 flex items-center gap-2">
                      <MessageSquare className="w-4 h-4" /> Describe your strategy
                    </label>
                    <textarea 
                      value={aiPrompt}
                      onChange={(e) => setAiPrompt(e.target.value)}
                      placeholder="e.g., Buy when RSI is below 30 and price hits a H4 Order Block. Set stop loss below the OB low."
                      className="w-full h-32 bg-slate-950 border border-slate-800 rounded-2xl p-4 text-sm text-white outline-none focus:border-cyan-500/50 resize-none transition-all"
                    />
                  </div>

                  <div className="space-y-3">
                    <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Quick Examples</p>
                    <div className="grid grid-cols-1 gap-2">
                      {aiExamples.map((example, i) => (
                        <button
                          key={i}
                          onClick={() => setAiPrompt(example)}
                          className="text-left p-3 rounded-xl bg-slate-800/30 border border-slate-800 hover:border-cyan-500/30 hover:bg-slate-800/50 transition-all text-xs text-slate-400 hover:text-cyan-400"
                        >
                          {example}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-cyan-500/5 border border-cyan-500/10 flex gap-3">
                    <Info className="w-5 h-5 text-cyan-400 shrink-0" />
                    <p className="text-[10px] text-slate-400 leading-relaxed">
                      The AI will analyze your description and generate a sequence of blocks. You can then refine the settings manually in the builder.
                    </p>
                  </div>
                  
                  <button 
                    onClick={handleAISuggestion}
                    disabled={isGenerating || !aiPrompt.trim()}
                    className="w-full py-4 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50 shadow-[0_0_20px_rgba(34,211,238,0.2)]"
                  >
                    {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                    {isGenerating ? "Analyzing Strategy..." : "Generate Strategy"}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Templates Modal Overlay */}
        <AnimatePresence>
          {showTemplates && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-6"
            >
              <motion.div 
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl"
              >
                <div className="p-6 border-b border-slate-800 flex justify-between items-center">
                  <h2 className="text-xl font-bold text-white">Strategy Templates</h2>
                  <button onClick={() => setShowTemplates(false)} className="text-slate-400 hover:text-white">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="p-6 grid grid-cols-1 gap-4 max-h-[60vh] overflow-y-auto">
                  {templates.map(template => (
                    <button
                      key={template.id}
                      onClick={() => loadTemplate(template)}
                      className="text-left p-4 rounded-2xl bg-slate-800/50 border border-slate-700 hover:border-cyan-500/50 hover:bg-slate-800 transition-all group"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold text-white group-hover:text-cyan-400 transition-colors">{template.name}</h3>
                        <CheckCircle2 className="w-5 h-5 text-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <p className="text-sm text-slate-400 mb-4">{template.description}</p>
                      <div className="flex flex-wrap gap-2">
                        {template.blocks.map((b, i) => (
                          <span key={i} className="px-2 py-1 rounded bg-slate-900 text-[10px] text-slate-500 border border-slate-800">
                            {b.label}
                          </span>
                        ))}
                      </div>
                    </button>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

const Loader2 = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
);
