/* =================================================================
   SEO OPTIMIZER MODULE
   Handles SEO optimization features including meta tags, structured data, and analytics
   ================================================================= */
class SEOOptimizer {
    constructor() {
        this.config = {
            siteName: 'LED Display Solutions',
            defaultTitle: 'Professional LED Display Solutions | Shenzhen Lianjin Optoelectronics',
            defaultDescription: 'Leading manufacturer of high-quality LED displays including fine pitch, outdoor, rental, and creative LED solutions for commercial and industrial applications.',
            defaultKeywords: 'LED display, LED screen, fine pitch LED, outdoor LED, rental LED, transparent LED, creative LED, digital signage',
            defaultImage: '/images/og-default.jpg',
            twitterHandle: '@LEDSolutions',
            fbAppId: '',
            googleAnalyticsId: 'GA_MEASUREMENT_ID',
            googleTagManagerId: 'GTM_CONTAINER_ID',
            structuredDataEnabled: true,
            canonicalUrlEnabled: true,
            openGraphEnabled: true,
            twitterCardEnabled: true,
            jsonLdEnabled: true
        };
        
        this.pageData = {};
        this.structuredData = {};
        
        this.init();
    }
    
    init() {
        this.loadConfiguration();
        this.detectPageType();
        this.optimizeCurrentPage();
        this.setupAnalytics();
        this.setupSocialSharing();
        
        console.log('SEO Optimizer initialized');
    }
    
    loadConfiguration() {
        // Load configuration from external file or API
        try {
            const configElement = document.querySelector('script[type="application/json"][data-seo-config]');
            if (configElement) {
                const customConfig = JSON.parse(configElement.textContent);
                this.config = { ...this.config, ...customConfig };
            }
        } catch (error) {
            console.warn('Failed to load SEO configuration:', error);
        }
    }
    
    detectPageType() {
        const path = window.location.pathname;
        const params = new URLSearchParams(window.location.search);
        
        // Detect page type based on URL and content
        if (path === '/' || path === '/index.html') {
            this.pageData.type = 'homepage';
        } else if (path.includes('/products') || path.includes('/product')) {
            this.pageData.type = params.get('id') ? 'product' : 'products';
        } else if (path.includes('/about')) {
            this.pageData.type = 'about';
        } else if (path.includes('/contact')) {
            this.pageData.type = 'contact';
        } else if (path.includes('/news') || path.includes('/blog')) {
            this.pageData.type = 'article';
        } else {
            this.pageData.type = 'page';
        }
        
        // Extract page-specific data
        this.extractPageData();
    }
    
    extractPageData() {
        // Extract title
        const titleElement = document.querySelector('h1');
        this.pageData.title = titleElement ? titleElement.textContent.trim() : '';
        
        // Extract description from meta tag or first paragraph
        let description = document.querySelector('meta[name="description"]')?.getAttribute('content');
        if (!description) {
            const firstParagraph = document.querySelector('main p, .content p, .page-content p');
            if (firstParagraph) {
                description = firstParagraph.textContent.trim().substring(0, 160);
            }
        }
        this.pageData.description = description || this.config.defaultDescription;
        
        // Extract keywords
        const keywordsElement = document.querySelector('meta[name="keywords"]');
        this.pageData.keywords = keywordsElement ? 
            keywordsElement.getAttribute('content') : this.config.defaultKeywords;
        
        // Extract image
        const ogImage = document.querySelector('meta[property="og:image"]');
        const firstImage = document.querySelector('main img, .content img, .hero img');
        this.pageData.image = ogImage ? 
            ogImage.getAttribute('content') : 
            (firstImage ? firstImage.src : this.config.defaultImage);
        
        // Extract canonical URL
        this.pageData.canonicalUrl = this.getCanonicalUrl();
        
        // Extract breadcrumb data
        this.pageData.breadcrumbs = this.extractBreadcrumbs();
        
        // Extract product data if applicable
        if (this.pageData.type === 'product') {
            this.extractProductData();
        }
    }
    
    extractProductData() {
        // Extract product-specific data for structured data
        const productData = {};
        
        // Try to get product data from various sources
        const productTitle = document.querySelector('.product-title, .product-name, h1');
        if (productTitle) {
            productData.name = productTitle.textContent.trim();
        }
        
        const productDescription = document.querySelector('.product-description, .product-summary');
        if (productDescription) {
            productData.description = productDescription.textContent.trim();
        }
        
        const productImage = document.querySelector('.product-image img, .product-gallery img');
        if (productImage) {
            productData.image = productImage.src;
        }
        
        const productPrice = document.querySelector('.product-price, .price');
        if (productPrice) {
            const priceText = productPrice.textContent.replace(/[^0-9.,]/g, '');
            if (priceText) {
                productData.price = parseFloat(priceText.replace(',', ''));
            }
        }
        
        // Extract specifications
        const specs = {};
        document.querySelectorAll('.spec-item, .specification-item').forEach(item => {
            const label = item.querySelector('.spec-label, .spec-name');
            const value = item.querySelector('.spec-value, .spec-data');
            if (label && value) {
                specs[label.textContent.trim()] = value.textContent.trim();
            }
        });
        
        if (Object.keys(specs).length > 0) {
            productData.specifications = specs;
        }
        
        this.pageData.product = productData;
    }
    
    extractBreadcrumbs() {
        const breadcrumbs = [];
        const breadcrumbElements = document.querySelectorAll('.breadcrumb a, .breadcrumb-item a, nav[aria-label="breadcrumb"] a');
        
        breadcrumbElements.forEach((element, index) => {
            breadcrumbs.push({
                name: element.textContent.trim(),
                url: element.href,
                position: index + 1
            });
        });
        
        // Add current page if not in breadcrumbs
        if (breadcrumbs.length > 0) {
            const currentPageTitle = this.pageData.title || document.title;
            breadcrumbs.push({
                name: currentPageTitle,
                url: window.location.href,
                position: breadcrumbs.length + 1
            });
        }
        
        return breadcrumbs;
    }
    
    getCanonicalUrl() {
        const existingCanonical = document.querySelector('link[rel="canonical"]');
        if (existingCanonical) {
            return existingCanonical.href;
        }
        
        // Generate canonical URL
        const url = new URL(window.location.href);
        // Remove tracking parameters
        const trackingParams = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'fbclid', 'gclid'];
        trackingParams.forEach(param => url.searchParams.delete(param));
        
        return url.toString();
    }
    
    optimizeCurrentPage() {
        this.updateTitle();
        this.updateMetaTags();
        
        if (this.config.canonicalUrlEnabled) {
            this.addCanonicalUrl();
        }
        
        if (this.config.openGraphEnabled) {
            this.addOpenGraphTags();
        }
        
        if (this.config.twitterCardEnabled) {
            this.addTwitterCardTags();
        }
        
        if (this.config.jsonLdEnabled) {
            this.addStructuredData();
        }
        
        this.optimizeImages();
        this.optimizeLinks();
        this.addRobotsTags();
    }
    
    updateTitle() {
        let title = this.pageData.title;
        
        if (title && title !== this.config.siteName) {
            title = `${title} | ${this.config.siteName}`;
        } else {
            title = this.config.defaultTitle;
        }
        
        document.title = title;
        
        // Update og:title if it exists
        const ogTitle = document.querySelector('meta[property="og:title"]');
        if (ogTitle) {
            ogTitle.setAttribute('content', this.pageData.title || title);
        }
    }
    
    updateMetaTags() {
        // Update or create meta description
        this.updateOrCreateMeta('name', 'description', this.pageData.description);
        
        // Update or create meta keywords
        this.updateOrCreateMeta('name', 'keywords', this.pageData.keywords);
        
        // Add viewport meta tag if missing
        if (!document.querySelector('meta[name="viewport"]')) {
            this.updateOrCreateMeta('name', 'viewport', 'width=device-width, initial-scale=1.0');
        }
        
        // Add charset meta tag if missing
        if (!document.querySelector('meta[charset]')) {
            const charsetMeta = document.createElement('meta');
            charsetMeta.setAttribute('charset', 'UTF-8');
            document.head.insertBefore(charsetMeta, document.head.firstChild);
        }
        
        // Add robots meta tag
        this.updateOrCreateMeta('name', 'robots', 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1');
        
        // Add author meta tag
        this.updateOrCreateMeta('name', 'author', this.config.siteName);
        
        // Add generator meta tag
        this.updateOrCreateMeta('name', 'generator', 'LED Website SEO Optimizer');
    }
    
    updateOrCreateMeta(attribute, name, content) {
        if (!content) return;
        
        let meta = document.querySelector(`meta[${attribute}="${name}"]`);
        if (!meta) {
            meta = document.createElement('meta');
            meta.setAttribute(attribute, name);
            document.head.appendChild(meta);
        }
        meta.setAttribute('content', content);
    }
    
    addCanonicalUrl() {
        let canonical = document.querySelector('link[rel="canonical"]');
        if (!canonical) {
            canonical = document.createElement('link');
            canonical.setAttribute('rel', 'canonical');
            document.head.appendChild(canonical);
        }
        canonical.setAttribute('href', this.pageData.canonicalUrl);
    }
    
    addOpenGraphTags() {
        const ogTags = {
            'og:type': this.pageData.type === 'product' ? 'product' : 'website',
            'og:title': this.pageData.title || this.config.defaultTitle,
            'og:description': this.pageData.description,
            'og:image': this.pageData.image,
            'og:url': this.pageData.canonicalUrl,
            'og:site_name': this.config.siteName,
            'og:locale': document.documentElement.lang || 'en_US'
        };
        
        if (this.config.fbAppId) {
            ogTags['fb:app_id'] = this.config.fbAppId;
        }
        
        // Add product-specific OG tags
        if (this.pageData.type === 'product' && this.pageData.product) {
            if (this.pageData.product.price) {
                ogTags['product:price:amount'] = this.pageData.product.price;
                ogTags['product:price:currency'] = 'USD';
            }
        }
        
        Object.entries(ogTags).forEach(([property, content]) => {
            if (content) {
                this.updateOrCreateMeta('property', property, content);
            }
        });
    }
    
    addTwitterCardTags() {
        const twitterTags = {
            'twitter:card': 'summary_large_image',
            'twitter:title': this.pageData.title || this.config.defaultTitle,
            'twitter:description': this.pageData.description,
            'twitter:image': this.pageData.image,
            'twitter:site': this.config.twitterHandle,
            'twitter:creator': this.config.twitterHandle
        };
        
        Object.entries(twitterTags).forEach(([name, content]) => {
            if (content) {
                this.updateOrCreateMeta('name', name, content);
            }
        });
    }
    
    addStructuredData() {
        // Remove existing structured data
        document.querySelectorAll('script[type="application/ld+json"]').forEach(script => {
            if (script.dataset.seoGenerated) {
                script.remove();
            }
        });
        
        const structuredDataArray = [];
        
        // Add organization data
        structuredDataArray.push(this.generateOrganizationData());
        
        // Add website data
        structuredDataArray.push(this.generateWebsiteData());
        
        // Add breadcrumb data
        if (this.pageData.breadcrumbs && this.pageData.breadcrumbs.length > 1) {
            structuredDataArray.push(this.generateBreadcrumbData());
        }
        
        // Add page-specific structured data
        switch (this.pageData.type) {
            case 'product':
                if (this.pageData.product) {
                    structuredDataArray.push(this.generateProductData());
                }
                break;
            case 'article':
                structuredDataArray.push(this.generateArticleData());
                break;
        }
        
        // Add FAQ data if FAQ section exists
        const faqData = this.generateFAQData();
        if (faqData) {
            structuredDataArray.push(faqData);
        }
        
        // Insert structured data
        structuredDataArray.forEach(data => {
            if (data) {
                const script = document.createElement('script');
                script.type = 'application/ld+json';
                script.dataset.seoGenerated = 'true';
                script.textContent = JSON.stringify(data, null, 2);
                document.head.appendChild(script);
            }
        });
    }
    
    generateOrganizationData() {
        return {
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": this.config.siteName,
            "url": window.location.origin,
            "logo": {
                "@type": "ImageObject",
                "url": window.location.origin + "/images/logo.png"
            },
            "contactPoint": {
                "@type": "ContactPoint",
                "telephone": "+86-755-1234-5678",
                "contactType": "customer service",
                "availableLanguage": ["English", "Chinese"]
            },
            "address": {
                "@type": "PostalAddress",
                "streetAddress": "123 LED Technology Park",
                "addressLocality": "Shenzhen",
                "addressRegion": "Guangdong",
                "postalCode": "518000",
                "addressCountry": "CN"
            },
            "sameAs": [
                "https://www.linkedin.com/company/led-solutions",
                "https://www.facebook.com/ledsolutions",
                "https://twitter.com/ledsolutions"
            ]
        };
    }
    
    generateWebsiteData() {
        return {
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": this.config.siteName,
            "url": window.location.origin,
            "potentialAction": {
                "@type": "SearchAction",
                "target": {
                    "@type": "EntryPoint",
                    "urlTemplate": window.location.origin + "/search?q={search_term_string}"
                },
                "query-input": "required name=search_term_string"
            }
        };
    }
    
    generateBreadcrumbData() {
        return {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": this.pageData.breadcrumbs.map(crumb => ({
                "@type": "ListItem",
                "position": crumb.position,
                "name": crumb.name,
                "item": crumb.url
            }))
        };
    }
    
    generateProductData() {
        const product = this.pageData.product;
        const productData = {
            "@context": "https://schema.org",
            "@type": "Product",
            "name": product.name,
            "description": product.description,
            "image": product.image,
            "brand": {
                "@type": "Brand",
                "name": this.config.siteName
            },
            "manufacturer": {
                "@type": "Organization",
                "name": this.config.siteName
            }
        };
        
        if (product.price) {
            productData.offers = {
                "@type": "Offer",
                "price": product.price,
                "priceCurrency": "USD",
                "availability": "https://schema.org/InStock",
                "seller": {
                    "@type": "Organization",
                    "name": this.config.siteName
                }
            };
        }
        
        if (product.specifications) {
            productData.additionalProperty = Object.entries(product.specifications).map(([name, value]) => ({
                "@type": "PropertyValue",
                "name": name,
                "value": value
            }));
        }
        
        return productData;
    }
    
    generateArticleData() {
        return {
            "@context": "https://schema.org",
            "@type": "Article",
            "headline": this.pageData.title,
            "description": this.pageData.description,
            "image": this.pageData.image,
            "author": {
                "@type": "Organization",
                "name": this.config.siteName
            },
            "publisher": {
                "@type": "Organization",
                "name": this.config.siteName,
                "logo": {
                    "@type": "ImageObject",
                    "url": window.location.origin + "/images/logo.png"
                }
            },
            "datePublished": document.querySelector('meta[name="date"]')?.getAttribute('content') || new Date().toISOString(),
            "dateModified": new Date().toISOString()
        };
    }
    
    generateFAQData() {
        const faqItems = document.querySelectorAll('.faq-item, .accordion-item');
        if (faqItems.length === 0) return null;
        
        const mainEntity = [];
        
        faqItems.forEach(item => {
            const question = item.querySelector('.faq-question, .accordion-header, h3, h4');
            const answer = item.querySelector('.faq-answer, .accordion-body, .faq-content');
            
            if (question && answer) {
                mainEntity.push({
                    "@type": "Question",
                    "name": question.textContent.trim(),
                    "acceptedAnswer": {
                        "@type": "Answer",
                        "text": answer.textContent.trim()
                    }
                });
            }
        });
        
        if (mainEntity.length === 0) return null;
        
        return {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": mainEntity
        };
    }
    
    optimizeImages() {
        document.querySelectorAll('img').forEach(img => {
            // Add alt text if missing
            if (!img.alt && img.src) {
                const filename = img.src.split('/').pop().split('.')[0];
                img.alt = filename.replace(/[-_]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
            }
            
            // Add loading="lazy" for images below the fold
            if (!img.loading && this.isImageBelowFold(img)) {
                img.loading = 'lazy';
            }
            
            // Add width and height attributes if missing
            if (!img.width && !img.height && img.complete) {
                img.width = img.naturalWidth;
                img.height = img.naturalHeight;
            }
        });
    }
    
    isImageBelowFold(img) {
        const rect = img.getBoundingClientRect();
        return rect.top > window.innerHeight;
    }
    
    optimizeLinks() {
        document.querySelectorAll('a').forEach(link => {
            // Add rel="noopener" to external links
            if (link.hostname && link.hostname !== window.location.hostname) {
                if (!link.rel.includes('noopener')) {
                    link.rel = link.rel ? `${link.rel} noopener` : 'noopener';
                }
                
                // Add target="_blank" if not set
                if (!link.target) {
                    link.target = '_blank';
                }
            }
            
            // Add title attribute if missing
            if (!link.title && link.textContent.trim()) {
                link.title = link.textContent.trim();
            }
        });
    }
    
    addRobotsTags() {
        // Add robots meta tag based on page type
        let robotsContent = 'index, follow';
        
        // Don't index certain pages
        const noIndexPages = ['/admin', '/login', '/search', '/404'];
        if (noIndexPages.some(page => window.location.pathname.includes(page))) {
            robotsContent = 'noindex, nofollow';
        }
        
        this.updateOrCreateMeta('name', 'robots', robotsContent);
    }
    
    setupAnalytics() {
        // Google Analytics 4
        if (this.config.googleAnalyticsId && this.config.googleAnalyticsId !== 'GA_MEASUREMENT_ID') {
            this.loadGoogleAnalytics();
        }
        
        // Google Tag Manager
        if (this.config.googleTagManagerId && this.config.googleTagManagerId !== 'GTM_CONTAINER_ID') {
            this.loadGoogleTagManager();
        }
        
        // Track page view
        this.trackPageView();
    }
    
    loadGoogleAnalytics() {
        // Load gtag script
        const gtagScript = document.createElement('script');
        gtagScript.async = true;
        gtagScript.src = `https://www.googletagmanager.com/gtag/js?id=${this.config.googleAnalyticsId}`;
        document.head.appendChild(gtagScript);
        
        // Initialize gtag
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', this.config.googleAnalyticsId, {
            page_title: document.title,
            page_location: window.location.href
        });
        
        window.gtag = gtag;
    }
    
    loadGoogleTagManager() {
        // GTM script
        const gtmScript = document.createElement('script');
        gtmScript.innerHTML = `
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','${this.config.googleTagManagerId}');
        `;
        document.head.appendChild(gtmScript);
        
        // GTM noscript
        const gtmNoscript = document.createElement('noscript');
        gtmNoscript.innerHTML = `
            <iframe src="https://www.googletagmanager.com/ns.html?id=${this.config.googleTagManagerId}"
                    height="0" width="0" style="display:none;visibility:hidden"></iframe>
        `;
        document.body.insertBefore(gtmNoscript, document.body.firstChild);
    }
    
    trackPageView() {
        // Track page view with custom data
        const pageData = {
            page_title: document.title,
            page_location: window.location.href,
            page_type: this.pageData.type,
            content_group1: this.pageData.type
        };
        
        if (typeof gtag !== 'undefined') {
            gtag('event', 'page_view', pageData);
        }
        
        // Custom tracking for LED website
        this.trackLEDSpecificEvents();
    }
    
    trackLEDSpecificEvents() {
        // Track product views
        if (this.pageData.type === 'product' && this.pageData.product) {
            if (typeof gtag !== 'undefined') {
                gtag('event', 'view_item', {
                    currency: 'USD',
                    value: this.pageData.product.price || 0,
                    items: [{
                        item_id: this.pageData.product.name,
                        item_name: this.pageData.product.name,
                        category: 'LED Display',
                        quantity: 1,
                        price: this.pageData.product.price || 0
                    }]
                });
            }
        }
        
        // Track contact form views
        if (this.pageData.type === 'contact') {
            if (typeof gtag !== 'undefined') {
                gtag('event', 'view_contact_form', {
                    event_category: 'Contact',
                    event_label: 'Contact Page View'
                });
            }
        }
    }
    
    setupSocialSharing() {
        // Add social sharing buttons if container exists
        const shareContainer = document.querySelector('.social-share, .share-buttons');
        if (shareContainer) {
            this.addSocialShareButtons(shareContainer);
        }
    }
    
    addSocialShareButtons(container) {
        const shareData = {
            title: this.pageData.title || document.title,
            text: this.pageData.description,
            url: this.pageData.canonicalUrl
        };
        
        const shareButtons = [
            {
                name: 'Facebook',
                url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareData.url)}`,
                icon: '📘'
            },
            {
                name: 'Twitter',
                url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareData.text)}&url=${encodeURIComponent(shareData.url)}`,
                icon: '🐦'
            },
            {
                name: 'LinkedIn',
                url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareData.url)}`,
                icon: '💼'
            }
        ];
        
        const buttonsHTML = shareButtons.map(button => `
            <a href="${button.url}" target="_blank" rel="noopener" class="share-button" data-platform="${button.name.toLowerCase()}">
                <span class="share-icon">${button.icon}</span>
                <span class="share-text">${button.name}</span>
            </a>
        `).join('');
        
        container.innerHTML = `
            <div class="share-buttons-container">
                <span class="share-label">Share:</span>
                ${buttonsHTML}
            </div>
        `;
        
        // Add click tracking
        container.querySelectorAll('.share-button').forEach(button => {
            button.addEventListener('click', (e) => {
                const platform = e.currentTarget.dataset.platform;
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'share', {
                        method: platform,
                        content_type: this.pageData.type,
                        item_id: shareData.url
                    });
                }
            });
        });
    }
    
    // Public API methods
    updatePageData(newData) {
        this.pageData = { ...this.pageData, ...newData };
        this.optimizeCurrentPage();
    }
    
    trackEvent(eventName, parameters = {}) {
        if (typeof gtag !== 'undefined') {
            gtag('event', eventName, parameters);
        }
    }
    
    trackConversion(conversionData) {
        if (typeof gtag !== 'undefined') {
            gtag('event', 'conversion', {
                send_to: this.config.googleAnalyticsId,
                ...conversionData
            });
        }
    }
    
    generateSitemap() {
        // Generate basic sitemap data
        const pages = [
            { url: '/', priority: 1.0, changefreq: 'weekly' },
            { url: '/products.html', priority: 0.9, changefreq: 'weekly' },
            { url: '/about.html', priority: 0.7, changefreq: 'monthly' },
            { url: '/contact.html', priority: 0.8, changefreq: 'monthly' },
            { url: '/fine-pitch.html', priority: 0.8, changefreq: 'weekly' },
            { url: '/outdoor.html', priority: 0.8, changefreq: 'weekly' },
            { url: '/rental.html', priority: 0.8, changefreq: 'weekly' }
        ];
        
        return pages.map(page => ({
            ...page,
            url: window.location.origin + page.url,
            lastmod: new Date().toISOString()
        }));
    }
}

// Initialize SEO Optimizer when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.seoOptimizer = new SEOOptimizer();
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SEOOptimizer;
}