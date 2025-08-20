/**
 * 多语言国际化系统
 * Internationalization (i18n) System
 */

class I18n {
    constructor() {
        this.currentLanguage = this.getStoredLanguage() || this.detectLanguage();
        this.translations = {};
        this.fallbackLanguage = 'en';
        
        this.init();
    }
    
    init() {
        // 加载翻译资源
        this.loadTranslations();
        
        // 设置页面语言属性
        document.documentElement.lang = this.currentLanguage;
        
        // 初始化语言切换器
        this.initLanguageSwitchers();
        
        // 应用翻译
        this.applyTranslations();
        
        console.log(`I18n initialized with language: ${this.currentLanguage}`);
    }
    
    getStoredLanguage() {
        try {
            return localStorage.getItem('preferred_language');
        } catch (error) {
            return null;
        }
    }
    
    detectLanguage() {
        // 检测浏览器语言
        const browserLang = navigator.language || navigator.userLanguage;
        
        // 支持的语言列表
        const supportedLanguages = ['en', 'zh'];
        
        // 检查是否为中文
        if (browserLang.startsWith('zh')) {
            return 'zh';
        }
        
        // 默认返回英文
        return 'en';
    }
    
    loadTranslations() {
        // 英文翻译
        this.translations.en = {
            // 导航菜单
            'nav.home': 'Home',
            'nav.about': 'About Us',
            'nav.products': 'Products',
            'nav.solutions': 'Solutions',
            'nav.cases': 'Cases',
            'nav.news': 'News',
            'nav.support': 'Support',
            'nav.contact': 'Contact',
            
            // 产品类别
            'products.fine-pitch': 'Fine Pitch LED',
            'products.outdoor': 'Outdoor LED',
            'products.rental': 'Rental LED',
            'products.creative': 'Creative LED',
            'products.transparent': 'Transparent LED',
            'products.interactive': 'Interactive LED',
            
            // 产品页面内容
            'products.fine-pitch.subtitle': 'Unmatched Clarity for Mission-Critical Visuals',
            'products.outdoor.subtitle': 'Brilliant Performance Under Any Weather',
            'products.rental.subtitle': 'Portable Solutions for Dynamic Events',
            'products.creative.subtitle': 'Unlimited Possibilities for Unique Displays',
            'products.transparent.subtitle': 'See-Through Technology for Modern Architecture',
            
            'product.key-features': 'Key Features',
            'product.applications': 'Applications',
            'product.specifications': 'Technical Specifications',
            
            // 通用按钮
            'btn.learn-more': 'Learn More',
            'btn.get-quote': 'Get a Quote',
            'btn.contact-us': 'Contact Us',
            'btn.inquire-now': 'Inquire Now',
            'btn.view-details': 'View Details',
            'btn.add-to-compare': 'Add to Compare',
            'btn.remove-from-compare': 'Remove from Compare',
            'btn.discover-solutions': 'Discover Our Solutions',
            
            // 首页内容
            'hero.title': 'Innovate with Light: World-Class LED Display Manufacturing',
            'hero.subtitle': 'We provide cutting-edge LED solutions that captivate audiences and empower businesses across 160+ countries.',
            
            // 表单标签
            'form.name': 'Your Name',
            'form.email': 'Email Address',
            'form.company': 'Company Name',
            'form.phone': 'Phone Number',
            'form.country': 'Country/Region',
            'form.message': 'Your Message',
            'form.submit': 'Submit Inquiry',
            'form.required': 'Required',
            
            // 页面标题
            'page.home': 'LED Display Solutions',
            'page.about': 'About Us',
            'page.products': 'Our Products',
            'page.contact': 'Contact Us',
            
            // 公司信息
            'company.name': 'Shenzhen Lianjin Optoelectronics Co., Ltd.',
            'company.address': 'Shenzhen, Guangdong, China',
            'company.phone': '+86-755-1234-5678',
            'company.email': 'sales@lianjin-led.com',
            
            // 状态消息
            'status.loading': 'Loading...',
            'status.success': 'Success',
            'status.error': 'Error',
            'status.no-results': 'No results found',
            
            // 产品对比
            'compare.title': 'Product Comparison',
            'compare.empty': 'No products selected for comparison',
            'compare.select-products': 'Please select at least 2 products to compare',
            'compare.max-products': 'You can only compare up to 3 products at a time',
            'compare.selected-for-comparison': 'products selected for comparison',
            'compare.product-selected': 'product selected',
            'compare.products-selected': 'products selected',
            
            // 表单验证
            'validation.name-required': 'Name must be at least 2 characters long',
            'validation.email-invalid': 'Please enter a valid email address',
            'validation.message-length': 'Message must be between 10 and 1000 characters',
            'validation.privacy-required': 'You must agree to the privacy policy to continue',
            
            // 产品规格
            'specs.pixel-pitch': 'Pixel Pitch',
            'specs.brightness': 'Brightness',
            'specs.refresh-rate': 'Refresh Rate',
            'specs.viewing-angle': 'Viewing Angle',
            'specs.power-consumption': 'Power Consumption',
            'specs.weight': 'Weight',
            'specs.dimensions': 'Dimensions',
            'specs.ip-rating': 'IP Rating',
            
            // 页脚
            'footer.quick-links': 'Quick Links',
            'footer.contact-info': 'Contact Information',
            'footer.follow-us': 'Follow Us',
            'footer.copyright': '© 2024 Shenzhen Lianjin Optoelectronics Co., Ltd. All rights reserved.',
            
            // 感谢页面
            'thank-you.title': 'Thank You for Your Inquiry!',
            'thank-you.subtitle': 'We have successfully received your message and will respond within 24 hours.',
            'thank-you.next-steps': 'What Happens Next?',
            'thank-you.step1-title': 'Review & Analysis',
            'thank-you.step1-desc': 'Our technical team will review your requirements and analyze the best solution for your project.',
            'thank-you.step2-title': 'Personal Response',
            'thank-you.step2-desc': 'A dedicated sales engineer will contact you within 24 hours to discuss your project in detail.',
            'thank-you.step3-title': 'Custom Proposal',
            'thank-you.step3-desc': 'We\'ll prepare a detailed proposal with technical specifications and competitive pricing.',
            'thank-you.urgent-title': 'Need Immediate Assistance?',
            'thank-you.urgent-desc': 'For urgent inquiries, please contact us directly:',
            'thank-you.social-proof-title': 'Join 1000+ Satisfied Customers',
            'thank-you.testimonial': '"Lianjin\'s LED displays have transformed our retail spaces. The quality and support are exceptional."',
            'thank-you.testimonial-author': '- Global Retail Chain',
            'btn.back-home': 'Back to Home',
            'btn.browse-products': 'Browse Products',
            'btn.view-cases': 'View Case Studies'
        };
        
        // 中文翻译
        this.translations.zh = {
            // 导航菜单
            'nav.home': '首页',
            'nav.about': '关于我们',
            'nav.products': '产品中心',
            'nav.solutions': '解决方案',
            'nav.cases': '案例展示',
            'nav.news': '新闻资讯',
            'nav.support': '技术支持',
            'nav.contact': '联系我们',
            
            // 产品类别
            'products.fine-pitch': '小间距LED显示屏',
            'products.outdoor': '户外LED显示屏',
            'products.rental': '租赁LED显示屏',
            'products.creative': '创意LED显示屏',
            'products.transparent': '透明LED显示屏',
            'products.interactive': '交互LED显示屏',
            
            // 产品页面内容
            'products.fine-pitch.subtitle': '关键任务视觉的无与伦比清晰度',
            'products.outdoor.subtitle': '任何天气条件下的卓越表现',
            'products.rental.subtitle': '动态活动的便携式解决方案',
            'products.creative.subtitle': '独特显示的无限可能',
            'products.transparent.subtitle': '现代建筑的透视技术',
            
            'product.key-features': '主要特性',
            'product.applications': '应用场景',
            'product.specifications': '技术规格',
            
            // 通用按钮
            'btn.learn-more': '了解更多',
            'btn.get-quote': '获取报价',
            'btn.contact-us': '联系我们',
            'btn.inquire-now': '立即询价',
            'btn.view-details': '查看详情',
            'btn.add-to-compare': '加入对比',
            'btn.remove-from-compare': '移除对比',
            'btn.discover-solutions': '探索我们的解决方案',
            
            // 首页内容
            'hero.title': '光影创新：世界级LED显示屏制造',
            'hero.subtitle': '我们为全球160多个国家的企业提供前沿LED解决方案，吸引观众，赋能商业。',
            
            // 表单标签
            'form.name': '您的姓名',
            'form.email': '邮箱地址',
            'form.company': '公司名称',
            'form.phone': '联系电话',
            'form.country': '国家/地区',
            'form.message': '您的留言',
            'form.submit': '提交询盘',
            'form.required': '必填',
            
            // 页面标题
            'page.home': 'LED显示屏解决方案',
            'page.about': '关于我们',
            'page.products': '我们的产品',
            'page.contact': '联系我们',
            
            // 公司信息
            'company.name': '深圳联锦光电有限公司',
            'company.address': '中国广东省深圳市',
            'company.phone': '+86-755-1234-5678',
            'company.email': 'sales@lianjin-led.com',
            
            // 状态消息
            'status.loading': '加载中...',
            'status.success': '成功',
            'status.error': '错误',
            'status.no-results': '未找到结果',
            
            // 产品对比
            'compare.title': '产品对比',
            'compare.empty': '未选择对比产品',
            'compare.select-products': '请至少选择2个产品进行对比',
            'compare.max-products': '最多只能同时对比3个产品',
            'compare.selected-for-comparison': '个产品已选择对比',
            'compare.product-selected': '个产品已选择',
            'compare.products-selected': '个产品已选择',
            
            // 表单验证
            'validation.name-required': '姓名至少需要2个字符',
            'validation.email-invalid': '请输入有效的邮箱地址',
            'validation.message-length': '留言内容需要在10到1000个字符之间',
            'validation.privacy-required': '您必须同意隐私政策才能继续',
            
            // 产品规格
            'specs.pixel-pitch': '像素间距',
            'specs.brightness': '亮度',
            'specs.refresh-rate': '刷新率',
            'specs.viewing-angle': '视角',
            'specs.power-consumption': '功耗',
            'specs.weight': '重量',
            'specs.dimensions': '尺寸',
            'specs.ip-rating': '防护等级',
            
            // 页脚
            'footer.quick-links': '快速链接',
            'footer.contact-info': '联系信息',
            'footer.follow-us': '关注我们',
            'footer.copyright': '© 2024 深圳联锦光电有限公司 版权所有',
            
            // 感谢页面
            'thank-you.title': '感谢您的询盘！',
            'thank-you.subtitle': '我们已成功收到您的留言，将在24小时内回复。',
            'thank-you.next-steps': '接下来会发生什么？',
            'thank-you.step1-title': '审核与分析',
            'thank-you.step1-desc': '我们的技术团队将审核您的需求并分析最适合您项目的解决方案。',
            'thank-you.step2-title': '专人回复',
            'thank-you.step2-desc': '专业的销售工程师将在24小时内联系您，详细讨论您的项目。',
            'thank-you.step3-title': '定制方案',
            'thank-you.step3-desc': '我们将为您准备详细的技术规格和具有竞争力的报价方案。',
            'thank-you.urgent-title': '需要紧急协助？',
            'thank-you.urgent-desc': '如有紧急询盘，请直接联系我们：',
            'thank-you.social-proof-title': '加入1000+满意客户',
            'thank-you.testimonial': '"联锦的LED显示屏改变了我们的零售空间。质量和支持都非常出色。"',
            'thank-you.testimonial-author': '- 全球零售连锁',
            'btn.back-home': '返回首页',
            'btn.browse-products': '浏览产品',
            'btn.view-cases': '查看案例'
        };
    }
    
    initLanguageSwitchers() {
        const switchers = document.querySelectorAll('.lang-switcher');
        
        switchers.forEach(switcher => {
            // 更新按钮文本
            this.updateSwitcherText(switcher);
            
            // 添加点击事件
            switcher.addEventListener('click', (e) => {
                e.preventDefault();
                this.toggleLanguage();
            });
        });
    }
    
    updateSwitcherText(switcher) {
        if (this.currentLanguage === 'zh') {
            switcher.textContent = '中/EN';
        } else {
            switcher.textContent = 'EN/中';
        }
        switcher.setAttribute('data-lang', this.currentLanguage);
    }
    
    toggleLanguage() {
        // 切换语言
        this.currentLanguage = this.currentLanguage === 'en' ? 'zh' : 'en';
        
        // 保存到本地存储
        try {
            localStorage.setItem('preferred_language', this.currentLanguage);
        } catch (error) {
            console.warn('Failed to save language preference:', error);
        }
        
        // 更新页面
        document.documentElement.lang = this.currentLanguage;
        
        // 更新所有语言切换器
        const switchers = document.querySelectorAll('.lang-switcher');
        switchers.forEach(switcher => {
            this.updateSwitcherText(switcher);
        });
        
        // 应用翻译
        this.applyTranslations();
        
        // 触发语言变更事件
        this.dispatchLanguageChangeEvent();
        
        console.log(`Language switched to: ${this.currentLanguage}`);
    }
    
    applyTranslations() {
        // 查找所有带有 data-i18n 属性的元素
        const elements = document.querySelectorAll('[data-i18n]');
        
        elements.forEach(element => {
            const key = element.getAttribute('data-i18n');
            const translation = this.t(key);
            
            if (translation) {
                // 检查是否有特殊属性需要翻译
                const attr = element.getAttribute('data-i18n-attr');
                if (attr) {
                    element.setAttribute(attr, translation);
                } else {
                    element.textContent = translation;
                }
            }
        });
        
        // 更新产品对比组件的文本
        this.updateProductComparisonTexts();
    }
    
    updateProductComparisonTexts() {
        // 更新产品对比按钮文本
        const compareButtons = document.querySelectorAll('.btn-compare');
        compareButtons.forEach(button => {
            const isActive = button.classList.contains('active');
            const key = isActive ? 'btn.remove-from-compare' : 'btn.add-to-compare';
            button.textContent = this.t(key);
        });
    }
    
    t(key, params = {}) {
        // 获取翻译文本
        let translation = this.translations[this.currentLanguage]?.[key] || 
                         this.translations[this.fallbackLanguage]?.[key] || 
                         key;
        
        // 替换参数
        Object.keys(params).forEach(param => {
            translation = translation.replace(`{{${param}}}`, params[param]);
        });
        
        return translation;
    }
    
    getCurrentLanguage() {
        return this.currentLanguage;
    }
    
    setLanguage(language) {
        if (this.translations[language]) {
            this.currentLanguage = language;
            
            // 保存到本地存储
            try {
                localStorage.setItem('preferred_language', language);
            } catch (error) {
                console.warn('Failed to save language preference:', error);
            }
            
            // 更新页面
            document.documentElement.lang = language;
            
            // 更新语言切换器
            const switchers = document.querySelectorAll('.lang-switcher');
            switchers.forEach(switcher => {
                this.updateSwitcherText(switcher);
            });
            
            // 应用翻译
            this.applyTranslations();
            
            // 触发语言变更事件
            this.dispatchLanguageChangeEvent();
        }
    }
    
    dispatchLanguageChangeEvent() {
        const event = new CustomEvent('languageChanged', {
            detail: {
                language: this.currentLanguage,
                translations: this.translations[this.currentLanguage]
            }
        });
        document.dispatchEvent(event);
    }
    
    // 动态加载翻译资源（用于未来扩展）
    async loadTranslationFile(language) {
        try {
            const response = await fetch(`/api/translations/${language}`);
            if (response.ok) {
                const translations = await response.json();
                this.translations[language] = translations;
                return true;
            }
        } catch (error) {
            console.warn(`Failed to load translations for ${language}:`, error);
        }
        return false;
    }
}

// 全局实例
window.i18n = null;

// 初始化函数
function initializeI18n() {
    if (!window.i18n) {
        window.i18n = new I18n();
    }
    return window.i18n;
}

// 便捷的翻译函数
function t(key, params = {}) {
    return window.i18n ? window.i18n.t(key, params) : key;
}

// 导出（如果使用模块系统）
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { I18n, initializeI18n, t };
}