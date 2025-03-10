# main.py
import uvicorn
import time
import threading
from datetime import datetime
import schedule

from database.models import init_db
from api.routes import app
from mock_data_generator import generate_mock_sentiment_data
from database.models import store_sentiment_data
from config import SCRAPE_INTERVAL

def update_data():
    """Mettre à jour les données de sentiment avec des données simulées."""
    print(f"[{datetime.now()}] Updating sentiment data (DEMO mode)...")
    try:
        # Générer des données simulées au lieu de scraper
        processed_data, summaries = generate_mock_sentiment_data()
        
        # Stocker les données
        store_sentiment_data(processed_data, summaries)
        
        print(f"[{datetime.now()}] Generated {len(processed_data)} sentiment items for {len(summaries)} symbols")
    except Exception as e:
        print(f"[{datetime.now()}] Error generating demo data: {e}")

def scheduler_thread():
    """Thread de planification pour mettre à jour les données périodiquement."""
    # Programmer la mise à jour toutes les heures
    schedule.every(SCRAPE_INTERVAL).seconds.do(update_data)
    
    while True:
        schedule.run_pending()
        time.sleep(1)

if __name__ == "__main__":
    print("Starting Sentiment Analysis Dashboard - DEMO MODE")
    print("This version uses simulated data rather than live scrapers")
    print("-" * 70)
    
    # Initialiser la base de données
    init_db()
    
    # Effectuer une mise à jour initiale des données
    update_data()
    
    # Démarrer le thread de planification
    scheduler = threading.Thread(target=scheduler_thread)
    scheduler.daemon = True
    scheduler.start()
    
    # Démarrer le serveur FastAPI
    print(f"Server started! Visit http://localhost:8000 to view the dashboard")
    uvicorn.run(app, host="0.0.0.0", port=8000)