# analysis/sentiment.py
from textblob import TextBlob
from nltk.sentiment.vader import SentimentIntensityAnalyzer
import pandas as pd
import datetime

class SentimentAnalyzer:
    def __init__(self):
        self.sid = SentimentIntensityAnalyzer()
    
    def analyze_text(self, text):
        """Analyse le sentiment d'un texte en utilisant NLTK VADER et TextBlob."""
        if not text or text.strip() == "":
            return {
                'vader_compound': 0,
                'textblob_polarity': 0,
                'textblob_subjectivity': 0,
                'sentiment_score': 0,
                'sentiment_label': 'neutral'
            }
        
        # Analyse VADER
        vader_scores = self.sid.polarity_scores(text)
        
        # Analyse TextBlob
        blob = TextBlob(text)
        textblob_polarity = blob.sentiment.polarity
        textblob_subjectivity = blob.sentiment.subjectivity
        
        # Score combiné (moyenne des deux méthodes)
        combined_score = (vader_scores['compound'] + textblob_polarity) / 2
        
        # Déterminer le label de sentiment
        if combined_score >= 0.05:
            sentiment_label = 'positive'
        elif combined_score <= -0.05:
            sentiment_label = 'negative'
        else:
            sentiment_label = 'neutral'
        
        return {
            'vader_compound': vader_scores['compound'],
            'textblob_polarity': textblob_polarity,
            'textblob_subjectivity': textblob_subjectivity,
            'sentiment_score': combined_score,
            'sentiment_label': sentiment_label
        }
    
    def process_data(self, data_list):
        """Traite une liste de données (articles ou posts) et ajoute l'analyse de sentiment."""
        processed_data = []
        
        for item in data_list:
            # Combiner titre et texte pour analyse
            full_text = f"{item.get('title', '')} {item.get('text', '')}"
            
            # Analyser le sentiment
            sentiment_data = self.analyze_text(full_text)
            
            # Combiner les données originales avec l'analyse de sentiment
            processed_item = {**item, **sentiment_data}
            processed_data.append(processed_item)
        
        return processed_data
    
    def get_sentiment_summary(self, processed_data, symbol=None):
        """Génère un résumé du sentiment pour un symbole donné."""
        if symbol:
            data = [item for item in processed_data if item.get('symbol') == symbol]
        else:
            data = processed_data
        
        if not data:
            return {
                'symbol': symbol,
                'count': 0,
                'average_sentiment': 0,
                'positive_count': 0,
                'negative_count': 0,
                'neutral_count': 0,
                'positive_pct': 0,
                'negative_pct': 0,
                'neutral_pct': 0,
                'date': datetime.datetime.now()
            }
        
        # Calculer les métriques
        sentiment_scores = [item['sentiment_score'] for item in data]
        average_sentiment = sum(sentiment_scores) / len(sentiment_scores) if sentiment_scores else 0
        
        # Compter les sentiments par catégorie
        positive_count = sum(1 for item in data if item['sentiment_label'] == 'positive')
        negative_count = sum(1 for item in data if item['sentiment_label'] == 'negative')
        neutral_count = sum(1 for item in data if item['sentiment_label'] == 'neutral')
        
        # Calculer les pourcentages
        total = len(data)
        positive_pct = (positive_count / total * 100) if total > 0 else 0
        negative_pct = (negative_count / total * 100) if total > 0 else 0
        neutral_pct = (neutral_count / total * 100) if total > 0 else 0
        
        return {
            'symbol': symbol,
            'count': total,
            'average_sentiment': average_sentiment,
            'positive_count': positive_count,
            'negative_count': negative_count,
            'neutral_count': neutral_count,
            'positive_pct': positive_pct,
            'negative_pct': negative_pct,
            'neutral_pct': neutral_pct,
            'date': datetime.datetime.now()
        }

def analyze_all_data(reddit_data, news_data):
    """Analyse toutes les données et génère des résumés par symbole."""
    # Combiner les données
    all_data = reddit_data + news_data
    
    # Analyser le sentiment
    analyzer = SentimentAnalyzer()
    processed_data = analyzer.process_data(all_data)
    
    # Générer des résumés par symbole
    summaries = {}
    for symbol in set(item.get('symbol', '') for item in processed_data):
        if symbol:  # Ignorer les éléments sans symbole
            summaries[symbol] = analyzer.get_sentiment_summary(processed_data, symbol)
    
    return processed_data, summaries