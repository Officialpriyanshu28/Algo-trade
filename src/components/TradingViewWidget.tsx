import React, { useEffect, useRef, memo } from 'react';

interface TradingViewWidgetProps {
  symbol: string;
  interval: string;
}

let tvScriptLoadingPromise: Promise<void> | null = null;

function TradingViewWidget({ symbol, interval }: TradingViewWidgetProps) {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onLoadScriptRef = () => {
      if (typeof window === 'undefined' || !('TradingView' in window)) return;

      // Map our intervals to TradingView intervals
      const tvInterval = interval === '1m' ? '1' :
                         interval === '5m' ? '5' :
                         interval === '15m' ? '15' :
                         interval === '1h' ? '60' :
                         interval === '4h' ? '240' :
                         interval === '1D' ? 'D' :
                         interval === '1W' ? 'W' : '15';

      // Map our symbols to TradingView symbols
      let tvSymbol = symbol;
      if (symbol === 'BTC/USDT') tvSymbol = 'BINANCE:BTCUSDT';
      else if (symbol === 'ETH/USDT') tvSymbol = 'BINANCE:ETHUSDT';
      else if (symbol === 'NIFTY 50') tvSymbol = 'INDEX:NIFTY';
      else if (symbol === 'BANK NIFTY') tvSymbol = 'INDEX:BANKNIFTY';
      else if (symbol === 'RELIANCE') tvSymbol = 'BSE:RELIANCE';
      else if (symbol === 'TCS') tvSymbol = 'BSE:TCS';
      else if (symbol === 'HDFCBANK') tvSymbol = 'BSE:HDFCBANK';
      else if (symbol === 'INFY') tvSymbol = 'BSE:INFY';
      else if (symbol === 'ICICIBANK') tvSymbol = 'BSE:ICICIBANK';
      else if (symbol === 'SBIN') tvSymbol = 'BSE:SBIN';
      else if (symbol === 'BHARTIARTL') tvSymbol = 'BSE:BHARTIARTL';
      else if (symbol === 'LT') tvSymbol = 'BSE:LT';
      else if (symbol === 'ITC') tvSymbol = 'BSE:ITC';

      if (container.current) {
        container.current.innerHTML = '';
        const widgetContainer = document.createElement('div');
        widgetContainer.id = `tradingview_${Math.random().toString(36).substring(7)}`;
        widgetContainer.style.height = '100%';
        widgetContainer.style.width = '100%';
        container.current.appendChild(widgetContainer);

        // @ts-ignore
        new window.TradingView.widget({
          autosize: true,
          symbol: tvSymbol,
          interval: tvInterval,
          timezone: "Etc/UTC",
          theme: "dark",
          style: "1",
          locale: "en",
          enable_publishing: false,
          backgroundColor: "rgba(15, 23, 42, 0)",
          gridColor: "rgba(30, 41, 59, 1)",
          hide_top_toolbar: true,
          hide_legend: false,
          save_image: false,
          allow_symbol_change: false,
          container_id: widgetContainer.id
        });
      }
    };

    if (!tvScriptLoadingPromise) {
      tvScriptLoadingPromise = new Promise((resolve) => {
        const script = document.createElement('script');
        script.id = 'tradingview-widget-loading-script';
        script.src = 'https://s3.tradingview.com/tv.js';
        script.type = 'text/javascript';
        script.onload = () => resolve();
        document.head.appendChild(script);
      });
    }

    tvScriptLoadingPromise.then(() => onLoadScriptRef());

    return () => {
      if (container.current) {
        container.current.innerHTML = '';
      }
    };
  }, [symbol, interval]);

  return (
    <div className="tradingview-widget-container" ref={container} style={{ height: "100%", width: "100%" }} />
  );
}

export default memo(TradingViewWidget);
