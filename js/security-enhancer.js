/* =================================================================
   SECURITY ENHANCER MODULE
   Advanced security features and protection mechanisms
   ================================================================= */
class SecurityEnhancer {
    constructor() {
        this.config = null;
        this.csrfToken = null;
        this.rateLimitData = new Map();
        this.securityLog = [];
        this.blockedIPs = new Set();
        this.sessionData = {};
        this.encryptionKey = null;
        this.init();
    }

    async init() {
        try {
            await this.loadSecurityConfig();
            this.setupCSRFProtection();
            this.setupXSSProtection();
            this.setupRateLimiting();
            this.setupInputValidation();
            this.setupSecurityHeaders();
            this.setupSessionSecurity();
            this.setupFileUploadSecurity();
            this.setupSecurityMonitoring();
            this.setupContentSecurityPolicy();
            console.log('Security Enhancer initialized successfully');
        } catch (error) {
            console.error('Security Enhancer initialization failed:', error);
        }
    }

    async loadSecurityConfig() {
        try {
            const response = await fetch('security-config.json');
            this.config = await response.json();
        } catch (error) {
            console.warn('Could not load security config, using defaults');
            this.config = this.getDefaultSecurityConfig();
        }
    }

    getDefaultSecurityConfig() {
        return {
            security: {
                inputValidation: { enabled: true, maxInputLength: 1000 },
                xssProtection: { enabled: true, strictMode: true },
                csrfProtection: { enabled: true, tokenLength: 32 },
                rateLimiting: { enabled: true, maxRequests: 100, windowSize: 60000 },
                fileUpload: { enabled: true, maxFileSize: 5242880 },
                sessionSecurity: { enabled: true, sessionTimeout: 1800000 },
                monitoring: { enabled: true, logSecurityEvents: true }
            }
        };
    }

    // CSRF Protection
    setupCSRFProtection() {
        if (!this.config.security.csrfProtection.enabled) return;

        this.generateCSRFToken();
        this.addCSRFTokenToForms();
        this.setupCSRFValidation();
    }

    generateCSRFToken() {
        const tokenLength = this.config.security.csrfProtection.tokenLength || 32;
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let token = '';
        
        for (let i = 0; i < tokenLength; i++) {
            token += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        
        this.csrfToken = token;
        
        // Store in session storage
        sessionStorage.setItem(this.config.security.csrfProtection.sessionStorageKey || 'csrf_token', token);
        
        // Set as cookie if configured
        if (this.config.security.csrfProtection.cookieName) {
            document.cookie = `${this.config.security.csrfProtection.cookieName}=${token}; path=/; secure; samesite=strict`;
        }
        
        return token;
    }

    addCSRFTokenToForms() {
        document.querySelectorAll('form').forEach(form => {
            // Skip forms that already have CSRF token
            if (form.querySelector('input[name="csrf_token"]')) return;
            
            const csrfInput = document.createElement('input');
            csrfInput.type = 'hidden';
            csrfInput.name = 'csrf_token';
            csrfInput.value = this.csrfToken;
            form.appendChild(csrfInput);
        });
    }

    setupCSRFValidation() {
        // Intercept form submissions
        document.addEventListener('submit', (event) => {
            const form = event.target;
            if (form.tagName !== 'FORM') return;
            
            const csrfInput = form.querySelector('input[name="csrf_token"]');
            if (!csrfInput || csrfInput.value !== this.csrfToken) {
                event.preventDefault();
                this.logSecurityEvent('CSRF token validation failed', {
                    form: form.action,
                    expected: this.csrfToken,
                    received: csrfInput ? csrfInput.value : 'none'
                });
                this.showSecurityAlert('Security validation failed. Please refresh the page and try again.');
                return false;
            }
        });

        // Intercept AJAX requests
        const originalFetch = window.fetch;
        window.fetch = async (url, options = {}) => {
            if (options.method && ['POST', 'PUT', 'DELETE', 'PATCH'].includes(options.method.toUpperCase())) {
                options.headers = options.headers || {};
                options.headers[this.config.security.csrfProtection.headerName || 'X-CSRF-Token'] = this.csrfToken;
            }
            return originalFetch(url, options);
        };
    }

    // XSS Protection
    setupXSSProtection() {
        if (!this.config.security.xssProtection.enabled) return;

        this.setupInputSanitization();
        this.setupOutputEncoding();
        this.monitorDOMChanges();
    }

    setupInputSanitization() {
        document.addEventListener('input', (event) => {
            const input = event.target;
            if (input.tagName === 'INPUT' || input.tagName === 'TEXTAREA') {
                const sanitized = this.sanitizeInput(input.value);
                if (sanitized !== input.value) {
                    input.value = sanitized;
                    this.logSecurityEvent('XSS attempt blocked', {
                        element: input.name || input.id,
                        original: event.target.value,
                        sanitized: sanitized
                    });
                }
            }
        });
    }

    sanitizeInput(input) {
        if (!input) return input;

        let sanitized = input;
        const config = this.config.security.xssProtection;

        // Remove script tags
        if (config.sanitization?.removeScriptTags) {
            sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
        }

        // Remove event handlers
        if (config.sanitization?.removeEventHandlers) {
            sanitized = sanitized.replace(/on\w+\s*=\s*[\"'][^\"']*[\"']/gi, '');
        }

        // Remove javascript: URLs
        if (config.sanitization?.removeJavaScriptUrls) {
            sanitized = sanitized.replace(/javascript:/gi, '');
        }

        // Encode HTML entities
        if (config.sanitization?.encodeHtmlEntities) {
            sanitized = sanitized
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#x27;');
        }

        return sanitized;
    }

    setupOutputEncoding() {
        // Override innerHTML to sanitize content
        const originalInnerHTML = Object.getOwnPropertyDescriptor(Element.prototype, 'innerHTML');
        Object.defineProperty(Element.prototype, 'innerHTML', {
            set: function(value) {
                const sanitized = window.securityEnhancer.sanitizeHTML(value);
                originalInnerHTML.set.call(this, sanitized);
            },
            get: originalInnerHTML.get
        });
    }

    sanitizeHTML(html) {
        const allowedTags = this.config.security.xssProtection.allowedTags || [];
        const allowedAttributes = this.config.security.xssProtection.allowedAttributes || {};

        // Create a temporary div to parse HTML
        const temp = document.createElement('div');
        temp.innerHTML = html;

        // Remove disallowed tags and attributes
        this.sanitizeElement(temp, allowedTags, allowedAttributes);

        return temp.innerHTML;
    }

    sanitizeElement(element, allowedTags, allowedAttributes) {
        const children = Array.from(element.children);
        
        children.forEach(child => {
            const tagName = child.tagName.toLowerCase();
            
            if (!allowedTags.includes(tagName)) {
                child.remove();
                return;
            }

            // Remove disallowed attributes
            const attributes = Array.from(child.attributes);
            attributes.forEach(attr => {
                const attrName = attr.name.toLowerCase();
                const allowedForTag = allowedAttributes[tagName] || [];
                const allowedForAll = allowedAttributes['*'] || [];
                
                if (!allowedForTag.includes(attrName) && !allowedForAll.includes(attrName)) {
                    child.removeAttribute(attr.name);
                }
            });

            // Recursively sanitize children
            this.sanitizeElement(child, allowedTags, allowedAttributes);
        });
    }

    monitorDOMChanges() {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach((node) => {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            this.scanForMaliciousContent(node);
                        }
                    });
                }
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    scanForMaliciousContent(element) {
        // Check for suspicious patterns
        const suspiciousPatterns = [
            /javascript:/i,
            /on\w+\s*=/i,
            /<script/i,
            /eval\s*\(/i,
            /document\.write/i
        ];

        const content = element.outerHTML || element.textContent;
        suspiciousPatterns.forEach(pattern => {
            if (pattern.test(content)) {
                this.logSecurityEvent('Suspicious content detected', {
                    element: element.tagName,
                    content: content.substring(0, 200)
                });
                element.remove();
            }
        });
    }

    // Rate Limiting
    setupRateLimiting() {
        if (!this.config.security.rateLimiting.enabled) return;

        this.interceptRequests();
        this.setupRateLimitCleanup();
    }

    interceptRequests() {
        const originalFetch = window.fetch;
        window.fetch = async (url, options = {}) => {
            const clientId = this.getClientId();
            
            if (this.isRateLimited(clientId, url)) {
                throw new Error('Rate limit exceeded. Please try again later.');
            }

            this.recordRequest(clientId, url);
            return originalFetch(url, options);
        };
    }

    getClientId() {
        // Use a combination of IP (if available) and browser fingerprint
        let clientId = sessionStorage.getItem('client_id');
        if (!clientId) {
            clientId = this.generateFingerprint();
            sessionStorage.setItem('client_id', clientId);
        }
        return clientId;
    }

    generateFingerprint() {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        ctx.textBaseline = 'top';
        ctx.font = '14px Arial';
        ctx.fillText('Browser fingerprint', 2, 2);
        
        const fingerprint = [
            navigator.userAgent,
            navigator.language,
            screen.width + 'x' + screen.height,
            new Date().getTimezoneOffset(),
            canvas.toDataURL()
        ].join('|');
        
        return btoa(fingerprint).substring(0, 32);
    }

    isRateLimited(clientId, url) {
        const now = Date.now();
        const config = this.config.security.rateLimiting;
        const windowSize = config.windowSize || 60000;
        const maxRequests = config.maxRequests || 100;

        // Check endpoint-specific limits
        const endpointConfig = this.getEndpointConfig(url);
        const effectiveWindowSize = endpointConfig?.windowSize || windowSize;
        const effectiveMaxRequests = endpointConfig?.maxRequests || maxRequests;

        if (!this.rateLimitData.has(clientId)) {
            this.rateLimitData.set(clientId, []);
        }

        const requests = this.rateLimitData.get(clientId);
        
        // Remove old requests outside the window
        const validRequests = requests.filter(timestamp => now - timestamp < effectiveWindowSize);
        this.rateLimitData.set(clientId, validRequests);

        return validRequests.length >= effectiveMaxRequests;
    }

    getEndpointConfig(url) {
        const endpoints = this.config.security.rateLimiting.endpoints || {};
        for (const [endpoint, config] of Object.entries(endpoints)) {
            if (url.includes(endpoint)) {
                return config;
            }
        }
        return null;
    }

    recordRequest(clientId, url) {
        const now = Date.now();
        if (!this.rateLimitData.has(clientId)) {
            this.rateLimitData.set(clientId, []);
        }
        this.rateLimitData.get(clientId).push(now);
    }

    setupRateLimitCleanup() {
        // Clean up old rate limit data every 5 minutes
        setInterval(() => {
            const now = Date.now();
            const maxAge = Math.max(
                this.config.security.rateLimiting.windowSize || 60000,
                300000 // 5 minutes minimum
            );

            for (const [clientId, requests] of this.rateLimitData.entries()) {
                const validRequests = requests.filter(timestamp => now - timestamp < maxAge);
                if (validRequests.length === 0) {
                    this.rateLimitData.delete(clientId);
                } else {
                    this.rateLimitData.set(clientId, validRequests);
                }
            }
        }, 300000); // 5 minutes
    }

    // Input Validation
    setupInputValidation() {
        if (!this.config.security.inputValidation.enabled) return;

        document.addEventListener('input', (event) => {
            this.validateInput(event.target);
        });

        document.addEventListener('submit', (event) => {
            const form = event.target;
            if (form.tagName !== 'FORM') return;

            const inputs = form.querySelectorAll('input, textarea, select');
            let isValid = true;

            inputs.forEach(input => {
                if (!this.validateInput(input)) {
                    isValid = false;
                }
            });

            if (!isValid) {
                event.preventDefault();
                this.showSecurityAlert('Please correct the highlighted fields and try again.');
            }
        });
    }

    validateInput(input) {
        const config = this.config.security.inputValidation;
        const value = input.value;
        const type = input.type || input.dataset.validationType || 'text';

        // Check length
        if (value.length > (config.maxInputLength || 1000)) {
            this.markInputInvalid(input, 'Input too long');
            return false;
        }

        // Check pattern based on type
        const patterns = config.allowedCharacters || {};
        const pattern = patterns[type];

        if (pattern && !new RegExp(pattern).test(value)) {
            this.markInputInvalid(input, 'Invalid characters detected');
            this.logSecurityEvent('Invalid input detected', {
                element: input.name || input.id,
                type: type,
                value: value.substring(0, 100)
            });
            return false;
        }

        this.markInputValid(input);
        return true;
    }

    markInputInvalid(input, message) {
        input.classList.add('security-invalid');
        input.title = message;
        
        // Add visual indicator
        let indicator = input.parentNode.querySelector('.security-indicator');
        if (!indicator) {
            indicator = document.createElement('span');
            indicator.className = 'security-indicator';
            input.parentNode.appendChild(indicator);
        }
        indicator.textContent = '⚠️ ' + message;
        indicator.style.color = 'red';
    }

    markInputValid(input) {
        input.classList.remove('security-invalid');
        input.title = '';
        
        const indicator = input.parentNode.querySelector('.security-indicator');
        if (indicator) {
            indicator.remove();
        }
    }

    // Security Headers
    setupSecurityHeaders() {
        // This would typically be handled server-side, but we can check if they're present
        this.checkSecurityHeaders();
    }

    checkSecurityHeaders() {
        const requiredHeaders = this.config.security.headers || {};
        const missingHeaders = [];

        // We can't directly check response headers from client-side,
        // but we can make a test request to check
        fetch(window.location.href, { method: 'HEAD' })
            .then(response => {
                Object.keys(requiredHeaders).forEach(header => {
                    if (!response.headers.get(header)) {
                        missingHeaders.push(header);
                    }
                });

                if (missingHeaders.length > 0) {
                    console.warn('Missing security headers:', missingHeaders);
                    this.logSecurityEvent('Missing security headers', { headers: missingHeaders });
                }
            })
            .catch(error => {
                console.warn('Could not check security headers:', error);
            });
    }

    // Content Security Policy
    setupContentSecurityPolicy() {
        const cspConfig = this.config.security.xssProtection.contentSecurityPolicy;
        if (!cspConfig?.enabled) return;

        // Check if CSP is already set
        const existingCSP = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
        if (existingCSP) return;

        // Generate CSP header value
        const directives = cspConfig.directives || {};
        const cspValue = Object.entries(directives)
            .map(([directive, sources]) => `${directive} ${sources.join(' ')}`)
            .join('; ');

        // Add CSP meta tag
        const cspMeta = document.createElement('meta');
        cspMeta.httpEquiv = 'Content-Security-Policy';
        cspMeta.content = cspValue;
        document.head.appendChild(cspMeta);

        // Monitor CSP violations
        document.addEventListener('securitypolicyviolation', (event) => {
            this.logSecurityEvent('CSP violation', {
                violatedDirective: event.violatedDirective,
                blockedURI: event.blockedURI,
                documentURI: event.documentURI,
                originalPolicy: event.originalPolicy
            });
        });
    }

    // Session Security
    setupSessionSecurity() {
        if (!this.config.security.sessionSecurity.enabled) return;

        this.setupSessionTimeout();
        this.setupSessionValidation();
        this.monitorSessionActivity();
    }

    setupSessionTimeout() {
        const timeout = this.config.security.sessionSecurity.sessionTimeout || 1800000; // 30 minutes
        
        let timeoutId;
        const resetTimeout = () => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                this.handleSessionTimeout();
            }, timeout);
        };

        // Reset timeout on user activity
        ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'].forEach(event => {
            document.addEventListener(event, resetTimeout, { passive: true });
        });

        resetTimeout();
    }

    handleSessionTimeout() {
        this.logSecurityEvent('Session timeout', { timestamp: new Date().toISOString() });
        
        // Clear sensitive data
        sessionStorage.clear();
        
        // Redirect to login or show timeout message
        this.showSecurityAlert('Your session has expired for security reasons. Please refresh the page.');
        
        // Optionally redirect
        // window.location.href = '/login.html';
    }

    setupSessionValidation() {
        // Generate session fingerprint
        const fingerprint = this.generateSessionFingerprint();
        const storedFingerprint = sessionStorage.getItem('session_fingerprint');
        
        if (storedFingerprint && storedFingerprint !== fingerprint) {
            this.logSecurityEvent('Session hijacking attempt detected', {
                expected: storedFingerprint,
                received: fingerprint
            });
            this.handleSessionTimeout();
            return;
        }
        
        sessionStorage.setItem('session_fingerprint', fingerprint);
    }

    generateSessionFingerprint() {
        return btoa([
            navigator.userAgent,
            screen.width + 'x' + screen.height,
            new Date().getTimezoneOffset(),
            navigator.language
        ].join('|')).substring(0, 32);
    }

    monitorSessionActivity() {
        // Track suspicious session activity
        let requestCount = 0;
        const startTime = Date.now();
        
        const originalFetch = window.fetch;
        window.fetch = async (...args) => {
            requestCount++;
            
            // Check for unusual request patterns
            const timeDiff = Date.now() - startTime;
            const requestRate = requestCount / (timeDiff / 1000);
            
            if (requestRate > 10) { // More than 10 requests per second
                this.logSecurityEvent('Suspicious request rate detected', {
                    rate: requestRate,
                    count: requestCount,
                    duration: timeDiff
                });
            }
            
            return originalFetch(...args);
        };
    }

    // File Upload Security
    setupFileUploadSecurity() {
        if (!this.config.security.fileUpload.enabled) return;

        document.addEventListener('change', (event) => {
            if (event.target.type === 'file') {
                this.validateFileUpload(event.target);
            }
        });
    }

    validateFileUpload(input) {
        const config = this.config.security.fileUpload;
        const files = Array.from(input.files);
        let isValid = true;

        files.forEach(file => {
            // Check file size
            if (file.size > (config.maxFileSize || 5242880)) {
                this.markInputInvalid(input, 'File too large');
                isValid = false;
                return;
            }

            // Check file type
            const extension = file.name.split('.').pop().toLowerCase();
            const allowedTypes = config.allowedTypes || [];
            const blockedTypes = config.blockedTypes || [];

            if (blockedTypes.includes(extension)) {
                this.markInputInvalid(input, 'File type not allowed');
                this.logSecurityEvent('Blocked file type upload attempt', {
                    filename: file.name,
                    type: extension,
                    size: file.size
                });
                isValid = false;
                return;
            }

            if (allowedTypes.length > 0 && !allowedTypes.includes(extension)) {
                this.markInputInvalid(input, 'File type not allowed');
                isValid = false;
                return;
            }

            // Basic malware check (client-side)
            this.scanFileForMalware(file);
        });

        if (isValid) {
            this.markInputValid(input);
        }

        return isValid;
    }

    scanFileForMalware(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const content = e.target.result;
            const suspiciousPatterns = [
                /eval\s*\(/i,
                /document\.write/i,
                /javascript:/i,
                /<script/i,
                /cmd\.exe/i,
                /powershell/i
            ];

            suspiciousPatterns.forEach(pattern => {
                if (pattern.test(content)) {
                    this.logSecurityEvent('Suspicious file content detected', {
                        filename: file.name,
                        pattern: pattern.toString()
                    });
                }
            });
        };
        
        // Read first 1KB for scanning
        reader.readAsText(file.slice(0, 1024));
    }

    // Security Monitoring
    setupSecurityMonitoring() {
        if (!this.config.security.monitoring.enabled) return;

        this.setupErrorMonitoring();
        this.setupPerformanceMonitoring();
        this.setupSecurityEventAggregation();
    }

    setupErrorMonitoring() {
        window.addEventListener('error', (event) => {
            this.logSecurityEvent('JavaScript error', {
                message: event.message,
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno,
                stack: event.error?.stack
            });
        });

        window.addEventListener('unhandledrejection', (event) => {
            this.logSecurityEvent('Unhandled promise rejection', {
                reason: event.reason?.toString(),
                stack: event.reason?.stack
            });
        });
    }

    setupPerformanceMonitoring() {
        // Monitor for performance anomalies that might indicate attacks
        const observer = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            entries.forEach(entry => {
                if (entry.duration > 5000) { // Slow operations might indicate DoS
                    this.logSecurityEvent('Performance anomaly detected', {
                        name: entry.name,
                        duration: entry.duration,
                        type: entry.entryType
                    });
                }
            });
        });

        observer.observe({ entryTypes: ['measure', 'navigation'] });
    }

    setupSecurityEventAggregation() {
        // Aggregate and analyze security events
        setInterval(() => {
            this.analyzeSecurityEvents();
        }, 60000); // Every minute
    }

    analyzeSecurityEvents() {
        const recentEvents = this.securityLog.filter(event => 
            Date.now() - event.timestamp < 300000 // Last 5 minutes
        );

        const eventCounts = {};
        recentEvents.forEach(event => {
            eventCounts[event.type] = (eventCounts[event.type] || 0) + 1;
        });

        // Check for suspicious patterns
        const thresholds = this.config.security.monitoring.alertThresholds || {};
        
        Object.entries(eventCounts).forEach(([type, count]) => {
            const threshold = thresholds[type];
            if (threshold && count >= threshold) {
                this.triggerSecurityAlert(type, count);
            }
        });
    }

    triggerSecurityAlert(eventType, count) {
        const alert = {
            type: 'SECURITY_ALERT',
            eventType,
            count,
            timestamp: Date.now(),
            severity: this.getAlertSeverity(eventType, count)
        };

        this.logSecurityEvent('Security alert triggered', alert);
        
        // Send to monitoring system
        this.sendSecurityAlert(alert);
    }

    getAlertSeverity(eventType, count) {
        const severityMap = {
            'XSS attempt blocked': 'HIGH',
            'CSRF token validation failed': 'HIGH',
            'Suspicious content detected': 'MEDIUM',
            'Rate limit exceeded': 'MEDIUM',
            'Invalid input detected': 'LOW'
        };
        
        return severityMap[eventType] || 'LOW';
    }

    sendSecurityAlert(alert) {
        // Send to webhook if configured
        const webhookConfig = this.config.security.monitoring.notifications?.webhook;
        if (webhookConfig?.enabled && webhookConfig.url) {
            fetch(webhookConfig.url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Webhook-Secret': webhookConfig.secret || ''
                },
                body: JSON.stringify(alert)
            }).catch(error => {
                console.error('Failed to send security alert:', error);
            });
        }
    }

    // Utility Methods
    logSecurityEvent(type, details = {}) {
        const event = {
            type,
            details,
            timestamp: Date.now(),
            url: window.location.href,
            userAgent: navigator.userAgent,
            clientId: this.getClientId()
        };

        this.securityLog.push(event);
        
        // Keep only recent events
        const maxEntries = this.config.security.monitoring.maxLogEntries || 1000;
        if (this.securityLog.length > maxEntries) {
            this.securityLog.splice(0, this.securityLog.length - maxEntries);
        }

        // Store in localStorage for persistence
        try {
            localStorage.setItem('security_log', JSON.stringify(this.securityLog.slice(-100)));
        } catch (error) {
            // Handle storage quota exceeded
            localStorage.removeItem('security_log');
        }

        console.warn(`Security Event: ${type}`, details);
    }

    showSecurityAlert(message) {
        // Create security alert modal
        const alertModal = document.createElement('div');
        alertModal.className = 'security-alert-modal';
        alertModal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.8);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 10000;
        `;

        alertModal.innerHTML = `
            <div style="background: white; padding: 2rem; border-radius: 8px; max-width: 400px; text-align: center;">
                <div style="color: #d32f2f; font-size: 3rem; margin-bottom: 1rem;">🛡️</div>
                <h3 style="color: #d32f2f; margin-bottom: 1rem;">Security Alert</h3>
                <p style="margin-bottom: 2rem;">${message}</p>
                <button onclick="this.closest('.security-alert-modal').remove()" 
                        style="background: #d32f2f; color: white; border: none; padding: 0.5rem 2rem; border-radius: 4px; cursor: pointer;">
                    OK
                </button>
            </div>
        `;

        document.body.appendChild(alertModal);

        // Auto-remove after 10 seconds
        setTimeout(() => {
            if (alertModal.parentNode) {
                alertModal.remove();
            }
        }, 10000);
    }

    // Public API
    getSecurityReport() {
        return {
            overview: {
                totalEvents: this.securityLog.length,
                recentEvents: this.securityLog.filter(e => Date.now() - e.timestamp < 3600000).length,
                blockedIPs: this.blockedIPs.size,
                activeRateLimits: this.rateLimitData.size
            },
            events: this.securityLog.slice(-50), // Last 50 events
            rateLimits: Array.from(this.rateLimitData.entries()).map(([clientId, requests]) => ({
                clientId,
                requestCount: requests.length,
                lastRequest: Math.max(...requests)
            })),
            config: {
                csrfEnabled: this.config.security.csrfProtection.enabled,
                xssEnabled: this.config.security.xssProtection.enabled,
                rateLimitEnabled: this.config.security.rateLimiting.enabled,
                monitoringEnabled: this.config.security.monitoring.enabled
            }
        };
    }

    exportSecurityLog() {
        const report = this.getSecurityReport();
        const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `security-log-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    clearSecurityLog() {
        this.securityLog = [];
        localStorage.removeItem('security_log');
        console.log('Security log cleared');
    }
}

// Initialize Security Enhancer
document.addEventListener('DOMContentLoaded', () => {
    window.securityEnhancer = new SecurityEnhancer();
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SecurityEnhancer;
}