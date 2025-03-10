// frontend/static/js/charts.js
document.addEventListener('DOMContentLoaded', function () {
    // Variables globales
    let currentSymbol = 'AAPL';  // Symbole par défaut

    // Données de démonstration
    const demoData = {
        "AAPL": {
            "symbol": "AAPL",
            "count": 32,
            "average_sentiment": 0.35,
            "positive_count": 18,
            "negative_count": 7,
            "neutral_count": 7,
            "positive_pct": 56.25,
            "negative_pct": 21.88,
            "neutral_pct": 21.87,
            "date": "2025-03-10T17:00:00.000Z",
            "current_price": 184.37,
            "previous_close": 180.75,
            "price_change": 3.62,
            "price_change_pct": 2.00
        },
        "TSLA": {
            "symbol": "TSLA",
            "count": 45,
            "average_sentiment": -0.12,
            "positive_count": 14,
            "negative_count": 22,
            "neutral_count": 9,
            "positive_pct": 31.11,
            "negative_pct": 48.89,
            "neutral_pct": 20.00,
            "date": "2025-03-10T17:00:00.000Z",
            "current_price": 178.04,
            "previous_close": 182.43,
            "price_change": -4.39,
            "price_change_pct": -2.41
        },
        "MSFT": {
            "symbol": "MSFT",
            "count": 28,
            "average_sentiment": 0.22,
            "positive_count": 15,
            "negative_count": 8,
            "neutral_count": 5,
            "positive_pct": 53.57,
            "negative_pct": 28.57,
            "neutral_pct": 17.86,
            "date": "2025-03-10T17:00:00.000Z",
            "current_price": 417.22,
            "previous_close": 415.50,
            "price_change": 1.72,
            "price_change_pct": 0.41
        }
    };

    // Données d'historique de démonstration
    const demoHistory = {
        "sentiment_history": [
            { "date": "2025-03-04", "average_sentiment": 0.15, "positive_pct": 45.0, "negative_pct": 30.0, "neutral_pct": 25.0, "count": 20 },
            { "date": "2025-03-05", "average_sentiment": 0.22, "positive_pct": 48.0, "negative_pct": 25.0, "neutral_pct": 27.0, "count": 22 },
            { "date": "2025-03-06", "average_sentiment": 0.18, "positive_pct": 46.0, "negative_pct": 29.0, "neutral_pct": 25.0, "count": 24 },
            { "date": "2025-03-07", "average_sentiment": 0.25, "positive_pct": 50.0, "negative_pct": 20.0, "neutral_pct": 30.0, "count": 25 },
            { "date": "2025-03-08", "average_sentiment": 0.30, "positive_pct": 53.0, "negative_pct": 18.0, "neutral_pct": 29.0, "count": 28 },
            { "date": "2025-03-09", "average_sentiment": 0.32, "positive_pct": 54.0, "negative_pct": 16.0, "neutral_pct": 30.0, "count": 30 },
            { "date": "2025-03-10", "average_sentiment": 0.35, "positive_pct": 56.0, "negative_pct": 22.0, "neutral_pct": 22.0, "count": 32 }
        ],
        "price_history": [
            { "date": "2025-03-04", "open": 175.12, "high": 178.32, "low": 174.89, "close": 176.28, "volume": 12458900 },
            { "date": "2025-03-05", "open": 176.45, "high": 179.65, "low": 175.87, "close": 177.93, "volume": 13567800 },
            { "date": "2025-03-06", "open": 178.10, "high": 180.23, "low": 177.56, "close": 179.45, "volume": 11876500 },
            { "date": "2025-03-07", "open": 179.67, "high": 182.14, "low": 179.11, "close": 181.78, "volume": 14325900 },
            { "date": "2025-03-08", "open": 181.92, "high": 183.45, "low": 180.76, "close": 182.34, "volume": 10954300 },
            { "date": "2025-03-09", "open": 182.56, "high": 184.21, "low": 181.89, "close": 183.67, "volume": 11234500 },
            { "date": "2025-03-10", "open": 183.78, "high": 185.43, "low": 183.12, "close": 184.37, "volume": 13456700 }
        ]
    };

    // Initialiser le dashboard avec des données de démonstration
    renderStockCards(demoData);
    setActiveSymbol('AAPL');
    renderSentimentChart(demoHistory.sentiment_history, 'AAPL');
    renderPriceChart(demoHistory.price_history, 'AAPL');

    // Configurer les écouteurs d'événements
    document.querySelectorAll('.stock-selector').forEach(button => {
        button.addEventListener('click', function () {
            const symbol = this.getAttribute('data-symbol');
            setActiveSymbol(symbol);
            renderSentimentChart(demoHistory.sentiment_history, symbol);
            renderPriceChart(demoHistory.price_history, symbol);
        });
    });

    document.getElementById('refreshButton').addEventListener('click', function () {
        this.disabled = true;
        this.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Refreshing...';

        setTimeout(() => {
            renderStockCards(demoData);
            renderSentimentChart(demoHistory.sentiment_history, currentSymbol);
            renderPriceChart(demoHistory.price_history, currentSymbol);
            this.disabled = false;
            this.textContent = 'Refresh Data';
        }, 1500);
    });

    // Rendre les cartes d'actions
    function renderStockCards(data) {
        const container = document.getElementById('stockCards');
        container.innerHTML = '';

        Object.keys(data).forEach(symbol => {
            const summary = data[symbol];
            const sentimentClass = getSentimentClass(summary.average_sentiment);
            const priceChangeClass = summary.price_change >= 0 ? 'price-change-positive' : 'price-change-negative';

            const card = document.createElement('div');
            card.className = 'col-md-4 mb-3';
            card.innerHTML = `
                <div class="card stock-card ${sentimentClass}" data-symbol="${symbol}">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-center">
                            <h5 class="card-title">${symbol}</h5>
                            <div class="price-info">
                                <span class="current-price">$${summary.current_price.toFixed(2)}</span>
                                <span class="price-change ${priceChangeClass}">
                                    ${summary.price_change >= 0 ? '+' : ''}${summary.price_change.toFixed(2)} (${summary.price_change_pct.toFixed(2)}%)
                                </span>
                            </div>
                        </div>
                        <div class="sentiment-info mt-3">
                            <div class="progress mb-2">
                                <div class="progress-bar bg-success" role="progressbar" style="width: ${summary.positive_pct}%" aria-valuenow="${summary.positive_pct}" aria-valuemin="0" aria-valuemax="100"></div>
                                <div class="progress-bar bg-info" role="progressbar" style="width: ${summary.neutral_pct}%" aria-valuenow="${summary.neutral_pct}" aria-valuemin="0" aria-valuemax="100"></div>
                                <div class="progress-bar bg-danger" role="progressbar" style="width: ${summary.negative_pct}%" aria-valuenow="${summary.negative_pct}" aria-valuemin="0" aria-valuemax="100"></div>
                            </div>
                            <div class="small">
                                <span class="text-success">Positive: ${summary.positive_pct.toFixed(1)}%</span> |
                                <span class="text-info">Neutral: ${summary.neutral_pct.toFixed(1)}%</span> |
                                <span class="text-danger">Negative: ${summary.negative_pct.toFixed(1)}%</span>
                            </div>
                        </div>
                        <div class="mt-2 small text-muted">
                            Based on ${summary.count} mentions | Updated: ${new Date(summary.date).toLocaleString()}
                        </div>
                    </div>
                </div>
            `;

            card.querySelector('.stock-card').addEventListener('click', function () {
                const symbol = this.getAttribute('data-symbol');
                setActiveSymbol(symbol);
                renderSentimentChart(demoHistory.sentiment_history, symbol);
                renderPriceChart(demoHistory.price_history, symbol);
            });

            container.appendChild(card);
        });
    }

    // Rendre le graphique de sentiment
    function renderSentimentChart(data, symbol) {
        const container = document.getElementById('sentimentChart');

        const dates = data.map(item => item.date);
        const sentiments = data.map(item => item.average_sentiment);
        const positivePcts = data.map(item => item.positive_pct);
        const negativePcts = data.map(item => item.negative_pct);

        const trace1 = {
            x: dates,
            y: sentiments,
            type: 'scatter',
            mode: 'lines+markers',
            name: 'Average Sentiment',
            line: {
                color: 'rgb(75, 192, 192)',
                width: 3
            },
            marker: {
                size: 8
            }
        };

        const trace2 = {
            x: dates,
            y: positivePcts,
            type: 'bar',
            name: 'Positive %',
            marker: {
                color: 'rgba(40, 167, 69, 0.6)'
            },
            yaxis: 'y2'
        };

        const trace3 = {
            x: dates,
            y: negativePcts,
            type: 'bar',
            name: 'Negative %',
            marker: {
                color: 'rgba(220, 53, 69, 0.6)'
            },
            yaxis: 'y2'
        };

        const layout = {
            title: `Sentiment Trend for ${symbol}`,
            xaxis: {
                title: 'Date'
            },
            yaxis: {
                title: 'Sentiment Score',
                range: [-1, 1],
                zeroline: true,
                zerolinecolor: '#888',
                zerolinewidth: 1
            },
            yaxis2: {
                title: 'Percentage',
                overlaying: 'y',
                side: 'right',
                range: [0, 100],
                showgrid: false
            },
            legend: {
                orientation: 'h',
                y: -0.2
            },
            margin: {
                l: 50,
                r: 50,
                t: 50,
                b: 80
            }
        };

        Plotly.newPlot(container, [trace1, trace2, trace3], layout);
    }

    // Rendre le graphique de prix
    function renderPriceChart(data, symbol) {
        const container = document.getElementById('priceChart');

        const dates = data.map(item => item.date);
        const prices = data.map(item => item.close);

        const trace = {
            x: dates,
            y: prices,
            type: 'scatter',
            mode: 'lines',
            name: 'Close Price',
            line: {
                color: 'rgb(75, 75, 192)',
                width: 2
            }
        };

        const layout = {
            title: `Price History for ${symbol}`,
            xaxis: {
                title: 'Date'
            },
            yaxis: {
                title: 'Price ($)'
            },
            margin: {
                l: 50,
                r: 40,
                t: 50,
                b: 80
            }
        };

        Plotly.newPlot(container, [trace], layout);
    }

    // Définir le symbole actif
    function setActiveSymbol(symbol) {
        currentSymbol = symbol;

        // Mettre à jour l'état actif des boutons
        document.querySelectorAll('.stock-selector').forEach(button => {
            if (button.getAttribute('data-symbol') === symbol) {
                button.classList.add('btn-primary');
                button.classList.remove('btn-outline-primary');
            } else {
                button.classList.remove('btn-primary');
                button.classList.add('btn-outline-primary');
            }
        });

        // Mettre en évidence la carte correspondante
        document.querySelectorAll('.stock-card').forEach(card => {
            if (card.getAttribute('data-symbol') === symbol) {
                card.classList.add('border-primary');
            } else {
                card.classList.remove('border-primary');
            }
        });

        // Ajouter quelques éléments récents de sentiment
        displayRecentItems(symbol);
    }

    // Afficher des éléments récents de sentiment
    function displayRecentItems(symbol) {
        const container = document.getElementById('recentItems');

        // Données d'exemple pour les éléments récents
        const recentItems = [
            {
                title: `${symbol} Announces New Product Line`,
                source: 'Yahoo Finance',
                date: '2025-03-10',
                sentiment: 0.42,
                label: 'positive'
            },
            {
                title: `Analysts Predict Strong Quarter for ${symbol}`,
                source: 'MarketWatch',
                date: '2025-03-09',
                sentiment: 0.38,
                label: 'positive'
            },
            {
                title: `${symbol} Faces Supply Chain Challenges`,
                source: 'Bloomberg',
                date: '2025-03-08',
                sentiment: -0.25,
                label: 'negative'
            }
        ];

        let html = `<h6 class="mb-3">Recent mentions of ${symbol}</h6>`;

        recentItems.forEach(item => {
            const badgeClass = item.label === 'positive' ? 'positive' : item.label === 'negative' ? 'negative' : 'neutral';
            html += `
                <div class="card mb-2">
                    <div class="card-body">
                        <div class="d-flex justify-content-between">
                            <h6 class="card-title">${item.title}</h6>
                            <span class="sentiment-badge ${badgeClass}">${item.label}</span>
                        </div>
                        <div class="small text-muted">
                            Source: ${item.source} | Date: ${item.date}
                        </div>
                    </div>
                </div>
            `;
        });

        container.innerHTML = html;
    }

    // Obtenir la classe CSS basée sur le sentiment
    function getSentimentClass(sentiment) {
        if (sentiment >= 0.05) {
            return 'sentiment-positive';
        } else if (sentiment <= -0.05) {
            return 'sentiment-negative';
        } else {
            return 'sentiment-neutral';
        }
    }
});