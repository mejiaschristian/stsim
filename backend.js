// --- backend.js ---
// SecureSim: secure trading simulation backend (with offline growth)
const SecureSim = (() => {
    const STORAGE_KEY = "secureSimSave"; // key name for localStorage
    const LAST_TICK_KEY = "secureSimLastTick"; // track last tick time

    const state = {
        balance: 800,
        stocks: {
            LUX: { price: 120, shares: 0 },
            FIZZ: { price: 95, shares: 0 },
            NOVA: { price: 180, shares: 0 },
        },
        tick: 0,
        subscribers: [],
    };

    // --- SAVE & LOAD FUNCTIONS ---
    function saveGame() {
        try {
            const saveData = {
                balance: state.balance,
                stocks: state.stocks,
            };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(saveData));
            console.log("✅ Game saved!");
        } catch (e) {
            console.error("Failed to save game:", e);
        }
    }

    function loadGame() {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                const data = JSON.parse(saved);
                if (data.balance !== undefined && data.stocks) {
                    state.balance = data.balance;
                    for (const key in data.stocks) {
                        if (state.stocks[key]) {
                            state.stocks[key].shares = data.stocks[key].shares;
                            state.stocks[key].price = data.stocks[key].price;
                        }
                    }
                    console.log("📂 Game loaded from localStorage!");
                    return true; // successfully loaded
                }
            }
            console.log("🆕 No saved data found — starting fresh.");
            return false; // no save found
        } catch (e) {
            console.error("Failed to load game:", e);
            return false;
        }
    }

    // --- CORE GAME FUNCTIONS ---
    function notify() {
        const snapshot = getPublicView();
        state.subscribers.forEach((fn) => fn(snapshot));
    }

    function getPublicView() {
        return JSON.parse(
            JSON.stringify({
                balance: state.balance,
                stocks: state.stocks,
            })
        );
    }

    function randomizePrices() {
        for (const s in state.stocks) {
            const stock = state.stocks[s];
            const change = (Math.random() - 0.5) * 4; // ±2% change
            stock.price = Math.max(
                1,
                +(stock.price * (1 + change / 100)).toFixed(2)
            );
        }
        state.tick++;
        notify();
    }

    function applyDividends() {
        const divRate = 0.002; // 0.2% per tick
        let totalPayout = 0;

        for (const s in state.stocks) {
            const stock = state.stocks[s];
            const payout = stock.price * stock.shares * divRate;
            state.balance += payout;
            totalPayout += payout;
        }

        if (totalPayout > 0.01 && window.showTransactionMessage) {
            window.showTransactionMessage(
                `💵 Received $${totalPayout.toFixed(2)} in dividends!`,
                "cyan"
            );
        }

        notify();
        saveGame();
        saveLastTick();
    }

    function buyByPercent(ticker, percent) {
        const s = state.stocks[ticker];
        if (!s) return { ok: false, error: "invalid ticker" };
        const invest = state.balance * (percent / 100);
        if (invest <= 0) return { ok: false, error: "no balance" };
        const shares = invest / s.price;
        state.balance -= invest;
        s.shares += shares;
        notify();
        saveGame();
        return { ok: true, sharesBought: shares };
    }

    function sellByPercent(ticker, percent) {
        const s = state.stocks[ticker];
        if (!s) return { ok: false, error: "invalid ticker" };
        const sellShares = s.shares * (percent / 100);
        if (sellShares <= 0) return { ok: false, error: "no shares" };
        const gain = sellShares * s.price;
        s.shares -= sellShares;
        state.balance += gain;
        notify();
        saveGame();
        return { ok: true, gain };
    }

    function subscribe(fn) {
        state.subscribers.push(fn);
    }

    // --- OFFLINE GROWTH HANDLER ---
    function saveLastTick() {
        localStorage.setItem(LAST_TICK_KEY, Date.now());
    }

    function applyOfflineGrowth() {
        const last = parseInt(
            localStorage.getItem(LAST_TICK_KEY) || Date.now()
        );
        const now = Date.now();
        const elapsedSec = (now - last) / 1000;
        const ticks = Math.floor(elapsedSec / 3); // 1 tick = 3 seconds

        if (ticks > 0) {
            console.log(`⏱ Applying ${ticks} offline ticks...`);
            for (let i = 0; i < ticks; i++) {
                randomizePrices();
                applyDividends();
            }
        }

        saveLastTick();
    }

    // --- INITIALIZE GAME ---
    function init() {
        loadGame();
        applyOfflineGrowth();
        notify();

        setInterval(() => {
            randomizePrices();
            applyDividends();
        }, 3000);
    }

    // --- RESET GAME ---
    function reset() {
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(LAST_TICK_KEY);
        location.reload();
    }

    return {
        init,
        buyByPercent,
        sellByPercent,
        subscribe,
        getPublicView,
        reset,
    };
})();

console.log("✅ SecureSim loaded with offline growth enabled");
window.SecureSim = SecureSim;
