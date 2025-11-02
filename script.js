// Store individual price histories
const priceHistories = {
    FIZZ: [],
    LUX: [],
    NOVA: [],
};
const maxPoints = 50;
let currentTicker = "LUX"; // default

// --- Initialize chart ---
let chart;
function initChart() {
    const ctx = document.getElementById("stockChart").getContext("2d");

    // Gradient for line
    const gradient = ctx.createLinearGradient(0, 0, 0, 300);
    gradient.addColorStop(0, "rgba(0, 255, 255, 0.8)");
    gradient.addColorStop(1, "rgba(0, 100, 255, 0.1)");

    chart = new Chart(ctx, {
        type: "line",
        data: {
            labels: Array(maxPoints).fill(""),
            datasets: [
                {
                    label: `${currentTicker} Price`,
                    data: priceHistories[currentTicker],
                    borderColor: "rgba(0, 255, 255, 0.9)",
                    backgroundColor: gradient,
                    borderWidth: 2,
                    fill: true,
                    tension: 0.3,
                    pointRadius: 0,
                    pointHoverRadius: 5,
                    pointHoverBackgroundColor: "white",
                    pointHoverBorderColor: "cyan",
                    pointHoverBorderWidth: 2,
                },
            ],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: {
                duration: 400,
                easing: "easeOutCubic",
            },
            plugins: {
                legend: {
                    display: true,
                    labels: {
                        color: "#ccc",
                        font: {
                            size: 13,
                            weight: "bold",
                        },
                        usePointStyle: true,
                    },
                },
                tooltip: {
                    backgroundColor: "rgba(0,0,0,0.8)",
                    titleColor: "#fff",
                    bodyColor: "#0ff",
                    borderColor: "#0ff",
                    borderWidth: 1,
                    displayColors: false,
                    callbacks: {
                        label: function (context) {
                            return `$${context.formattedValue}`;
                        },
                    },
                },
            },
            scales: {
                x: {
                    display: false,
                },
                y: {
                    grid: {
                        color: "rgba(255,255,255,0.05)",
                    },
                    ticks: {
                        color: "#aaa",
                        font: {
                            size: 12,
                        },
                    },
                },
            },
        },
    });
}

function updateChart(price) {
    if (currentTicker === "ALL") {
        const longest = Math.max(
            ...Object.values(priceHistories).map((a) => a.length)
        );

        chart.data.datasets = Object.keys(priceHistories).map((ticker, i) => {
            const hue = (i * 80) % 360;
            const color = `hsl(${hue}, 80%, 60%)`;
            const ctx = document.getElementById("stockChart").getContext("2d");
            const gradient = ctx.createLinearGradient(0, 0, 0, 300);
            gradient.addColorStop(
                0,
                color
                    .replace("60%", "70%")
                    .replace("hsl", "hsla")
                    .replace(")", ",0.8)")
            );
            gradient.addColorStop(
                1,
                color
                    .replace("60%", "70%")
                    .replace("hsl", "hsla")
                    .replace(")", ",0.1)")
            );

            return {
                label: `${ticker} Price`,
                data: priceHistories[ticker].slice(-maxPoints),
                borderColor: color,
                backgroundColor: gradient,
                borderWidth: 2,
                fill: true,
                tension: 0.3,
                pointRadius: 0,
            };
        });

        chart.data.labels = Array(Math.min(longest, maxPoints)).fill("");
    } else {
        const arr = priceHistories[currentTicker];
        if (
            price !== undefined &&
            (arr.length === 0 || arr[arr.length - 1] !== price)
        ) {
            arr.push(price);
        }
        if (arr.length > maxPoints) arr.splice(0, arr.length - maxPoints);

        const ctx = document.getElementById("stockChart").getContext("2d");
        const gradient = ctx.createLinearGradient(0, 0, 0, 300);
        gradient.addColorStop(0, "rgba(0,255,255,0.8)");
        gradient.addColorStop(1, "rgba(0,100,255,0.1)");

        chart.data.datasets = [
            {
                label: `${currentTicker} Price`,
                data: arr,
                borderColor: "rgba(0,255,255,0.9)",
                backgroundColor: gradient,
                borderWidth: 2,
                fill: true,
                tension: 0.3,
                pointRadius: 0,
            },
        ];

        chart.data.labels = Array(arr.length).fill("");
    }

    chart.update("none");
}

function calculateNetWorth() {
    const view = SecureSim.getPublicView();
    let totalStockValue = 0;
    for (const t in view.stocks) {
        totalStockValue += view.stocks[t].price * view.stocks[t].shares;
    }
    return view.balance + totalStockValue;
}

function getRank(netWorth) {
    const rankElem = document.getElementById("rank");

    let rank = "";
    let color = "";
    let glow = "";
    let specialClass = ""; // For animation

    if (netWorth < 2_000) {
        rank = "📉 Beginner Investor";
        color = "#A0A0A0"; // grey
        glow = ""; // no glow
    } else if (netWorth < 10_000) {
        rank = "📊 Aspiring Trader";
        color = "#5DADE2"; // soft blue
        glow = "0 0 2px #5DADE2";
    } else if (netWorth < 25_000) {
        rank = "💰 Emerging Investor";
        color = "#48C9B0"; // teal/greenish
        glow = "0 0 3px #48C9B0";
    } else if (netWorth < 75_000) {
        rank = "📈 Market Analyst";
        color = "#28B463"; // medium green
        glow = "0 0 4px #28B463";
    } else if (netWorth < 150_000) {
        rank = "🏦 Portfolio Builder";
        color = "#239B56"; // deeper green
        glow = "0 0 5px #239B56";
    } else if (netWorth < 300_000) {
        rank = "💎 Capital Strategist";
        color = "#F7DC6F"; // brighter gold
        glow = "0 0 6px #F7DC6F";
    } else if (netWorth < 600_000) {
        rank = "💸 Financial Tycoon";
        color = "#F5B041"; // bright orange
        glow = "0 0 7px #F5B041";
    } else if (netWorth < 1_200_000) {
        rank = "🪙 Investment Master I";
        color = "#EC7063"; // bright red
        glow = "0 0 8px #EC7063";
    } else if (netWorth < 1_800_000) {
        rank = "🪙 Investment Master II";
        color = "#E74C3C"; // stronger red
        glow = "0 0 9px #E74C3C";
    } else if (netWorth < 3_000_000) {
        rank = "🪙 Investment Master III";
        color = "#C0392B"; // vivid red
        glow = "0 0 10px #C0392B";
    } else if (netWorth < 5_000_000) {
        rank = "👑 Investment Legend I 👑";
        color = "#9B59B6"; // bright purple
        glow = "0 0 11px #9B59B6";
        specialClass = "rank-gradient"; // Apply glow + gradient animation
    } else if (netWorth < 10_000_000) {
        rank = "👑 Investment Legend II 👑";
        color = "#8E44AD"; // strong purple
        glow = "0 0 12px #8E44AD";
        specialClass = "rank-gradient"; // Apply glow + gradient animation
    } else if (netWorth < 20_000_000) {
        rank = "👑 Investment Legend III 👑";
        color = "#7D3C98"; // vivid purple
        glow = "0 0 13px #7D3C98";
        specialClass = "rank-gradient"; // Apply glow + gradient animation
    } else {
        rank = "🏆 Global Market Radiant 🏆";
        color = "#F1C40F"; // bright gold
        glow = "0 0 20px #F1C40F";
        specialClass = "rank-glow rank-gradient"; // Apply glow + gradient animation
    
        // --- ⭐ Star scaling every +10 million beyond 20M ---
        const extraStars = Math.floor((netWorth - 20_000_000) / 10_000_000);
        if (extraStars > 0) {
            rank += " " + "⭐".repeat(extraStars);
        }
    }

    rankElem.textContent = rank;
    rankElem.style.color = color;
    rankElem.style.textShadow = glow;
    rankElem.className = specialClass; // Apply CSS animations
    updateWithPulse(rankElem, rank);
}

function updateWithPulse(elem, value) {
    if (!elem) return;

    // Only trigger if value changed
    if (elem.textContent !== value) {
        elem.textContent = value;

        // Remove pulse class to retrigger
        elem.classList.remove("pulse");
        void elem.offsetWidth; // force reflow
        elem.classList.add("pulse");
    }
}

// Handle view updates (called by subscribe)
function handleView(view) {
    if (!view) return;

    const balanceElem = document.getElementById("balance");
    const networthElem = document.getElementById("networth");
    const sharesElem = document.getElementById("shares");
    updateWithPulse(balanceElem, view.balance.toFixed(2));

    // Calculate total net worth (balance + stock values)
    let totalValue = view.balance;
    for (const ticker of Object.keys(view.stocks)) {
        const stock = view.stocks[ticker];
        totalValue += stock.price * stock.shares;
    }
    updateWithPulse(networthElem, totalValue.toFixed(2));
    getRank(totalValue);

    // Update all stock histories
    for (const ticker of Object.keys(view.stocks)) {
        const price = view.stocks[ticker].price;
        const arr = priceHistories[ticker];
        if (arr.length === 0 || arr[arr.length - 1] !== price) {
            arr.push(price);
            if (arr.length > maxPoints) arr.shift();
        }
    }

    if (currentTicker === "ALL") {
        updateChart();
    } else {
        const stock = view.stocks[currentTicker];
        if (!stock) return;

        // Use updateWithPulse for shares and price too
        updateWithPulse(sharesElem, (stock.shares ?? 0).toFixed(2));
        updateWithPulse(
            document.getElementById("price"),
            stock.price.toFixed(2)
        );

        updateChart(stock.price);
    }
}

function selectTicker(ticker) {
    currentTicker = ticker;

    const tickerLabel = document.getElementById("tickerLabel");
    const priceLabel = document.getElementById("price");
    const sharesLabel = document.getElementById("shares");

    // --- Highlight active ticker button ---
    document
        .querySelectorAll(".ticker-btn")
        .forEach((btn) => btn.classList.remove("active"));
    const activeBtn = document.querySelector(`[data-ticker="${ticker}"]`);
    if (activeBtn) activeBtn.classList.add("active");

    // --- Update ticker display ---
    tickerLabel.textContent = ticker;
    priceLabel.textContent = "---";
    sharesLabel.textContent = "---";

    // --- Update chart ---
    if (ticker === "ALL") {
        // Build datasets for all tickers
        chart.data.datasets = Object.keys(priceHistories).map((t, i) => ({
            label: `${t} Price`,
            data: [...priceHistories[t]], // copy to prevent mutation issues
            borderColor: `hsl(${i * 100}, 70%, 50%)`,
            borderWidth: 2,
            fill: false,
            tension: 0.1,
        }));
    } else {
        // Single ticker — rebuild datasets to remove others
        chart.data.datasets = [
            {
                label: `${ticker} Price`,
                data: [...priceHistories[ticker]],
                borderColor: "rgb(75,192,192)",
                borderWidth: 2,
                fill: false,
                tension: 0.1,
            },
        ];
    }

    chart.data.labels = Array(maxPoints).fill(""); // ensure consistent label length
    chart.update({ duration: 0 }); // instant redraw without bounce

    // --- Update price and shares from SecureSim ---
    const view = SecureSim.getPublicView();
    const stock = view.stocks[ticker];
    if (stock) {
        priceLabel.textContent = stock.price.toFixed(2);
        sharesLabel.textContent = stock.shares.toFixed(2);
    } else {
        priceLabel.textContent = "---";
        sharesLabel.textContent = "---";
    }
}

function showAllTickers() {
    currentTicker = "ALL";

    // Update active button
    document
        .querySelectorAll(".ticker-btn")
        .forEach((btn) => btn.classList.remove("active"));
    const allBtn = document.querySelector('[data-ticker="ALL"]');
    if (allBtn) allBtn.classList.add("active");

    // Prepare datasets WITHOUT specifying colors
    chart.data.datasets = Object.keys(priceHistories).map((ticker) => ({
        label: `${ticker} Price`,
        data: [...priceHistories[ticker]],
        tension: 0.1,
        borderWidth: 2,
        fill: false,
        // no borderColor here
    }));

    // Update labels
    chart.data.labels = Array(maxPoints).fill("");

    // Update chart instantly
    chart.update({ duration: 0 });

    // Update info labels
    document.getElementById("tickerLabel").textContent = "ALL";
    document.getElementById("price").textContent = "---";
    document.getElementById("shares").textContent = "---";
}

// --- Transaction Feedback ---
function showTransactionMessage(text, color = "cyan") {
    // Find or create notification container
    let container = document.getElementById("notificationContainer");
    if (!container) {
        container = document.createElement("div");
        container.id = "notificationContainer";
        Object.assign(container.style, {
            position: "fixed",
            top: "20px",
            right: "20px",
            display: "flex",
            flexDirection: "column",
            gap: "10px",
            zIndex: 9999,
        });
        document.body.appendChild(container);
    }

    // Create message element
    const msg = document.createElement("div");
    msg.textContent = text;
    Object.assign(msg.style, {
        background: "rgba(0, 0, 0, 0.7)",
        border: `1px solid ${color}`,
        color,
        padding: "10px 18px",
        borderRadius: "10px",
        fontWeight: "bold",
        fontSize: "15px",
        opacity: 0,
        transform: "translateX(100%)",
        transition: "all 0.4s ease",
        whiteSpace: "nowrap",
    });

    // Add to container
    container.appendChild(msg);

    // Slide in
    setTimeout(() => {
        msg.style.opacity = 1;
        msg.style.transform = "translateX(0)";
    }, 50);

    // Slide out after a delay
    setTimeout(() => {
        msg.style.opacity = 0;
        msg.style.transform = "translateX(120%)";
    }, 2000);

    // Remove after animation
    setTimeout(() => msg.remove(), 2500);
}

// --- Buy and Sell Functions ---
function buyStock(percent) {
    const result = SecureSim.buyByPercent(currentTicker, percent);
    if (!result.ok) {
        alert(result.error);
        return;
    }
    handleView(SecureSim.getPublicView());
    showTransactionMessage(`Bought ${percent}% of ${currentTicker}`, "lime");
}

function sellStock(percent) {
    const result = SecureSim.sellByPercent(currentTicker, percent);
    if (!result.ok) {
        alert(result.error);
        return;
    }
    handleView(SecureSim.getPublicView());
    showTransactionMessage(`Sold ${percent}% of ${currentTicker}`, "red");
}

// Initialize
initChart();
SecureSim.subscribe(handleView);
SecureSim.init();

