#!/usr/bin/env python3
"""
LED Website Sitemap Generator
Generates XML sitemap for the LED display website
"""

import os
import json
import xml.etree.ElementTree as ET
from datetime import datetime
from urllib.parse import urljoin
import argparse

class SitemapGenerator:
    def __init__(self, base_url="https://www.lianjin-led.com", config_file="seo-config.json"):
        self.base_url = base_url.rstrip('/')
        self.config_file = config_file
        self.config = self.load_config()
        self.sitemap_data = []
        
    def load_config(self):
        """Load SEO configuration"""
        try:
            with open(self.config_file, 'r', encoding='utf-8') as f:
                return json.load(f)
        except FileNotFoundError:
            print(f"Warning: Config file {self.config_file} not found. Using defaults.")
            return {}
        except json.JSONDecodeError as e:
            print(f"Error parsing config file: {e}")
            return {}
    
    def add_url(self, path, priority=0.5, changefreq='monthly', lastmod=None):
        """Add a URL to the sitemap"""
        if not path.startswith('/'):
            path = '/' + path
            
        url = self.base_url + path
        
        if lastmod is None:
            lastmod = datetime.now().strftime('%Y-%m-%d')
        
        self.sitemap_data.append({
            'url': url,
            'priority': priority,
            'changefreq': changefreq,
            'lastmod': lastmod
        })
    
    def scan_html_files(self, directory='.'):
        """Scan directory for HTML files and add them to sitemap"""
        html_files = []
        
        for root, dirs, files in os.walk(directory):
            # Skip certain directories
            skip_dirs = ['admin', 'test', 'temp', '.git', 'node_modules', '__pycache__']
            dirs[:] = [d for d in dirs if d not in skip_dirs]
            
            for file in files:
                if file.endswith('.html') and not file.startswith('test-'):
                    file_path = os.path.join(root, file)
                    rel_path = os.path.relpath(file_path, directory)
                    
                    # Convert file path to URL path
                    url_path = rel_path.replace('\\', '/')
                    if url_path == 'index.html':
                        url_path = ''
                    
                    html_files.append({
                        'path': url_path,
                        'file_path': file_path,
                        'filename': file
                    })
        
        return html_files
    
    def get_file_priority(self, filename, path):
        """Determine priority based on file type and path"""
        priority_map = {
            'index.html': 1.0,
            'products.html': 0.9,
            'about.html': 0.7,
            'contact.html': 0.8,
            'fine-pitch.html': 0.8,
            'outdoor.html': 0.8,
            'rental.html': 0.8,
            'transparent.html': 0.8,
            'creative.html': 0.8,
            'solutions.html': 0.7,
            'cases.html': 0.6,
            'news.html': 0.6,
            'support.html': 0.5
        }
        
        return priority_map.get(filename, 0.5)
    
    def get_changefreq(self, filename, path):
        """Determine change frequency based on file type"""
        freq_map = {
            'index.html': 'weekly',
            'products.html': 'weekly',
            'news.html': 'daily',
            'cases.html': 'weekly',
            'contact.html': 'monthly',
            'about.html': 'monthly'
        }
        
        return freq_map.get(filename, 'monthly')
    
    def get_lastmod(self, file_path):
        """Get last modification date of file"""
        try:
            mtime = os.path.getmtime(file_path)
            return datetime.fromtimestamp(mtime).strftime('%Y-%m-%d')
        except OSError:
            return datetime.now().strftime('%Y-%m-%d')
    
    def generate_static_urls(self):
        """Add static/important URLs"""
        # Homepage
        self.add_url('', priority=1.0, changefreq='weekly')
        
        # Main pages
        main_pages = [
            ('products.html', 0.9, 'weekly'),
            ('about.html', 0.7, 'monthly'),
            ('contact.html', 0.8, 'monthly'),
            ('solutions.html', 0.7, 'weekly'),
            ('cases.html', 0.6, 'weekly'),
            ('news.html', 0.6, 'daily'),
            ('support.html', 0.5, 'monthly')
        ]
        
        for page, priority, changefreq in main_pages:
            self.add_url(page, priority=priority, changefreq=changefreq)
        
        # Product category pages
        product_pages = [
            ('fine-pitch.html', 0.8, 'weekly'),
            ('outdoor.html', 0.8, 'weekly'),
            ('rental.html', 0.8, 'weekly'),
            ('transparent.html', 0.8, 'weekly'),
            ('creative.html', 0.8, 'weekly')
        ]
        
        for page, priority, changefreq in product_pages:
            self.add_url(page, priority=priority, changefreq=changefreq)
    
    def generate_dynamic_urls(self):
        """Generate URLs for dynamic content"""
        # Add product detail pages (if they exist)
        # This would typically query a database or API
        
        # Add blog/news article URLs
        # This would typically query a CMS or database
        
        # For now, we'll add some example URLs
        example_products = [
            'p1.25-fine-pitch-led',
            'p2.5-indoor-led-display',
            'p4-outdoor-led-screen',
            'p6-rental-led-panel',
            'transparent-led-display'
        ]
        
        for product in example_products:
            self.add_url(f'product/{product}.html', priority=0.7, changefreq='monthly')
    
    def generate_from_files(self, directory='.'):
        """Generate sitemap from HTML files in directory"""
        html_files = self.scan_html_files(directory)
        
        for file_info in html_files:
            priority = self.get_file_priority(file_info['filename'], file_info['path'])
            changefreq = self.get_changefreq(file_info['filename'], file_info['path'])
            lastmod = self.get_lastmod(file_info['file_path'])
            
            self.add_url(file_info['path'], priority=priority, changefreq=changefreq, lastmod=lastmod)
    
    def create_xml_sitemap(self):
        """Create XML sitemap"""
        # Create root element
        urlset = ET.Element('urlset')
        urlset.set('xmlns', 'http://www.sitemaps.org/schemas/sitemap/0.9')
        urlset.set('xmlns:xsi', 'http://www.w3.org/2001/XMLSchema-instance')
        urlset.set('xsi:schemaLocation', 'http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd')
        
        # Sort URLs by priority (highest first)
        sorted_urls = sorted(self.sitemap_data, key=lambda x: x['priority'], reverse=True)
        
        # Add URL elements
        for url_data in sorted_urls:
            url_elem = ET.SubElement(urlset, 'url')
            
            loc = ET.SubElement(url_elem, 'loc')
            loc.text = url_data['url']
            
            lastmod = ET.SubElement(url_elem, 'lastmod')
            lastmod.text = url_data['lastmod']
            
            changefreq = ET.SubElement(url_elem, 'changefreq')
            changefreq.text = url_data['changefreq']
            
            priority = ET.SubElement(url_elem, 'priority')
            priority.text = str(url_data['priority'])
        
        return urlset
    
    def create_robots_txt(self):
        """Create robots.txt file"""
        robots_content = f"""User-agent: *
Allow: /

# Disallow admin and test pages
Disallow: /admin/
Disallow: /test/
Disallow: /temp/
Disallow: /*test*.html

# Disallow search and filter pages
Disallow: /search?
Disallow: /*?*

# Allow important files
Allow: /css/
Allow: /js/
Allow: /images/

# Sitemap location
Sitemap: {self.base_url}/sitemap.xml

# Crawl delay (optional)
Crawl-delay: 1
"""
        return robots_content
    
    def save_sitemap(self, filename='sitemap.xml'):
        """Save sitemap to file"""
        if not self.sitemap_data:
            print("No URLs to save. Generate sitemap first.")
            return False
        
        try:
            # Create XML tree
            urlset = self.create_xml_sitemap()
            tree = ET.ElementTree(urlset)
            
            # Format XML with proper indentation
            self.indent_xml(urlset)
            
            # Write to file
            tree.write(filename, encoding='utf-8', xml_declaration=True)
            
            print(f"Sitemap saved to {filename}")
            print(f"Total URLs: {len(self.sitemap_data)}")
            return True
            
        except Exception as e:
            print(f"Error saving sitemap: {e}")
            return False
    
    def save_robots_txt(self, filename='robots.txt'):
        """Save robots.txt file"""
        try:
            robots_content = self.create_robots_txt()
            
            with open(filename, 'w', encoding='utf-8') as f:
                f.write(robots_content)
            
            print(f"Robots.txt saved to {filename}")
            return True
            
        except Exception as e:
            print(f"Error saving robots.txt: {e}")
            return False
    
    def indent_xml(self, elem, level=0):
        """Add proper indentation to XML"""
        i = "\n" + level * "  "
        if len(elem):
            if not elem.text or not elem.text.strip():
                elem.text = i + "  "
            if not elem.tail or not elem.tail.strip():
                elem.tail = i
            for elem in elem:
                self.indent_xml(elem, level + 1)
            if not elem.tail or not elem.tail.strip():
                elem.tail = i
        else:
            if level and (not elem.tail or not elem.tail.strip()):
                elem.tail = i
    
    def print_summary(self):
        """Print sitemap summary"""
        if not self.sitemap_data:
            print("No URLs in sitemap.")
            return
        
        print(f"\nSitemap Summary:")
        print(f"Total URLs: {len(self.sitemap_data)}")
        print(f"Base URL: {self.base_url}")
        
        # Group by priority
        priority_groups = {}
        for url_data in self.sitemap_data:
            priority = url_data['priority']
            if priority not in priority_groups:
                priority_groups[priority] = []
            priority_groups[priority].append(url_data['url'])
        
        print("\nURLs by Priority:")
        for priority in sorted(priority_groups.keys(), reverse=True):
            urls = priority_groups[priority]
            print(f"  Priority {priority}: {len(urls)} URLs")
            for url in urls[:3]:  # Show first 3 URLs
                print(f"    - {url}")
            if len(urls) > 3:
                print(f"    ... and {len(urls) - 3} more")

def main():
    parser = argparse.ArgumentParser(description='Generate sitemap for LED website')
    parser.add_argument('--base-url', default='https://www.lianjin-led.com', 
                       help='Base URL for the website')
    parser.add_argument('--config', default='seo-config.json',
                       help='SEO configuration file')
    parser.add_argument('--output', default='sitemap.xml',
                       help='Output sitemap filename')
    parser.add_argument('--robots', action='store_true',
                       help='Also generate robots.txt')
    parser.add_argument('--scan-files', action='store_true',
                       help='Scan HTML files in current directory')
    parser.add_argument('--directory', default='.',
                       help='Directory to scan for HTML files')
    
    args = parser.parse_args()
    
    # Create sitemap generator
    generator = SitemapGenerator(base_url=args.base_url, config_file=args.config)
    
    # Generate URLs
    if args.scan_files:
        print(f"Scanning HTML files in {args.directory}...")
        generator.generate_from_files(args.directory)
    else:
        print("Generating static URLs...")
        generator.generate_static_urls()
        generator.generate_dynamic_urls()
    
    # Print summary
    generator.print_summary()
    
    # Save sitemap
    if generator.save_sitemap(args.output):
        print(f"\nSitemap successfully generated: {args.output}")
    
    # Generate robots.txt if requested
    if args.robots:
        if generator.save_robots_txt():
            print(f"Robots.txt successfully generated: robots.txt")

if __name__ == '__main__':
    main()