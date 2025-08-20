
import os
import sqlite3
import csv
import io
import uuid
import re
import hashlib
import secrets
import time
from datetime import datetime, timedelta
from flask import Flask, request, jsonify, render_template, send_from_directory, redirect, url_for, Response, session
from flask_cors import CORS
from werkzeug.utils import secure_filename
from werkzeug.security import generate_password_hash, check_password_hash
from flask_login import LoginManager, UserMixin, login_user, logout_user, login_required, current_user
from database_manager import db_manager
from functools import wraps
import logging

# Configuration
UPLOAD_FOLDER = 'assets/uploads'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp'}
DATABASE = 'database.db'
SECRET_KEY = os.environ.get('SECRET_KEY', os.urandom(24))

# Security Configuration
SECURITY_CONFIG = {
    'CSRF_ENABLED': True,
    'CSRF_SESSION_KEY': '_csrf_token',
    'RATE_LIMIT_ENABLED': True,
    'RATE_LIMIT_REQUESTS': 100,
    'RATE_LIMIT_WINDOW': 3600,  # 1 hour
    'INPUT_VALIDATION_ENABLED': True,
    'XSS_PROTECTION_ENABLED': True,
    'SECURITY_HEADERS_ENABLED': True,
    'FILE_UPLOAD_MAX_SIZE': 10 * 1024 * 1024,  # 10MB
    'ALLOWED_MIME_TYPES': {
        'image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp'
    }
}

app = Flask(__name__, static_folder='.', static_url_path='', template_folder='.')
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['SECRET_KEY'] = SECRET_KEY
app.config['MAX_CONTENT_LENGTH'] = SECURITY_CONFIG['FILE_UPLOAD_MAX_SIZE']
CORS(app)

# Security logging setup
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('security.log'),
        logging.StreamHandler()
    ]
)
security_logger = logging.getLogger('security')

# Rate limiting storage
rate_limit_storage = {}

# CSRF token storage
csrf_tokens = {}

# --- Login Manager Setup ---
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'admin_login' # Redirect to this route if not logged in
login_manager.login_message = "Please log in to access this page."

class User(UserMixin):
    def __init__(self, id, username, email, password_hash, role='admin'):
        self.id = id
        self.username = username
        self.email = email
        self.password_hash = password_hash
        self.role = role

@login_manager.user_loader
def load_user(user_id):
    user_data = db_manager.get_user_by_id(int(user_id))
    if user_data:
        return User(
            id=user_data['id'], 
            username=user_data['username'], 
            email=user_data['email'],
            password_hash=user_data['password_hash'],
            role=user_data['role']
        )
    return None

# Ensure the upload folder exists
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# Security Decorators and Middleware
def generate_csrf_token():
    """Generate a CSRF token"""
    return secrets.token_urlsafe(32)

def validate_csrf_token(token):
    """Validate CSRF token"""
    if not SECURITY_CONFIG['CSRF_ENABLED']:
        return True
    
    session_token = session.get(SECURITY_CONFIG['CSRF_SESSION_KEY'])
    return session_token and secrets.compare_digest(session_token, token)

def csrf_protect(f):
    """CSRF protection decorator"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not SECURITY_CONFIG['CSRF_ENABLED']:
            return f(*args, **kwargs)
        
        if request.method in ['POST', 'PUT', 'DELETE', 'PATCH']:
            token = request.headers.get('X-CSRF-Token') or request.form.get('_csrf_token')
            if not token or not validate_csrf_token(token):
                security_logger.warning(f'CSRF token validation failed for {request.endpoint}')
                return jsonify({'error': 'CSRF token validation failed'}), 403
        
        return f(*args, **kwargs)
    return decorated_function

def rate_limit(max_requests=None, window=None):
    """Rate limiting decorator"""
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            if not SECURITY_CONFIG['RATE_LIMIT_ENABLED']:
                return f(*args, **kwargs)
            
            # Use provided limits or defaults
            limit = max_requests or SECURITY_CONFIG['RATE_LIMIT_REQUESTS']
            time_window = window or SECURITY_CONFIG['RATE_LIMIT_WINDOW']
            
            # Get client identifier
            client_id = get_client_identifier()
            current_time = time.time()
            
            # Clean old entries
            if client_id in rate_limit_storage:
                rate_limit_storage[client_id] = [
                    timestamp for timestamp in rate_limit_storage[client_id]
                    if current_time - timestamp < time_window
                ]
            else:
                rate_limit_storage[client_id] = []
            
            # Check rate limit
            if len(rate_limit_storage[client_id]) >= limit:
                security_logger.warning(f'Rate limit exceeded for {client_id} on {request.endpoint}')
                return jsonify({'error': 'Rate limit exceeded'}), 429
            
            # Add current request
            rate_limit_storage[client_id].append(current_time)
            
            return f(*args, **kwargs)
        return decorated_function
    return decorator

def get_client_identifier():
    """Get client identifier for rate limiting"""
    # Use IP address and User-Agent for identification
    ip = request.environ.get('HTTP_X_FORWARDED_FOR', request.remote_addr)
    user_agent = request.headers.get('User-Agent', '')
    return hashlib.sha256(f"{ip}:{user_agent}".encode()).hexdigest()[:16]

def validate_input(data, validation_rules):
    """Validate input data against rules"""
    if not SECURITY_CONFIG['INPUT_VALIDATION_ENABLED']:
        return True, []
    
    errors = []
    
    for field, rules in validation_rules.items():
        value = data.get(field)
        
        # Required field check
        if rules.get('required', False) and not value:
            errors.append(f'{field} is required')
            continue
        
        if value:
            # Type validation
            if 'type' in rules:
                if not validate_field_type(value, rules['type']):
                    errors.append(f'{field} has invalid format')
            
            # Length validation
            if 'min_length' in rules and len(str(value)) < rules['min_length']:
                errors.append(f'{field} must be at least {rules["min_length"]} characters')
            
            if 'max_length' in rules and len(str(value)) > rules['max_length']:
                errors.append(f'{field} must be no more than {rules["max_length"]} characters')
            
            # Pattern validation
            if 'pattern' in rules and not re.match(rules['pattern'], str(value)):
                errors.append(f'{field} format is invalid')
    
    return len(errors) == 0, errors

def validate_field_type(value, field_type):
    """Validate field type"""
    patterns = {
        'email': r'^[^\s@]+@[^\s@]+\.[^\s@]+$',
        'phone': r'^[\+]?[1-9][\d]{0,15}$',
        'url': r'^https?://.+',
        'alphanumeric': r'^[a-zA-Z0-9]+$',
        'numeric': r'^\d+$',
        'text': r'^[a-zA-Z\s]+$'
    }
    
    if field_type in patterns:
        return bool(re.match(patterns[field_type], str(value)))
    
    return True

def sanitize_input(data):
    """Sanitize input data to prevent XSS"""
    if not SECURITY_CONFIG['XSS_PROTECTION_ENABLED']:
        return data
    
    if isinstance(data, dict):
        return {key: sanitize_input(value) for key, value in data.items()}
    elif isinstance(data, list):
        return [sanitize_input(item) for item in data]
    elif isinstance(data, str):
        # Remove script tags
        data = re.sub(r'<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>', '', data, flags=re.IGNORECASE)
        
        # Remove javascript: URLs
        data = re.sub(r'javascript:', '', data, flags=re.IGNORECASE)
        
        # Remove on* event handlers
        data = re.sub(r'\s*on\w+\s*=\s*["\'][^"\']*["\']', '', data, flags=re.IGNORECASE)
        
        # Encode HTML entities
        data = (data.replace('&', '&amp;')
                   .replace('<', '&lt;')
                   .replace('>', '&gt;')
                   .replace('"', '&quot;')
                   .replace("'", '&#x27;'))
        
        return data
    
    return data

def validate_file_upload(file):
    """Validate uploaded file"""
    if not file:
        return False, 'No file provided'
    
    if file.filename == '':
        return False, 'No file selected'
    
    # Check file extension
    if not allowed_file(file.filename):
        return False, 'File type not allowed'
    
    # Check file size
    file.seek(0, 2)  # Seek to end
    file_size = file.tell()
    file.seek(0)  # Reset to beginning
    
    if file_size > SECURITY_CONFIG['FILE_UPLOAD_MAX_SIZE']:
        return False, f'File too large. Maximum size is {SECURITY_CONFIG["FILE_UPLOAD_MAX_SIZE"] // (1024*1024)}MB'
    
    # Check MIME type
    import mimetypes
    mime_type, _ = mimetypes.guess_type(file.filename)
    if mime_type not in SECURITY_CONFIG['ALLOWED_MIME_TYPES']:
        return False, 'Invalid file type'
    
    # Check file signature (magic bytes)
    file_header = file.read(8)
    file.seek(0)  # Reset to beginning
    
    if not validate_file_signature(file_header, mime_type):
        return False, 'File signature validation failed'
    
    return True, 'File is valid'

def validate_file_signature(header, mime_type):
    """Validate file signature against MIME type"""
    signatures = {
        'image/jpeg': [b'\xff\xd8\xff'],
        'image/png': [b'\x89PNG\r\n\x1a\n'],
        'image/gif': [b'GIF87a', b'GIF89a'],
        'image/webp': [b'RIFF']
    }
    
    if mime_type in signatures:
        return any(header.startswith(sig) for sig in signatures[mime_type])
    
    return True  # Allow unknown types for now

@app.before_request
def security_before_request():
    """Security checks before each request"""
    # Generate CSRF token for session
    if SECURITY_CONFIG['CSRF_ENABLED'] and SECURITY_CONFIG['CSRF_SESSION_KEY'] not in session:
        session[SECURITY_CONFIG['CSRF_SESSION_KEY']] = generate_csrf_token()
    
    # Log suspicious requests
    if detect_suspicious_request():
        security_logger.warning(f'Suspicious request detected: {request.method} {request.path} from {request.remote_addr}')

@app.after_request
def security_after_request(response):
    """Add security headers to response"""
    if SECURITY_CONFIG['SECURITY_HEADERS_ENABLED']:
        # Content Security Policy
        csp = (
            "default-src 'self'; "
            "script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://cdnjs.cloudflare.com; "
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.jsdelivr.net https://cdnjs.cloudflare.com; "
            "font-src 'self' https://fonts.gstatic.com; "
            "img-src 'self' data: https: blob:; "
            "connect-src 'self'; "
            "frame-ancestors 'none';"
        )
        response.headers['Content-Security-Policy'] = csp
        
        # Other security headers
        response.headers['X-Content-Type-Options'] = 'nosniff'
        response.headers['X-Frame-Options'] = 'DENY'
        response.headers['X-XSS-Protection'] = '1; mode=block'
        response.headers['Referrer-Policy'] = 'strict-origin-when-cross-origin'
        response.headers['Permissions-Policy'] = 'geolocation=(), microphone=(), camera=()'
        
        # HSTS for HTTPS
        if request.is_secure:
            response.headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains'
    
    return response

def detect_suspicious_request():
    """Detect potentially suspicious requests"""
    suspicious_patterns = [
        r'<script',
        r'javascript:',
        r'eval\(',
        r'expression\(',
        r'vbscript:',
        r'onload=',
        r'onerror='
    ]
    
    # Check URL parameters
    for param in request.args.values():
        if any(re.search(pattern, param, re.IGNORECASE) for pattern in suspicious_patterns):
            return True
    
    # Check form data
    if request.form:
        for value in request.form.values():
            if any(re.search(pattern, value, re.IGNORECASE) for pattern in suspicious_patterns):
                return True
    
    # Check JSON data
    if request.is_json:
        try:
            json_data = request.get_json()
            if json_data and isinstance(json_data, dict):
                for value in json_data.values():
                    if isinstance(value, str) and any(re.search(pattern, value, re.IGNORECASE) for pattern in suspicious_patterns):
                        return True
        except:
            pass
    
    return False

# --- Database Setup ---
def get_db():
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    return conn

def init_db(create_admin=True, use_enhanced_schema=True):
    """Initialize database with enhanced schema"""
    with app.app_context():
        db = get_db()
        
        # Choose which schema to use
        schema_file = 'schema_enhanced.sql' if use_enhanced_schema else 'schema.sql'
        
        try:
            with open(schema_file, 'r', encoding='utf-8') as f:
                db.cursor().executescript(f.read())
            print(f"Database initialized with {schema_file}")
        except FileNotFoundError:
            print(f"Schema file {schema_file} not found, falling back to basic schema")
            with app.open_resource('schema.sql', mode='r') as f:
                db.cursor().executescript(f.read())
        
        if create_admin:
            # Check if admin user already exists
            admin_user = db.execute('SELECT * FROM users WHERE username = ?', ('admin',)).fetchone()
            if not admin_user:
                print("Creating default admin user...")
                password_hash = generate_password_hash('admin123')  # More secure default password
                
                # Use enhanced user table if available
                try:
                    db.execute('''
                        INSERT INTO users (username, email, password_hash, role, is_active) 
                        VALUES (?, ?, ?, ?, ?)
                    ''', ('admin', 'admin@lianjin-led.com', password_hash, 'admin', 1))
                    print("Enhanced admin user created. Username: admin, Password: admin123")
                except sqlite3.Error:
                    # Fallback to basic user table
                    db.execute('INSERT INTO users (username, password_hash) VALUES (?, ?)', ('admin', password_hash))
                    print("Basic admin user created. Username: admin, Password: admin123")

        db.commit()

# --- Helper Functions ---
def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# --- Static File Serving ---
@app.route('/')
def index():
    return send_from_directory('.', 'index.html')

@app.route('/<path:filename>')
def serve_static(filename):
    return send_from_directory('.', filename)

# --- API Endpoints ---

# Get products API for the public website
@app.route('/api/products', methods=['GET'])
def get_products():
    db = get_db()
    language = request.args.get('lang', 'en')
    category = request.args.get('category')
    featured_only = request.args.get('featured', 'false').lower() == 'true'
    
    # Build query based on parameters
    query = '''
        SELECT p.id, p.sku, 
               CASE WHEN ? = 'zh' THEN p.name_zh ELSE p.name_en END as name,
               CASE WHEN ? = 'zh' THEN p.description_zh ELSE p.description_en END as description,
               p.pixel_pitch, p.brightness, p.refresh_rate, p.viewing_angle,
               p.power_consumption, p.weight, p.dimensions, p.ip_rating,
               p.is_featured, p.created_at,
               c.name_en as category_name_en, c.name_zh as category_name_zh,
               pi.image_url
        FROM products p
        LEFT JOIN product_categories c ON p.category_id = c.id
        LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.is_primary = 1
        WHERE p.is_active = 1
    '''
    
    params = [language, language]
    
    if category:
        query += ' AND c.slug = ?'
        params.append(category)
    
    if featured_only:
        query += ' AND p.is_featured = 1'
    
    query += ' ORDER BY p.sort_order, p.created_at DESC'
    
    try:
        products_cursor = db.execute(query, params)
        products = products_cursor.fetchall()
        products_list = []
        
        for row in products:
            product = dict(row)
            # Add category name based on language
            product['category'] = product['category_name_zh'] if language == 'zh' else product['category_name_en']
            # Clean up temporary fields
            del product['category_name_en']
            del product['category_name_zh']
            products_list.append(product)
        
        return jsonify(products_list)
    except sqlite3.Error as e:
        # Fallback to basic query for backward compatibility
        products_cursor = db.execute('SELECT id, name, category, description, image_url FROM products ORDER BY created_at DESC')
        products = products_cursor.fetchall()
        products_list = [dict(row) for row in products]
        return jsonify(products_list)

# Get single product API for the public website
@app.route('/api/products/<int:product_id>', methods=['GET'])
def get_product_detail(product_id):
    db = get_db()
    language = request.args.get('lang', 'en')
    
    try:
        # Enhanced query with multi-language support
        product_cursor = db.execute('''
            SELECT p.id, p.sku,
                   CASE WHEN ? = 'zh' THEN p.name_zh ELSE p.name_en END as name,
                   CASE WHEN ? = 'zh' THEN p.description_zh ELSE p.description_en END as description,
                   CASE WHEN ? = 'zh' THEN p.specs_zh ELSE p.specs_en END as specs,
                   p.pixel_pitch, p.brightness, p.refresh_rate, p.viewing_angle,
                   p.power_consumption, p.weight, p.dimensions, p.ip_rating,
                   p.price, p.currency, p.is_featured,
                   c.name_en as category_name_en, c.name_zh as category_name_zh
            FROM products p
            LEFT JOIN product_categories c ON p.category_id = c.id
            WHERE p.id = ? AND p.is_active = 1
        ''', (language, language, language, product_id))
        
        product = product_cursor.fetchone()
        if product is None:
            return jsonify({'error': 'Product not found'}), 404
        
        product_dict = dict(product)
        
        # Add category name based on language
        product_dict['category'] = product_dict['category_name_zh'] if language == 'zh' else product_dict['category_name_en']
        del product_dict['category_name_en']
        del product_dict['category_name_zh']
        
        # Get product images
        images_cursor = db.execute('''
            SELECT image_url, 
                   CASE WHEN ? = 'zh' THEN alt_text_zh ELSE alt_text_en END as alt_text,
                   is_primary, sort_order
            FROM product_images 
            WHERE product_id = ? 
            ORDER BY is_primary DESC, sort_order
        ''', (language, product_id))
        
        images = [dict(row) for row in images_cursor.fetchall()]
        product_dict['images'] = images
        
        # Get product applications
        apps_cursor = db.execute('''
            SELECT CASE WHEN ? = 'zh' THEN application_zh ELSE application_en END as application
            FROM product_applications 
            WHERE product_id = ? 
            ORDER BY sort_order
        ''', (language, product_id))
        
        applications = [row[0] for row in apps_cursor.fetchall()]
        product_dict['applications'] = applications
        
        return jsonify(product_dict)
        
    except sqlite3.Error:
        # Fallback to basic query for backward compatibility
        product_cursor = db.execute('SELECT * FROM products WHERE id = ?', (product_id,))
        product = product_cursor.fetchone()
        if product is None:
            return jsonify({'error': 'Product not found'}), 404
        return jsonify(dict(product))

# Security API Endpoints
@app.route('/api/csrf-token', methods=['GET'])
def get_csrf_token():
    """Get CSRF token for client-side use"""
    if SECURITY_CONFIG['CSRF_ENABLED']:
        token = session.get(SECURITY_CONFIG['CSRF_SESSION_KEY'])
        if not token:
            token = generate_csrf_token()
            session[SECURITY_CONFIG['CSRF_SESSION_KEY']] = token
        return jsonify({'csrf_token': token})
    return jsonify({'csrf_token': None})

@app.route('/api/security/log', methods=['POST'])
@csrf_protect
@rate_limit(max_requests=50, window=3600)
def log_security_event():
    """Log security events from client-side"""
    data = request.get_json()
    if not data:
        return jsonify({'error': 'No data provided'}), 400
    
    # Validate and sanitize the security event data
    validation_rules = {
        'type': {'required': True, 'type': 'text', 'max_length': 50},
        'data': {'required': False},
        'timestamp': {'required': True},
        'url': {'required': False, 'type': 'url', 'max_length': 500}
    }
    
    is_valid, errors = validate_input(data, validation_rules)
    if not is_valid:
        return jsonify({'error': 'Validation failed', 'details': errors}), 400
    
    # Sanitize the data
    sanitized_data = sanitize_input(data)
    
    # Log the security event
    security_logger.info(f'Client security event: {sanitized_data["type"]} - {sanitized_data.get("data", {})}')
    
    return jsonify({'success': True, 'message': 'Security event logged'})

# Contact Form Submission
@app.route('/api/contact', methods=['POST'])
@csrf_protect
@rate_limit(max_requests=10, window=3600)
def handle_contact():
    data = request.get_json()
    if not data:
        return jsonify({'error': 'No data provided'}), 400
    
    # Define validation rules
    validation_rules = {
        'name': {'required': True, 'type': 'text', 'min_length': 2, 'max_length': 100},
        'email': {'required': True, 'type': 'email', 'max_length': 255},
        'message': {'required': True, 'min_length': 10, 'max_length': 2000},
        'company': {'required': False, 'max_length': 200},
        'phone': {'required': False, 'type': 'phone', 'max_length': 20},
        'country': {'required': False, 'max_length': 100},
        'product_interest': {'required': False, 'max_length': 200},
        'inquiry_type': {'required': False, 'max_length': 50},
        'budget_range': {'required': False, 'max_length': 50}
    }
    
    # Validate input
    is_valid, errors = validate_input(data, validation_rules)
    if not is_valid:
        security_logger.warning(f'Contact form validation failed: {errors}')
        return jsonify({'error': 'Validation failed', 'details': errors}), 400
    
    # Check for honeypot field (bot detection)
    if data.get('website'):  # Honeypot field
        security_logger.warning(f'Bot detected in contact form from {request.remote_addr}')
        return jsonify({'error': 'Spam detected'}), 400
    
    # Sanitize input data
    sanitized_data = sanitize_input(data)
    
    # Additional email validation
    email_pattern = r'^[^\s@]+@[^\s@]+\.[^\s@]+$'
    if not re.match(email_pattern, sanitized_data.get('email')):
        return jsonify({'error': 'Invalid email format'}), 400
    
    try:
        # Calculate estimated value based on budget range
        estimated_value = None
        budget_range = data.get('budget_range', '')
        budget_mapping = {
            'under-10k': 5000,
            '10k-50k': 30000,
            '50k-100k': 75000,
            '100k-500k': 300000,
            'over-500k': 750000
        }
        estimated_value = budget_mapping.get(budget_range)
        
        # Determine priority based on inquiry type and budget
        priority = 'normal'
        if data.get('inquiry_type') == 'quote' and budget_range in ['100k-500k', 'over-500k']:
            priority = 'high'
        elif data.get('inquiry_type') == 'partnership':
            priority = 'high'
        
        # Prepare inquiry data
        inquiry_data = {
            'name': data.get('name'),
            'email': data.get('email'),
            'company': data.get('company', ''),
            'phone': data.get('phone', ''),
            'country': data.get('country', ''),
            'message': data.get('message'),
            'product_interest': data.get('product_interest', ''),
            'inquiry_type': data.get('inquiry_type', 'general'),
            'language': data.get('language', 'en'),
            'source': data.get('source', 'website'),
            'estimated_value': estimated_value,
            'priority': priority
        }
        
        # Create inquiry using database manager
        inquiry_id = db_manager.create_inquiry(inquiry_data)
        
        # Log the inquiry submission
        db_manager.log_activity(
            user_id=None,
            action='inquiry_submitted',
            table_name='inquiries',
            record_id=inquiry_id,
            new_values=inquiry_data,
            ip_address=request.remote_addr,
            user_agent=request.headers.get('User-Agent', '')
        )
        
        # Send email notifications
        try:
            from email_templates import send_inquiry_notifications
            
            # 发送所有相关的邮件通知
            notification_result = send_inquiry_notifications(data, inquiry_id)
            
            if notification_result['success']:
                print(f"✅ Successfully sent {notification_result['total_sent']} email notifications")
            else:
                print(f"❌ Failed to send some email notifications: {notification_result.get('error', 'Unknown error')}")
            
        except ImportError:
            print("Email templates not available, skipping email notifications")
        except Exception as e:
            print(f"Failed to send email notifications: {e}")
        
        return jsonify({
            'success': True,
            'message': 'Inquiry received successfully! We will contact you within 24 hours.',
            'inquiry_id': inquiry_id
        })
        
    except sqlite3.IntegrityError as e:
        return jsonify({'error': 'Database error occurred. Please try again.'}), 500
    except Exception as e:
        print(f"Contact form error: {e}")
        return jsonify({'error': 'An unexpected error occurred. Please try again later.'}), 500

# --- Admin API Endpoints ---

@app.route('/api/admin/login', methods=['POST'])
def api_admin_login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({'success': False, 'message': 'Username and password are required.'}), 400

    db = get_db()
    user_data = db.execute('SELECT * FROM users WHERE username = ?', (username,)).fetchone()

    if user_data and check_password_hash(user_data['password_hash'], password):
        user = User(id=user_data['id'], username=user_data['username'], password_hash=user_data['password_hash'])
        login_user(user)
        return jsonify({'success': True})
    
    return jsonify({'success': False, 'message': 'Invalid username or password.'}), 401

@app.route('/api/admin/logout')
@login_required
def api_admin_logout():
    logout_user()
    return redirect(url_for('admin_login'))

@app.route('/api/admin/products', methods=['GET', 'POST'])
@login_required
def admin_manage_products():
    db = get_db()
    
    if request.method == 'POST':
        data = request.get_json()
        
        if not data.get('name_en') or not data.get('category_id'):
            return jsonify({'success': False, 'error': 'Missing required fields: name_en, category_id'}), 400
        
        try:
            # Generate SKU if not provided
            sku = data.get('sku')
            if not sku:
                # Generate SKU based on category and timestamp
                category_prefix = 'LED'
                timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
                sku = f"{category_prefix}-{timestamp}"
            
            # Insert product with enhanced schema
            cursor = db.execute('''
                INSERT INTO products (
                    sku, name_en, name_zh, description_en, description_zh,
                    category_id, pixel_pitch, brightness, refresh_rate, viewing_angle,
                    power_consumption, weight, dimensions, ip_rating,
                    price, currency, is_featured, is_active, sort_order, created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
            ''', (
                sku,
                data.get('name_en'),
                data.get('name_zh', ''),
                data.get('description_en', ''),
                data.get('description_zh', ''),
                data.get('category_id'),
                data.get('pixel_pitch', ''),
                data.get('brightness'),
                data.get('refresh_rate'),
                data.get('viewing_angle', ''),
                data.get('power_consumption'),
                data.get('weight'),
                data.get('dimensions', ''),
                data.get('ip_rating', ''),
                data.get('price'),
                data.get('currency', 'USD'),
                data.get('is_featured', 0),
                data.get('is_active', 1),
                data.get('sort_order', 0)
            ))
            
            db.commit()
            new_product_id = cursor.lastrowid
            
            # Get the created product with category info
            new_product = db.execute('''
                SELECT p.*, c.name_en as category_name_en, c.name_zh as category_name_zh
                FROM products p
                LEFT JOIN product_categories c ON p.category_id = c.id
                WHERE p.id = ?
            ''', (new_product_id,)).fetchone()
            
            return jsonify({
                'success': True,
                'product': dict(new_product),
                'message': 'Product created successfully'
            }), 201
            
        except sqlite3.IntegrityError as e:
            if 'UNIQUE constraint failed: products.sku' in str(e):
                return jsonify({'success': False, 'error': 'SKU already exists'}), 400
            return jsonify({'success': False, 'error': 'Database error'}), 500
        except Exception as e:
            return jsonify({'success': False, 'error': str(e)}), 500
    
    # GET request - list products with pagination and filtering
    try:
        page = request.args.get('page', 1, type=int)
        limit = request.args.get('limit', 20, type=int)
        category_id = request.args.get('category_id', type=int)
        active_only = request.args.get('active_only', 'true').lower() == 'true'
        search = request.args.get('search', '')
        
        # Build query
        base_query = '''
            SELECT p.*, c.name_en as category_name_en, c.name_zh as category_name_zh,
                   (SELECT image_url FROM product_images pi WHERE pi.product_id = p.id AND pi.is_primary = 1 LIMIT 1) as primary_image
            FROM products p
            LEFT JOIN product_categories c ON p.category_id = c.id
            WHERE 1=1
        '''
        count_query = 'SELECT COUNT(*) as total FROM products p WHERE 1=1'
        params = []
        
        # Add filters
        if active_only:
            base_query += ' AND p.is_active = 1'
            count_query += ' AND p.is_active = 1'
        
        if category_id:
            base_query += ' AND p.category_id = ?'
            count_query += ' AND p.category_id = ?'
            params.append(category_id)
        
        if search:
            search_condition = ' AND (p.name_en LIKE ? OR p.name_zh LIKE ? OR p.sku LIKE ?)'
            base_query += search_condition
            count_query += search_condition
            search_param = f'%{search}%'
            params.extend([search_param, search_param, search_param])
        
        # Get total count
        total_count = db.execute(count_query, params).fetchone()['total']
        
        # Add pagination
        offset = (page - 1) * limit
        base_query += ' ORDER BY p.sort_order, p.created_at DESC LIMIT ? OFFSET ?'
        params.extend([limit, offset])
        
        # Execute query
        products_cursor = db.execute(base_query, params)
        products = products_cursor.fetchall()
        
        # Format products data
        products_list = []
        for product in products:
            product_dict = dict(product)
            
            # Get product images
            images_cursor = db.execute('''
                SELECT image_url, alt_text_en, is_primary, sort_order
                FROM product_images 
                WHERE product_id = ? 
                ORDER BY is_primary DESC, sort_order
            ''', (product['id'],))
            product_dict['images'] = [dict(img) for img in images_cursor.fetchall()]
            
            products_list.append(product_dict)
        
        return jsonify({
            'success': True,
            'products': products_list,
            'pagination': {
                'current': page,
                'total': total_count,
                'pages': (total_count + limit - 1) // limit,
                'limit': limit
            }
        })
        
    except sqlite3.Error as e:
        # Fallback to basic query for backward compatibility
        products_cursor = db.execute('SELECT * FROM products ORDER BY created_at DESC LIMIT ?', (limit,))
        products = products_cursor.fetchall()
        return jsonify({
            'success': True,
            'products': [dict(row) for row in products],
            'pagination': {'current': 1, 'total': len(products), 'pages': 1, 'limit': limit}
        })

@app.route('/api/admin/products/<int:product_id>', methods=['GET', 'PUT', 'DELETE'])
@login_required
def admin_manage_single_product(product_id):
    db = get_db()
    product = db.execute('SELECT * FROM products WHERE id = ?', (product_id,)).fetchone()
    if product is None:
        return jsonify({'error': 'Product not found'}), 404
    
    if request.method == 'PUT':
        data = request.form
        image = request.files.get('image')
        image_url = product['image_url']
        if image and allowed_file(image.filename):
            filename = secure_filename(image.filename)
            image_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            image.save(image_path)
            image_url = image_path.replace('\\', '/')
        try:
            db.execute(
                'UPDATE products SET name=?, category=?, description=?, specs=?, image_url=? WHERE id=?',
                (data.get('name', product['name']), data.get('category', product['category']),
                 data.get('description', product['description']), data.get('specs', product['specs']),
                 image_url, product_id)
            )
            db.commit()
            updated_product = db.execute('SELECT * FROM products WHERE id = ?', (product_id,)).fetchone()
            return jsonify(dict(updated_product))
        except sqlite3.IntegrityError as e:
            return jsonify({'error': 'Database error', 'message': str(e)}), 500

    if request.method == 'DELETE':
        if product['image_url'] and os.path.exists(product['image_url']):
            os.remove(product['image_url'])
        db.execute('DELETE FROM products WHERE id = ?', (product_id,))
        db.commit()
        return jsonify({'message': 'Product deleted successfully'})

    return jsonify(dict(product))

# --- New Enhanced API Endpoints ---

# Get product categories
@app.route('/api/categories', methods=['GET'])
def get_categories():
    db = get_db()
    language = request.args.get('lang', 'en')
    
    try:
        categories_cursor = db.execute('''
            SELECT id, slug,
                   CASE WHEN ? = 'zh' THEN name_zh ELSE name_en END as name,
                   CASE WHEN ? = 'zh' THEN description_zh ELSE description_en END as description,
                   parent_id, sort_order
            FROM product_categories 
            WHERE is_active = 1 
            ORDER BY sort_order, name
        ''', (language, language))
        
        categories = [dict(row) for row in categories_cursor.fetchall()]
        return jsonify(categories)
        
    except sqlite3.Error:
        # Fallback for basic schema
        return jsonify([
            {'id': 1, 'name': 'Fine Pitch LED', 'slug': 'fine-pitch-led'},
            {'id': 2, 'name': 'Outdoor LED', 'slug': 'outdoor-led'},
            {'id': 3, 'name': 'Rental LED', 'slug': 'rental-led'},
            {'id': 4, 'name': 'Creative LED', 'slug': 'creative-led'},
            {'id': 5, 'name': 'Transparent LED', 'slug': 'transparent-led'}
        ])

# Get page content
@app.route('/api/content/<page_key>', methods=['GET'])
def get_page_content(page_key):
    db = get_db()
    language = request.args.get('lang', 'en')
    
    try:
        content_cursor = db.execute('''
            SELECT section_key,
                   CASE WHEN ? = 'zh' THEN content_zh ELSE content_en END as content,
                   content_type
            FROM page_contents 
            WHERE page_key = ? AND is_active = 1
        ''', (language, page_key))
        
        content_items = content_cursor.fetchall()
        content_dict = {}
        
        for item in content_items:
            content_dict[item['section_key']] = {
                'content': item['content'],
                'type': item['content_type']
            }
        
        return jsonify(content_dict)
        
    except sqlite3.Error:
        return jsonify({'error': 'Content not found'}), 404

# Get news articles
@app.route('/api/news', methods=['GET'])
def get_news():
    db = get_db()
    language = request.args.get('lang', 'en')
    limit = request.args.get('limit', 10, type=int)
    featured_only = request.args.get('featured', 'false').lower() == 'true'
    
    try:
        query = '''
            SELECT id,
                   CASE WHEN ? = 'zh' THEN title_zh ELSE title_en END as title,
                   CASE WHEN ? = 'zh' THEN excerpt_zh ELSE excerpt_en END as excerpt,
                   CASE WHEN ? = 'zh' THEN slug_zh ELSE slug_en END as slug,
                   featured_image, category, published_at, is_featured
            FROM news_articles 
            WHERE is_published = 1
        '''
        
        params = [language, language, language]
        
        if featured_only:
            query += ' AND is_featured = 1'
        
        query += ' ORDER BY published_at DESC LIMIT ?'
        params.append(limit)
        
        news_cursor = db.execute(query, params)
        news_list = [dict(row) for row in news_cursor.fetchall()]
        
        return jsonify(news_list)
        
    except sqlite3.Error:
        return jsonify([])

# Get case studies
@app.route('/api/cases', methods=['GET'])
def get_cases():
    db = get_db()
    language = request.args.get('lang', 'en')
    limit = request.args.get('limit', 12, type=int)
    featured_only = request.args.get('featured', 'false').lower() == 'true'
    
    try:
        query = '''
            SELECT id,
                   CASE WHEN ? = 'zh' THEN title_zh ELSE title_en END as title,
                   CASE WHEN ? = 'zh' THEN description_zh ELSE description_en END as description,
                   CASE WHEN ? = 'zh' THEN slug_zh ELSE slug_en END as slug,
                   client, location, country, project_date, featured_image, 
                   industry, is_featured
            FROM cases 
            WHERE is_published = 1
        '''
        
        params = [language, language, language]
        
        if featured_only:
            query += ' AND is_featured = 1'
        
        query += ' ORDER BY project_date DESC LIMIT ?'
        params.append(limit)
        
        cases_cursor = db.execute(query, params)
        cases_list = [dict(row) for row in cases_cursor.fetchall()]
        
        return jsonify(cases_list)
        
    except sqlite3.Error:
        # Fallback to basic cases table
        cases_cursor = db.execute('SELECT * FROM cases ORDER BY created_at DESC LIMIT ?', (limit,))
        cases = cases_cursor.fetchall()
        return jsonify([dict(row) for row in cases])

# Search products
@app.route('/api/search', methods=['GET'])
def search_products():
    db = get_db()
    query = request.args.get('q', '').strip()
    language = request.args.get('lang', 'en')
    
    if not query:
        return jsonify([])
    
    try:
        search_cursor = db.execute('''
            SELECT p.id, p.sku,
                   CASE WHEN ? = 'zh' THEN p.name_zh ELSE p.name_en END as name,
                   CASE WHEN ? = 'zh' THEN p.description_zh ELSE p.description_en END as description,
                   p.pixel_pitch, pi.image_url
            FROM products p
            LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.is_primary = 1
            WHERE p.is_active = 1 AND (
                (? = 'zh' AND (p.name_zh LIKE ? OR p.description_zh LIKE ?)) OR
                (? = 'en' AND (p.name_en LIKE ? OR p.description_en LIKE ?)) OR
                p.sku LIKE ? OR p.pixel_pitch LIKE ?
            )
            ORDER BY 
                CASE WHEN p.sku LIKE ? THEN 1
                     WHEN (? = 'zh' AND p.name_zh LIKE ?) THEN 2
                     WHEN (? = 'en' AND p.name_en LIKE ?) THEN 2
                     ELSE 3 END,
                p.name_en
            LIMIT 20
        ''', (
            language, language,
            language, f'%{query}%', f'%{query}%',
            language, f'%{query}%', f'%{query}%',
            f'%{query}%', f'%{query}%',
            f'%{query}%',
            language, f'%{query}%',
            language, f'%{query}%'
        ))
        
        results = [dict(row) for row in search_cursor.fetchall()]
        return jsonify(results)
        
    except sqlite3.Error:
        return jsonify([])

@app.route('/api/admin/inquiries', methods=['GET'])
@login_required
def admin_get_inquiries():
    """Get inquiries with pagination and filtering"""
    db = get_db()
    
    # Get parameters
    page = request.args.get('page', 1, type=int)
    limit = request.args.get('limit', 20, type=int)
    status = request.args.get('status', '')
    priority = request.args.get('priority', '')
    inquiry_type = request.args.get('type', '')
    search = request.args.get('search', '')
    
    try:
        # Build base query
        base_query = '''
            SELECT i.*, 
                   CASE WHEN i.estimated_value IS NOT NULL THEN i.estimated_value ELSE 0 END as est_value
            FROM inquiries i
            WHERE 1=1
        '''
        count_query = 'SELECT COUNT(*) as total FROM inquiries i WHERE 1=1'
        params = []
        
        # Add filters
        if status:
            base_query += ' AND i.status = ?'
            count_query += ' AND i.status = ?'
            params.append(status)
        
        if priority:
            base_query += ' AND i.priority = ?'
            count_query += ' AND i.priority = ?'
            params.append(priority)
        
        if inquiry_type:
            base_query += ' AND i.inquiry_type = ?'
            count_query += ' AND i.inquiry_type = ?'
            params.append(inquiry_type)
        
        if search:
            search_condition = ' AND (i.name LIKE ? OR i.email LIKE ? OR i.company LIKE ?)'
            base_query += search_condition
            count_query += search_condition
            search_param = f'%{search}%'
            params.extend([search_param, search_param, search_param])
        
        # Get total count
        total_count = db.execute(count_query, params).fetchone()['total']
        
        # Add pagination
        offset = (page - 1) * limit
        base_query += ' ORDER BY i.created_at DESC LIMIT ? OFFSET ?'
        params.extend([limit, offset])
        
        # Execute query
        inquiries_cursor = db.execute(base_query, params)
        inquiries = inquiries_cursor.fetchall()
        
        # Calculate pagination info
        total_pages = (total_count + limit - 1) // limit
        
        return jsonify({
            'inquiries': [dict(row) for row in inquiries],
            'pagination': {
                'current': page,
                'pages': total_pages,
                'total': total_count,
                'limit': limit
            },
            'total': total_count
        })
        
    except sqlite3.Error as e:
        # Fallback to basic query for backward compatibility
        inquiries_cursor = db.execute('SELECT * FROM inquiries ORDER BY created_at DESC LIMIT ?', (limit,))
        inquiries = inquiries_cursor.fetchall()
        return jsonify([dict(row) for row in inquiries])

# --- Admin Panel ---
@app.route('/admin/login')
def admin_login():
    if current_user.is_authenticated:
        return redirect(url_for('admin_dashboard'))
    return render_template('admin/templates/login.html')

@app.route('/admin')
@app.route('/admin/dashboard')
@login_required
def admin_dashboard():
    return render_template('admin/templates/dashboard.html')

@app.route('/admin/products')
@login_required
def admin_products():
    return render_template('admin/templates/products.html')

@app.route('/admin/inquiries')
@login_required
def admin_inquiries():
    return render_template('admin/templates/inquiries.html')

# --- Enhanced Admin API Endpoints ---

@app.route('/api/admin/dashboard/stats', methods=['GET'])
@login_required
def get_dashboard_stats():
    """Get comprehensive dashboard statistics"""
    db = get_db()
    
    try:
        # Product statistics
        total_products = db.execute('SELECT COUNT(*) as count FROM products').fetchone()['count']
        active_products = db.execute('SELECT COUNT(*) as count FROM products WHERE is_active = 1').fetchone()['count']
        featured_products = db.execute('SELECT COUNT(*) as count FROM products WHERE is_featured = 1').fetchone()['count']
        
        # Inquiry statistics
        total_inquiries = db.execute('SELECT COUNT(*) as count FROM inquiries').fetchone()['count']
        new_inquiries = db.execute('''
            SELECT COUNT(*) as count FROM inquiries 
            WHERE created_at >= datetime('now', '-7 days') AND status = 'new'
        ''').fetchone()['count']
        
        pending_inquiries = db.execute('''
            SELECT COUNT(*) as count FROM inquiries 
            WHERE status IN ('new', 'contacted')
        ''').fetchone()['count']
        
        high_priority = db.execute('''
            SELECT COUNT(*) as count FROM inquiries 
            WHERE priority = 'high' AND status NOT IN ('closed', 'lost')
        ''').fetchone()['count']
        
        # Monthly statistics
        monthly_inquiries = db.execute('''
            SELECT COUNT(*) as count FROM inquiries 
            WHERE created_at >= datetime('now', 'start of month')
        ''').fetchone()['count']
        
        # Today's statistics
        today_inquiries = db.execute('''
            SELECT COUNT(*) as count FROM inquiries 
            WHERE DATE(created_at) = DATE('now')
        ''').fetchone()['count']
        
        # Conversion statistics
        quoted_inquiries = db.execute('''
            SELECT COUNT(*) as count FROM inquiries WHERE status = 'quoted'
        ''').fetchone()['count']
        
        closed_inquiries = db.execute('''
            SELECT COUNT(*) as count FROM inquiries WHERE status = 'closed'
        ''').fetchone()['count']
        
        conversion_rate = (closed_inquiries / total_inquiries * 100) if total_inquiries > 0 else 0
        
        # Response time statistics
        avg_response_time = db.execute('''
            SELECT AVG(
                CASE 
                    WHEN first_response_at IS NOT NULL 
                    THEN (julianday(first_response_at) - julianday(created_at)) * 24 
                    ELSE NULL 
                END
            ) as avg_hours
            FROM inquiries 
            WHERE first_response_at IS NOT NULL
        ''').fetchone()['avg_hours'] or 0
        
        # Recent activity
        recent_activity = db.execute('''
            SELECT 
                'inquiry' as type,
                name as title,
                created_at as timestamp,
                'New inquiry from ' || name as description
            FROM inquiries 
            WHERE created_at >= datetime('now', '-24 hours')
            ORDER BY created_at DESC 
            LIMIT 5
        ''').fetchall()
        
        return jsonify({
            'products': {
                'total': total_products,
                'active': active_products,
                'featured': featured_products,
                'inactive': total_products - active_products
            },
            'inquiries': {
                'total': total_inquiries,
                'new': new_inquiries,
                'pending': pending_inquiries,
                'high_priority': high_priority,
                'monthly': monthly_inquiries,
                'today': today_inquiries,
                'quoted': quoted_inquiries,
                'closed': closed_inquiries,
                'conversion_rate': round(conversion_rate, 1)
            },
            'performance': {
                'avg_response_time': round(avg_response_time, 1)
            },
            'recent_activity': [dict(row) for row in recent_activity]
        })
        
    except sqlite3.Error as e:
        return jsonify({'error': 'Database error', 'message': str(e)}), 500

@app.route('/api/admin/dashboard/charts', methods=['GET'])
@login_required
def get_dashboard_charts():
    """Get chart data for dashboard"""
    db = get_db()
    
    try:
        # Inquiry trend (last 7 days)
        inquiry_trend = db.execute('''
            SELECT DATE(created_at) as date, COUNT(*) as count
            FROM inquiries 
            WHERE created_at >= datetime('now', '-7 days')
            GROUP BY DATE(created_at)
            ORDER BY date
        ''').fetchall()
        
        # Product categories
        product_categories = db.execute('''
            SELECT c.name_en as category, COUNT(p.id) as count
            FROM product_categories c
            LEFT JOIN products p ON c.id = p.category_id AND p.is_active = 1
            GROUP BY c.id, c.name_en
            ORDER BY count DESC
        ''').fetchall()
        
        # Inquiry types
        inquiry_types = db.execute('''
            SELECT inquiry_type, COUNT(*) as count
            FROM inquiries 
            WHERE created_at >= datetime('now', '-30 days')
            GROUP BY inquiry_type
            ORDER BY count DESC
        ''').fetchall()
        
        return jsonify({
            'inquiry_trend': {
                'labels': [row['date'] for row in inquiry_trend],
                'data': [row['count'] for row in inquiry_trend]
            },
            'product_categories': {
                'labels': [row['category'] for row in product_categories],
                'data': [row['count'] for row in product_categories]
            },
            'inquiry_types': {
                'labels': [row['inquiry_type'] for row in inquiry_types],
                'data': [row['count'] for row in inquiry_types]
            }
        })
        
    except sqlite3.Error as e:
        return jsonify({'error': 'Database error'}), 500

@app.route('/api/admin/inquiries/<int:inquiry_id>', methods=['GET'])
@login_required
def get_inquiry_detail(inquiry_id):
    """Get detailed inquiry information with follow-up history"""
    db = get_db()
    
    try:
        # Get inquiry details
        inquiry = db.execute('''
            SELECT i.*, u.username as assigned_user
            FROM inquiries i
            LEFT JOIN users u ON i.assigned_to = u.id
            WHERE i.id = ?
        ''', (inquiry_id,)).fetchone()
        
        if not inquiry:
            return jsonify({'success': False, 'error': 'Inquiry not found'}), 404
        
        inquiry_dict = dict(inquiry)
        
        # Get follow-up history
        followups = db.execute('''
            SELECT f.*, u.username
            FROM inquiry_followups f
            LEFT JOIN users u ON f.user_id = u.id
            WHERE f.inquiry_id = ?
            ORDER BY f.created_at DESC
        ''', (inquiry_id,)).fetchall()
        
        inquiry_dict['followups'] = [dict(row) for row in followups]
        
        return jsonify({
            'success': True,
            'inquiry': inquiry_dict
        })
        
    except sqlite3.Error as e:
        return jsonify({'success': False, 'error': 'Database error'}), 500

@app.route('/api/admin/inquiries/<int:inquiry_id>/followup', methods=['POST'])
@login_required
def add_inquiry_followup(inquiry_id):
    """Add follow-up to an inquiry"""
    data = request.get_json()
    
    if not data or not data.get('action_type') or not data.get('notes'):
        return jsonify({'success': False, 'error': 'Missing required fields'}), 400
    
    db = get_db()
    
    try:
        # Verify inquiry exists
        inquiry = db.execute('SELECT id FROM inquiries WHERE id = ?', (inquiry_id,)).fetchone()
        if not inquiry:
            return jsonify({'success': False, 'error': 'Inquiry not found'}), 404
        
        # Insert follow-up
        db.execute('''
            INSERT INTO inquiry_followups 
            (inquiry_id, user_id, action_type, subject, notes, next_action, next_action_date, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))
        ''', (
            inquiry_id,
            current_user.id,
            data.get('action_type'),
            data.get('subject', ''),
            data.get('notes'),
            data.get('next_action', ''),
            data.get('next_action_date', None)
        ))
        
        # Update inquiry last_activity
        db.execute('''
            UPDATE inquiries 
            SET last_activity = datetime('now')
            WHERE id = ?
        ''', (inquiry_id,))
        
        db.commit()
        
        return jsonify({'success': True, 'message': 'Follow-up added successfully'})
        
    except sqlite3.Error as e:
        return jsonify({'success': False, 'error': 'Database error'}), 500

@app.route('/api/admin/inquiries/<int:inquiry_id>/status', methods=['PUT'])
@login_required
def update_inquiry_status(inquiry_id):
    """Update inquiry status"""
    data = request.get_json()
    
    if not data or not data.get('status'):
        return jsonify({'success': False, 'error': 'Status is required'}), 400
    
    valid_statuses = ['new', 'contacted', 'quoted', 'closed', 'lost']
    if data.get('status') not in valid_statuses:
        return jsonify({'success': False, 'error': 'Invalid status'}), 400
    
    db = get_db()
    
    try:
        # Update inquiry
        db.execute('''
            UPDATE inquiries 
            SET status = ?, priority = ?, assigned_to = ?, last_activity = datetime('now')
            WHERE id = ?
        ''', (
            data.get('status'),
            data.get('priority', 'normal'),
            data.get('assigned_to') if data.get('assigned_to') else None,
            inquiry_id
        ))
        
        # Add automatic follow-up entry
        db.execute('''
            INSERT INTO inquiry_followups 
            (inquiry_id, user_id, action_type, notes, created_at)
            VALUES (?, ?, 'status_change', ?, datetime('now'))
        ''', (
            inquiry_id,
            current_user.id,
            f"Status changed to {data.get('status')}"
        ))
        
        db.commit()
        
        return jsonify({'success': True, 'message': 'Inquiry updated successfully'})
        
    except sqlite3.Error as e:
        return jsonify({'success': False, 'error': 'Database error'}), 500



@app.route('/api/admin/dashboard-stats', methods=['GET'])
@login_required
def get_admin_dashboard_stats():
    """Get statistics for inquiry management page"""
    db = get_db()
    
    try:
        # Get inquiry counts by status
        new_inquiries = db.execute('''
            SELECT COUNT(*) as count FROM inquiries WHERE status = 'new'
        ''').fetchone()['count']
        
        contacted_inquiries = db.execute('''
            SELECT COUNT(*) as count FROM inquiries WHERE status IN ('contacted', 'quoted')
        ''').fetchone()['count']
        
        high_priority = db.execute('''
            SELECT COUNT(*) as count FROM inquiries 
            WHERE priority = 'high' AND status NOT IN ('closed', 'lost')
        ''').fetchone()['count']
        
        closed_inquiries = db.execute('''
            SELECT COUNT(*) as count FROM inquiries WHERE status = 'closed'
        ''').fetchone()['count']
        
        return jsonify({
            'success': True,
            'stats': {
                'new_inquiries': new_inquiries,
                'contacted_inquiries': contacted_inquiries,
                'high_priority': high_priority,
                'closed_inquiries': closed_inquiries
            }
        })
        
    except sqlite3.Error as e:
        return jsonify({'success': False, 'error': 'Database error'}), 500

@app.route('/api/admin/users', methods=['GET'])
@login_required
def get_admin_users():
    """Get list of admin users for assignment"""
    db = get_db()
    
    try:
        users = db.execute('''
            SELECT id, username, email, role
            FROM users 
            WHERE is_active = 1 AND role IN ('admin', 'manager')
            ORDER BY username
        ''').fetchall()
        
        return jsonify({
            'success': True,
            'users': [dict(row) for row in users]
        })
        
    except sqlite3.Error as e:
        return jsonify({'success': False, 'error': 'Database error'}), 500

# Enhanced product management endpoints
@app.route('/api/product-categories', methods=['GET'])
def get_product_categories():
    """Get product categories for admin and public use"""
    db = get_db()
    
    try:
        categories = db.execute('''
            SELECT id, name_en, name_zh, slug, parent_id, sort_order
            FROM product_categories 
            WHERE is_active = 1
            ORDER BY sort_order, name_en
        ''').fetchall()
        
        return jsonify({
            'success': True,
            'categories': [dict(row) for row in categories]
        })
        
    except sqlite3.Error:
        # Fallback for basic schema
        return jsonify({
            'success': True,
            'categories': [
                {'id': 1, 'name_en': 'Fine Pitch LED', 'slug': 'fine-pitch-led'},
                {'id': 2, 'name_en': 'Outdoor LED', 'slug': 'outdoor-led'},
                {'id': 3, 'name_en': 'Rental LED', 'slug': 'rental-led'},
                {'id': 4, 'name_en': 'Creative LED', 'slug': 'creative-led'},
                {'id': 5, 'name_en': 'Transparent LED', 'slug': 'transparent-led'}
            ]
        })

@app.route('/api/admin/products/bulk', methods=['POST'])
@login_required
def bulk_update_products():
    """Enhanced bulk update products with validation and logging"""
    data = request.get_json()
    
    if not data or not data.get('product_ids') or not data.get('action'):
        return jsonify({'success': False, 'error': 'Missing required fields'}), 400
    
    db = get_db()
    product_ids = data.get('product_ids')
    action = data.get('action')
    
    # Validate product IDs
    if not isinstance(product_ids, list) or len(product_ids) == 0:
        return jsonify({'success': False, 'error': 'Invalid product IDs'}), 400
    
    # Validate that all product IDs exist
    placeholders = ','.join(['?'] * len(product_ids))
    existing_products = db.execute(f'''
        SELECT id, name_en FROM products WHERE id IN ({placeholders})
    ''', product_ids).fetchall()
    
    if len(existing_products) != len(product_ids):
        return jsonify({'success': False, 'error': 'Some products not found'}), 400
    
    try:
        updated_count = 0
        
        if action == 'activate':
            cursor = db.execute(f'''
                UPDATE products 
                SET is_active = 1, updated_at = datetime('now')
                WHERE id IN ({placeholders}) AND is_active = 0
            ''', product_ids)
            updated_count = cursor.rowcount
            
        elif action == 'deactivate':
            cursor = db.execute(f'''
                UPDATE products 
                SET is_active = 0, updated_at = datetime('now')
                WHERE id IN ({placeholders}) AND is_active = 1
            ''', product_ids)
            updated_count = cursor.rowcount
            
        elif action == 'feature':
            cursor = db.execute(f'''
                UPDATE products 
                SET is_featured = 1, updated_at = datetime('now')
                WHERE id IN ({placeholders}) AND is_featured = 0
            ''', product_ids)
            updated_count = cursor.rowcount
            
        elif action == 'unfeature':
            cursor = db.execute(f'''
                UPDATE products 
                SET is_featured = 0, updated_at = datetime('now')
                WHERE id IN ({placeholders}) AND is_featured = 1
            ''', product_ids)
            updated_count = cursor.rowcount
            
        elif action == 'delete':
            # Soft delete - mark as inactive and set deleted timestamp
            cursor = db.execute(f'''
                UPDATE products 
                SET is_active = 0, deleted_at = datetime('now'), updated_at = datetime('now')
                WHERE id IN ({placeholders}) AND deleted_at IS NULL
            ''', product_ids)
            updated_count = cursor.rowcount
            
        elif action == 'update_category':
            category_id = data.get('category_id')
            if not category_id:
                return jsonify({'success': False, 'error': 'Category ID required for category update'}), 400
            
            cursor = db.execute(f'''
                UPDATE products 
                SET category_id = ?, updated_at = datetime('now')
                WHERE id IN ({placeholders})
            ''', [category_id] + product_ids)
            updated_count = cursor.rowcount
            
        elif action == 'update_price':
            price_adjustment = data.get('price_adjustment', {})
            adjustment_type = price_adjustment.get('type')  # 'percentage' or 'fixed'
            adjustment_value = price_adjustment.get('value', 0)
            
            if adjustment_type == 'percentage':
                cursor = db.execute(f'''
                    UPDATE products 
                    SET price = price * (1 + ? / 100.0), updated_at = datetime('now')
                    WHERE id IN ({placeholders}) AND price IS NOT NULL
                ''', [adjustment_value] + product_ids)
            elif adjustment_type == 'fixed':
                cursor = db.execute(f'''
                    UPDATE products 
                    SET price = price + ?, updated_at = datetime('now')
                    WHERE id IN ({placeholders}) AND price IS NOT NULL
                ''', [adjustment_value] + product_ids)
            else:
                return jsonify({'success': False, 'error': 'Invalid price adjustment type'}), 400
            
            updated_count = cursor.rowcount
            
        else:
            return jsonify({'success': False, 'error': 'Invalid action'}), 400
        
        db.commit()
        
        # Log the bulk operation
        try:
            db_manager.log_activity(
                user_id=current_user.id if hasattr(current_user, 'id') else None,
                action=f'bulk_{action}',
                table_name='products',
                record_id=None,
                new_values={'product_ids': product_ids, 'action': action},
                ip_address=request.remote_addr,
                user_agent=request.headers.get('User-Agent', '')
            )
        except:
            pass  # Don't fail the operation if logging fails
        
        return jsonify({
            'success': True,
            'message': f'Successfully {action}d {updated_count} of {len(product_ids)} products',
            'updated_count': updated_count,
            'total_selected': len(product_ids)
        })
        
    except sqlite3.Error as e:
        return jsonify({'success': False, 'error': 'Database error'}), 500
        
        db.commit()
        
        return jsonify({'message': f'{len(inquiry_ids)} inquiries updated successfully'})
        
    except sqlite3.Error as e:
        return jsonify({'error': 'Database error'}), 500

@app.route('/api/admin/inquiries/export', methods=['GET'])
@login_required
def export_inquiries():
    """Export inquiries to CSV"""
    import csv
    import io
    
    # Get filter parameters
    status = request.args.get('status', '')
    priority = request.args.get('priority', '')
    inquiry_type = request.args.get('type', '')
    search = request.args.get('search', '')
    
    db = get_db()
    
    try:
        # Build query with filters
        query = '''
            SELECT i.id, i.name, i.email, i.company, i.phone, i.country,
                   i.product_interest, i.inquiry_type, i.status, i.priority,
                   i.message, i.created_at, i.estimated_value
            FROM inquiries i
            WHERE 1=1
        '''
        params = []
        
        if status:
            query += ' AND i.status = ?'
            params.append(status)
        
        if priority:
            query += ' AND i.priority = ?'
            params.append(priority)
        
        if inquiry_type:
            query += ' AND i.inquiry_type = ?'
            params.append(inquiry_type)
        
        if search:
            query += ' AND (i.name LIKE ? OR i.email LIKE ? OR i.company LIKE ?)'
            search_param = f'%{search}%'
            params.extend([search_param, search_param, search_param])
        
        query += ' ORDER BY i.created_at DESC'
        
        inquiries = db.execute(query, params).fetchall()
        
        # Create CSV
        output = io.StringIO()
        writer = csv.writer(output)
        
        # Write header
        writer.writerow([
            'ID', 'Name', 'Email', 'Company', 'Phone', 'Country',
            'Product Interest', 'Inquiry Type', 'Status', 'Priority',
            'Message', 'Created At', 'Estimated Value'
        ])
        
        # Write data
        for inquiry in inquiries:
            writer.writerow([
                inquiry['id'], inquiry['name'], inquiry['email'],
                inquiry['company'] or '', inquiry['phone'] or '',
                inquiry['country'] or '', inquiry['product_interest'] or '',
                inquiry['inquiry_type'], inquiry['status'], inquiry['priority'] or '',
                inquiry['message'], inquiry['created_at'],
                inquiry['estimated_value'] or ''
            ])
        
        # Return CSV response
        output.seek(0)
        return Response(
            output.getvalue(),
            mimetype='text/csv',
            headers={
                'Content-Disposition': f'attachment; filename=inquiries_{datetime.now().strftime("%Y%m%d")}.csv'
            }
        )
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/admin/static/<path:filename>')
def serve_admin_static(filename):
    return send_from_directory('admin/static', filename)

@app.route('/api/cases', methods=['GET'])
def api_get_cases():
    """获取案例列表API"""
    try:
        featured_only = request.args.get('featured', 'false').lower() == 'true'
        limit = request.args.get('limit', type=int)
        
        cases = db_manager.get_cases(
            featured_only=featured_only,
            limit=limit
        )
        
        return jsonify({
            'success': True,
            'cases': cases,
            'count': len(cases)
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/page-content/<page_key>', methods=['GET'])
def api_get_page_content(page_key):
    """获取页面内容API"""
    try:
        section_key = request.args.get('section_key')
        content = db_manager.get_page_content(page_key, section_key)
        
        return jsonify({
            'success': True,
            'content': content
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/settings/public', methods=['GET'])
def api_get_public_settings():
    """获取公开设置API"""
    try:
        settings = db_manager.get_public_settings()
        return jsonify({
            'success': True,
            'settings': settings
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/admin/dashboard-stats', methods=['GET'])
@login_required
def api_get_dashboard_stats():
    """获取仪表板统计数据API"""
    try:
        stats = db_manager.get_dashboard_stats()
        return jsonify({
            'success': True,
            'stats': stats
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/admin/inquiries', methods=['GET'])
@login_required
def api_get_inquiries():
    """获取询盘列表API"""
    try:
        status = request.args.get('status')
        limit = request.args.get('limit', type=int)
        
        inquiries = db_manager.get_inquiries(status=status, limit=limit)
        
        return jsonify({
            'success': True,
            'inquiries': inquiries,
            'count': len(inquiries)
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/admin/inquiries/<int:inquiry_id>', methods=['GET'])
@login_required
def api_get_inquiry(inquiry_id):
    """获取单个询盘API"""
    try:
        inquiry = db_manager.get_inquiry_by_id(inquiry_id)
        if not inquiry:
            return jsonify({'success': False, 'error': 'Inquiry not found'}), 404
        
        return jsonify({
            'success': True,
            'inquiry': inquiry
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

# Enhanced file upload with security and optimization
@app.route('/api/admin/upload', methods=['POST'])
@login_required
@csrf_protect
@rate_limit(max_requests=20, window=3600)
def admin_upload_file():
    """Enhanced secure file upload with validation and optimization"""
    if 'file' not in request.files:
        return jsonify({'success': False, 'error': 'No file provided'}), 400
    
    file = request.files['file']
    
    # Comprehensive file validation
    is_valid, error_message = validate_file_upload(file)
    if not is_valid:
        security_logger.warning(f'File upload validation failed: {error_message} from {request.remote_addr}')
        return jsonify({'success': False, 'error': error_message}), 400
    
    try:
        # Read file content for validation
        file_content = file.read()
        file.seek(0)  # Reset for saving
        
        # Validate file signature (magic bytes)
        if not validate_image_signature(file_content):
            return jsonify({'success': False, 'error': 'Invalid file format or corrupted file'}), 400
        
        # Generate secure filename
        original_filename = secure_filename(file.filename)
        file_extension = original_filename.rsplit('.', 1)[1].lower()
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S_')
        unique_id = str(uuid.uuid4())[:8]
        filename = f"{timestamp}{unique_id}.{file_extension}"
        
        # Create upload directory structure
        upload_date = datetime.now().strftime('%Y/%m')
        upload_path = os.path.join(app.config['UPLOAD_FOLDER'], upload_date)
        os.makedirs(upload_path, exist_ok=True)
        
        # Save original file
        file_path = os.path.join(upload_path, filename)
        file.save(file_path)
        
        # Generate optimized versions for images
        optimized_files = {}
        if file_extension in ['jpg', 'jpeg', 'png']:
            try:
                from PIL import Image
                
                # Open and optimize image
                with Image.open(file_path) as img:
                    # Convert RGBA to RGB for JPEG
                    if file_extension in ['jpg', 'jpeg'] and img.mode in ('RGBA', 'LA', 'P'):
                        background = Image.new('RGB', img.size, (255, 255, 255))
                        if img.mode == 'P':
                            img = img.convert('RGBA')
                        background.paste(img, mask=img.split()[-1] if img.mode == 'RGBA' else None)
                        img = background
                    
                    # Generate thumbnail (300x300)
                    thumb_filename = f"{timestamp}{unique_id}_thumb.{file_extension}"
                    thumb_path = os.path.join(upload_path, thumb_filename)
                    img_thumb = img.copy()
                    img_thumb.thumbnail((300, 300), Image.Resampling.LANCZOS)
                    img_thumb.save(thumb_path, optimize=True, quality=85)
                    optimized_files['thumbnail'] = f"assets/uploads/{upload_date}/{thumb_filename}"
                    
                    # Generate medium size (800x600)
                    medium_filename = f"{timestamp}{unique_id}_medium.{file_extension}"
                    medium_path = os.path.join(upload_path, medium_filename)
                    img_medium = img.copy()
                    img_medium.thumbnail((800, 600), Image.Resampling.LANCZOS)
                    img_medium.save(medium_path, optimize=True, quality=90)
                    optimized_files['medium'] = f"assets/uploads/{upload_date}/{medium_filename}"
                    
                    # Optimize original
                    img.save(file_path, optimize=True, quality=95)
                    
            except ImportError:
                # PIL not available, skip optimization
                pass
            except Exception as e:
                # Optimization failed, but original file is saved
                print(f"Image optimization failed: {e}")
        
        # Return relative path for database storage
        relative_path = f"assets/uploads/{upload_date}/{filename}"
        
        # Log the upload
        try:
            db_manager.log_activity(
                user_id=current_user.id if hasattr(current_user, 'id') else None,
                action='file_upload',
                table_name='files',
                record_id=None,
                new_values={
                    'filename': filename,
                    'original_filename': original_filename,
                    'file_size': file_size,
                    'file_type': file_extension
                },
                ip_address=request.remote_addr,
                user_agent=request.headers.get('User-Agent', '')
            )
        except:
            pass  # Don't fail upload if logging fails
        
        return jsonify({
            'success': True,
            'filename': filename,
            'original_filename': original_filename,
            'path': relative_path,
            'url': f"/{relative_path}",
            'file_size': file_size,
            'optimized_versions': optimized_files
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': f'Upload failed: {str(e)}'}), 500

def validate_image_signature(file_content):
    """Validate file signature (magic bytes) for common image formats"""
    if not file_content:
        return False
    
    # Common image file signatures
    signatures = {
        b'\xFF\xD8\xFF': 'jpeg',
        b'\x89PNG\r\n\x1a\n': 'png',
        b'GIF87a': 'gif',
        b'GIF89a': 'gif',
    }
    
    for signature, file_type in signatures.items():
        if file_content.startswith(signature):
            return True
    
    return False

# Enhanced inquiry management endpoints
@app.route('/api/admin/inquiries/<int:inquiry_id>/reply', methods=['POST'])
@login_required
def reply_to_inquiry(inquiry_id):
    """Send reply to inquiry and update status"""
    data = request.get_json()
    
    if not data or not data.get('message'):
        return jsonify({'success': False, 'error': 'Reply message is required'}), 400
    
    db = get_db()
    
    try:
        # Get inquiry details
        inquiry = db.execute('SELECT * FROM inquiries WHERE id = ?', (inquiry_id,)).fetchone()
        if not inquiry:
            return jsonify({'success': False, 'error': 'Inquiry not found'}), 404
        
        # Add follow-up record
        db.execute('''
            INSERT INTO inquiry_followups (
                inquiry_id, user_id, action_type, subject, notes, 
                next_action, next_action_date, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))
        ''', (
            inquiry_id,
            current_user.id if hasattr(current_user, 'id') else None,
            'email_reply',
            data.get('subject', 'Reply to your inquiry'),
            data.get('message'),
            data.get('next_action'),
            data.get('next_action_date'),
        ))
        
        # Update inquiry status and first response time
        new_status = data.get('status', 'contacted')
        db.execute('''
            UPDATE inquiries 
            SET status = ?, 
                first_response_at = COALESCE(first_response_at, datetime('now')),
                last_contact_at = datetime('now'),
                updated_at = datetime('now')
            WHERE id = ?
        ''', (new_status, inquiry_id))
        
        db.commit()
        
        # Here you would integrate with email service to actually send the email
        # For now, we'll just log the action
        
        return jsonify({
            'success': True,
            'message': 'Reply sent successfully',
            'inquiry_id': inquiry_id
        })
        
    except sqlite3.Error as e:
        return jsonify({'success': False, 'error': 'Database error'}), 500

@app.route('/api/admin/inquiries/bulk-update', methods=['POST'])
@login_required
def bulk_update_inquiries():
    """Bulk update inquiry status, priority, or assignment"""
    data = request.get_json()
    
    if not data or not data.get('inquiry_ids') or not data.get('action'):
        return jsonify({'success': False, 'error': 'Missing required fields'}), 400
    
    db = get_db()
    inquiry_ids = data.get('inquiry_ids')
    action = data.get('action')
    
    # Validate inquiry IDs
    if not isinstance(inquiry_ids, list) or len(inquiry_ids) == 0:
        return jsonify({'success': False, 'error': 'Invalid inquiry IDs'}), 400
    
    try:
        placeholders = ','.join(['?'] * len(inquiry_ids))
        updated_count = 0
        
        if action == 'update_status':
            new_status = data.get('status')
            if not new_status:
                return jsonify({'success': False, 'error': 'Status is required'}), 400
            
            cursor = db.execute(f'''
                UPDATE inquiries 
                SET status = ?, updated_at = datetime('now')
                WHERE id IN ({placeholders})
            ''', [new_status] + inquiry_ids)
            updated_count = cursor.rowcount
            
        elif action == 'update_priority':
            new_priority = data.get('priority')
            if not new_priority:
                return jsonify({'success': False, 'error': 'Priority is required'}), 400
            
            cursor = db.execute(f'''
                UPDATE inquiries 
                SET priority = ?, updated_at = datetime('now')
                WHERE id IN ({placeholders})
            ''', [new_priority] + inquiry_ids)
            updated_count = cursor.rowcount
            
        elif action == 'assign':
            assigned_to = data.get('assigned_to')
            cursor = db.execute(f'''
                UPDATE inquiries 
                SET assigned_to = ?, updated_at = datetime('now')
                WHERE id IN ({placeholders})
            ''', [assigned_to] + inquiry_ids)
            updated_count = cursor.rowcount
            
        elif action == 'add_tag':
            tag = data.get('tag')
            if not tag:
                return jsonify({'success': False, 'error': 'Tag is required'}), 400
            
            # Add tags to inquiries (assuming a tags field exists)
            for inquiry_id in inquiry_ids:
                current_tags = db.execute('SELECT tags FROM inquiries WHERE id = ?', (inquiry_id,)).fetchone()
                if current_tags and current_tags['tags']:
                    existing_tags = current_tags['tags'].split(',')
                    if tag not in existing_tags:
                        new_tags = ','.join(existing_tags + [tag])
                        db.execute('UPDATE inquiries SET tags = ?, updated_at = datetime("now") WHERE id = ?', (new_tags, inquiry_id))
                        updated_count += 1
                else:
                    db.execute('UPDATE inquiries SET tags = ?, updated_at = datetime("now") WHERE id = ?', (tag, inquiry_id))
                    updated_count += 1
                    
        else:
            return jsonify({'success': False, 'error': 'Invalid action'}), 400
        
        db.commit()
        
        return jsonify({
            'success': True,
            'message': f'Successfully updated {updated_count} inquiries',
            'updated_count': updated_count
        })
        
    except sqlite3.Error as e:
        return jsonify({'success': False, 'error': 'Database error'}), 500

@app.route('/api/admin/inquiries/stats', methods=['GET'])
@login_required
def get_inquiry_stats():
    """Get detailed inquiry statistics for reporting"""
    db = get_db()
    
    try:
        # Status distribution
        status_stats = db.execute('''
            SELECT status, COUNT(*) as count
            FROM inquiries
            GROUP BY status
            ORDER BY count DESC
        ''').fetchall()
        
        # Priority distribution
        priority_stats = db.execute('''
            SELECT priority, COUNT(*) as count
            FROM inquiries
            WHERE priority IS NOT NULL
            GROUP BY priority
            ORDER BY 
                CASE priority 
                    WHEN 'high' THEN 1 
                    WHEN 'normal' THEN 2 
                    WHEN 'low' THEN 3 
                END
        ''').fetchall()
        
        # Monthly trend (last 12 months)
        monthly_trend = db.execute('''
            SELECT 
                strftime('%Y-%m', created_at) as month,
                COUNT(*) as total,
                SUM(CASE WHEN status = 'closed' THEN 1 ELSE 0 END) as closed,
                SUM(CASE WHEN estimated_value IS NOT NULL THEN estimated_value ELSE 0 END) as total_value
            FROM inquiries
            WHERE created_at >= datetime('now', '-12 months')
            GROUP BY strftime('%Y-%m', created_at)
            ORDER BY month
        ''').fetchall()
        
        # Response time analysis
        response_time_stats = db.execute('''
            SELECT 
                AVG(CASE 
                    WHEN first_response_at IS NOT NULL 
                    THEN (julianday(first_response_at) - julianday(created_at)) * 24 
                    ELSE NULL 
                END) as avg_response_hours,
                COUNT(CASE WHEN first_response_at IS NOT NULL THEN 1 END) as responded_count,
                COUNT(*) as total_count
            FROM inquiries
            WHERE created_at >= datetime('now', '-30 days')
        ''').fetchone()
        
        # Top product interests
        product_interests = db.execute('''
            SELECT 
                product_interest,
                COUNT(*) as count,
                AVG(CASE WHEN estimated_value IS NOT NULL THEN estimated_value ELSE 0 END) as avg_value
            FROM inquiries
            WHERE product_interest IS NOT NULL AND product_interest != ''
            GROUP BY product_interest
            ORDER BY count DESC
            LIMIT 10
        ''').fetchall()
        
        return jsonify({
            'status_distribution': [dict(row) for row in status_stats],
            'priority_distribution': [dict(row) for row in priority_stats],
            'monthly_trend': [dict(row) for row in monthly_trend],
            'response_time': dict(response_time_stats) if response_time_stats else {},
            'product_interests': [dict(row) for row in product_interests]
        })
        
    except sqlite3.Error as e:
        return jsonify({'success': False, 'error': 'Database error'}), 500

# System health check
@app.route('/api/admin/health', methods=['GET'])
@login_required
def system_health():
    """System health check for admin dashboard"""
    try:
        db = get_db()
        
        # Check database connection
        db.execute('SELECT 1').fetchone()
        
        # Get system stats
        total_inquiries = db.execute('SELECT COUNT(*) as count FROM inquiries').fetchone()['count']
        total_products = db.execute('SELECT COUNT(*) as count FROM products').fetchone()['count']
        
        # Check disk space (simplified)
        import shutil
        disk_usage = shutil.disk_usage('.')
        disk_free_gb = disk_usage.free / (1024**3)
        
        return jsonify({
            'success': True,
            'status': 'healthy',
            'database': 'connected',
            'total_inquiries': total_inquiries,
            'total_products': total_products,
            'disk_free_gb': round(disk_free_gb, 2),
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'status': 'error',
            'error': str(e)
        }), 500

# Enhanced error handling
@app.errorhandler(404)
def not_found(error):
    if request.path.startswith('/api/'):
        return jsonify({'error': 'API endpoint not found'}), 404
    return send_from_directory('.', '404.html'), 404

@app.errorhandler(500)
def internal_error(error):
    if request.path.startswith('/api/'):
        return jsonify({'error': 'Internal server error'}), 500
    return jsonify({'error': 'Internal server error'}), 500

@app.errorhandler(403)
def forbidden(error):
    if request.path.startswith('/api/'):
        return jsonify({'error': 'Access forbidden'}), 403
    return redirect(url_for('admin_login'))

# Request logging middleware
@app.before_request
def log_request_info():
    if request.path.startswith('/api/admin/') and current_user.is_authenticated:
        # Log admin API requests for security
        print(f"Admin API: {current_user.username} - {request.method} {request.path}")

if __name__ == '__main__':
    with app.app_context():
        init_db() # Initialize DB and create admin user if not exists
    
    # Get port from environment variable (for Vercel and other platforms)
    port = int(os.environ.get('PORT', 8088))
    debug = os.environ.get('FLASK_ENV') != 'production'
    
    app.run(host='0.0.0.0', port=port, debug=debug)

# For Vercel deployment - expose the app instance
def handler(request):
    """Vercel serverless function handler"""
    with app.app_context():
        # Initialize database if not exists
        try:
            init_db(create_admin=True, use_enhanced_schema=True)
        except:
            pass  # Database might already exist
    
    return app(request.environ, request.start_response)

# Export app for WSGI servers
application = app
