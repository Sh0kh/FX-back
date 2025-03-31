const WebSocket = require("ws");
const TradingStrategy = require("./strategy");

const wss = new WebSocket.Server({ port: 5001 });

let trades = [];
let tradingStats = {
    totalTrades: 0,
    profitableTrades: 0,
    lossTrades: 0
};

wss.on("connection", (ws) => {
    console.log("✅ Клиент подключен");

    // Функция для генерации и отправки торговых сигналов
    async function sendTradingSignals() {
        try {
            const signals = await TradingStrategy.generateTradeSignals();

            signals.forEach(signal => {
                const tradeEntry = {
                    ...signal,
                    status: "OPEN",
                    openTime: new Date().toISOString()
                };

                trades.push(tradeEntry);
                tradingStats.totalTrades++;

                console.log("📊 Сигнал для торговли:", tradeEntry);
                ws.send(JSON.stringify(tradeEntry));
            });
        } catch (error) {
            console.error("❌ Ошибка генерации сигналов:", error);
        }
    }

    // Периодическая генерация сигналов (например, каждые 15 минут)
    const signalInterval = setInterval(sendTradingSignals, 15 * 60 * 1000);

    // Обработка входящих сообщений для управления позициями
    ws.on("message", (message) => {
        try {
            const data = JSON.parse(message);

            if (data.type === "CLOSE_TRADE") {
                const tradeIndex = trades.findIndex(t =>
                    t.symbol === data.symbol && t.status === "OPEN"
                );

                if (tradeIndex !== -1) {
                    trades[tradeIndex].status = "CLOSED";
                    trades[tradeIndex].closeTime = new Date().toISOString();
                    trades[tradeIndex].closePrice = data.closePrice;

                    // Обновление статистики
                    if (data.closePrice > trades[tradeIndex].entryPrice) {
                        tradingStats.profitableTrades++;
                    } else {
                        tradingStats.lossTrades++;
                    }

                    console.log("🏁 Сделка закрыта:", trades[tradeIndex]);
                    ws.send(JSON.stringify({
                        type: "TRADE_CLOSED",
                        trade: trades[tradeIndex],
                        stats: tradingStats
                    }));
                }
            }
        } catch (error) {
            console.error("❌ Ошибка обработки сообщения:", error);
        }
    });

    // Отправка первоначальных сигналов при подключении
    sendTradingSignals();

    ws.on("close", () => {
        console.log("❌ Клиент отключился");
        clearInterval(signalInterval);
    });
});

console.log("🚀 Торговый сервер запущен на порту 5001");