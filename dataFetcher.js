const axios = require("axios");

class DataFetcher {
    constructor() {
        this.baseUrl = "https://api.binance.com/api/v3/klines";
    }

    async fetchHistoricalData(symbol, interval = "5m", limit = 500) {
        try {
            const url = `${this.baseUrl}?symbol=${symbol}&interval=${interval}&limit=${limit}`;
            const response = await axios.get(url);

            return {
                symbol,
                closes: response.data.map(candle => parseFloat(candle[4])),
                highs: response.data.map(candle => parseFloat(candle[2])),
                lows: response.data.map(candle => parseFloat(candle[3]))
            };
        } catch (error) {
            console.error(`❌ Ошибка получения данных для ${symbol}:`, error.message);
            return null;
        }
    }
}

module.exports = new DataFetcher();