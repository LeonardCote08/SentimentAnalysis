# database/models.py
from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, ForeignKey, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
import datetime
from config import DATABASE_URL

Base = declarative_base()
engine = create_engine(DATABASE_URL)
Session = sessionmaker(bind=engine)

class SentimentItem(Base):
    __tablename__ = "sentiment_items"
    
    id = Column(Integer, primary_key=True)
    symbol = Column(String(10), index=True)
    title = Column(String(255))
    text = Column(Text)
    created_utc = Column(DateTime, default=datetime.datetime.now)
    source = Column(String(50))
    url = Column(String(255))
    sentiment_score = Column(Float)
    sentiment_label = Column(String(20))
    vader_compound = Column(Float)
    textblob_polarity = Column(Float)
    textblob_subjectivity = Column(Float)
    
    def __repr__(self):
        return f"<SentimentItem(symbol='{self.symbol}', source='{self.source}', sentiment_score={self.sentiment_score})>"

class SentimentSummary(Base):
    __tablename__ = "sentiment_summaries"
    
    id = Column(Integer, primary_key=True)
    symbol = Column(String(10), index=True)
    date = Column(DateTime, default=datetime.datetime.now)
    count = Column(Integer)
    average_sentiment = Column(Float)
    positive_count = Column(Integer)
    negative_count = Column(Integer)
    neutral_count = Column(Integer)
    positive_pct = Column(Float)
    negative_pct = Column(Float)
    neutral_pct = Column(Float)
    
    def __repr__(self):
        return f"<SentimentSummary(symbol='{self.symbol}', date='{self.date}', average_sentiment={self.average_sentiment})>"

def init_db():
    """Initialise la base de données."""
    Base.metadata.create_all(engine)
    print("Database initialized")

def store_sentiment_data(processed_data, summaries):
    """Stocke les données de sentiment dans la base de données."""
    session = Session()
    
    try:
        # Stocker les éléments de sentiment
        for item in processed_data:
            db_item = SentimentItem(
                symbol=item.get('symbol'),
                title=item.get('title', ''),
                text=item.get('text', ''),
                created_utc=item.get('created_utc', datetime.datetime.now()),
                source=item.get('source', ''),
                url=item.get('url', ''),
                sentiment_score=item.get('sentiment_score', 0),
                sentiment_label=item.get('sentiment_label', 'neutral'),
                vader_compound=item.get('vader_compound', 0),
                textblob_polarity=item.get('textblob_polarity', 0),
                textblob_subjectivity=item.get('textblob_subjectivity', 0)
            )
            session.add(db_item)
        
        # Stocker les résumés de sentiment
        for symbol, summary in summaries.items():
            db_summary = SentimentSummary(
                symbol=symbol,
                date=summary.get('date', datetime.datetime.now()),
                count=summary.get('count', 0),
                average_sentiment=summary.get('average_sentiment', 0),
                positive_count=summary.get('positive_count', 0),
                negative_count=summary.get('negative_count', 0),
                neutral_count=summary.get('neutral_count', 0),
                positive_pct=summary.get('positive_pct', 0),
                negative_pct=summary.get('negative_pct', 0),
                neutral_pct=summary.get('neutral_pct', 0)
            )
            session.add(db_summary)
        
        session.commit()
        print(f"Stored {len(processed_data)} sentiment items and {len(summaries)} summaries in database")
    
    except Exception as e:
        session.rollback()
        print(f"Error storing data in database: {e}")
    
    finally:
        session.close()

def get_latest_summaries():
    """Récupère les derniers résumés de sentiment pour chaque symbole."""
    session = Session()
    summaries = {}
    
    try:
        # Pour chaque symbole, récupérer le résumé le plus récent
        for symbol in ["AAPL", "TSLA", "MSFT"]:  # Remplacer par une requête de tous les symboles uniques
            latest_summary = session.query(SentimentSummary)\
                .filter(SentimentSummary.symbol == symbol)\
                .order_by(SentimentSummary.date.desc())\
                .first()
            
            if latest_summary:
                summaries[symbol] = {
                    'symbol': latest_summary.symbol,
                    'date': latest_summary.date,
                    'count': latest_summary.count,
                    'average_sentiment': latest_summary.average_sentiment,
                    'positive_count': latest_summary.positive_count,
                    'negative_count': latest_summary.negative_count,
                    'neutral_count': latest_summary.neutral_count,
                    'positive_pct': latest_summary.positive_pct,
                    'negative_pct': latest_summary.negative_pct,
                    'neutral_pct': latest_summary.neutral_pct
                }
    
    except Exception as e:
        print(f"Error retrieving latest summaries: {e}")
    
    finally:
        session.close()
    
    return summaries

def get_sentiment_history(symbol, days=7):
    """Récupère l'historique des sentiments pour un symbole donné."""
    session = Session()
    history = []
    
    try:
        # Calculer la date limite
        cutoff_date = datetime.datetime.now() - datetime.timedelta(days=days)
        
        # Récupérer les résumés pour la période
        summaries = session.query(SentimentSummary)\
            .filter(SentimentSummary.symbol == symbol)\
            .filter(SentimentSummary.date >= cutoff_date)\
            .order_by(SentimentSummary.date.asc())\
            .all()
        
        for summary in summaries:
            history.append({
                'date': summary.date.strftime('%Y-%m-%d'),
                'average_sentiment': summary.average_sentiment,
                'positive_pct': summary.positive_pct,
                'negative_pct': summary.negative_pct,
                'neutral_pct': summary.neutral_pct,
                'count': summary.count
            })
    
    except Exception as e:
        print(f"Error retrieving sentiment history for {symbol}: {e}")
    
    finally:
        session.close()
    
    return history