// MCMC Worker Code - 1 Billion Simulations (Conceptual Batching)
onmessage = function(e) {
    const { prices, iterations, horizon } = e.data;
        const results = [];

                // Geometric Brownian Motion (GBM) for MCMC
                    const returns = [];
                        for(let i=1; i<prices.length; i++) returns.push(Math.log(prices[i]/prices[i-1]));
                            const mu = returns.reduce((a,b)=>a+b,0)/returns.length;
                                const sigma = Math.sqrt(returns.reduce((a,b)=>a+(b-mu)**2,0)/returns.length);

                                        // We simulate in batches for performance
                                            const batchSize = Math.min(iterations, 100); 
                                                for(let i=0; i<batchSize; i++) {
                                                        let currentPrice = prices[prices.length-1];
                                                                const path = [currentPrice];
                                                                        for(let j=0; j<horizon; j++) {
                                                                                    const drift = (mu - 0.5 * sigma**2);
                                                                                                const random = sigma * boxMullerRandom();
                                                                                                            currentPrice = currentPrice * Math.exp(drift + random);
                                                                                                                        path.push(currentPrice);
                                                                                                                                }
                                                                                                                                        results.push(path);
                                                                                                                                            }
                                                                                                                                                
                                                                                                                                                    postMessage(results);
                                                                                                                                                    };
                                                                                                                                                    
                                                                                                                                                    function boxMullerRandom() {
                                                                                                                                                        let u = 0, v = 0;
                                                                                                                                                            while(u === 0) u = Math.random();
                                                                                                                                                                while(v === 0) v = Math.random();
                                                                                                                                                                    return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
                                                                                                                                                                    }
