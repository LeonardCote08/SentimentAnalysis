document.addEventListener('DOMContentLoaded', function () {
    // Variables globales
    let currentSymbol = 'AAPL';  // Symbole par défaut
    let currentPeriod = 7;      // Période par défaut (7 jours)

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
            "price_change_pct": 2.00,
            "prediction": {
                "price": 186.21,
                "change_pct": 1.00,
                "confidence": 75,
                "factors": {
                    "sentiment_trend": "positive",
                    "market_momentum": "bullish",
                    "news_impact": "neutral",
                    "historical_pattern": "uptrend"
                }
            }
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
            "price_change_pct": -2.41,
            "prediction": {
                "price": 175.26,
                "change_pct": -1.56,
                "confidence": 68,
                "factors": {
                    "sentiment_trend": "negative",
                    "market_momentum": "bearish",
                    "news_impact": "negative",
                    "historical_pattern": "downtrend"
                }
            }
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
            "price_change_pct": 0.41,
            "prediction": {
                "price": 421.39,
                "change_pct": 1.00,
                "confidence": 62,
                "factors": {
                    "sentiment_trend": "positive",
                    "market_momentum": "neutral",
                    "news_impact": "positive",
                    "historical_pattern": "sideways"
                }
            }
        }
    };

    // Données d'historique de démonstration
    const generateHistoryData = (symbol, days) => {
        const today = new Date();
        const startDate = new Date(today);
        startDate.setDate(startDate.getDate() - days);

        let basePrice, sentimentTrend, volatility;

        // Valeurs de référence selon le symbole
        switch (symbol) {
            case 'AAPL':
                basePrice = 176;
                sentimentTrend = 0.15;
                volatility = 0.8;
                break;
            case 'TSLA':
                basePrice = 180;
                sentimentTrend = -0.1;
                volatility = 2.5;
                break;
            case 'MSFT':
                basePrice = 410;
                sentimentTrend = 0.2;
                volatility = 1.2;
                break;
            default:
                basePrice = 100;
                sentimentTrend = 0;
                volatility = 1;
        }

        const sentimentHistory = [];
        const priceHistory = [];

        // Générer les données d'historique
        for (let i = 0; i <= days; i++) {
            const date = new Date(startDate);
            date.setDate(date.getDate() + i);
            const dateStr = date.toISOString().split('T')[0];

            // Calculer les valeurs avec des tendances et variations aléatoires
            const dayRatio = i / days; // 0 à 1 pour la progression dans le temps
            const randomFactor = Math.random() * 2 - 1; // -1 à 1 pour l'aléatoire

            // Sentiment: commence à une valeur de base et se déplace vers la valeur cible
            let sentiment;
            if (symbol === 'AAPL') {
                sentiment = 0.1 + dayRatio * 0.25 + randomFactor * 0.1;
            } else if (symbol === 'TSLA') {
                sentiment = 0.05 - dayRatio * 0.2 + randomFactor * 0.15;
            } else {
                sentiment = 0.15 + dayRatio * 0.1 + randomFactor * 0.1;
            }
            sentiment = Math.max(-0.8, Math.min(0.8, sentiment)); // Limiter entre -0.8 et 0.8

            // Pourcentages de sentiment
            let positivePct, negativePct, neutralPct;
            if (sentiment > 0) {
                positivePct = 40 + sentiment * 50;
                negativePct = 30 - sentiment * 25;
                neutralPct = 100 - positivePct - negativePct;
            } else {
                negativePct = 40 + Math.abs(sentiment) * 50;
                positivePct = 30 - Math.abs(sentiment) * 25;
                neutralPct = 100 - positivePct - negativePct;
            }

            // Prix: commence à basePrice et varie selon le sentiment et l'aléatoire
            const price = basePrice * (1 + dayRatio * (sentiment + 0.05) + randomFactor * 0.01 * volatility);

            // Ajouter à l'historique
            sentimentHistory.push({
                date: dateStr,
                average_sentiment: sentiment,
                positive_pct: positivePct,
                negative_pct: negativePct,
                neutral_pct: neutralPct,
                count: Math.round(20 + 15 * dayRatio + randomFactor * 5)
            });

            priceHistory.push({
                date: dateStr,
                open: price * (1 - 0.005 * Math.random()),
                high: price * (1 + 0.01 * Math.random()),
                low: price * (1 - 0.01 * Math.random()),
                close: price,
                volume: Math.round(10000000 + 5000000 * Math.random())
            });
        }

        return {
            sentiment_history: sentimentHistory,
            price_history: priceHistory
        };
    };

    // Initialiser le dashboard avec des données de démonstration
    renderStockCards(demoData);
    renderComparisonTable(demoData);
    const historyData = generateHistoryData('AAPL', 7);
    renderSentimentChart(historyData.sentiment_history, 'AAPL');
    renderPriceChart(historyData.price_history, 'AAPL', demoData['AAPL'].prediction);
    updatePrediction('AAPL', demoData['AAPL']);
    displayRecentItems('AAPL');

    // Configurer les écouteurs d'événements
    document.querySelectorAll('.stock-selector').forEach(button => {
        button.addEventListener('click', function () {
            const symbol = this.getAttribute('data-symbol');
            setActiveSymbol(symbol);

            // Générer et afficher les données pour la période actuelle
            const historyData = generateHistoryData(symbol, currentPeriod);
            renderSentimentChart(historyData.sentiment_history, symbol);
            renderPriceChart(historyData.price_history, symbol, demoData[symbol].prediction);
            updatePrediction(symbol, demoData[symbol]);
            displayRecentItems(symbol);

            // Afficher une notification de changement significatif pour TSLA
            if (symbol === 'TSLA' && Math.random() > 0.5) {
                showNotification('significant-change', 'Significant change detected in TSLA sentiment (-15% in 24h)');
            }
        });
    });

    // Configurer les écouteurs pour les filtres de période
    document.querySelectorAll('.period-btn').forEach(button => {
        button.addEventListener('click', function () {
            const period = parseInt(this.getAttribute('data-period'));
            setActivePeriod(period);

            // Régénérer et afficher les données pour la nouvelle période
            const historyData = generateHistoryData(currentSymbol, period);
            renderSentimentChart(historyData.sentiment_history, currentSymbol);
            renderPriceChart(historyData.price_history, currentSymbol, demoData[currentSymbol].prediction);
        });
    });

    document.getElementById('refreshButton').addEventListener('click', function () {
        this.disabled = true;
        this.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Refreshing...';

        setTimeout(() => {
            // Mettre à jour l'heure
            const now = new Date();
            const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            document.getElementById('lastUpdateTime').textContent = `Today ${timeString}`;

            // Recréer les données avec de légères variations
            Object.keys(demoData).forEach(symbol => {
                demoData[symbol].average_sentiment += (Math.random() * 0.1 - 0.05);
                demoData[symbol].current_price *= (1 + (Math.random() * 0.02 - 0.01));
                demoData[symbol].price_change = demoData[symbol].current_price - demoData[symbol].previous_close;
                demoData[symbol].price_change_pct = (demoData[symbol].price_change / demoData[symbol].previous_close * 100);

                // Ajuster les pourcentages
                const sentShift = Math.random() * 6 - 3;
                demoData[symbol].positive_pct += sentShift;
                demoData[symbol].negative_pct -= sentShift / 2;
                demoData[symbol].neutral_pct -= sentShift / 2;

                // Mettre à jour les prédictions
                const predShift = Math.random() * 2 - 1;
                demoData[symbol].prediction.price *= (1 + predShift * 0.01);
                demoData[symbol].prediction.confidence = Math.min(95, Math.max(50, demoData[symbol].prediction.confidence + predShift * 5));
            });

            // Mettre à jour l'interface
            renderStockCards(demoData);
            renderComparisonTable(demoData);
            const historyData = generateHistoryData(currentSymbol, currentPeriod);
            renderSentimentChart(historyData.sentiment_history, currentSymbol);
            renderPriceChart(historyData.price_history, currentSymbol, demoData[currentSymbol].prediction);
            updatePrediction(currentSymbol, demoData[currentSymbol]);

            // Réactiver le bouton
            this.disabled = false;
            this.innerHTML = '<i class="fa-solid fa-sync-alt me-1"></i> Refresh Data';

            // Montrer une notification aléatoirement
            if (Math.random() > 0.7) {
                const randomSymbol = Object.keys(demoData)[Math.floor(Math.random() * 3)];
                showNotification('significant-change', `Significant change detected in ${randomSymbol} sentiment (+12% in 6h)`);
            }
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

                const historyData = generateHistoryData(symbol, currentPeriod);
                renderSentimentChart(historyData.sentiment_history, symbol);
                renderPriceChart(historyData.price_history, symbol, demoData[symbol].prediction);
                updatePrediction(symbol, demoData[symbol]);
                displayRecentItems(symbol);
            });

            container.appendChild(card);
        });
    }

    // Rendre le tableau comparatif
    function renderComparisonTable(data) {
        const tbody = document.getElementById('comparisonTableBody');
        tbody.innerHTML = '';

        Object.keys(data).forEach(symbol => {
            const stock = data[symbol];
            const row = document.createElement('tr');

            // Définir les classes de sentiment et de prix
            const sentClass = stock.average_sentiment >= 0.05 ? 'text-success' :
                stock.average_sentiment <= -0.05 ? 'text-danger' : 'text-info';
            const priceClass = stock.price_change >= 0 ? 'text-success' : 'text-danger';
            const predClass = stock.prediction.change_pct >= 0 ? 'text-success' : 'text-danger';

            row.innerHTML = `
                <td><strong>${symbol}</strong></td>
                <td>$${stock.current_price.toFixed(2)}</td>
                <td class="${priceClass}">${stock.price_change >= 0 ? '+' : ''}${stock.price_change.toFixed(2)} (${stock.price_change_pct.toFixed(2)}%)</td>
                <td class="${sentClass}">${stock.average_sentiment.toFixed(2)}</td>
                <td>${stock.positive_pct.toFixed(1)}%</td>
                <td>${stock.negative_pct.toFixed(1)}%</td>
                <td>${stock.neutral_pct.toFixed(1)}%</td>
                <td>${stock.count}</td>
                <td class="${predClass}">
                    $${stock.prediction.price.toFixed(2)}
                    <small>(${stock.prediction.change_pct >= 0 ? '+' : ''}${stock.prediction.change_pct.toFixed(2)}%)</small>
                </td>
            `;

            tbody.appendChild(row);
        });
    }

    // Rendre le graphique de sentiment
    function renderSentimentChart(data, symbol) {
        const container = document.getElementById('sentimentChart');

        if (data.length === 0) {
            container.innerHTML = `<p class="text-center">No sentiment data available for ${symbol}</p>`;
            return;
        }

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
            },
            plot_bgcolor: 'rgba(0,0,0,0)',
            paper_bgcolor: 'rgba(0,0,0,0)',
            font: {
                color: '#f3f4f6'
            },
            showlegend: true
        };

        Plotly.newPlot(container, [trace1, trace2, trace3], layout);
    }

    // Rendre le graphique de prix avec prédiction
    function renderPriceChart(data, symbol, prediction) {
        const container = document.getElementById('priceChart');

        if (data.length === 0) {
            container.innerHTML = `<p class="text-center">No price data available for ${symbol}</p>`;
            return;
        }

        const dates = data.map(item => item.date);
        const prices = data.map(item => item.close);

        // Créer des dates et prix de prédiction
        const lastDate = new Date(dates[dates.length - 1]);
        const predictionDates = [];
        const predictionPrices = [];

        // Générer 3 jours de prédiction
        for (let i = 1; i <= 3; i++) {
            const nextDate = new Date(lastDate);
            nextDate.setDate(nextDate.getDate() + i);
            const dateStr = nextDate.toISOString().split('T')[0];
            predictionDates.push(dateStr);

            const lastPrice = prices[prices.length - 1];
            const priceDiff = prediction.price - lastPrice;
            const step = priceDiff / 3;
            predictionPrices.push(lastPrice + step * i);
        }

        // Combiner avec le dernier point connu pour une transition fluide
        predictionDates.unshift(dates[dates.length - 1]);
        predictionPrices.unshift(prices[prices.length - 1]);

        const trace1 = {
            x: dates,
            y: prices,
            type: 'scatter',
            mode: 'lines',
            name: 'Actual Price',
            line: {
                color: 'rgb(75, 75, 192)',
                width: 2
            }
        };

        const trace2 = {
            x: predictionDates,
            y: predictionPrices,
            type: 'scatter',
            mode: 'lines',
            name: 'Predicted Price',
            line: {
                color: 'rgba(75, 192, 75, 0.5)',
                width: 2,
                dash: 'dot'
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
            },
            plot_bgcolor: 'rgba(0,0,0,0)',
            paper_bgcolor: 'rgba(0,0,0,0)',
            font: {
                color: '#f3f4f6'
            },
            showlegend: false
        };

        Plotly.newPlot(container, [trace1, trace2], layout);
    }

    // Mettre à jour la section de prédiction
    function updatePrediction(symbol, data) {
        document.querySelector('.selected-stock-name').textContent = symbol;

        // Mettre à jour les prix actuels et prédits
        document.getElementById('currentPrice').textContent = `$${data.current_price.toFixed(2)}`;
        document.getElementById('predictedPrice').textContent = `$${data.prediction.price.toFixed(2)}`;

        // Changer la classe selon la direction de la prédiction
        const predictedPrice = document.getElementById('predictedPrice');
        if (data.prediction.price > data.current_price) {
            predictedPrice.className = 'predicted-price-up';
        } else {
            predictedPrice.className = 'predicted-price-down';
        }

        // Mettre à jour les facteurs
        const factors = data.prediction.factors;
        document.querySelectorAll('.prediction-factor').forEach((factor, index) => {
            const factorValue = factor.querySelector('.factor-value');

            switch (index) {
                case 0: // Sentiment Trend
                    factorValue.textContent = capitalize(factors.sentiment_trend);
                    factorValue.className = `factor-value ${factors.sentiment_trend}`;
                    break;
                case 1: // Market Momentum
                    factorValue.textContent = capitalize(factors.market_momentum);
                    factorValue.className = `factor-value ${factors.market_momentum === 'bullish' ? 'positive' : factors.market_momentum === 'bearish' ? 'negative' : 'neutral'}`;
                    break;
                case 2: // News Impact
                    factorValue.textContent = capitalize(factors.news_impact);
                    factorValue.className = `factor-value ${factors.news_impact}`;
                    break;
                case 3: // Historical Pattern
                    factorValue.textContent = capitalize(factors.historical_pattern);
                    factorValue.className = `factor-value ${factors.historical_pattern === 'uptrend' ? 'positive' : factors.historical_pattern === 'downtrend' ? 'negative' : 'neutral'}`;
                    break;
            }
        });

        // Mettre à jour la jauge de confiance
        const confidenceBar = document.querySelector('.prediction-confidence .progress-bar');
        confidenceBar.style.width = `${data.prediction.confidence}%`;
        confidenceBar.textContent = `${data.prediction.confidence}%`;
    }

    // Afficher des éléments récents de sentiment
    function displayRecentItems(symbol) {
        const container = document.getElementById('recentItems');

        // Données d'exemple pour les éléments récents selon le symbole
        const recentItemsData = {
            'AAPL': [
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
            ],
            'TSLA': [
                {
                    title: `${symbol} Stock Falls as Competitors Gain Market Share`,
                    source: 'Reuters',
                    date: '2025-03-10',
                    sentiment: -0.35,
                    label: 'negative'
                },
                {
                    title: `New Factory Delays for ${symbol}`,
                    source: 'Wall Street Journal',
                    date: '2025-03-09',
                    sentiment: -0.28,
                    label: 'negative'
                },
                {
                    title: `${symbol} Innovation Continues Despite Challenges`,
                    source: 'TechCrunch',
                    date: '2025-03-08',
                    sentiment: 0.15,
                    label: 'positive'
                }
            ],
            'MSFT': [
                {
                    title: `${symbol} Cloud Service Growth Exceeds Expectations`,
                    source: 'CNBC',
                    date: '2025-03-10',
                    sentiment: 0.31,
                    label: 'positive'
                },
                {
                    title: `New Partnership Announced for ${symbol}`,
                    source: 'Business Insider',
                    date: '2025-03-09',
                    sentiment: 0.22,
                    label: 'positive'
                },
                {
                    title: `${symbol} Faces Regulatory Scrutiny in EU`,
                    source: 'Financial Times',
                    date: '2025-03-08',
                    sentiment: -0.18,
                    label: 'negative'
                }
            ]
        };

        const recentItems = recentItemsData[symbol] || recentItemsData['AAPL'];

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
    }

    // Définir la période active
    function setActivePeriod(period) {
        currentPeriod = period;

        // Mettre à jour l'état actif des boutons
        document.querySelectorAll('.period-btn').forEach(button => {
            const buttonPeriod = parseInt(button.getAttribute('data-period'));
            if (buttonPeriod === period) {
                button.classList.add('active');
            } else {
                button.classList.remove('active');
            }
        });
    }

    // Afficher une notification
    function showNotification(type, message) {
        const notificationArea = document.getElementById('notification-area');
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `<i class="fa-solid fa-exclamation-triangle me-2"></i>${message}`;

        notificationArea.innerHTML = '';
        notificationArea.appendChild(notification);

        // Supprimer la notification après 5 secondes
        setTimeout(() => {
            notification.remove();
        }, 5000);
    }

    // Helper: Capitalize first letter
    function capitalize(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
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