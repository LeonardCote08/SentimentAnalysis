# api/routes.py
from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
import yfinance as yf
import json
import pandas as pd
import datetime
from pathlib import Path

from database.models import get_latest_summaries, get_sentiment_history
from scrapers.reddit_scraper import get_reddit_sentiment_data
from scrapers.news_scraper import get_news_sentiment_data
from analysis.sentiment import analyze_all_data
from database.models import store_sentiment_data, init_db
from config import STOCKS

app = FastAPI()

# Configurer les templates et fichiers statiques
templates = Jinja2Templates(directory="frontend/templates")
app.mount("/static", StaticFiles(directory="frontend/static"), name="static")

@app.get("/", response_class=HTMLResponse)
async def get_dashboard(request: Request):
    """Affiche le tableau de bord principal."""
    return templates.TemplateResponse("dashboard.html", {"request": request, "stocks": STOCKS})

@app.get("/api/refresh")
async def refresh_data():
    """Point d'API pour forcer l'actualisation des données."""
    try:
        # Récupérer les données
        reddit_data = get_reddit_sentiment_data()
        news_data = get_news_sentiment_data()
        
        # Analyser les données
        processed_data, summaries = analyze_all_data(reddit_data, news_data)
        
        # Stocker les données
        store_sentiment_data(processed_data, summaries)
        
        return {"status": "success", "message": f"Refreshed data: {len(processed_data)} items processed"}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error refreshing data: {str(e)}")

@app.get("/api/summary")
async def get_summaries():
    """Point d'API pour récupérer les résumés de sentiment."""
    try:
        summaries = get_latest_summaries()
        
        # Ajouter les données de cours actuelles
        for symbol in summaries:
            try:
                stock = yf.Ticker(symbol)
                stock_info = stock.info
                summaries[symbol]['current_price'] = stock_info.get('regularMarketPrice', 0)
                summaries[symbol]['previous_close'] = stock_info.get('previousClose', 0)
                summaries[symbol]['price_change'] = summaries[symbol]['current_price'] - summaries[symbol]['previous_close']
                summaries[symbol]['price_change_pct'] = (summaries[symbol]['price_change'] / summaries[symbol]['previous_close'] * 100) if summaries[symbol]['previous_close'] else 0
            except Exception as e:
                print(f"Error getting price data for {symbol}: {e}")
                summaries[symbol]['current_price'] = 0
                summaries[symbol]['previous_close'] = 0
                summaries[symbol]['price_change'] = 0
                summaries[symbol]['price_change_pct'] = 0
        
        return summaries
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting summaries: {str(e)}")

@app.get("/api/history/{symbol}")
async def get_history(symbol: str):
    """Point d'API pour récupérer l'historique des sentiments."""
    try:
        history = get_sentiment_history(symbol)
        
        # Récupérer également l'historique des prix
        try:
            end_date = datetime.datetime.now()
            start_date = end_date - datetime.timedelta(days=30)
            
            stock = yf.Ticker(symbol)
            price_history = stock.history(start=start_date, end=end_date)
            
            # Convertir en liste pour l'API
            price_data = []
            for date, row in price_history.iterrows():
                price_data.append({
                    'date': date.strftime('%Y-%m-%d'),
                    'open': row['Open'],
                    'high': row['High'],
                    'low': row['Low'],
                    'close': row['Close'],
                    'volume': row['Volume']
                })
        except Exception as e:
            print(f"Error getting price history for {symbol}: {e}")
            price_data = []
        
        return {
            "sentiment_history": history,
            "price_history": price_data
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting history for {symbol}: {str(e)}")