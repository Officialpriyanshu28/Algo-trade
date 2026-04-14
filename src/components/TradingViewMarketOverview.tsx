import React, { useEffect, useRef } from 'react';

export default function TradingViewMarketOverview() {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!container.current) return;

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-market-overview.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = JSON.stringify({
      "colorTheme": "dark",
      "dateRange": "12M",
      "showChart": true,
      "locale": "en",
      "largeChartUrl": "",
      "isTransparent": true,
      "showSymbolLogo": true,
      "showFloatingTooltip": false,
      "width": "100%",
      "height": "100%",
      "tabs": [
        {
          "title": "Indices",
          "symbols": [
            { "s": "FOREXCOM:SPX500", "d": "S&P 500" },
            { "s": "FOREXCOM:NSXUSD", "d": "US Tech 100" },
            { "s": "FOREXCOM:DJI", "d": "Dow 30" },
            { "s": "INDEX:NIFTY", "d": "Nifty 50" },
            { "s": "INDEX:SENSEX", "d": "BSE Sensex" }
          ],
          "originalTitle": "Indices"
        },
        {
          "title": "Futures",
          "symbols": [
            { "s": "CME_MINI:ES1!", "d": "S&P 500" },
            { "s": "CME:6E1!", "d": "Euro" },
            { "s": "COMEX:GC1!", "d": "Gold" },
            { "s": "NYMEX:CL1!", "d": "Crude Oil" },
            { "s": "NYMEX:NG1!", "d": "Natural Gas" }
          ],
          "originalTitle": "Futures"
        },
        {
          "title": "Bonds",
          "symbols": [
            { "s": "CME:GE1!", "d": "Eurodollar" },
            { "s": "CBOT:ZB1!", "d": "T-Bond" },
            { "s": "CBOT:UB1!", "d": "Ultra T-Bond" },
            { "s": "EUREX:FGBL1!", "d": "Euro Bund" },
            { "s": "EUREX:FBTP1!", "d": "Euro BTP" }
          ],
          "originalTitle": "Bonds"
        },
        {
          "title": "Forex",
          "symbols": [
            { "s": "FX:EURUSD", "d": "EUR/USD" },
            { "s": "FX:GBPUSD", "d": "GBP/USD" },
            { "s": "FX:USDJPY", "d": "USD/JPY" },
            { "s": "FX:USDCHF", "d": "USD/CHF" },
            { "s": "FX:AUDUSD", "d": "AUD/USD" },
            { "s": "FX:USDCAD", "d": "USD/CAD" }
          ],
          "originalTitle": "Forex"
        },
        {
          "title": "Crypto",
          "symbols": [
            { "s": "BINANCE:BTCUSDT", "d": "BTC/USDT" },
            { "s": "BINANCE:ETHUSDT", "d": "ETH/USDT" },
            { "s": "BINANCE:SOLUSDT", "d": "SOL/USDT" },
            { "s": "BINANCE:BNBUSDT", "d": "BNB/USDT" },
            { "s": "BINANCE:ADAUSDT", "d": "ADA/USDT" }
          ]
        }
      ]
    });

    container.current.appendChild(script);

    return () => {
      if (container.current) {
        container.current.innerHTML = '';
      }
    };
  }, []);

  return (
    <div className="tradingview-widget-container" ref={container} style={{ height: "100%", width: "100%" }}>
      <div className="tradingview-widget-container__widget" style={{ height: "calc(100% - 32px)", width: "100%" }}></div>
    </div>
  );
}
