import React, { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface DepthLevel {
  price: string;
  amount: string;
}

interface MarketDepthChartProps {
  bids: DepthLevel[];
  asks: DepthLevel[];
}

export default function MarketDepthChart({ bids, asks }: MarketDepthChartProps) {
  const data = useMemo(() => {
    const chartData: any[] = [];
    
    let cumulativeBid = 0;
    // Bids are sorted descending by price from Binance, but we want them ascending for the chart X-axis
    const sortedBids = [...bids].sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
    const bidPoints = sortedBids.map(b => {
      cumulativeBid += parseFloat(b.amount);
      return { 
        price: parseFloat(b.price), 
        bidAmount: cumulativeBid,
        askAmount: null,
        type: 'bid'
      };
    }).reverse(); // Reverse to go from lowest to highest price

    let cumulativeAsk = 0;
    // Asks are sorted ascending by price from Binance
    const sortedAsks = [...asks].sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
    const askPoints = sortedAsks.map(a => {
      cumulativeAsk += parseFloat(a.amount);
      return { 
        price: parseFloat(a.price), 
        askAmount: cumulativeAsk,
        bidAmount: null,
        type: 'ask'
      };
    });

    return [...bidPoints, ...askPoints];
  }, [bids, asks]);

  if (bids.length === 0 && asks.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center text-slate-500 text-sm">
        Waiting for depth data...
      </div>
    );
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const dataPoint = payload[0].payload;
      const isBid = dataPoint.type === 'bid';
      return (
        <div className="bg-slate-900 border border-slate-700 p-3 rounded-xl shadow-xl">
          <p className="text-slate-400 text-xs mb-1">Price</p>
          <p className="text-white font-mono font-bold">${dataPoint.price.toFixed(2)}</p>
          <div className="mt-2">
            <p className="text-slate-400 text-xs mb-1">Cumulative Amount</p>
            <p className={`font-mono font-bold ${isBid ? 'text-green-400' : 'text-red-400'}`}>
              {isBid ? dataPoint.bidAmount.toFixed(4) : dataPoint.askAmount.toFixed(4)}
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-full min-h-[200px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 10, right: 0, left: 0, bottom: 0 }}
        >
          <XAxis 
            dataKey="price" 
            type="number" 
            domain={['dataMin', 'dataMax']} 
            tickFormatter={(val) => val.toFixed(0)}
            stroke="#475569"
            fontSize={10}
            tickMargin={8}
            minTickGap={30}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#475569', strokeWidth: 1, strokeDasharray: '4 4' }} />
          <Area 
            type="step" 
            dataKey="bidAmount" 
            stroke="#22c55e" 
            fill="#22c55e" 
            fillOpacity={0.2} 
            strokeWidth={2}
            isAnimationActive={false}
          />
          <Area 
            type="step" 
            dataKey="askAmount" 
            stroke="#ef4444" 
            fill="#ef4444" 
            fillOpacity={0.2} 
            strokeWidth={2}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
