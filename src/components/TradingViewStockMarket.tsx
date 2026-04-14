import React, { useEffect, useRef } from 'react';

export default function TradingViewStockMarket() {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!container.current) return;

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-hotlists.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = JSON.stringify({
      "colorTheme": "dark",
      "dateRange": "12M",
      "exchange": "US",
      "showChart": true,
      "locale": "en",
      "largeChartUrl": "",
      "isTransparent": true,
      "showSymbolLogo": true,
      "showFloatingTooltip": false,
      "width": "100%",
      "height": "100%",
      "plotLineColorGrowing": "rgba(34, 211, 238, 1)",
      "plotLineColorFalling": "rgba(244, 63, 94, 1)",
      "gridLineColor": "rgba(30, 41, 59, 1)",
      "scaleFontColor": "rgba(148, 163, 184, 1)",
      "belowLineFillColorGrowing": "rgba(34, 211, 238, 0.12)",
      "belowLineFillColorFalling": "rgba(244, 63, 94, 0.12)",
      "belowLineFillColorGrowingBottom": "rgba(34, 211, 238, 0)",
      "belowLineFillColorFallingBottom": "rgba(244, 63, 94, 0)",
      "symbolActiveColor": "rgba(34, 211, 238, 0.12)"
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
      <div className="tradingview-widget-container__widget" style={{ height: "100%", width: "100%" }}></div>
    </div>
  );
}
