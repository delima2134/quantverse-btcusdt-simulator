// Quant Strategies Library - GARCH, Hurst, Fisher, OU, Kelly, Entropy
const QuantStrategies = {
    // Generalized Autoregressive Conditional Heteroskedasticity (Simple)
    garch: (prices) => {
        if (prices.length < 20) return { signal: 'HOLD', value: 0 };
        const returns = [];
        for(let i=1; i<prices.length; i++) returns.push((prices[i]-prices[i-1])/prices[i-1]);
        const variance = returns.reduce((a, b) => a + b*b, 0) / returns.length;
        const volatility = Math.sqrt(variance) * Math.sqrt(24); // Hourly to Daily approx
        return {
            signal: volatility > 0.02 ? 'LOW_EXPOSURE' : 'NORMAL',
            value: volatility.toFixed(4),
            label: volatility > 0.02 ? 'HIGH' : 'LOW'
        };
    },
    // Hurst Exponent (Trend vs Mean Reversion)
    hurst: (prices) => {
        if (prices.length < 50) return { signal: 'HOLD', value: 0.5 };
        // Simplified RS analysis
        const logPrices = prices.map(p => Math.log(p));
        const diffs = [];
        for(let i=1; i<logPrices.length; i++) diffs.push(logPrices[i]-logPrices[i-1]);
        const mean = diffs.reduce((a,b)=>a+b,0)/diffs.length;
        const std = Math.sqrt(diffs.reduce((a,b)=>a+(b-mean)**2,0)/diffs.length);
        const rs = (Math.max(...logPrices)-Math.min(...logPrices))/std;
        const h = Math.log(rs)/Math.log(prices.length);
        return {
            signal: h > 0.55 ? 'TREND' : (h < 0.45 ? 'MEAN_REVERSION' : 'RANDOM'),
            value: h.toFixed(3),
            label: h > 0.55 ? 'TRENDING' : (h < 0.45 ? 'REVERTING' : 'RANDOM')
        };
    },
    // Fisher Transform
    fisher: (prices) => {
        const period = 10;
        if (prices.length < period) return { signal: 'HOLD', value: 0 };
        const slice = prices.slice(-period);
        const maxH = Math.max(...slice);
        const minL = Math.min(...slice);
        const val = 0.66 * ((prices[prices.length-1] - minL)/(maxH - minL) - 0.5) + 0.67 * 0; // Simplified
        const fish = 0.5 * Math.log((1 + val)/(1 - val));
        return {
            signal: fish > 1.5 ? 'SELL' : (fish < -1.5 ? 'BUY' : 'NEUTRAL'),
            value: fish.toFixed(3),
            label: fish > 1.5 ? 'OVERBOUGHT' : (fish < -1.5 ? 'OVERSOLD' : 'STABLE')
        };
    },
    // Ornstein-Uhlenbeck (Mean Reversion Speed)
    ou: (prices) => {
        const period = 30;
        if (prices.length < period) return { signal: 'HOLD', value: 0 };
        const mean = prices.reduce((a,b)=>a+b,0)/prices.length;
        const last = prices[prices.length-1];
        const sigma = Math.sqrt(prices.reduce((a,b)=>a+(b-mean)**2,0)/prices.length);
        const zScore = (last - mean) / sigma;
        return {
            signal: zScore > 2 ? 'SELL' : (zScore < -2 ? 'BUY' : 'HOLD'),
            value: zScore.toFixed(2),
            label: zScore > 2 ? 'STRONG_SELL' : (zScore < -2 ? 'STRONG_BUY' : 'STABLE')
        };

    },
    // Kelly Criterion (Optimal Bet Sizing)
    kelly: (winRate, winLoss) => {
        const k = winRate - (1 - winRate) / winLoss;
        return {
            signal: k > 0 ? 'TRADE' : 'HOLD',
            value: (k * 100).toFixed(1) + '%',
            label: k > 0.2 ? 'AGGRESSIVE' : (k > 0 ? 'CAUTIOUS' : 'NO_BET')
        };
    },
    // Shannon Entropy (Market Noise/Complexity)
    shannon: (prices) => {
        if (prices.length < 20) return { signal: 'HOLD', value: 0 };
        const returns = [];
        for(let i=1; i<prices.length; i++) returns.push(prices[i] > prices[i-1] ? 1 : 0);
        const p1 = returns.reduce((a,b)=>a+b,0)/returns.length;
        const p0 = 1 - p1;
        const entropy = -(p1 * Math.log2(p1 || 1) + p0 * Math.log2(p0 || 1));
        return {
            signal: entropy > 0.9 ? 'HOLD' : 'TRADE',
            value: entropy.toFixed(3),
            label: entropy > 0.9 ? 'HIGH_NOISE' : 'LOW_NOISE'
        };
    }
};
