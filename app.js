// QuantVerse Main App - BTCUSDT Trading Simulator
const state = {
      prices: [],
      balance: 10000,
      equityHistory: [{ time: Date.now(), balance: 10000 }],
      mcmcResults: null,
      ws: null
};

// Initialize WebSocket for Live Binance Data
function initWS() {
      state.ws = new WebSocket('wss://stream.binance.com:9443/ws/btcusdt@kline_1m');
      state.ws.onmessage = (e) => {
                const data = JSON.parse(e.data);
                const k = data.k;
                if (k.x) { // Candle closed
                    const p = parseFloat(k.c);
                              state.prices.push(p);
                              updateUI(p);
                              runStrategies();
                }
      };
      state.ws.onopen = () => document.getElementById('status').classList.add('connected');
}

function updateUI(price) {
      document.getElementById('price').innerText = '$' + price.toLocaleString();
      ChartRenderer.drawCandlesticks('priceChart', state.prices.slice(-50).map(p => ({ o:p, h:p, l:p, c:p })));
}

function runStrategies() {
      const results = {
                garch: QuantStrategies.garch(state.prices),
                hurst: QuantStrategies.hurst(state.prices),
                fisher: QuantStrategies.fisher(state.prices),
                ou: QuantStrategies.ou(state.prices),
                kelly: QuantStrategies.kelly(0.55, 1.5),
                shannon: QuantStrategies.shannon(state.prices)
      };

    // Update Scorecard
    Object.keys(results).forEach(id => {
              const r = results[id];
              document.getElementById(id + '-val').innerText = r.value;
              document.getElementById(id + '-sig').innerText = r.label;
    });

    // Run MCMC every 10 candles
    if (state.prices.length % 10 === 0) runMCMC();
}

function runMCMC() {
      const worker = new Worker('mcmc-worker-code.js');
      worker.postMessage({ prices: state.prices, iterations: 1000, horizon: 24 });
      worker.onmessage = (e) => {
                state.mcmcResults = e.data;
                ChartRenderer.drawEquity('equityChart', state.equityHistory, state.mcmcResults);
      };
}

document.addEventListener('DOMContentLoaded', () => { initWS(); ChartRenderer.drawEquity('equityChart', state.equityHistory, state.mcmcResults); });
