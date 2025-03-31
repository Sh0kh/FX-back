const { SMA, RSI, MACD, EMA, BollingerBands } = require("technicalindicators");

class IndicatorCalculator {
    calculateIndicators(data) {
        const closes = data.closes;
        
        // Базовые индикаторы
        const sma50 = SMA.calculate({ period: 50, values: closes });
        const sma200 = SMA.calculate({ period: 200, values: closes });
        const rsi = RSI.calculate({ period: 14, values: closes });
        const macd = MACD.calculate({
            fastPeriod: 12,
            slowPeriod: 26,
            signalPeriod: 9,
            values: closes
        });
        
        // Дополнительные индикаторы для краткосрочных движений
        const ema20 = EMA.calculate({ period: 20, values: closes });
        
        const bb = BollingerBands.calculate({
            period: 20,
            values: closes,
            stdDev: 2
        });
        
        // Анализ ценового действия (последние 3 свечи)
        const priceAction = this.analyzePriceAction(closes);
        
        // Последняя цена для удобства
        const lastPrice = closes[closes.length - 1];

        return {
            sma50: sma50[sma50.length - 1],
            sma200: sma200[sma200.length - 1],
            rsi: rsi[rsi.length - 1],
            macd: macd[macd.length - 1],
            ema20: ema20[ema20.length - 1],
            bollingerBands: bb[bb.length - 1],
            priceAction: priceAction,
            lastPrice: lastPrice
        };
    }
    
    analyzePriceAction(prices) {
        // Проверяем последние 3 свечи для определения краткосрочного импульса
        const recent = prices.slice(-3);
        let bullishCandles = 0;
        let bearishCandles = 0;
        
        for (let i = 1; i < recent.length; i++) {
            if (recent[i] > recent[i-1]) bullishCandles++;
            if (recent[i] < recent[i-1]) bearishCandles++;
        }
        
        if (bullishCandles >= 2) return "bullish";
        if (bearishCandles >= 2) return "bearish";
        return "neutral";
    }
}

module.exports = new IndicatorCalculator();