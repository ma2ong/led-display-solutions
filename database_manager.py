#!/usr/bin/env python3
"""
数据库管理器
Database Manager

为增强版数据库结构提供统一的数据访问接口
Provides unified data access interface for enhanced database structure
"""

import sqlite3
import json
from datetime import datetime, date
from typing import Dict, List, Optional, Any, Tuple
import logging

class DatabaseManager:
    def __init__(self, db_path='database.db'):
        self.db_path = db_path
        self.logger = logging.getLogger(__name__)
    
    def get_connection(self):
        """获取数据库连接"""
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        conn.execute("PRAGMA foreign_keys = ON")
        return conn
    
    def execute_query(self, query: str, params: tuple = (), fetch_one: bool = False, fetch_all: bool = True):
        """执行查询"""
        try:
            with self.get_connection() as conn:
                cursor = conn.cursor()
                cursor.execute(query, params)
                
                if fetch_one:
                    return cursor.fetchone()
                elif fetch_all:
                    return cursor.fetchall()
                else:
                    conn.commit()
                    return cursor.lastrowid
        except Exception as e:
            self.logger.error(f"Database query error: {e}")
            raise
    
    # ================================================================
    # 产品管理 / Product Management
    # ================================================================
    
    def get_product_categories(self, active_only: bool = True) -> List[Dict]:
        """获取产品分类"""
        query = """
            SELECT * FROM product_categories 
            WHERE is_active = 1 
            ORDER BY sort_order, name_en
        """ if active_only else """
            SELECT * FROM product_categories 
            ORDER BY sort_order, name_en
        """
        
        rows = self.execute_query(query)
        return [dict(row) for row in rows]
    
    def get_products(self, category_id: Optional[int] = None, active_only: bool = True, 
                    featured_only: bool = False, limit: Optional[int] = None) -> List[Dict]:
        """获取产品列表"""
        conditions = []
        params = []
        
        if active_only:
            conditions.append("p.is_active = 1")
        
        if featured_only:
            conditions.append("p.is_featured = 1")
        
        if category_id:
            conditions.append("p.category_id = ?")
            params.append(category_id)
        
        where_clause = "WHERE " + " AND ".join(conditions) if conditions else ""
        limit_clause = f"LIMIT {limit}" if limit else ""
        
        query = f"""
            SELECT p.*, c.name_en as category_name_en, c.name_zh as category_name_zh,
                   c.slug as category_slug
            FROM products p
            LEFT JOIN product_categories c ON p.category_id = c.id
            {where_clause}
            ORDER BY p.sort_order, p.name_en
            {limit_clause}
        """
        
        rows = self.execute_query(query, tuple(params))
        products = []
        
        for row in rows:
            product = dict(row)
            # 获取产品图片
            product['images'] = self.get_product_images(product['id'])
            # 获取产品应用场景
            product['applications'] = self.get_product_applications(product['id'])
            products.append(product)
        
        return products
    
    def get_product_by_id(self, product_id: int) -> Optional[Dict]:
        """根据ID获取产品"""
        query = """
            SELECT p.*, c.name_en as category_name_en, c.name_zh as category_name_zh,
                   c.slug as category_slug
            FROM products p
            LEFT JOIN product_categories c ON p.category_id = c.id
            WHERE p.id = ?
        """
        
        row = self.execute_query(query, (product_id,), fetch_one=True)
        if not row:
            return None
        
        product = dict(row)
        product['images'] = self.get_product_images(product_id)
        product['applications'] = self.get_product_applications(product_id)
        
        return product
    
    def get_product_by_sku(self, sku: str) -> Optional[Dict]:
        """根据SKU获取产品"""
        query = """
            SELECT p.*, c.name_en as category_name_en, c.name_zh as category_name_zh
            FROM products p
            LEFT JOIN product_categories c ON p.category_id = c.id
            WHERE p.sku = ?
        """
        
        row = self.execute_query(query, (sku,), fetch_one=True)
        if not row:
            return None
        
        product = dict(row)
        product['images'] = self.get_product_images(product['id'])
        product['applications'] = self.get_product_applications(product['id'])
        
        return product
    
    def get_product_images(self, product_id: int) -> List[Dict]:
        """获取产品图片"""
        query = """
            SELECT * FROM product_images 
            WHERE product_id = ? 
            ORDER BY is_primary DESC, sort_order
        """
        
        rows = self.execute_query(query, (product_id,))
        return [dict(row) for row in rows]
    
    def get_product_applications(self, product_id: int) -> List[Dict]:
        """获取产品应用场景"""
        query = """
            SELECT * FROM product_applications 
            WHERE product_id = ? 
            ORDER BY sort_order
        """
        
        rows = self.execute_query(query, (product_id,))
        return [dict(row) for row in rows]
    
    def create_product(self, product_data: Dict) -> int:
        """创建产品"""
        query = """
            INSERT INTO products (
                sku, category_id, name_en, name_zh, description_en, description_zh,
                specs_en, specs_zh, price, currency, pixel_pitch, brightness,
                resolution, refresh_rate, viewing_angle, ip_rating, power_consumption,
                weight, dimensions, is_featured, is_active, sort_order
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """
        
        params = (
            product_data.get('sku'),
            product_data.get('category_id'),
            product_data.get('name_en'),
            product_data.get('name_zh'),
            product_data.get('description_en'),
            product_data.get('description_zh'),
            product_data.get('specs_en'),
            product_data.get('specs_zh'),
            product_data.get('price'),
            product_data.get('currency', 'USD'),
            product_data.get('pixel_pitch'),
            product_data.get('brightness'),
            product_data.get('resolution'),
            product_data.get('refresh_rate'),
            product_data.get('viewing_angle'),
            product_data.get('ip_rating'),
            product_data.get('power_consumption'),
            product_data.get('weight'),
            product_data.get('dimensions'),
            product_data.get('is_featured', 0),
            product_data.get('is_active', 1),
            product_data.get('sort_order', 0)
        )
        
        return self.execute_query(query, params, fetch_all=False)
    
    # ================================================================
    # 询盘管理 / Inquiry Management
    # ================================================================
    
    def get_inquiries(self, status: Optional[str] = None, limit: Optional[int] = None) -> List[Dict]:
        """获取询盘列表"""
        conditions = []
        params = []
        
        if status:
            conditions.append("status = ?")
            params.append(status)
        
        where_clause = "WHERE " + " AND ".join(conditions) if conditions else ""
        limit_clause = f"LIMIT {limit}" if limit else ""
        
        query = f"""
            SELECT i.*, u.username as assigned_user
            FROM inquiries i
            LEFT JOIN users u ON i.assigned_to = u.id
            {where_clause}
            ORDER BY i.created_at DESC
            {limit_clause}
        """
        
        rows = self.execute_query(query, tuple(params))
        return [dict(row) for row in rows]
    
    def get_inquiry_by_id(self, inquiry_id: int) -> Optional[Dict]:
        """根据ID获取询盘"""
        query = """
            SELECT i.*, u.username as assigned_user
            FROM inquiries i
            LEFT JOIN users u ON i.assigned_to = u.id
            WHERE i.id = ?
        """
        
        row = self.execute_query(query, (inquiry_id,), fetch_one=True)
        if not row:
            return None
        
        inquiry = dict(row)
        inquiry['followups'] = self.get_inquiry_followups(inquiry_id)
        
        return inquiry
    
    def create_inquiry(self, inquiry_data: Dict) -> int:
        """创建询盘"""
        query = """
            INSERT INTO inquiries (
                name, email, company, phone, country, message, product_interest,
                inquiry_type, status, priority, source, language
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """
        
        params = (
            inquiry_data.get('name'),
            inquiry_data.get('email'),
            inquiry_data.get('company'),
            inquiry_data.get('phone'),
            inquiry_data.get('country'),
            inquiry_data.get('message'),
            inquiry_data.get('product_interest'),
            inquiry_data.get('inquiry_type', 'general'),
            inquiry_data.get('status', 'new'),
            inquiry_data.get('priority', 'normal'),
            inquiry_data.get('source', 'website'),
            inquiry_data.get('language', 'en')
        )
        
        return self.execute_query(query, params, fetch_all=False)
    
    def update_inquiry_status(self, inquiry_id: int, status: str, user_id: Optional[int] = None) -> bool:
        """更新询盘状态"""
        query = "UPDATE inquiries SET status = ?, updated_at = CURRENT_TIMESTAMP"
        params = [status]
        
        if user_id:
            query += ", assigned_to = ?"
            params.append(user_id)
        
        query += " WHERE id = ?"
        params.append(inquiry_id)
        
        try:
            self.execute_query(query, tuple(params), fetch_all=False)
            return True
        except:
            return False
    
    def get_inquiry_followups(self, inquiry_id: int) -> List[Dict]:
        """获取询盘跟进记录"""
        query = """
            SELECT f.*, u.username
            FROM inquiry_followups f
            LEFT JOIN users u ON f.user_id = u.id
            WHERE f.inquiry_id = ?
            ORDER BY f.created_at DESC
        """
        
        rows = self.execute_query(query, (inquiry_id,))
        return [dict(row) for row in rows]
    
    def add_inquiry_followup(self, followup_data: Dict) -> int:
        """添加询盘跟进记录"""
        query = """
            INSERT INTO inquiry_followups (
                inquiry_id, user_id, action_type, subject, notes, next_action, next_action_date
            ) VALUES (?, ?, ?, ?, ?, ?, ?)
        """
        
        params = (
            followup_data.get('inquiry_id'),
            followup_data.get('user_id'),
            followup_data.get('action_type'),
            followup_data.get('subject'),
            followup_data.get('notes'),
            followup_data.get('next_action'),
            followup_data.get('next_action_date')
        )
        
        return self.execute_query(query, params, fetch_all=False)
    
    # ================================================================
    # 用户管理 / User Management
    # ================================================================
    
    def get_user_by_id(self, user_id: int) -> Optional[Dict]:
        """根据ID获取用户"""
        query = "SELECT * FROM users WHERE id = ?"
        row = self.execute_query(query, (user_id,), fetch_one=True)
        return dict(row) if row else None
    
    def get_user_by_username(self, username: str) -> Optional[Dict]:
        """根据用户名获取用户"""
        query = "SELECT * FROM users WHERE username = ?"
        row = self.execute_query(query, (username,), fetch_one=True)
        return dict(row) if row else None
    
    def get_user_by_email(self, email: str) -> Optional[Dict]:
        """根据邮箱获取用户"""
        query = "SELECT * FROM users WHERE email = ?"
        row = self.execute_query(query, (email,), fetch_one=True)
        return dict(row) if row else None
    
    def create_user(self, user_data: Dict) -> int:
        """创建用户"""
        query = """
            INSERT INTO users (username, email, password_hash, role, is_active)
            VALUES (?, ?, ?, ?, ?)
        """
        
        params = (
            user_data.get('username'),
            user_data.get('email'),
            user_data.get('password_hash'),
            user_data.get('role', 'admin'),
            user_data.get('is_active', 1)
        )
        
        return self.execute_query(query, params, fetch_all=False)
    
    def update_user_last_login(self, user_id: int) -> bool:
        """更新用户最后登录时间"""
        query = "UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?"
        try:
            self.execute_query(query, (user_id,), fetch_all=False)
            return True
        except:
            return False
    
    # ================================================================
    # 案例管理 / Case Management
    # ================================================================
    
    def get_cases(self, published_only: bool = True, featured_only: bool = False, limit: Optional[int] = None) -> List[Dict]:
        """获取案例列表"""
        conditions = []
        params = []
        
        if published_only:
            conditions.append("is_published = 1")
        
        if featured_only:
            conditions.append("is_featured = 1")
        
        where_clause = "WHERE " + " AND ".join(conditions) if conditions else ""
        limit_clause = f"LIMIT {limit}" if limit else ""
        
        query = f"""
            SELECT * FROM cases
            {where_clause}
            ORDER BY is_featured DESC, created_at DESC
            {limit_clause}
        """
        
        rows = self.execute_query(query, tuple(params))
        cases = []
        
        for row in rows:
            case = dict(row)
            case['images'] = self.get_case_images(case['id'])
            cases.append(case)
        
        return cases
    
    def get_case_by_id(self, case_id: int) -> Optional[Dict]:
        """根据ID获取案例"""
        query = "SELECT * FROM cases WHERE id = ?"
        row = self.execute_query(query, (case_id,), fetch_one=True)
        
        if not row:
            return None
        
        case = dict(row)
        case['images'] = self.get_case_images(case_id)
        
        return case
    
    def get_case_images(self, case_id: int) -> List[Dict]:
        """获取案例图片"""
        query = """
            SELECT * FROM case_images 
            WHERE case_id = ? 
            ORDER BY sort_order
        """
        
        rows = self.execute_query(query, (case_id,))
        return [dict(row) for row in rows]
    
    # ================================================================
    # 内容管理 / Content Management
    # ================================================================
    
    def get_page_content(self, page_key: str, section_key: Optional[str] = None) -> Dict:
        """获取页面内容"""
        if section_key:
            query = """
                SELECT * FROM page_contents 
                WHERE page_key = ? AND section_key = ? AND is_active = 1
            """
            row = self.execute_query(query, (page_key, section_key), fetch_one=True)
            return dict(row) if row else {}
        else:
            query = """
                SELECT * FROM page_contents 
                WHERE page_key = ? AND is_active = 1
                ORDER BY section_key
            """
            rows = self.execute_query(query, (page_key,))
            return {row['section_key']: dict(row) for row in rows}
    
    def update_page_content(self, page_key: str, section_key: str, content_data: Dict) -> bool:
        """更新页面内容"""
        query = """
            INSERT OR REPLACE INTO page_contents 
            (page_key, section_key, content_en, content_zh, content_type, is_active)
            VALUES (?, ?, ?, ?, ?, ?)
        """
        
        params = (
            page_key,
            section_key,
            content_data.get('content_en'),
            content_data.get('content_zh'),
            content_data.get('content_type', 'text'),
            content_data.get('is_active', 1)
        )
        
        try:
            self.execute_query(query, params, fetch_all=False)
            return True
        except:
            return False
    
    # ================================================================
    # 系统设置 / System Settings
    # ================================================================
    
    def get_system_setting(self, setting_key: str) -> Optional[str]:
        """获取系统设置"""
        query = "SELECT setting_value FROM system_settings WHERE setting_key = ?"
        row = self.execute_query(query, (setting_key,), fetch_one=True)
        return row['setting_value'] if row else None
    
    def get_public_settings(self) -> Dict:
        """获取公开的系统设置"""
        query = "SELECT setting_key, setting_value FROM system_settings WHERE is_public = 1"
        rows = self.execute_query(query)
        return {row['setting_key']: row['setting_value'] for row in rows}
    
    def update_system_setting(self, setting_key: str, setting_value: str) -> bool:
        """更新系统设置"""
        query = """
            INSERT OR REPLACE INTO system_settings (setting_key, setting_value, updated_at)
            VALUES (?, ?, CURRENT_TIMESTAMP)
        """
        
        try:
            self.execute_query(query, (setting_key, setting_value), fetch_all=False)
            return True
        except:
            return False
    
    # ================================================================
    # 统计和分析 / Statistics and Analytics
    # ================================================================
    
    def get_dashboard_stats(self) -> Dict:
        """获取仪表板统计数据"""
        stats = {}
        
        # 产品统计
        stats['total_products'] = self.execute_query(
            "SELECT COUNT(*) as count FROM products WHERE is_active = 1", 
            fetch_one=True
        )['count']
        
        # 询盘统计
        stats['total_inquiries'] = self.execute_query(
            "SELECT COUNT(*) as count FROM inquiries", 
            fetch_one=True
        )['count']
        
        stats['new_inquiries'] = self.execute_query(
            "SELECT COUNT(*) as count FROM inquiries WHERE status = 'new'", 
            fetch_one=True
        )['count']
        
        # 案例统计
        stats['total_cases'] = self.execute_query(
            "SELECT COUNT(*) as count FROM cases WHERE is_published = 1", 
            fetch_one=True
        )['count']
        
        # 最近询盘
        stats['recent_inquiries'] = self.get_inquiries(limit=5)
        
        return stats
    
    def get_inquiry_stats_by_status(self) -> List[Dict]:
        """按状态获取询盘统计"""
        query = """
            SELECT status, COUNT(*) as count 
            FROM inquiries 
            GROUP BY status 
            ORDER BY count DESC
        """
        
        rows = self.execute_query(query)
        return [dict(row) for row in rows]
    
    def get_inquiry_stats_by_month(self, months: int = 12) -> List[Dict]:
        """按月份获取询盘统计"""
        query = """
            SELECT 
                strftime('%Y-%m', created_at) as month,
                COUNT(*) as count
            FROM inquiries 
            WHERE created_at >= date('now', '-{} months')
            GROUP BY strftime('%Y-%m', created_at)
            ORDER BY month
        """.format(months)
        
        rows = self.execute_query(query)
        return [dict(row) for row in rows]
    
    # ================================================================
    # 活动日志 / Activity Logs
    # ================================================================
    
    def log_activity(self, user_id: Optional[int], action: str, table_name: Optional[str] = None,
                    record_id: Optional[int] = None, old_values: Optional[Dict] = None,
                    new_values: Optional[Dict] = None, ip_address: Optional[str] = None,
                    user_agent: Optional[str] = None) -> int:
        """记录活动日志"""
        query = """
            INSERT INTO activity_logs (
                user_id, action, table_name, record_id, old_values, new_values,
                ip_address, user_agent
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """
        
        params = (
            user_id,
            action,
            table_name,
            record_id,
            json.dumps(old_values) if old_values else None,
            json.dumps(new_values) if new_values else None,
            ip_address,
            user_agent
        )
        
        return self.execute_query(query, params, fetch_all=False)
    
    def get_activity_logs(self, limit: int = 50, user_id: Optional[int] = None) -> List[Dict]:
        """获取活动日志"""
        conditions = []
        params = []
        
        if user_id:
            conditions.append("user_id = ?")
            params.append(user_id)
        
        where_clause = "WHERE " + " AND ".join(conditions) if conditions else ""
        
        query = f"""
            SELECT l.*, u.username
            FROM activity_logs l
            LEFT JOIN users u ON l.user_id = u.id
            {where_clause}
            ORDER BY l.created_at DESC
            LIMIT {limit}
        """
        
        rows = self.execute_query(query, tuple(params))
        return [dict(row) for row in rows]

# 全局数据库管理器实例
db_manager = DatabaseManager()