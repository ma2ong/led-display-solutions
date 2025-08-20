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

try:
    # Import the Flask app
    from integrated_server import app
    print("✅ Flask app imported successfully")
except Exception as e:
    print(f"❌ Import error: {e}")
    # Create a minimal Flask app as fallback
    from flask import Flask
    app = Flask(__name__)
    
    @app.route('/')
    def hello():
        return f"<h1>Import Error</h1><p>Error importing main app: {str(e)}</p>"
    
    @app.route('/<path:path>')
    def catch_all(path):
        return f"<h1>Import Error</h1><p>Error importing main app: {str(e)}</p><p>Path: {path}</p>"