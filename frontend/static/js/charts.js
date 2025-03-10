document.addEventListener('DOMContentLoaded', function () {
    // Variables globales
    let currentSymbol = 'AAPL';  // Symbole par défaut
    let currentPeriod = 7;      // Période par défaut (7 jours)
    let sentimentChart = null;  // Référence au graphique pour mise à jour fluide
    let priceChart = null;      // Référence au graphique pour mise à jour fluide

    // Easter egg - clic multiple sur le logo
    let logoClickCount = 0;
    document.querySelector('.navbar-brand').addEventListener('click', function (e) {
        e.preventDefault();
        logoClickCount++;
        if (logoClickCount >= 5) {
            showNotification('easter-egg', '🎉 Developer mode activated!');
            document.body.classList.add('dev-mode');
            logoClickCount = 0;
        }
    });

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

    // Données d'historique de démonstration avec courbes plus naturelles
    const generateHistoryData = (symbol, days) => {
        const today = new Date();
        const startDate = new Date(today);
        startDate.setDate(startDate.getDate() - days);

        let basePrice, sentimentTrend, volatility, trendStrength;

        // Valeurs de référence selon le symbole
        switch (symbol) {
            case 'AAPL':
                basePrice = 176;
                sentimentTrend = 0.15;
                volatility = 0.8;
                trendStrength = 0.7;  // Force de la tendance (0-1)
                break;
            case 'TSLA':
                basePrice = 180;
                sentimentTrend = -0.1;
                volatility = 2.5;
                trendStrength = 0.6;
                break;
            case 'MSFT':
                basePrice = 410;
                sentimentTrend = 0.2;
                volatility = 1.2;
                trendStrength = 0.5;
                break;
            default:
                basePrice = 100;
                sentimentTrend = 0;
                volatility = 1;
                trendStrength = 0.5;
        }

        // Générer des données de marché réalistes avec tendance et fluctuations
        const sentimentHistory = [];
        const priceHistory = [];

        // Points de perturbation aléatoires pour des courbes plus naturelles
        const perturbationPoints = [];
        for (let i = 0; i < Math.max(1, Math.floor(days / 3)); i++) {
            perturbationPoints.push(Math.floor(Math.random() * days));
        }

        // Tendance initiale
        let prevSentiment = symbol === 'TSLA' ? -0.05 : 0.05;
        let prevPrice = basePrice * (1 + (Math.random() * 0.02 - 0.01));
        let movingAvgSentiment = prevSentiment;
        let momentumPrice = 0;

        // Événements spéciaux aléatoires
        const specialEvents = [];
        if (days > 5 && Math.random() > 0.7) {
            const eventDay = Math.floor(days * 0.3) + Math.floor(Math.random() * (days * 0.4));
            specialEvents.push({
                day: eventDay,
                impact: (Math.random() * 0.3 + 0.1) * (Math.random() > 0.5 ? 1 : -1),
                duration: Math.floor(Math.random() * 2) + 1
            });
        }

        // Générer les données d'historique
        for (let i = 0; i <= days; i++) {
            const date = new Date(startDate);
            date.setDate(date.getDate() + i);
            const dateStr = date.toISOString().split('T')[0];

            // Calcul du sentiment avec influence de la tendance et continuité
            const dayRatio = i / days; // 0 à 1 pour la progression
            const trendInfluence = sentimentTrend * dayRatio * trendStrength;
            const randomFactor = (Math.random() * 2 - 1) * (1 - trendStrength);
            const continuityFactor = 0.7; // Plus élevé = plus de continuité

            // Vérifier les événements spéciaux
            let eventImpact = 0;
            specialEvents.forEach(event => {
                if (i >= event.day && i < event.day + event.duration) {
                    eventImpact = event.impact;
                }
            });

            // Vérifier les points de perturbation
            const isPerturbationPoint = perturbationPoints.includes(i);
            const perturbationFactor = isPerturbationPoint ? (Math.random() * 0.2 - 0.1) : 0;

            // Calculer le nouveau sentiment avec tous les facteurs
            let newSentiment = prevSentiment * continuityFactor +
                trendInfluence * (1 - continuityFactor) +
                randomFactor * 0.1 +
                perturbationFactor +
                eventImpact;

            // Limiter entre -0.8 et 0.8
            newSentiment = Math.max(-0.8, Math.min(0.8, newSentiment));

            // Mise à jour de la moyenne mobile du sentiment
            movingAvgSentiment = movingAvgSentiment * 0.8 + newSentiment * 0.2;

            // Ajuster les pourcentages de sentiment basés sur le score de sentiment
            let positivePct, negativePct, neutralPct;
            if (newSentiment > 0) {
                positivePct = 40 + newSentiment * 60;
                negativePct = 30 - newSentiment * 25;
            } else {
                negativePct = 40 + Math.abs(newSentiment) * 60;
                positivePct = 30 - Math.abs(newSentiment) * 25;
            }
            neutralPct = 100 - positivePct - negativePct;

            // S'assurer que les pourcentages sont dans les limites
            positivePct = Math.max(5, Math.min(90, positivePct));
            negativePct = Math.max(5, Math.min(90, negativePct));
            neutralPct = Math.max(5, Math.min(90, neutralPct));

            // Normaliser pour que la somme soit exactement 100%
            const total = positivePct + negativePct + neutralPct;
            positivePct = (positivePct / total) * 100;
            negativePct = (negativePct / total) * 100;
            neutralPct = (neutralPct / total) * 100;

            // Calculer le prix avec influence du sentiment et momentum
            const sentimentInfluence = newSentiment * 0.02;
            const volatilityFactor = (Math.random() * 2 - 1) * volatility * 0.01;

            // Momentum du prix (reproduit l'effet de tendance naturelle)
            momentumPrice = momentumPrice * 0.8 + (volatilityFactor + sentimentInfluence) * 0.2;

            // Calculer le nouveau prix
            let newPrice = prevPrice * (1 + momentumPrice + eventImpact * 0.02);

            // Limiter les changements de prix extrêmes
            if (newPrice / prevPrice > 1.05) newPrice = prevPrice * 1.05;
            if (newPrice / prevPrice < 0.95) newPrice = prevPrice * 0.95;

            // Ajouter à l'historique
            sentimentHistory.push({
                date: dateStr,
                average_sentiment: newSentiment,
                positive_pct: positivePct,
                negative_pct: negativePct,
                neutral_pct: neutralPct,
                count: Math.round(20 + 15 * dayRatio + randomFactor * 5)
            });

            // Calculer les prix intraday
            const dailyVolatility = volatility * 0.005;
            const openPrice = newPrice * (1 - dailyVolatility * Math.random());
            const highPrice = newPrice * (1 + dailyVolatility * (1 + Math.random()));
            const lowPrice = newPrice * (1 - dailyVolatility * (1 + Math.random()));

            // S'assurer que high > open > low
            const adjustedHigh = Math.max(highPrice, openPrice);
            const adjustedLow = Math.min(lowPrice, openPrice);

            priceHistory.push({
                date: dateStr,
                open: openPrice,
                high: adjustedHigh,
                low: adjustedLow,
                close: newPrice,
                volume: Math.round(10000000 + 5000000 * Math.random() * (1 + Math.abs(momentumPrice) * 10))
            });

            // Préparer pour la prochaine itération
            prevSentiment = newSentiment;
            prevPrice = newPrice;
        }

        return {
            sentiment_history: sentimentHistory,
            price_history: priceHistory
        };
    };

    // Initialiser le dashboard avec des données de démonstration et animation progressive
    setTimeout(() => {
        renderStockCards(demoData);
        renderComparisonTable(demoData);
        updateLastUpdateTime();
    }, 300);

    setTimeout(() => {
        const historyData = generateHistoryData('AAPL', 7);
        renderSentimentChart(historyData.sentiment_history, 'AAPL');
        renderPriceChart(historyData.price_history, 'AAPL', demoData['AAPL'].prediction);
    }, 600);

    setTimeout(() => {
        updatePrediction('AAPL', demoData['AAPL']);
        displayRecentItems('AAPL');
    }, 900);

    // Configurer les écouteurs d'événements
    document.querySelectorAll('.stock-selector').forEach(button => {
        button.addEventListener('click', function () {
            const symbol = this.getAttribute('data-symbol');
            setActiveSymbol(symbol);

            // Animation de la mise à jour des données
            animateDataUpdate(() => {
                // Générer et afficher les données pour la période actuelle
                const historyData = generateHistoryData(symbol, currentPeriod);
                renderSentimentChart(historyData.sentiment_history, symbol);
                renderPriceChart(historyData.price_history, symbol, demoData[symbol].prediction);
                updatePrediction(symbol, demoData[symbol]);
                displayRecentItems(symbol);
            });

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

            // Animation de la mise à jour des données
            animateDataUpdate(() => {
                // Régénérer et afficher les données pour la nouvelle période
                const historyData = generateHistoryData(currentSymbol, period);
                renderSentimentChart(historyData.sentiment_history, currentSymbol);
                renderPriceChart(historyData.price_history, currentSymbol, demoData[currentSymbol].prediction);
            });
        });
    });

    // Gestion du bouton Refresh avec effets visuels améliorés
    document.getElementById('refreshButton').addEventListener('click', function () {
        this.disabled = true;
        this.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Refreshing...';

        // Effet visuel sur les cartes d'action pendant le refresh
        document.querySelectorAll('.stock-card').forEach(card => {
            card.style.transition = 'filter 0.5s, transform 0.3s';
            card.style.filter = 'blur(1px)';
            card.style.transform = 'scale(0.98)';
        });

        setTimeout(() => {
            // Mettre à jour l'heure
            updateLastUpdateTime();

            // Recréer les données avec de légères variations et tendances plus réalistes
            Object.keys(demoData).forEach(symbol => {
                // Ajustement progressif du sentiment plutôt que totalement aléatoire
                const marketTrend = Math.random() > 0.7 ? 1 : -1; // Tendance générale du marché
                const symbolStrength = Math.random() * 0.15 + 0.05; // Force d'influence propre au symbole

                // Appliquer des changements cohérents
                demoData[symbol].average_sentiment += (marketTrend * symbolStrength);
                demoData[symbol].average_sentiment = Math.min(0.8, Math.max(-0.8, demoData[symbol].average_sentiment));

                // Prix influencé par le sentiment
                const priceInfluence = demoData[symbol].average_sentiment * 0.01 + (Math.random() * 0.01 - 0.005);
                demoData[symbol].current_price *= (1 + priceInfluence);
                demoData[symbol].price_change = demoData[symbol].current_price - demoData[symbol].previous_close;
                demoData[symbol].price_change_pct = (demoData[symbol].price_change / demoData[symbol].previous_close * 100);

                // Ajuster les pourcentages de sentiment de manière cohérente
                if (demoData[symbol].average_sentiment > 0) {
                    demoData[symbol].positive_pct += (Math.random() * 4 + 1);
                    demoData[symbol].negative_pct -= (Math.random() * 2 + 1);
                } else {
                    demoData[symbol].negative_pct += (Math.random() * 4 + 1);
                    demoData[symbol].positive_pct -= (Math.random() * 2 + 1);
                }

                // S'assurer que les pourcentages restent dans les limites
                demoData[symbol].positive_pct = Math.max(5, Math.min(90, demoData[symbol].positive_pct));
                demoData[symbol].negative_pct = Math.max(5, Math.min(90, demoData[symbol].negative_pct));
                demoData[symbol].neutral_pct = 100 - demoData[symbol].positive_pct - demoData[symbol].negative_pct;
                demoData[symbol].neutral_pct = Math.max(5, demoData[symbol].neutral_pct);

                // Normaliser à 100%
                const total = demoData[symbol].positive_pct + demoData[symbol].negative_pct + demoData[symbol].neutral_pct;
                demoData[symbol].positive_pct = (demoData[symbol].positive_pct / total * 100);
                demoData[symbol].negative_pct = (demoData[symbol].negative_pct / total * 100);
                demoData[symbol].neutral_pct = (demoData[symbol].neutral_pct / total * 100);

                // Mettre à jour les prédictions en fonction du sentiment
                const sentimentDirection = demoData[symbol].average_sentiment > 0 ? 1 : -1;
                const predictionStrength = Math.abs(demoData[symbol].average_sentiment) * 2 + 0.5;
                demoData[symbol].prediction.change_pct = sentimentDirection * predictionStrength;
                demoData[symbol].prediction.price = demoData[symbol].current_price * (1 + demoData[symbol].prediction.change_pct / 100);
                demoData[symbol].prediction.confidence = Math.min(95, Math.max(50, 60 + sentimentDirection * 15 + Math.random() * 10));

                // Mettre à jour les facteurs de prédiction
                if (demoData[symbol].average_sentiment > 0.1) {
                    demoData[symbol].prediction.factors.sentiment_trend = "positive";
                    demoData[symbol].prediction.factors.market_momentum = Math.random() > 0.3 ? "bullish" : "neutral";
                } else if (demoData[symbol].average_sentiment < -0.1) {
                    demoData[symbol].prediction.factors.sentiment_trend = "negative";
                    demoData[symbol].prediction.factors.market_momentum = Math.random() > 0.3 ? "bearish" : "neutral";
                } else {
                    demoData[symbol].prediction.factors.sentiment_trend = "neutral";
                    demoData[symbol].prediction.factors.market_momentum = Math.random() > 0.5 ? "neutral" : (Math.random() > 0.5 ? "bullish" : "bearish");
                }

                demoData[symbol].prediction.factors.historical_pattern = demoData[symbol].price_change_pct > 1 ? "uptrend" :
                    demoData[symbol].price_change_pct < -1 ? "downtrend" : "sideways";
            });

            // Animer le changement sur l'interface
            animateDataUpdate(() => {
                renderStockCards(demoData);
                renderComparisonTable(demoData);
                const historyData = generateHistoryData(currentSymbol, currentPeriod);
                renderSentimentChart(historyData.sentiment_history, currentSymbol);
                renderPriceChart(historyData.price_history, currentSymbol, demoData[currentSymbol].prediction);
                updatePrediction(currentSymbol, demoData[currentSymbol]);
            });

            // Restaurer l'apparence des cartes
            document.querySelectorAll('.stock-card').forEach(card => {
                card.style.filter = 'none';
                card.style.transform = 'translateY(0)';
            });

            // Réactiver le bouton
            this.disabled = false;
            this.innerHTML = '<i class="fa-solid fa-sync-alt me-1"></i> Refresh Data';

            // Montrer une notification aléatoirement
            if (Math.random() > 0.6) {
                const randomSymbol = Object.keys(demoData)[Math.floor(Math.random() * 3)];
                const isPositive = Math.random() > 0.5;
                const changeMsg = isPositive ? `+${(Math.random() * 10 + 5).toFixed(1)}%` : `-${(Math.random() * 10 + 5).toFixed(1)}%`;
                showNotification('significant-change', `Significant change detected in ${randomSymbol} sentiment (${changeMsg} in 6h)`);
            }
        }, 1500);
    });

    // Animation de transition lors des mises à jour de données
    function animateDataUpdate(updateCallback) {
        // Animer les graphiques (légère opacité)
        const charts = document.querySelectorAll('#sentimentChart, #priceChart');
        charts.forEach(chart => {
            chart.style.transition = 'opacity 0.3s ease';
            chart.style.opacity = '0.6';
        });

        setTimeout(() => {
            // Exécuter la mise à jour
            updateCallback();

            // Restaurer l'opacité
            charts.forEach(chart => {
                chart.style.opacity = '1';
            });
        }, 300);
    }

    // Fonction pour mettre à jour l'heure de dernière mise à jour
    function updateLastUpdateTime() {
        const now = new Date();
        const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        if (document.getElementById('lastUpdateTime')) {
            document.getElementById('lastUpdateTime').textContent = `Today ${timeString}`;
        }
    }

    // Rendre les cartes d'actions avec transition fluide
    function renderStockCards(data) {
        const container = document.getElementById('stockCards');

        // Créer le nouveau contenu
        let newHTML = '';

        Object.keys(data).forEach(symbol => {
            const summary = data[symbol];
            const sentimentClass = getSentimentClass(summary.average_sentiment);
            const priceChangeClass = summary.price_change >= 0 ? 'price-change-positive' : 'price-change-negative';

            newHTML += `
                <div class="col-md-4 mb-3">
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
                </div>
            `;
        });

        // Transition en fondu pour le nouveau contenu
        container.style.opacity = '0';

        setTimeout(() => {
            container.innerHTML = newHTML;
            container.style.opacity = '1';

            // Ajouter les event listeners aux nouvelles cartes
            document.querySelectorAll('.stock-card').forEach(card => {
                card.addEventListener('click', function () {
                    const symbol = this.getAttribute('data-symbol');
                    setActiveSymbol(symbol);

                    animateDataUpdate(() => {
                        const historyData = generateHistoryData(symbol, currentPeriod);
                        renderSentimentChart(historyData.sentiment_history, symbol);
                        renderPriceChart(historyData.price_history, symbol, demoData[symbol].prediction);
                        updatePrediction(symbol, demoData[symbol]);
                        displayRecentItems(symbol);
                    });
                });
            });
        }, 300);
    }

    // Rendre le tableau comparatif avec effets de surbrillance
    function renderComparisonTable(data) {
        const tbody = document.getElementById('comparisonTableBody');
        if (!tbody) return;

        let html = '';

        Object.keys(data).forEach(symbol => {
            const stock = data[symbol];

            // Définir les classes de sentiment et de prix
            const sentClass = stock.average_sentiment >= 0.05 ? 'text-success' :
                stock.average_sentiment <= -0.05 ? 'text-danger' : 'text-info';
            const priceClass = stock.price_change >= 0 ? 'text-success' : 'text-danger';
            const predClass = stock.prediction.change_pct >= 0 ? 'text-success' : 'text-danger';

            html += `
                <tr class="${symbol === currentSymbol ? 'table-active' : ''}">
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
                </tr>
            `;
        });

        // Animation de transition
        tbody.style.opacity = '0';

        setTimeout(() => {
            tbody.innerHTML = html;
            tbody.style.opacity = '1';

            // Ajouter des écouteurs d'événements pour les lignes du tableau
            tbody.querySelectorAll('tr').forEach(row => {
                row.addEventListener('click', function () {
                    const symbol = this.querySelector('td:first-child strong').textContent;
                    setActiveSymbol(symbol);

                    animateDataUpdate(() => {
                        const historyData = generateHistoryData(symbol, currentPeriod);
                        renderSentimentChart(historyData.sentiment_history, symbol);
                        renderPriceChart(historyData.price_history, symbol, demoData[symbol].prediction);
                        updatePrediction(symbol, demoData[symbol]);
                        displayRecentItems(symbol);
                    });
                });
            });
        }, 300);
    }

    // Rendre le graphique de sentiment avec des tooltips améliorés
    function renderSentimentChart(data, symbol) {
        const container = document.getElementById('sentimentChart');

        if (!container || data.length === 0) {
            if (container) container.innerHTML = `<p class="text-center">No sentiment data available for ${symbol}</p>`;
            return;
        }

        // Formater les dates pour l'affichage
        const dates = data.map(item => item.date);
        const sentiments = data.map(item => item.average_sentiment);
        const positivePcts = data.map(item => item.positive_pct);
        const negativePcts = data.map(item => item.negative_pct);
        const neutralPcts = data.map(item => data[0].neutral_pct); // Données "neutres" pour le graphique

        // Configuration des traces
        const trace1 = {
            x: dates,
            y: sentiments,
            type: 'scatter',
            mode: 'lines+markers',
            name: 'Average Sentiment',
            line: {
                color: 'rgb(75, 192, 192)',
                width: 3,
                shape: 'spline' // Courbe plus lisse
            },
            marker: {
                size: 8,
                color: sentiments.map(s =>
                    s >= 0.05 ? 'rgba(40, 167, 69, 0.8)' :
                        s <= -0.05 ? 'rgba(220, 53, 69, 0.8)' :
                            'rgba(23, 162, 184, 0.8)'
                ),
                line: {
                    width: 1,
                    color: 'white'
                }
            },
            hoverinfo: 'text',
            hovertext: sentiments.map((s, i) => {
                return `<b>${dates[i]}</b><br>` +
                    `Sentiment: ${s.toFixed(2)}<br>` +
                    `Positive: ${positivePcts[i].toFixed(1)}%<br>` +
                    `Negative: ${negativePcts[i].toFixed(1)}%<br>` +
                    `Neutral: ${(100 - positivePcts[i] - negativePcts[i]).toFixed(1)}%`;
            })
        };

        const trace2 = {
            x: dates,
            y: positivePcts,
            type: 'bar',
            name: 'Positive %',
            marker: {
                color: 'rgba(40, 167, 69, 0.6)'
            },
            yaxis: 'y2',
            hoverinfo: 'text',
            hovertext: positivePcts.map((p, i) => `Positive: ${p.toFixed(1)}%`)
        };

        const trace3 = {
            x: dates,
            y: negativePcts,
            type: 'bar',
            name: 'Negative %',
            marker: {
                color: 'rgba(220, 53, 69, 0.6)'
            },
            yaxis: 'y2',
            hoverinfo: 'text',
            hovertext: negativePcts.map((n, i) => `Negative: ${n.toFixed(1)}%`)
        };

        // Configuration du layout
        const layout = {
            title: {
                text: `Sentiment Trend for ${symbol}`,
                font: {
                    family: 'Inter, sans-serif',
                    size: 18,
                    color: '#f3f4f6'
                }
            },
            xaxis: {
                title: {
                    text: 'Date',
                    font: {
                        family: 'Inter, sans-serif',
                        size: 14,
                        color: '#9ca3af'
                    }
                },
                tickfont: {
                    family: 'Inter, sans-serif',
                    size: 12,
                    color: '#9ca3af'
                },
                gridcolor: 'rgba(255, 255, 255, 0.05)',
                linecolor: 'rgba(255, 255, 255, 0.2)',
                zeroline: false
            },
            yaxis: {
                title: {
                    text: 'Sentiment Score',
                    font: {
                        family: 'Inter, sans-serif',
                        size: 14,
                        color: '#9ca3af'
                    }
                },
                range: [-1, 1],
                zeroline: true,
                zerolinecolor: 'rgba(255, 255, 255, 0.2)',
                zerolinewidth: 1,
                gridcolor: 'rgba(255, 255, 255, 0.05)',
                linecolor: 'rgba(255, 255, 255, 0.2)',
                tickfont: {
                    family: 'Inter, sans-serif',
                    size: 12,
                    color: '#9ca3af'
                }
            },
            yaxis2: {
                title: {
                    text: 'Percentage',
                    font: {
                        family: 'Inter, sans-serif',
                        size: 14,
                        color: '#9ca3af'
                    }
                },
                overlaying: 'y',
                side: 'right',
                range: [0, 100],
                showgrid: false,
                tickfont: {
                    family: 'Inter, sans-serif',
                    size: 12,
                    color: '#9ca3af'
                }
            },
            legend: {
                orientation: 'h',
                y: -0.2,
                font: {
                    family: 'Inter, sans-serif',
                    size: 12,
                    color: '#f3f4f6'
                }
            },
            margin: {
                l: 60,
                r: 60,
                t: 50,
                b: 80
            },
            plot_bgcolor: 'rgba(0,0,0,0)',
            paper_bgcolor: 'rgba(0,0,0,0)',
            hovermode: 'closest',
            hoverlabel: {
                bgcolor: 'rgba(30, 41, 59, 0.95)',
                bordercolor: 'rgba(255, 255, 255, 0.2)',
                font: {
                    family: 'Inter, sans-serif',
                    size: 12,
                    color: '#f3f4f6'
                }
            },
            showlegend: true,
            transition: {
                duration: 500,
                easing: 'cubic-in-out'
            }
        };

        // Configurer les options de réactivité
        const config = {
            responsive: true,
            displayModeBar: true,
            modeBarButtonsToRemove: ['lasso2d', 'select2d', 'toggleSpikelines'],
            displaylogo: false,
            toImageButtonOptions: {
                format: 'png',
                filename: `${symbol}_sentiment_trend`,
                height: 500,
                width: 900,
                scale: 2
            }
        };

        // Rendre ou mettre à jour le graphique
        Plotly.newPlot(container, [trace1, trace2, trace3], layout, config);
    }

    // Rendre le graphique de prix avec prédiction et bandes de confiance
    function renderPriceChart(data, symbol, prediction) {
        const container = document.getElementById('priceChart');

        if (!container || data.length === 0) {
            if (container) container.innerHTML = `<p class="text-center">No price data available for ${symbol}</p>`;
            return;
        }

        const dates = data.map(item => item.date);
        const prices = data.map(item => item.close);

        // Créer des dates et prix de prédiction
        const lastDate = new Date(dates[dates.length - 1]);
        const predictionDates = [];
        const predictionPrices = [];
        const confidenceUpper = [];
        const confidenceLower = [];

        // Générer 3 jours de prédiction
        const confidenceFactor = (100 - prediction.confidence) / 100 * 0.1; // Plus la confiance est faible, plus la bande est large

        for (let i = 1; i <= 3; i++) {
            const nextDate = new Date(lastDate);
            nextDate.setDate(nextDate.getDate() + i);
            const dateStr = nextDate.toISOString().split('T')[0];
            predictionDates.push(dateStr);

            const lastPrice = prices[prices.length - 1];
            const priceDiff = prediction.price - lastPrice;
            const step = priceDiff / 3;
            const projectedPrice = lastPrice + step * i;

            predictionPrices.push(projectedPrice);

            // Calculer les bandes de confiance
            const dayFactor = i * 0.5; // Plus on va loin, plus l'incertitude est grande
            confidenceUpper.push(projectedPrice * (1 + confidenceFactor * dayFactor));
            confidenceLower.push(projectedPrice * (1 - confidenceFactor * dayFactor));
        }

        // Combiner avec le dernier point connu pour une transition fluide
        predictionDates.unshift(dates[dates.length - 1]);
        predictionPrices.unshift(prices[prices.length - 1]);
        confidenceUpper.unshift(prices[prices.length - 1]);
        confidenceLower.unshift(prices[prices.length - 1]);

        // Traces pour le graphique
        const trace1 = {
            x: dates,
            y: prices,
            type: 'scatter',
            mode: 'lines',
            name: 'Actual Price',
            line: {
                color: 'rgb(75, 75, 192)',
                width: 3,
                shape: 'spline'
            },
            hoverinfo: 'text',
            hovertext: data.map(item => {
                return `<b>${item.date}</b><br>` +
                    `Open: $${item.open.toFixed(2)}<br>` +
                    `High: $${item.high.toFixed(2)}<br>` +
                    `Low: $${item.low.toFixed(2)}<br>` +
                    `Close: $${item.close.toFixed(2)}<br>` +
                    `Volume: ${item.volume.toLocaleString()}`;
            })
        };

        const trace2 = {
            x: predictionDates,
            y: predictionPrices,
            type: 'scatter',
            mode: 'lines',
            name: 'Predicted Price',
            line: {
                color: 'rgba(75, 192, 75, 0.7)',
                width: 2,
                dash: 'dot',
                shape: 'spline'
            },
            hoverinfo: 'text',
            hovertext: predictionPrices.map((price, i) => {
                if (i === 0) return "";
                return `<b>${predictionDates[i]}</b><br>` +
                    `Predicted: $${price.toFixed(2)}<br>` +
                    `Confidence: ${prediction.confidence}%`;
            })
        };

        // Bande de confiance
        const trace3 = {
            x: predictionDates.concat(predictionDates.slice().reverse()),
            y: confidenceUpper.concat(confidenceLower.slice().reverse()),
            type: 'scatter',
            fill: 'toself',
            fillcolor: 'rgba(75, 192, 75, 0.1)',
            line: {
                color: 'transparent'
            },
            name: 'Confidence Interval',
            showlegend: false,
            hoverinfo: 'none'
        };

        // Configuration du layout
        const layout = {
            title: {
                text: `Price History for ${symbol}`,
                font: {
                    family: 'Inter, sans-serif',
                    size: 18,
                    color: '#f3f4f6'
                }
            },
            xaxis: {
                title: {
                    text: 'Date',
                    font: {
                        family: 'Inter, sans-serif',
                        size: 14,
                        color: '#9ca3af'
                    }
                },
                tickfont: {
                    family: 'Inter, sans-serif',
                    size: 12,
                    color: '#9ca3af'
                },
                gridcolor: 'rgba(255, 255, 255, 0.05)',
                linecolor: 'rgba(255, 255, 255, 0.2)'
            },
            yaxis: {
                title: {
                    text: 'Price ($)',
                    font: {
                        family: 'Inter, sans-serif',
                        size: 14,
                        color: '#9ca3af'
                    }
                },
                tickfont: {
                    family: 'Inter, sans-serif',
                    size: 12,
                    color: '#9ca3af'
                },
                gridcolor: 'rgba(255, 255, 255, 0.05)',
                linecolor: 'rgba(255, 255, 255, 0.2)'
            },
            margin: {
                l: 60,
                r: 40,
                t: 50,
                b: 80
            },
            plot_bgcolor: 'rgba(0,0,0,0)',
            paper_bgcolor: 'rgba(0,0,0,0)',
            legend: {
                orientation: 'h',
                y: -0.2,
                font: {
                    family: 'Inter, sans-serif',
                    size: 12,
                    color: '#f3f4f6'
                }
            },
            hovermode: 'closest',
            hoverlabel: {
                bgcolor: 'rgba(30, 41, 59, 0.95)',
                bordercolor: 'rgba(255, 255, 255, 0.2)',
                font: {
                    family: 'Inter, sans-serif',
                    size: 12,
                    color: '#f3f4f6'
                }
            },
            showlegend: false,
            transition: {
                duration: 500,
                easing: 'cubic-in-out'
            },
            annotations: [{
                x: predictionDates[predictionDates.length - 1],
                y: predictionPrices[predictionPrices.length - 1],
                text: `$${predictionPrices[predictionPrices.length - 1].toFixed(2)}`,
                showarrow: true,
                arrowhead: 2,
                arrowsize: 1,
                arrowwidth: 1,
                arrowcolor: 'rgba(75, 192, 75, 0.7)',
                font: {
                    family: 'Inter, sans-serif',
                    size: 12,
                    color: prediction.price > prices[prices.length - 1] ? '#10b981' : '#ef4444'
                },
                bgcolor: 'rgba(30, 41, 59, 0.8)',
                bordercolor: 'rgba(255, 255, 255, 0.2)',
                borderwidth: 1,
                borderpad: 4,
                ax: 0,
                ay: -40
            }]
        };

        // Configurer les options de réactivité
        const config = {
            responsive: true,
            displayModeBar: true,
            modeBarButtonsToRemove: ['lasso2d', 'select2d', 'toggleSpikelines'],
            displaylogo: false,
            toImageButtonOptions: {
                format: 'png',
                filename: `${symbol}_price_history`,
                height: 500,
                width: 900,
                scale: 2
            }
        };

        // Rendre le graphique
        Plotly.newPlot(container, [trace3, trace1, trace2], layout, config);
    }

    // Mettre à jour la section de prédiction avec animation
    function updatePrediction(symbol, data) {
        // Sélectionner les éléments
        const stockNameEl = document.querySelector('.selected-stock-name');
        const currentPriceEl = document.getElementById('currentPrice');
        const predictedPriceEl = document.getElementById('predictedPrice');

        // Animer le changement des données
        if (stockNameEl) {
            stockNameEl.style.opacity = '0';
            setTimeout(() => {
                stockNameEl.textContent = symbol;
                stockNameEl.style.opacity = '1';
            }, 200);
        }

        if (currentPriceEl && predictedPriceEl) {
            currentPriceEl.style.opacity = '0';
            predictedPriceEl.style.opacity = '0';

            setTimeout(() => {
                // Mettre à jour les prix
                currentPriceEl.textContent = `$${data.current_price.toFixed(2)}`;
                predictedPriceEl.textContent = `$${data.prediction.price.toFixed(2)}`;

                // Changer la classe selon la direction de la prédiction
                if (data.prediction.price > data.current_price) {
                    predictedPriceEl.className = 'predicted-price-up';
                } else {
                    predictedPriceEl.className = 'predicted-price-down';
                }

                currentPriceEl.style.opacity = '1';
                predictedPriceEl.style.opacity = '1';
            }, 200);
        }

        // Mettre à jour les facteurs
        const factors = data.prediction.factors;
        document.querySelectorAll('.prediction-factor').forEach((factor, index) => {
            const factorValue = factor.querySelector('.factor-value');
            if (!factorValue) return;

            factorValue.style.opacity = '0';

            setTimeout(() => {
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

                factorValue.style.opacity = '1';
            }, 200 + index * 50); // Échelonner l'animation pour chaque facteur
        });

        // Mettre à jour la jauge de confiance avec animation
        const confidenceBar = document.querySelector('.prediction-confidence .progress-bar');
        if (confidenceBar) {
            const currentWidth = parseFloat(confidenceBar.style.width) || 0;
            const targetWidth = data.prediction.confidence;

            // Animation de la barre
            const steps = 20;
            const increment = (targetWidth - currentWidth) / steps;
            let currentStep = 0;

            const animateBar = () => {
                if (currentStep < steps) {
                    const newWidth = currentWidth + increment * (currentStep + 1);
                    confidenceBar.style.width = `${newWidth}%`;
                    confidenceBar.textContent = `${Math.round(newWidth)}%`;
                    currentStep++;
                    requestAnimationFrame(animateBar);
                } else {
                    confidenceBar.style.width = `${targetWidth}%`;
                    confidenceBar.textContent = `${targetWidth}%`;
                }
            };

            requestAnimationFrame(animateBar);
        }
    }

    // Afficher des éléments récents de sentiment avec animation
    function displayRecentItems(symbol) {
        const container = document.getElementById('recentItems');
        if (!container) return;

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

        // Préparer le HTML pour une animation séquentielle
        recentItems.forEach(item => {
            const badgeClass = item.label === 'positive' ? 'positive' : item.label === 'negative' ? 'negative' : 'neutral';
            html += `
                <div class="card mb-2 recent-item">
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

        // Transition en fondu
        container.style.opacity = '0';

        setTimeout(() => {
            container.innerHTML = html;
            container.style.opacity = '1';

            // Animation d'apparition séquentielle des éléments
            const items = container.querySelectorAll('.recent-item');
            items.forEach((item, index) => {
                item.style.opacity = '0';
                item.style.transform = 'translateY(20px)';

                setTimeout(() => {
                    item.style.transition = 'all 0.5s ease';
                    item.style.opacity = '1';
                    item.style.transform = 'translateY(0)';
                }, index * 100);
            });
        }, 300);
    }

    // Définir le symbole actif avec animation
    function setActiveSymbol(symbol) {
        currentSymbol = symbol;

        // Mettre à jour l'état actif des boutons
        document.querySelectorAll('.stock-selector').forEach(button => {
            if (button.getAttribute('data-symbol') === symbol) {
                // Animation pour le bouton actif
                button.classList.add('btn-primary');
                button.classList.remove('btn-outline-primary');
                button.style.transform = 'scale(1.05)';
                setTimeout(() => {
                    button.style.transform = '';
                }, 300);
            } else {
                button.classList.remove('btn-primary');
                button.classList.add('btn-outline-primary');
            }
        });

        // Mettre en évidence la carte correspondante
        document.querySelectorAll('.stock-card').forEach(card => {
            if (card.getAttribute('data-symbol') === symbol) {
                card.classList.add('border-primary');
                // Animation pour la carte sélectionnée
                card.style.transition = 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)';
                card.style.transform = 'translateY(-8px) scale(1.02)';
                card.style.boxShadow = '0 12px 24px rgba(0, 0, 0, 0.3)';
            } else {
                card.classList.remove('border-primary');
                card.style.transform = '';
                card.style.boxShadow = '';
            }
        });

        // Mettre en évidence la ligne du tableau
        const tbody = document.getElementById('comparisonTableBody');
        if (tbody) {
            tbody.querySelectorAll('tr').forEach(row => {
                const rowSymbol = row.querySelector('td:first-child strong')?.textContent;
                if (rowSymbol === symbol) {
                    row.classList.add('table-active');
                } else {
                    row.classList.remove('table-active');
                }
            });
        }
    }

    // Définir la période active
    function setActivePeriod(period) {
        currentPeriod = period;

        // Mettre à jour l'état actif des boutons
        document.querySelectorAll('.period-btn').forEach(button => {
            const buttonPeriod = parseInt(button.getAttribute('data-period'));
            if (buttonPeriod === period) {
                button.classList.add('active');
                // Animation subtile
                button.style.transform = 'scale(1.05)';
                setTimeout(() => {
                    button.style.transform = '';
                }, 300);
            } else {
                button.classList.remove('active');
            }
        });
    }

    // Afficher une notification avec effet
    function showNotification(type, message) {
        const notificationArea = document.getElementById('notification-area');
        if (!notificationArea) return;

        // Supprimer les anciennes notifications
        const oldNotifications = notificationArea.querySelectorAll('.notification');
        oldNotifications.forEach(notification => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateY(-10px)';
            setTimeout(() => notification.remove(), 300);
        });

        // Créer la nouvelle notification
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;

        // Sélectionner l'icône en fonction du type
        let icon = 'fa-exclamation-triangle';
        if (type === 'significant-change') icon = 'fa-exclamation-triangle';
        if (type === 'easter-egg') icon = 'fa-magic';

        notification.innerHTML = `<i class="fa-solid ${icon} me-2"></i>${message}`;

        // Animation d'entrée
        notification.style.opacity = '0';
        notification.style.transform = 'translateY(-10px)';

        notificationArea.appendChild(notification);

        setTimeout(() => {
            notification.style.transition = 'all 0.3s ease';
            notification.style.opacity = '1';
            notification.style.transform = 'translateY(0)';
        }, 50);

        // Animation de sortie après 5 secondes
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateY(-10px)';
            setTimeout(() => notification.remove(), 300);
        }, 5000);
    }

    // Helper: Capitalize first letter
    function capitalize(string) {
        if (!string) return '';
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