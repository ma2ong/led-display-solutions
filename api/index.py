"""
Vercel Serverless Function Entry Point
LED Display Solutions - Main Application Handler
"""

import sys
import os
from pathlib import Path

# Add the parent directory to Python path
parent_dir = Path(__file__).parent.parent
sys.path.insert(0, str(parent_dir))

# Import the Flask app
from integrated_server import app, init_db

# Initialize database on cold start
try:
    with app.app_context():
        init_db(create_admin=True, use_enhanced_schema=True)
except Exception as e:
    print(f"Database initialization warning: {e}")

# Export the app for Vercel
def handler(request, response):
    """Vercel serverless function handler"""
    return app(request, response)

# Also export as 'app' for compatibility
app = app