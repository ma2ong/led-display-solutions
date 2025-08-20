/**
 * 面包屑导航系统
 * Breadcrumb Navigation System
 */

class BreadcrumbNavigation {
    constructor() {
        this.pageMapping = {
            'index.html': { title: 'nav.home', path: [] },
            'about.html': { title: 'nav.about', path: ['nav.home'] },
            'products.html': { title: 'nav.products', path: ['nav.home'] },
            'fine-pitch.html': { title: 'products.fine-pitch', path: ['nav.home', 'nav.products'] },
            'outdoor.html': { title: 'products.outdoor', path: ['nav.home', 'nav.products'] },
            'rental.html': { title: 'products.rental', path: ['nav.home', 'nav.products'] },
            'creative.html': { title: 'products.creative', path: ['nav.home', 'nav.products'] },
            'transparent.html': { title: 'products.transparent', path: ['nav.home', 'nav.products'] },
            'solutions.html': { title: 'nav.solutions', path: ['nav.home'] },
            'cases.html': { title: 'nav.cases', path: ['nav.home'] },
            'news.html': { title: 'nav.news', path: ['nav.home'] },
            'support.html': { title: 'nav.support', path: ['nav.home'] },
            'contact.html': { title: 'nav.contact', path: ['nav.home'] },
            'product-detail.html': { title: 'Product Details', path: ['nav.home', 'nav.products'] }
        };
        
        this.urlMapping = {
            'nav.home': 'index.html',
            'nav.about': 'about.html',
            'nav.products': 'products.html',
            'nav.solutions': 'solutions.html',
            'nav.cases': 'cases.html',
            'nav.news': 'news.html',
            'nav.support': 'support.html',
            'nav.contact': 'contact.html',
            'products.fine-pitch': 'fine-pitch.html',
            'products.outdoor': 'outdoor.html',
            'products.rental': 'rental.html',
            'products.creative': 'creative.html',
            'products.transparent': 'transparent.html'
        };
        
        this.init();
    }
    
    init() {
        this.createBreadcrumb();
        this.updateActiveNavigation();
        
        // 监听语言变更事件
        document.addEventListener('languageChanged', () => {
            this.updateBreadcrumbTexts();
        });
        
        console.log('Breadcrumb navigation initialized');
    }
    
    getCurrentPage() {
        const path = window.location.pathname;
        const filename = path.split('/').pop() || 'index.html';
        return filename;
    }
    
    createBreadcrumb() {
        const currentPage = this.getCurrentPage();
        const pageInfo = this.pageMapping[currentPage];
        
        if (!pageInfo) {
            console.warn(`No breadcrumb mapping found for page: ${currentPage}`);
            return;
        }
        
        // 查找现有的面包屑容器或创建新的
        let breadcrumbContainer = document.querySelector('.breadcrumb-nav');
        if (!breadcrumbContainer) {
            breadcrumbContainer = document.createElement('nav');
            breadcrumbContainer.className = 'breadcrumb-nav';
            
            // 插入到主内容之前
            const main = document.querySelector('main');
            if (main) {
                main.parentNode.insertBefore(breadcrumbContainer, main);
            } else {
                // 如果没有main标签，插入到header之后
                const header = document.querySelector('header');
                if (header) {
                    header.parentNode.insertBefore(breadcrumbContainer, header.nextSibling);
                }
            }
        }
        
        // 构建面包屑HTML
        const breadcrumbHtml = this.buildBreadcrumbHtml(pageInfo);
        breadcrumbContainer.innerHTML = `
            <div class="container">
                <ol class="breadcrumb">
                    ${breadcrumbHtml}
                </ol>
            </div>
        `;
    }
    
    buildBreadcrumbHtml(pageInfo) {
        let html = '';
        
        // 添加路径中的每一级
        pageInfo.path.forEach(pathKey => {
            const url = this.urlMapping[pathKey] || '#';
            html += `
                <li>
                    <a href="${url}" data-i18n="${pathKey}">${this.getDefaultText(pathKey)}</a>
                </li>
            `;
        });
        
        // 添加当前页面（不可点击）
        html += `
            <li class="active">
                <span data-i18n="${pageInfo.title}">${this.getDefaultText(pageInfo.title)}</span>
            </li>
        `;
        
        return html;
    }
    
    getDefaultText(key) {
        // 提供默认文本，以防i18n系统未加载
        const defaultTexts = {
            'nav.home': 'Home',
            'nav.about': 'About Us',
            'nav.products': 'Products',
            'nav.solutions': 'Solutions',
            'nav.cases': 'Cases',
            'nav.news': 'News',
            'nav.support': 'Support',
            'nav.contact': 'Contact',
            'products.fine-pitch': 'Fine Pitch LED',
            'products.outdoor': 'Outdoor LED',
            'products.rental': 'Rental LED',
            'products.creative': 'Creative LED',
            'products.transparent': 'Transparent LED',
            'Product Details': 'Product Details'
        };
        
        return defaultTexts[key] || key;
    }
    
    updateBreadcrumbTexts() {
        // 当语言变更时更新面包屑文本
        const breadcrumbElements = document.querySelectorAll('.breadcrumb [data-i18n]');
        breadcrumbElements.forEach(element => {
            const key = element.getAttribute('data-i18n');
            if (window.i18n) {
                element.textContent = window.i18n.t(key);
            }
        });
    }
    
    updateActiveNavigation() {
        // 更新导航菜单中的active状态
        const currentPage = this.getCurrentPage();
        const navLinks = document.querySelectorAll('.navbar-nav .nav-link');
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            
            // 检查链接是否指向当前页面
            const href = link.getAttribute('href');
            if (href === currentPage || (currentPage === 'index.html' && href === 'index.html')) {
                link.classList.add('active');
            }
            
            // 特殊处理产品页面
            if (this.isProductPage(currentPage) && href === 'products.html') {
                link.classList.add('active');
            }
        });
    }
    
    isProductPage(filename) {
        const productPages = ['fine-pitch.html', 'outdoor.html', 'rental.html', 'creative.html', 'transparent.html', 'product-detail.html'];
        return productPages.includes(filename);
    }
    
    // 添加页面映射（用于动态页面）
    addPageMapping(filename, config) {
        this.pageMapping[filename] = config;
    }
    
    // 更新当前页面的面包屑
    updateBreadcrumb(title, path = []) {
        const currentPage = this.getCurrentPage();
        this.pageMapping[currentPage] = { title, path };
        this.createBreadcrumb();
    }
}

// 全局实例
window.breadcrumbNav = null;

// 初始化函数
function initializeBreadcrumb() {
    if (!window.breadcrumbNav) {
        window.breadcrumbNav = new BreadcrumbNavigation();
    }
    return window.breadcrumbNav;
}

// 导出（如果使用模块系统）
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { BreadcrumbNavigation, initializeBreadcrumb };
}