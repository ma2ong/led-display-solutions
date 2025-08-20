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
from integrated_server import app

# Export the Flask app for Vercel - this is what Vercel expects