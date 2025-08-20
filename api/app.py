"""
Vercel Serverless Function - Simplified Entry Point
"""

import sys
import os
from pathlib import Path
from flask import Flask, render_template, send_from_directory, jsonify

# Add parent directory to path
parent_dir = Path(__file__).parent.parent
sys.path.insert(0, str(parent_dir))

# Create Flask app
app = Flask(__name__, 
           static_folder=str(parent_dir), 
           static_url_path='',
           template_folder=str(parent_dir))

app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'dev-key-for-vercel')

@app.route('/')
def index():
    """Serve the main index page"""
    try:
        return send_from_directory(str(parent_dir), 'index.html')
    except Exception as e:
        return f"<h1>LED Display Solutions</h1><p>Welcome to our website!</p><p>Debug: {str(e)}</p>"

@app.route('/<path:filename>')
def serve_static(filename):
    """Serve static files"""
    try:
        return send_from_directory(str(parent_dir), filename)
    except Exception as e:
        # If file not found, try to serve as HTML
        if not '.' in filename:
            try:
                return send_from_directory(str(parent_dir), f'{filename}.html')
            except:
                pass
        return f"<h1>File not found: {filename}</h1><p>Error: {str(e)}</p>", 404

@app.route('/api/health')
def health():
    """Health check endpoint"""
    return jsonify({
        'status': 'ok',
        'message': 'LED Display Solutions API is running',
        'version': '1.0'
    })

if __name__ == '__main__':
    app.run(debug=True)