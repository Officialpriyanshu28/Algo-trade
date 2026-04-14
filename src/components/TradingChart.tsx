import { useEffect, useRef } from 'react';
import { createChart, ColorType, IChartApi, ISeriesApi, CandlestickData, Time, CandlestickSeries } from 'lightweight-charts';

interface TradingChartProps {
  data?: CandlestickData<Time>[];
  containerId?: string;
}

export default function TradingChart({ data, containerId = "chart-container" }: TradingChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const handleResize = () => {
      if (chartRef.current && chartContainerRef.current) {
        chartRef.current.applyOptions({ 
          width: chartContainerRef.current.clientWidth,
          height: chartContainerRef.current.clientHeight 
        });
      }
    };

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: '#94a3b8',
      },
      grid: {
        vertLines: { color: '#1e293b' },
        horzLines: { color: '#1e293b' },
      },
      width: chartContainerRef.current.clientWidth,
      height: chartContainerRef.current.clientHeight || 400,
      timeScale: {
        borderColor: '#1e293b',
        timeVisible: true,
        secondsVisible: false,
      },
    });

    const candlestickSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#22d3ee',
      downColor: '#f43f5e',
      borderVisible: false,
      wickUpColor: '#22d3ee',
      wickDownColor: '#f43f5e',
    });

    // Generate some mock data if none provided
    const chartData = data || generateMockData();
    candlestickSeries.setData(chartData);

    chartRef.current = chart;
    seriesRef.current = candlestickSeries;

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, [data]);

  return (
    <div className="w-full h-full min-h-[400px] relative">
      <div ref={chartContainerRef} className="w-full h-full" id={containerId} />
      <div className="absolute top-4 left-4 z-10 flex gap-2">
        <span className="px-2 py-1 rounded bg-slate-800/80 border border-slate-700 text-[10px] font-bold text-cyan-400 uppercase tracking-wider">
          BTC/USDT
        </span>
        <span className="px-2 py-1 rounded bg-slate-800/80 border border-slate-700 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          1m
        </span>
      </div>
    </div>
  );
}

function generateMockData(): CandlestickData<Time>[] {
  const data: CandlestickData<Time>[] = [];
  let time = new Date('2026-04-10T00:00:00Z').getTime() / 1000;
  let lastClose = 64000;

  for (let i = 0; i < 100; i++) {
    const open = lastClose;
    const close = open + (Math.random() - 0.5) * 200;
    const high = Math.max(open, close) + Math.random() * 50;
    const low = Math.min(open, close) - Math.random() * 50;
    
    data.push({
      time: time as Time,
      open,
      high,
      low,
      close,
    });
    
    time += 60; // 1 minute
    lastClose = close;
  }
  return data;
}
