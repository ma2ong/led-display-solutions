/* =================================================================
   PERFORMANCE OPTIMIZER MODULE
   Handles various performance optimizations for the LED website
   ================================================================= */

class PerformanceOptimizer {
    constructor() {
        this.config = null;
        this.metrics = {
            loadTime: 0,
            domContentLoaded: 0,
            firstPaint: 0,
            firstContentfulPaint: 0,
            largestContentfulPaint: 0
        };
        this.observers = new Map();
        
        this.init();
    }
    
    async init() {
        try {
            // Load configuration
            await this.loadConfig();
            
            // Initialize performance monitoring
            this.initPerformanceMonitoring();
            
            // Initialize optimizations
            this.initImageOptimizations();
            this.initResourcePreloading();
            this.initCriticalResourceLoading();
            this.initUserExperienceEnhancements();
            
            console.log('Performance Optimizer initialized');
        } catch (error) {
            console.warn('Performance Optimizer initialization failed:', error);
        }
    }
    
    async loadConfig() {
        try {
            const response = await fetch('/performance-config.json');
            this.config = await response.json();
        } catch (error) {
            console.warn('Failed to load performance config, using defaults');
            this.config = this.getDefaultConfig();
        }
    }
    
    getDefaultConfig() {
        return {
            optimization: {
                images: {
                    lazyLoading: true,
                    webpSupport: true,
                    compressionQuality: 85,
                    fadeInDuration: 300
                },
                css: {
                    criticalCss: true,
                    prefetch: ['style.css']
                },
                javascript: {
                    deferNonCritical: true,
                    preloadCritical: ['main.js']
                }
            },
            monitoring: {
                performanceMetrics: true,
                errorTracking: true
            }
        };
    }
    
    initPerformanceMonitoring() {
        if (!this.config.monitoring.performanceMetrics) return;
        
        // Monitor Core Web Vitals
        this.observeLCP();
        this.observeFID();
        this.observeCLS();
        
        // Monitor basic metrics
        window.addEventListener('load', () => {
            this.metrics.loadTime = performance.now();
            this.reportMetrics();
        });
        
        document.addEventListener('DOMContentLoaded', () => {
            this.metrics.domContentLoaded = performance.now();
        });
        
        // Monitor paint metrics
        if ('PerformanceObserver' in window) {
            const paintObserver = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    if (entry.name === 'first-paint') {
                        this.metrics.firstPaint = entry.startTime;
                    } else if (entry.name === 'first-contentful-paint') {
                        this.metrics.firstContentfulPaint = entry.startTime;
                    }
                }
            });
            
            try {
                paintObserver.observe({ entryTypes: ['paint'] });
            } catch (error) {
                console.warn('Paint observer not supported');
            }
        }
    }
    
    observeLCP() {
        if (!('PerformanceObserver' in window)) return;
        
        const lcpObserver = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            const lastEntry = entries[entries.length - 1];
            this.metrics.largestContentfulPaint = lastEntry.startTime;
            
            // Report if threshold exceeded
            const threshold = this.config.thresholds?.largestContentfulPaint || 2500;
            if (lastEntry.startTime > threshold) {
                console.warn(`LCP threshold exceeded: ${lastEntry.startTime}ms > ${threshold}ms`);
            }
        });
        
        try {
            lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
            this.observers.set('lcp', lcpObserver);
        } catch (error) {
            console.warn('LCP observer not supported');
        }
    }
    
    observeFID() {
        if (!('PerformanceObserver' in window)) return;
        
        const fidObserver = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
                const threshold = this.config.thresholds?.firstInputDelay || 100;
                if (entry.processingStart - entry.startTime > threshold) {
                    console.warn(`FID threshold exceeded: ${entry.processingStart - entry.startTime}ms > ${threshold}ms`);
                }
            }
        });
        
        try {
            fidObserver.observe({ entryTypes: ['first-input'] });
            this.observers.set('fid', fidObserver);
        } catch (error) {
            console.warn('FID observer not supported');
        }
    }
    
    observeCLS() {
        if (!('PerformanceObserver' in window)) return;
        
        let clsValue = 0;
        const clsObserver = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
                if (!entry.hadRecentInput) {
                    clsValue += entry.value;
                }
            }
            
            const threshold = this.config.thresholds?.cumulativeLayoutShift || 0.1;
            if (clsValue > threshold) {
                console.warn(`CLS threshold exceeded: ${clsValue} > ${threshold}`);
            }
        });
        
        try {
            clsObserver.observe({ entryTypes: ['layout-shift'] });
            this.observers.set('cls', clsObserver);
        } catch (error) {
            console.warn('CLS observer not supported');
        }
    }
    
    initImageOptimizations() {
        if (!this.config.optimization.images.lazyLoading) return;
        
        // Enhanced lazy loading with better placeholders
        const images = document.querySelectorAll('img[data-src]');
        if (!images.length) return;
        
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    this.loadImage(img);
                    observer.unobserve(img);
                }
            });
        }, {
            rootMargin: '50px 0px',
            threshold: 0.01
        });
        
        images.forEach(img => {
            // Add loading placeholder
            this.addImagePlaceholder(img);
            imageObserver.observe(img);
        });
        
        this.observers.set('images', imageObserver);
    }
    
    addImagePlaceholder(img) {
        const placeholder = document.createElement('div');
        placeholder.className = 'image-placeholder loading-placeholder';
        placeholder.style.cssText = `
            width: ${img.getAttribute('width') || '100%'};
            height: ${img.getAttribute('height') || '200px'};
            background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
            background-size: 200% 100%;
            animation: loading 1.5s infinite;
            border-radius: 8px;
        `;
        
        img.parentNode.insertBefore(placeholder, img);
        img.style.display = 'none';
    }
    
    async loadImage(img) {
        const src = img.dataset.src;
        const placeholder = img.previousElementSibling;
        
        try {
            // Check for WebP support and use WebP if available
            const webpSrc = await this.getOptimizedImageSrc(src);
            
            // Preload the image
            const imageLoader = new Image();
            imageLoader.onload = () => {
                img.src = webpSrc;
                img.style.display = 'block';
                img.style.opacity = '0';
                img.style.transition = `opacity ${this.config.optimization.images.fadeInDuration}ms ease-in-out`;
                
                // Remove placeholder
                if (placeholder && placeholder.classList.contains('image-placeholder')) {
                    placeholder.remove();
                }
                
                // Fade in
                requestAnimationFrame(() => {
                    img.style.opacity = '1';
                });
                
                img.classList.add('loaded');
            };
            
            imageLoader.onerror = () => {
                console.warn(`Failed to load image: ${src}`);
                img.src = src; // Fallback to original
                img.style.display = 'block';
                if (placeholder) placeholder.remove();
            };
            
            imageLoader.src = webpSrc;
            
        } catch (error) {
            console.warn('Image loading error:', error);
            img.src = src;
            img.style.display = 'block';
            if (placeholder) placeholder.remove();
        }
    }
    
    async getOptimizedImageSrc(src) {
        if (!this.config.optimization.images.webpSupport) return src;
        
        // Check if browser supports WebP
        if (!this.supportsWebP()) return src;
        
        // Convert to WebP URL if possible
        const webpSrc = src.replace(/\.(jpg|jpeg|png)$/i, '.webp');
        
        // Check if WebP version exists
        try {
            const response = await fetch(webpSrc, { method: 'HEAD' });
            return response.ok ? webpSrc : src;
        } catch {
            return src;
        }
    }
    
    supportsWebP() {
        if (this._webpSupport !== undefined) return this._webpSupport;
        
        const canvas = document.createElement('canvas');
        canvas.width = 1;
        canvas.height = 1;
        this._webpSupport = canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
        return this._webpSupport;
    }
    
    initResourcePreloading() {
        const { css, javascript, fonts } = this.config.optimization;
        
        // Preload critical CSS
        if (css.prefetch) {
            css.prefetch.forEach(href => {
                this.preloadResource(href, 'style');
            });
        }
        
        // Preload critical JavaScript
        if (javascript.preloadCritical) {
            javascript.preloadCritical.forEach(src => {
                this.preloadResource(`/js/${src}`, 'script');
            });
        }
        
        // Preload fonts
        if (fonts && fonts.preload) {
            fonts.preload.forEach(fontFamily => {
                this.preloadFont(fontFamily);
            });
        }
    }
    
    preloadResource(href, as) {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.href = href;
        link.as = as;
        
        if (as === 'style') {
            link.onload = () => {
                link.rel = 'stylesheet';
            };
        }
        
        document.head.appendChild(link);
    }
    
    preloadFont(fontFamily) {
        // This is a simplified version - in production, you'd specify exact font files
        const link = document.createElement('link');
        link.rel = 'preload';
        link.href = `https://fonts.googleapis.com/css2?family=${fontFamily}:wght@400;500;600;700&display=swap`;
        link.as = 'style';
        link.onload = () => {
            link.rel = 'stylesheet';
        };
        document.head.appendChild(link);
    }
    
    initCriticalResourceLoading() {
        // Load non-critical CSS asynchronously
        this.loadNonCriticalCSS();
        
        // Defer non-critical JavaScript
        if (this.config.optimization.javascript.deferNonCritical) {
            this.deferNonCriticalJS();
        }
    }
    
    loadNonCriticalCSS() {
        const criticalLoaded = document.querySelector('link[href*="critical.css"]');
        if (!criticalLoaded) return;
        
        // Load main stylesheet after critical CSS
        const mainCSS = document.createElement('link');
        mainCSS.rel = 'stylesheet';
        mainCSS.href = '/css/style.css';
        mainCSS.media = 'print';
        mainCSS.onload = () => {
            mainCSS.media = 'all';
        };
        
        document.head.appendChild(mainCSS);
    }
    
    deferNonCriticalJS() {
        const scripts = document.querySelectorAll('script[data-defer="true"]');
        scripts.forEach(script => {
            const newScript = document.createElement('script');
            newScript.src = script.src;
            newScript.defer = true;
            
            // Load after page load
            window.addEventListener('load', () => {
                document.head.appendChild(newScript);
            });
        });
    }
    
    initUserExperienceEnhancements() {
        // Add loading indicators
        this.initLoadingIndicators();
        
        // Optimize form interactions
        this.optimizeFormExperience();
        
        // Add connection-aware loading
        this.initConnectionAwareLoading();
    }
    
    initLoadingIndicators() {
        // Add page loading indicator
        const loadingBar = document.createElement('div');
        loadingBar.id = 'page-loading-bar';
        loadingBar.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 0%;
            height: 3px;
            background: linear-gradient(90deg, var(--primary-blue), var(--accent-orange));
            z-index: 9999;
            transition: width 0.3s ease;
        `;
        
        document.body.appendChild(loadingBar);
        
        // Simulate loading progress
        let progress = 0;
        const interval = setInterval(() => {
            progress += Math.random() * 15;
            if (progress > 90) progress = 90;
            loadingBar.style.width = progress + '%';
        }, 100);
        
        window.addEventListener('load', () => {
            clearInterval(interval);
            loadingBar.style.width = '100%';
            setTimeout(() => {
                loadingBar.remove();
            }, 500);
        });
    }
    
    optimizeFormExperience() {
        // Add input debouncing for better performance
        const inputs = document.querySelectorAll('input, textarea');
        inputs.forEach(input => {
            let timeout;
            input.addEventListener('input', (e) => {
                clearTimeout(timeout);
                timeout = setTimeout(() => {
                    // Trigger validation or other actions
                    this.handleInputChange(e.target);
                }, 300);
            });
        });
    }
    
    handleInputChange(input) {
        // Placeholder for optimized input handling
        // This could include validation, auto-save, etc.
        if (input.type === 'email') {
            this.validateEmailAsync(input);
        }
    }
    
    async validateEmailAsync(input) {
        const email = input.value;
        if (!email || !email.includes('@')) return;
        
        // Debounced email validation
        try {
            // This would typically call an API to validate the email
            // For now, just basic client-side validation
            const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
            input.classList.toggle('valid', isValid);
            input.classList.toggle('invalid', !isValid);
        } catch (error) {
            console.warn('Email validation error:', error);
        }
    }
    
    initConnectionAwareLoading() {
        if (!('connection' in navigator)) return;
        
        const connection = navigator.connection;
        const isSlowConnection = connection.effectiveType === 'slow-2g' || 
                                connection.effectiveType === '2g' ||
                                connection.saveData;
        
        if (isSlowConnection) {
            // Reduce image quality for slow connections
            this.config.optimization.images.compressionQuality = 60;
            
            // Disable some animations
            document.documentElement.classList.add('reduced-motion');
            
            console.log('Slow connection detected, optimizing experience');
        }
    }
    
    reportMetrics() {
        if (!this.config.monitoring.performanceMetrics) return;
        
        const report = {
            ...this.metrics,
            timestamp: Date.now(),
            userAgent: navigator.userAgent,
            connection: navigator.connection ? {
                effectiveType: navigator.connection.effectiveType,
                downlink: navigator.connection.downlink,
                saveData: navigator.connection.saveData
            } : null
        };
        
        console.log('Performance Metrics:', report);
        
        // In production, you would send this to your analytics service
        // this.sendToAnalytics(report);
    }
    
    // Cleanup method
    destroy() {
        this.observers.forEach(observer => {
            observer.disconnect();
        });
        this.observers.clear();
    }
}

// Initialize performance optimizer when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.performanceOptimizer = new PerformanceOptimizer();
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PerformanceOptimizer;
}