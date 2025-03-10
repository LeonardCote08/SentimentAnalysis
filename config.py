# config.py
STOCKS = ["AAPL", "TSLA", "MSFT"]  # Symboles des actions à suivre
SUBREDDITS = ["wallstreetbets", "stocks", "investing"]  # Subreddits à scraper
NEWS_SOURCES = [
    "https://finance.yahoo.com/quote/{}/news",
    "https://www.marketwatch.com/investing/stock/{}"
]
DATABASE_URL = "sqlite:///./sentiment_data.db"
SCRAPE_INTERVAL = 3600  # en secondes (1 heure)


# Configuration Reddit (obtiens tes identifiants sur https://www.reddit.com/prefs/apps)
REDDIT_CLIENT_ID = "TON_CLIENT_ID"
REDDIT_CLIENT_SECRET = "TON_CLIENT_SECRET"
REDDIT_USER_AGENT = "SentimentTrader/1.0"