# scrapers/reddit_scraper.py
import praw
import datetime
from config import REDDIT_CLIENT_ID, REDDIT_CLIENT_SECRET, REDDIT_USER_AGENT, SUBREDDITS, STOCKS

def initialize_reddit():
    """Initialise le client Reddit API."""
    return praw.Reddit(
        client_id=REDDIT_CLIENT_ID,
        client_secret=REDDIT_CLIENT_SECRET,
        user_agent=REDDIT_USER_AGENT
    )

def scrape_reddit_posts(symbol, limit=100):
    """Scrape les posts Reddit mentionnant le symbole d'une action."""
    reddit = initialize_reddit()
    posts = []
    
    for subreddit_name in SUBREDDITS:
        subreddit = reddit.subreddit(subreddit_name)
        
        # Recherche dans les titres (moins précis mais plus rapide)
        for submission in subreddit.search(symbol, limit=limit):
            if submission.created_utc > (datetime.datetime.now() - datetime.timedelta(days=7)).timestamp():
                posts.append({
                    'title': submission.title,
                    'text': submission.selftext,
                    'created_utc': datetime.datetime.fromtimestamp(submission.created_utc),
                    'score': submission.score,
                    'num_comments': submission.num_comments,
                    'source': f"reddit/r/{subreddit_name}",
                    'url': f"https://reddit.com{submission.permalink}",
                    'symbol': symbol
                })
    
    return posts

def get_reddit_sentiment_data():
    """Récupère les données de sentiment pour tous les symboles configurés."""
    all_posts = []
    for symbol in STOCKS:
        try:
            symbol_posts = scrape_reddit_posts(symbol)
            all_posts.extend(symbol_posts)
            print(f"Scraped {len(symbol_posts)} Reddit posts for {symbol}")
        except Exception as e:
            print(f"Error scraping Reddit for {symbol}: {e}")
    
    return all_posts

if __name__ == "__main__":
    # Test
    posts = get_reddit_sentiment_data()
    print(f"Total posts scraped: {len(posts)}")