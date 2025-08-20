-- ================================================================
-- LED B2B WEBSITE - ENHANCED DATABASE SCHEMA
-- Version: 2.0
-- Description: Enhanced schema with multi-language support,
--              product categories, and comprehensive business features
-- ================================================================

-- ----------------------------------------------------------------
-- 1. USERS AND AUTHENTICATION
-- ----------------------------------------------------------------

-- Enhanced Users Table
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT DEFAULT 'admin', -- admin, editor, viewer
    is_active BOOLEAN DEFAULT 1,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User Sessions Table for better security
CREATE TABLE IF NOT EXISTS user_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    session_token TEXT NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ----------------------------------------------------------------
-- 2. PRODUCT MANAGEMENT SYSTEM
-- ----------------------------------------------------------------

-- Product Categories Table
CREATE TABLE IF NOT EXISTS product_categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name_en TEXT NOT NULL,
    name_zh TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description_en TEXT,
    description_zh TEXT,
    parent_id INTEGER,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (parent_id) REFERENCES product_categories(id)
);

-- Enhanced Products Table with multi-language support
CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sku TEXT UNIQUE NOT NULL,
    category_id INTEGER NOT NULL,
    name_en TEXT NOT NULL,
    name_zh TEXT NOT NULL,
    description_en TEXT,
    description_zh TEXT,
    specs_en TEXT, -- JSON format for detailed specifications
    specs_zh TEXT, -- JSON format for detailed specifications
    price DECIMAL(10,2),
    currency TEXT DEFAULT 'USD',
    pixel_pitch TEXT, -- e.g., "P1.25", "P2.5"
    brightness INTEGER, -- in nits
    resolution TEXT, -- e.g., "1920x1080"
    refresh_rate INTEGER, -- in Hz
    viewing_angle TEXT, -- e.g., "160°/160°"
    ip_rating TEXT, -- e.g., "IP65"
    power_consumption DECIMAL(8,2), -- in watts per sqm
    weight DECIMAL(8,2), -- in kg per panel
    dimensions TEXT, -- e.g., "500x500x85mm"
    is_featured BOOLEAN DEFAULT 0,
    is_active BOOLEAN DEFAULT 1,
    sort_order INTEGER DEFAULT 0,
    meta_title_en TEXT,
    meta_title_zh TEXT,
    meta_description_en TEXT,
    meta_description_zh TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES product_categories(id)
);

-- Product Images Table
CREATE TABLE IF NOT EXISTS product_images (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER NOT NULL,
    image_url TEXT NOT NULL,
    alt_text_en TEXT,
    alt_text_zh TEXT,
    is_primary BOOLEAN DEFAULT 0,
    sort_order INTEGER DEFAULT 0,
    file_size INTEGER, -- in bytes
    width INTEGER,
    height INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Product Applications/Use Cases
CREATE TABLE IF NOT EXISTS product_applications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER NOT NULL,
    application_en TEXT NOT NULL,
    application_zh TEXT NOT NULL,
    sort_order INTEGER DEFAULT 0,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- ----------------------------------------------------------------
-- 3. INQUIRY AND LEAD MANAGEMENT
-- ----------------------------------------------------------------

-- Enhanced Inquiries Table
CREATE TABLE IF NOT EXISTS inquiries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    company TEXT,
    phone TEXT,
    country TEXT,
    message TEXT NOT NULL,
    product_interest TEXT, -- Product categories or specific products
    inquiry_type TEXT DEFAULT 'general', -- general, quote, technical, partnership
    status TEXT DEFAULT 'new', -- new, contacted, quoted, closed, lost
    priority TEXT DEFAULT 'normal', -- low, normal, high, urgent
    source TEXT DEFAULT 'website', -- website, email, phone, exhibition
    assigned_to INTEGER, -- user_id of assigned sales person
    estimated_value DECIMAL(12,2), -- potential deal value
    notes TEXT, -- internal notes
    language TEXT DEFAULT 'en', -- preferred language
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (assigned_to) REFERENCES users(id)
);

-- Inquiry Follow-up Records
CREATE TABLE IF NOT EXISTS inquiry_followups (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    inquiry_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    action_type TEXT NOT NULL, -- call, email, meeting, quote_sent, etc.
    subject TEXT,
    notes TEXT,
    next_action TEXT,
    next_action_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (inquiry_id) REFERENCES inquiries(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- ----------------------------------------------------------------
-- 4. CONTENT MANAGEMENT SYSTEM
-- ----------------------------------------------------------------

-- Page Contents Table for dynamic content management
CREATE TABLE IF NOT EXISTS page_contents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    page_key TEXT NOT NULL, -- e.g., 'homepage', 'about', 'contact'
    section_key TEXT NOT NULL, -- e.g., 'hero_title', 'company_intro'
    content_en TEXT,
    content_zh TEXT,
    content_type TEXT DEFAULT 'text', -- text, html, json, image
    is_active BOOLEAN DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(page_key, section_key)
);

-- News/Blog Articles Table
CREATE TABLE IF NOT EXISTS news_articles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title_en TEXT NOT NULL,
    title_zh TEXT NOT NULL,
    slug_en TEXT UNIQUE NOT NULL,
    slug_zh TEXT UNIQUE NOT NULL,
    content_en TEXT,
    content_zh TEXT,
    excerpt_en TEXT,
    excerpt_zh TEXT,
    featured_image TEXT,
    author_id INTEGER,
    category TEXT, -- company_news, industry_news, product_updates
    tags TEXT, -- JSON array of tags
    is_published BOOLEAN DEFAULT 0,
    is_featured BOOLEAN DEFAULT 0,
    published_at TIMESTAMP,
    meta_title_en TEXT,
    meta_title_zh TEXT,
    meta_description_en TEXT,
    meta_description_zh TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (author_id) REFERENCES users(id)
);

-- Enhanced Case Studies Table
CREATE TABLE IF NOT EXISTS cases (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title_en TEXT NOT NULL,
    title_zh TEXT NOT NULL,
    slug_en TEXT UNIQUE NOT NULL,
    slug_zh TEXT UNIQUE NOT NULL,
    client TEXT,
    location TEXT,
    country TEXT,
    project_date DATE,
    project_value DECIMAL(12,2),
    currency TEXT DEFAULT 'USD',
    description_en TEXT,
    description_zh TEXT,
    challenge_en TEXT, -- project challenges
    challenge_zh TEXT,
    solution_en TEXT, -- our solution
    solution_zh TEXT,
    results_en TEXT, -- project results
    results_zh TEXT,
    featured_image TEXT,
    industry TEXT, -- retail, transportation, sports, etc.
    products_used TEXT, -- JSON array of product IDs
    is_featured BOOLEAN DEFAULT 0,
    is_published BOOLEAN DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Case Study Images
CREATE TABLE IF NOT EXISTS case_images (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    case_id INTEGER NOT NULL,
    image_url TEXT NOT NULL,
    caption_en TEXT,
    caption_zh TEXT,
    sort_order INTEGER DEFAULT 0,
    FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE
);

-- ----------------------------------------------------------------
-- 5. SYSTEM SETTINGS AND CONFIGURATION
-- ----------------------------------------------------------------

-- System Settings Table
CREATE TABLE IF NOT EXISTS system_settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    setting_key TEXT UNIQUE NOT NULL,
    setting_value TEXT,
    setting_type TEXT DEFAULT 'text', -- text, number, boolean, json
    description TEXT,
    is_public BOOLEAN DEFAULT 0, -- whether setting can be accessed by frontend
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Activity Logs for audit trail
CREATE TABLE IF NOT EXISTS activity_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    action TEXT NOT NULL, -- login, create_product, update_inquiry, etc.
    table_name TEXT, -- affected table
    record_id INTEGER, -- affected record ID
    old_values TEXT, -- JSON of old values
    new_values TEXT, -- JSON of new values
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- ----------------------------------------------------------------
-- 6. INDEXES FOR PERFORMANCE
-- ----------------------------------------------------------------

-- Product indexes
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(is_featured);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(is_active);

-- Inquiry indexes
CREATE INDEX IF NOT EXISTS idx_inquiries_status ON inquiries(status);
CREATE INDEX IF NOT EXISTS idx_inquiries_created ON inquiries(created_at);
CREATE INDEX IF NOT EXISTS idx_inquiries_assigned ON inquiries(assigned_to);
CREATE INDEX IF NOT EXISTS idx_inquiries_email ON inquiries(email);

-- User session indexes
CREATE INDEX IF NOT EXISTS idx_sessions_token ON user_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_sessions_expires ON user_sessions(expires_at);

-- Content indexes
CREATE INDEX IF NOT EXISTS idx_page_contents_page ON page_contents(page_key);
CREATE INDEX IF NOT EXISTS idx_news_published ON news_articles(is_published, published_at);
CREATE INDEX IF NOT EXISTS idx_cases_featured ON cases(is_featured);

-- ----------------------------------------------------------------
-- 7. INITIAL DATA INSERTION
-- ----------------------------------------------------------------

-- Insert default admin user (password: admin123)
INSERT OR IGNORE INTO users (username, email, password_hash, role) 
VALUES ('admin', 'admin@lianjin-led.com', 'scrypt:32768:8:1$YourHashHere', 'admin');

-- Insert default product categories
INSERT OR IGNORE INTO product_categories (id, name_en, name_zh, slug, description_en, description_zh, sort_order) VALUES
(1, 'Fine Pitch LED', '小间距LED显示屏', 'fine-pitch-led', 'High-resolution indoor displays', '高分辨率室内显示屏', 1),
(2, 'Outdoor LED', '户外LED显示屏', 'outdoor-led', 'Weather-resistant outdoor displays', '防水户外显示屏', 2),
(3, 'Rental LED', '租赁LED显示屏', 'rental-led', 'Portable event displays', '便携式活动显示屏', 3),
(4, 'Creative LED', '创意LED显示屏', 'creative-led', 'Custom shaped displays', '定制异形显示屏', 4),
(5, 'Transparent LED', '透明LED显示屏', 'transparent-led', 'See-through displays', '透明显示屏', 5),
(6, 'Interactive LED', '交互LED显示屏', 'interactive-led', 'Touch-enabled displays', '触摸交互显示屏', 6);

-- Insert default system settings
INSERT OR IGNORE INTO system_settings (setting_key, setting_value, setting_type, description, is_public) VALUES
('site_name_en', 'Shenzhen Lianjin Optoelectronics Co., Ltd.', 'text', 'Company name in English', 1),
('site_name_zh', '深圳联锦光电有限公司', 'text', 'Company name in Chinese', 1),
('contact_email', 'sales@lianjin-led.com', 'text', 'Main contact email', 1),
('contact_phone', '+86-755-1234-5678', 'text', 'Main contact phone', 1),
('company_address_en', 'Shenzhen, Guangdong, China', 'text', 'Company address in English', 1),
('company_address_zh', '中国广东省深圳市', 'text', 'Company address in Chinese', 1),
('default_language', 'en', 'text', 'Default website language', 1),
('items_per_page', '12', 'number', 'Default items per page for listings', 0),
('max_upload_size', '5242880', 'number', 'Maximum file upload size in bytes (5MB)', 0);

-- Insert sample page content
INSERT OR IGNORE INTO page_contents (page_key, section_key, content_en, content_zh, content_type) VALUES
('homepage', 'hero_title', 'Innovate with Light: World-Class LED Display Manufacturing', '用光创新：世界级LED显示屏制造', 'text'),
('homepage', 'hero_subtitle', 'We provide cutting-edge LED solutions that captivate audiences and empower businesses across 160+ countries.', '我们为160多个国家的企业提供前沿的LED解决方案，吸引观众并赋能业务。', 'text'),
('about', 'company_intro', 'Founded in 2007, Shenzhen Lianjin Optoelectronics is a leading manufacturer of LED displays.', '深圳联锦光电成立于2007年，是LED显示屏的领先制造商。', 'text');