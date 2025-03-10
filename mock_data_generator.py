# mock_data_generator.py
import random
import datetime
import json
from database.models import init_db, store_sentiment_data
from config import STOCKS

def generate_mock_sentiment_data():
    """Génère des données simulées de sentiment pour la démo."""
    processed_data = []
    summaries = {}
    
    current_date = datetime.datetime.now()
    
    # Générer des tendances de sentiment aléatoires mais cohérentes pour chaque action
    sentiment_trends = {
        "AAPL": random.uniform(-0.2, 0.5),  # Apple généralement positif
        "TSLA": random.uniform(-0.5, 0.3),  # Tesla plus volatil
        "MSFT": random.uniform(0.0, 0.4),   # Microsoft stable/positif
    }
    
    # Pour chaque action, générer des données sur 7 jours
    for symbol in STOCKS:
        base_sentiment = sentiment_trends[symbol]
        
        # Générer des mentions Reddit simulées
        for _ in range(random.randint(15, 30)):
            sentiment_variance = random.uniform(-0.3, 0.3)
            sentiment_score = max(min(base_sentiment + sentiment_variance, 1.0), -1.0)
            
            # Déterminer le label de sentiment
            if sentiment_score >= 0.05:
                sentiment_label = 'positive'
            elif sentiment_score <= -0.05:
                sentiment_label = 'negative'
            else:
                sentiment_label = 'neutral'
                
            # Date aléatoire dans les 7 derniers jours
            days_ago = random.randint(0, 7)
            post_date = current_date - datetime.timedelta(days=days_ago, 
                                                          hours=random.randint(0, 23),
                                                          minutes=random.randint(0, 59))
            
            post = {
                'symbol': symbol,
                'title': f"Discussion about {symbol} - {sentiment_label} outlook",
                'text': f"This is a simulated Reddit post about {symbol} with {sentiment_label} sentiment.",
                'created_utc': post_date,
                'source': f"reddit/r/{'wallstreetbets' if random.random() < 0.5 else 'stocks'}",
                'url': f"https://reddit.com/r/wallstreetbets/simulated/{random.randint(1000, 9999)}",
                'sentiment_score': sentiment_score,
                'sentiment_label': sentiment_label,
                'vader_compound': sentiment_score + random.uniform(-0.1, 0.1),
                'textblob_polarity': sentiment_score + random.uniform(-0.1, 0.1),
                'textblob_subjectivity': random.uniform(0.3, 0.8)
            }
            
            processed_data.append(post)
        
        # Générer des articles d'actualités simulés
        for _ in range(random.randint(5, 15)):
            sentiment_variance = random.uniform(-0.3, 0.3)
            sentiment_score = max(min(base_sentiment + sentiment_variance, 1.0), -1.0)
            
            # Déterminer le label de sentiment
            if sentiment_score >= 0.05:
                sentiment_label = 'positive'
            elif sentiment_score <= -0.05:
                sentiment_label = 'negative'
            else:
                sentiment_label = 'neutral'
                
            # Date aléatoire dans les 7 derniers jours
            days_ago = random.randint(0, 7)
            article_date = current_date - datetime.timedelta(days=days_ago, 
                                                             hours=random.randint(0, 23),
                                                             minutes=random.randint(0, 59))
            
            headlines = {
                'positive': [
                    f"{symbol} Surges as Market Rallies",
                    f"Analysts Upgrade {symbol} After Strong Earnings",
                    f"New Product from {symbol} Exceeds Expectations",
                    f"{symbol} Announces Expansion Plans"
                ],
                'negative': [
                    f"{symbol} Drops on Disappointing Guidance",
                    f"Analysts Downgrade {symbol} Citing Competition",
                    f"Regulatory Concerns Weigh on {symbol}",
                    f"{symbol} Faces Supply Chain Issues"
                ],
                'neutral': [
                    f"{symbol} Remains Stable Amid Market Volatility",
                    f"What to Expect from {symbol}'s Upcoming Earnings",
                    f"{symbol} Announces Leadership Changes",
                    f"Market Analysis: Is {symbol} Fairly Valued?"
                ]
            }
            
            article = {
                'symbol': symbol,
                'title': random.choice(headlines[sentiment_label]),
                'text': f"This is a simulated news article about {symbol} with {sentiment_label} sentiment.",
                'created_utc': article_date,
                'source': random.choice(['Yahoo Finance', 'MarketWatch', 'Bloomberg', 'CNBC']),
                'url': f"https://finance.yahoo.com/news/simulated/{random.randint(1000, 9999)}",
                'sentiment_score': sentiment_score,
                'sentiment_label': sentiment_label,
                'vader_compound': sentiment_score + random.uniform(-0.1, 0.1),
                'textblob_polarity': sentiment_score + random.uniform(-0.1, 0.1),
                'textblob_subjectivity': random.uniform(0.3, 0.8)
            }
            
            processed_data.append(article)
        
        # Générer le résumé pour ce symbole
        symbol_data = [item for item in processed_data if item['symbol'] == symbol]
        
        positive_items = [item for item in symbol_data if item['sentiment_label'] == 'positive']
        negative_items = [item for item in symbol_data if item['sentiment_label'] == 'negative']
        neutral_items = [item for item in symbol_data if item['sentiment_label'] == 'neutral']
        
        total_items = len(symbol_data)
        positive_count = len(positive_items)
        negative_count = len(negative_items)
        neutral_count = len(neutral_items)
        
        # Calculer les pourcentages
        positive_pct = (positive_count / total_items * 100) if total_items > 0 else 0
        negative_pct = (negative_count / total_items * 100) if total_items > 0 else 0
        neutral_pct = (neutral_count / total_items * 100) if total_items > 0 else 0
        
        # Calculer le sentiment moyen
        sentiment_scores = [item['sentiment_score'] for item in symbol_data]
        average_sentiment = sum(sentiment_scores) / len(sentiment_scores) if sentiment_scores else 0
        
        # Créer le résumé
        summaries[symbol] = {
            'symbol': symbol,
            'count': total_items,
            'average_sentiment': average_sentiment,
            'positive_count': positive_count,
            'negative_count': negative_count,
            'neutral_count': neutral_count,
            'positive_pct': positive_pct,
            'negative_pct': negative_pct,
            'neutral_pct': neutral_pct,
            'date': current_date
        }
        
        # Générer quelques résumés historiques
        for days_back in range(1, 8):
            hist_date = current_date - datetime.timedelta(days=days_back)
            # Créer une légère variation dans le sentiment pour l'historique
            hist_sentiment = base_sentiment + random.uniform(-0.2, 0.2)
            
            # Calculer de nouveaux pourcentages basés sur le sentiment historique
            if hist_sentiment > 0:
                pos_bias = 0.5 + hist_sentiment/2  # Entre 0.5 et 1.0
                hist_pos_pct = random.uniform(pos_bias*40, pos_bias*60)
                hist_neg_pct = random.uniform(10, 30)
                hist_neu_pct = 100 - hist_pos_pct - hist_neg_pct
            else:
                neg_bias = 0.5 + abs(hist_sentiment)/2  # Entre 0.5 et 1.0
                hist_neg_pct = random.uniform(neg_bias*40, neg_bias*60)
                hist_pos_pct = random.uniform(10, 30)
                hist_neu_pct = 100 - hist_pos_pct - hist_neg_pct
            
            # Créer résumé historique
            hist_summary = {
                'symbol': symbol,
                'date': hist_date,
                'count': random.randint(15, 40),
                'average_sentiment': hist_sentiment,
                'positive_count': int(hist_pos_pct * 0.4),
                'negative_count': int(hist_neg_pct * 0.4),
                'neutral_count': int(hist_neu_pct * 0.4),
                'positive_pct': hist_pos_pct,
                'negative_pct': hist_neg_pct,
                'neutral_pct': hist_neu_pct
            }
            
            # Ajouter ce résumé historique à la liste pour traitement en base
            processed_data.append({
                'symbol': symbol,
                'title': f"Historical summary for {symbol}",
                'text': json.dumps(hist_summary),
                'created_utc': hist_date,
                'source': 'Historical Data',
                'url': '',
                'sentiment_score': hist_sentiment,
                'sentiment_label': 'positive' if hist_sentiment > 0.05 else 'negative' if hist_sentiment < -0.05 else 'neutral',
                'vader_compound': hist_sentiment,
                'textblob_polarity': hist_sentiment,
                'textblob_subjectivity': 0.5,
                'is_historical_summary': True
            })
    
    return processed_data, summaries

if __name__ == "__main__":
    # Initialiser la base de données
    init_db()
    
    # Générer et stocker les données simulées
    processed_data, summaries = generate_mock_sentiment_data()
    store_sentiment_data(processed_data, summaries)
    
    print(f"Generated {len(processed_data)} sentiment items for {len(summaries)} symbols")
    for symbol, summary in summaries.items():
        print(f"{symbol}: {summary['count']} items, sentiment: {summary['average_sentiment']:.2f}")