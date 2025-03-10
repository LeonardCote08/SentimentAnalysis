# scrapers/news_scraper.py
import requests
from bs4 import BeautifulSoup
import datetime
import time
import random
from config import NEWS_SOURCES, STOCKS

# Liste d'agents utilisateurs pour éviter les blocages
USER_AGENTS = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0"
]

def get_headers():
    """Génère des en-têtes aléatoires pour éviter la détection."""
    return {
        "User-Agent": random.choice(USER_AGENTS),
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
        "DNT": "1",
        "Connection": "keep-alive",
        "Upgrade-Insecure-Requests": "1"
    }

def scrape_yahoo_finance(symbol):
    """Scrape les actualités Yahoo Finance pour un symbole donné."""
    url = NEWS_SOURCES[0].format(symbol)
    articles = []
    
    try:
        response = requests.get(url, headers=get_headers(), timeout=10)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.text, 'html.parser')
        news_items = soup.select('li.js-stream-content')
        
        for item in news_items:
            try:
                headline = item.select_one('h3').text.strip()
                link_element = item.select_one('a')
                link = "https://finance.yahoo.com" + link_element['href'] if link_element else ""
                
                # Extraire la date si disponible
                date_element = item.select_one('div.C(#959595)')
                date_str = date_element.text.strip() if date_element else ""
                
                # Convertir en objet datetime (simplification)
                date = datetime.datetime.now()
                
                articles.append({
                    'title': headline,
                    'text': headline,  # Utiliser le titre comme texte (simplifié)
                    'created_utc': date,
                    'source': 'Yahoo Finance',
                    'url': link,
                    'symbol': symbol
                })
            except Exception as e:
                print(f"Error parsing Yahoo Finance news item: {e}")
                continue
                
    except Exception as e:
        print(f"Error scraping Yahoo Finance for {symbol}: {e}")
    
    return articles

def get_news_sentiment_data():
    """Récupère les actualités pour tous les symboles configurés."""
    all_articles = []
    
    for symbol in STOCKS:
        try:
            # Scraper Yahoo Finance
            yahoo_articles = scrape_yahoo_finance(symbol)
            all_articles.extend(yahoo_articles)
            print(f"Scraped {len(yahoo_articles)} Yahoo Finance articles for {symbol}")
            
            # Ajouter une pause pour éviter les blocages
            time.sleep(random.uniform(1, 3))
            
        except Exception as e:
            print(f"Error scraping news for {symbol}: {e}")
    
    return all_articles

if __name__ == "__main__":
    # Test
    articles = get_news_sentiment_data()
    print(f"Total articles scraped: {len(articles)}")