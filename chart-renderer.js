// Chart Renderer Library - Candlesticks and Equity
const ChartRenderer = {
      drawCandlesticks: (canvasId, data) => {
                const canvas = document.getElementById(canvasId);
                if (!canvas) return;
                const ctx = canvas.getContext('2d');
                const w = canvas.width;
                const h = canvas.height;
                ctx.clearRect(0, 0, w, h);
                if (data.length === 0) return;

          const maxPrice = Math.max(...data.map(d => d.h));
                const minPrice = Math.min(...data.map(d => d.l));
                const range = maxPrice - minPrice;
                const candleWidth = w / data.length;

          data.forEach((d, i) => {
                        const x = i * candleWidth;
                        const isUp = d.c >= d.o;
                        ctx.strokeStyle = isUp ? '#10b981' : '#ef4444';
                        ctx.fillStyle = isUp ? '#10b981' : '#ef4444';

                                   // Wick
                                   ctx.beginPath();
                        ctx.moveTo(x + candleWidth/2, h - ((d.h - minPrice) / range) * h);
                        ctx.lineTo(x + candleWidth/2, h - ((d.l - minPrice) / range) * h);
                        ctx.stroke();

                                   // Body
                                   const y1 = h - ((Math.max(d.o, d.c) - minPrice) / range) * h;
                        const y2 = h - ((Math.min(d.o, d.c) - minPrice) / range) * h;
                        ctx.fillRect(x + 2, y1, candleWidth - 4, Math.max(1, y2 - y1));
          });
      },
      drawEquity: (canvasId, history, mcmc) => {
                const canvas = document.getElementById(canvasId);
                if (!canvas) return;
                const ctx = canvas.getContext('2d');
                const w = canvas.width;
                const h = canvas.height;
                ctx.clearRect(0, 0, w, h);
                if (history.length === 0) return;

          const allValues = history.map(h => h.balance);
                if (mcmc) mcmc.forEach(sim => allValues.push(...sim));

          const maxVal = Math.max(...allValues);
                const minVal = Math.min(...allValues);
                const range = maxVal - minVal;

          // Draw MCMC Simulations (Background)
          if (mcmc) {
                        ctx.strokeStyle = 'rgba(99, 102, 241, 0.05)';
                        mcmc.forEach(sim => {
                                          ctx.beginPath();
                                          sim.forEach((v, i) => {
                                                                const x = (i / (sim.length - 1)) * w;
                                                                const y = h - ((v - minVal) / range) * h;
                                                                if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
                                          });
                                          ctx.stroke();
                        });
          }

          // Draw Actual Equity
          ctx.strokeStyle = '#6366f1';
                ctx.lineWidth = 2;
                ctx.beginPath();
                history.forEach((d, i) => {
                              const x = (i / (history.length - 1)) * w;
                              const y = h - ((d.balance - minVal) / range) * h;
                              if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
                });
                ctx.stroke();
      }
};
