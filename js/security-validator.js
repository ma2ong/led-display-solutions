/* =================================================================
   SECURITY VALIDATOR MODULE
   Comprehensive security validation and protection system
   ================================================================= */

class SecurityValidator {
    constructor() {
        this.config = {
            maxInputLength: 1000,
            allowedFileTypes: ['jpg', 'jpeg', 'png', 'gif', 'pdf', 'doc', 'docx'],
            maxFileSize: 5 * 1024 * 1024, // 5MB
            rateLimitWindow: 60000, // 1 minute
            maxRequestsPerWindow: 100,
            csrfTokenName: 'csrf_token',
            sessionTimeout: 30 * 60 * 1000, // 30 minutes
            passwordMinLength: 8,
            passwordRequireSpecialChars: true
        };
        
        this.requestLog = new Map();
        this.blockedIPs = new Set();
        this.csrfTokens = new Map();
        
        this.init();
    }

    init() {
        this.setupCSRFProtection();
        this.setupXSSProtection();
        this.setupInputValidation();
        this.setupRateLimiting();
        this.setupSecurityHeaders();
        this.monitorSecurityEvents();
        
        console.log('Security Validator initialized');
    }

    // CSRF Protection
    setupCSRFProtection() {
        this.generateCSRFToken();
        this.addCSRFTokenToForms();
        this.interceptFormSubmissions();
    }

    generateCSRFToken() {
        const token = this.generateRandomToken(32);
        const timestamp = Date.now();
        
        this.csrfTokens.set(token, timestamp);
        
        // Store in session storage
        sessionStorage.setItem(this.config.csrfTokenName, token);
        
        // Clean up old tokens
        this.cleanupExpiredTokens();
        
        return token;
    }

    generateRandomToken(length) {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < length; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }

    addCSRFTokenToForms() {
        const forms = document.querySelectorAll('form');
        const token = sessionStorage.getItem(this.config.csrfTokenName);
        
        forms.forEach(form => {
            // Remove existing CSRF token input
            const existingToken = form.querySelector(`input[name="${this.config.csrfTokenName}"]`);
            if (existingToken) {
                existingToken.remove();
            }
            
            // Add new CSRF token
            const tokenInput = document.createElement('input');
            tokenInput.type = 'hidden';
            tokenInput.name = this.config.csrfTokenName;
            tokenInput.value = token;
            form.appendChild(tokenInput);
        });
    }

    interceptFormSubmissions() {
        document.addEventListener('submit', (e) => {
            const form = e.target;
            if (form.tagName === 'FORM') {
                if (!this.validateCSRFToken(form)) {
                    e.preventDefault();
                    this.handleSecurityViolation('CSRF token validation failed', 'csrf');
                    return false;
                }
            }
        });
    }

    validateCSRFToken(form) {
        const tokenInput = form.querySelector(`input[name="${this.config.csrfTokenName}"]`);
        if (!tokenInput) {
            return false;
        }
        
        const token = tokenInput.value;
        const storedToken = sessionStorage.getItem(this.config.csrfTokenName);
        
        if (token !== storedToken) {
            return false;
        }
        
        // Check if token is still valid (not expired)
        const tokenTimestamp = this.csrfTokens.get(token);
        if (!tokenTimestamp || Date.now() - tokenTimestamp > this.config.sessionTimeout) {
            return false;
        }
        
        return true;
    }

    cleanupExpiredTokens() {
        const now = Date.now();
        for (const [token, timestamp] of this.csrfTokens.entries()) {
            if (now - timestamp > this.config.sessionTimeout) {
                this.csrfTokens.delete(token);
            }
        }
    }

    // XSS Protection
    setupXSSProtection() {
        this.interceptDOMManipulation();
        this.sanitizeUserContent();
        this.setupContentSecurityPolicy();
    }

    interceptDOMManipulation() {
        // Override innerHTML to sanitize content
        const originalInnerHTML = Element.prototype.__lookupSetter__('innerHTML') || 
                                 Object.getOwnPropertyDescriptor(Element.prototype, 'innerHTML').set;
        
        Object.defineProperty(Element.prototype, 'innerHTML', {
            set: function(value) {
                const sanitized = securityValidator.sanitizeHTML(value);
                originalInnerHTML.call(this, sanitized);
            },
            get: Element.prototype.__lookupGetter__('innerHTML') || 
                 Object.getOwnPropertyDescriptor(Element.prototype, 'innerHTML').get
        });
    }

    sanitizeHTML(html) {
        // Create a temporary div to parse HTML
        const temp = document.createElement('div');
        temp.innerHTML = html;
        
        // Remove dangerous elements and attributes
        this.removeDangerousElements(temp);
        this.removeDangerousAttributes(temp);
        
        return temp.innerHTML;
    }

    removeDangerousElements(element) {
        const dangerousTags = ['script', 'iframe', 'object', 'embed', 'form', 'input', 'textarea', 'select'];
        
        dangerousTags.forEach(tag => {
            const elements = element.querySelectorAll(tag);
            elements.forEach(el => el.remove());
        });
    }

    removeDangerousAttributes(element) {
        const dangerousAttrs = ['onclick', 'onload', 'onerror', 'onmouseover', 'onfocus', 'onblur', 'onchange', 'onsubmit'];
        const allElements = element.querySelectorAll('*');
        
        allElements.forEach(el => {
            dangerousAttrs.forEach(attr => {
                if (el.hasAttribute(attr)) {
                    el.removeAttribute(attr);
                }
            });
            
            // Remove javascript: URLs
            ['href', 'src', 'action'].forEach(attr => {
                if (el.hasAttribute(attr)) {
                    const value = el.getAttribute(attr);
                    if (value && value.toLowerCase().startsWith('javascript:')) {
                        el.removeAttribute(attr);
                    }
                }
            });
        });
    }

    sanitizeUserContent() {
        // Sanitize all user input fields on change
        document.addEventListener('input', (e) => {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
                const sanitized = this.sanitizeInput(e.target.value);
                if (sanitized !== e.target.value) {
                    e.target.value = sanitized;
                    this.showSecurityWarning('Potentially dangerous content was removed from your input.');
                }
            }
        });
    }

    sanitizeInput(input) {
        if (typeof input !== 'string') return input;
        
        // Remove script tags and their content
        input = input.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
        
        // Remove dangerous HTML attributes
        input = input.replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, '');
        
        // Remove javascript: URLs
        input = input.replace(/javascript\s*:/gi, '');
        
        // Encode HTML entities
        input = input.replace(/[<>&"']/g, (match) => {
            const entities = {
                '<': '&lt;',
                '>': '&gt;',
                '&': '&amp;',
                '"': '&quot;',
                "'": '&#x27;'
            };
            return entities[match];
        });
        
        return input;
    }

    setupContentSecurityPolicy() {
        // Add CSP meta tag if not present
        if (!document.querySelector('meta[http-equiv="Content-Security-Policy"]')) {
            const cspMeta = document.createElement('meta');
            cspMeta.setAttribute('http-equiv', 'Content-Security-Policy');
            cspMeta.setAttribute('content', 
                "default-src 'self'; " +
                "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com; " +
                "style-src 'self' 'unsafe-inline'; " +
                "img-src 'self' data: https:; " +
                "font-src 'self'; " +
                "connect-src 'self';"
            );
            document.head.appendChild(cspMeta);
        }
    }
}    // 
Input Validation
    setupInputValidation() {
        this.addInputValidationRules();
        this.validateFormsOnSubmit();
    }

    addInputValidationRules() {
        document.addEventListener('input', (e) => {
            const input = e.target;
            if (input.tagName === 'INPUT' || input.tagName === 'TEXTAREA') {
                this.validateInput(input);
            }
        });
    }

    validateInput(input) {
        const value = input.value;
        const type = input.type || 'text';
        
        // Length validation
        if (value.length > this.config.maxInputLength) {
            input.value = value.substring(0, this.config.maxInputLength);
            this.showValidationError(input, `Input too long. Maximum ${this.config.maxInputLength} characters allowed.`);
            return false;
        }
        
        // Type-specific validation
        switch (type) {
            case 'email':
                return this.validateEmail(input, value);
            case 'tel':
                return this.validatePhone(input, value);
            case 'url':
                return this.validateURL(input, value);
            case 'password':
                return this.validatePassword(input, value);
            default:
                return this.validateText(input, value);
        }
    }

    validateEmail(input, value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const isValid = emailRegex.test(value);
        
        if (!isValid && value.length > 0) {
            this.showValidationError(input, 'Please enter a valid email address.');
        } else {
            this.clearValidationError(input);
        }
        
        return isValid;
    }

    validatePhone(input, value) {
        const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
        const cleanValue = value.replace(/[\s\-\(\)]/g, '');
        const isValid = phoneRegex.test(cleanValue);
        
        if (!isValid && value.length > 0) {
            this.showValidationError(input, 'Please enter a valid phone number.');
        } else {
            this.clearValidationError(input);
        }
        
        return isValid;
    }

    validateURL(input, value) {
        try {
            new URL(value);
            this.clearValidationError(input);
            return true;
        } catch {
            if (value.length > 0) {
                this.showValidationError(input, 'Please enter a valid URL.');
            }
            return false;
        }
    }

    validatePassword(input, value) {
        const errors = [];
        
        if (value.length < this.config.passwordMinLength) {
            errors.push(`At least ${this.config.passwordMinLength} characters`);
        }
        
        if (this.config.passwordRequireSpecialChars) {
            if (!/[A-Z]/.test(value)) errors.push('One uppercase letter');
            if (!/[a-z]/.test(value)) errors.push('One lowercase letter');
            if (!/[0-9]/.test(value)) errors.push('One number');
            if (!/[^A-Za-z0-9]/.test(value)) errors.push('One special character');
        }
        
        if (errors.length > 0 && value.length > 0) {
            this.showValidationError(input, `Password must contain: ${errors.join(', ')}`);
            return false;
        } else {
            this.clearValidationError(input);
            return true;
        }
    }

    validateText(input, value) {
        // Check for SQL injection patterns
        const sqlPatterns = [
            /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION)\b)/i,
            /(--|\/\*|\*\/|;)/,
            /(\b(OR|AND)\b.*=.*)/i
        ];
        
        for (const pattern of sqlPatterns) {
            if (pattern.test(value)) {
                this.showValidationError(input, 'Input contains potentially dangerous content.');
                this.handleSecurityViolation('SQL injection attempt detected', 'sql_injection');
                return false;
            }
        }
        
        this.clearValidationError(input);
        return true;
    }

    validateFormsOnSubmit() {
        document.addEventListener('submit', (e) => {
            const form = e.target;
            if (form.tagName === 'FORM') {
                if (!this.validateForm(form)) {
                    e.preventDefault();
                    return false;
                }
            }
        });
    }

    validateForm(form) {
        const inputs = form.querySelectorAll('input, textarea, select');
        let isValid = true;
        
        inputs.forEach(input => {
            if (!this.validateInput(input)) {
                isValid = false;
            }
        });
        
        return isValid;
    }

    showValidationError(input, message) {
        this.clearValidationError(input);
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'validation-error';
        errorDiv.style.cssText = `
            color: #dc3545;
            font-size: 0.875rem;
            margin-top: 0.25rem;
        `;
        errorDiv.textContent = message;
        
        input.style.borderColor = '#dc3545';
        input.parentNode.insertBefore(errorDiv, input.nextSibling);
    }

    clearValidationError(input) {
        const existingError = input.parentNode.querySelector('.validation-error');
        if (existingError) {
            existingError.remove();
        }
        input.style.borderColor = '';
    }

    // Rate Limiting
    setupRateLimiting() {
        this.interceptRequests();
        this.cleanupRequestLog();
    }

    interceptRequests() {
        // Override fetch to add rate limiting
        const originalFetch = window.fetch;
        window.fetch = (...args) => {
            if (!this.checkRateLimit()) {
                return Promise.reject(new Error('Rate limit exceeded'));
            }
            return originalFetch.apply(window, args);
        };
        
        // Override XMLHttpRequest
        const originalOpen = XMLHttpRequest.prototype.open;
        XMLHttpRequest.prototype.open = function(...args) {
            if (!securityValidator.checkRateLimit()) {
                throw new Error('Rate limit exceeded');
            }
            return originalOpen.apply(this, args);
        };
    }

    checkRateLimit() {
        const now = Date.now();
        const clientId = this.getClientId();
        
        if (this.blockedIPs.has(clientId)) {
            this.handleSecurityViolation('Request from blocked client', 'blocked_client');
            return false;
        }
        
        if (!this.requestLog.has(clientId)) {
            this.requestLog.set(clientId, []);
        }
        
        const requests = this.requestLog.get(clientId);
        
        // Remove old requests outside the window
        const validRequests = requests.filter(timestamp => 
            now - timestamp < this.config.rateLimitWindow
        );
        
        if (validRequests.length >= this.config.maxRequestsPerWindow) {
            this.handleSecurityViolation('Rate limit exceeded', 'rate_limit');
            this.blockedIPs.add(clientId);
            return false;
        }
        
        validRequests.push(now);
        this.requestLog.set(clientId, validRequests);
        
        return true;
    }

    getClientId() {
        // In a real implementation, this would be the client's IP address
        // For client-side, we use a session-based identifier
        let clientId = sessionStorage.getItem('client_id');
        if (!clientId) {
            clientId = this.generateRandomToken(16);
            sessionStorage.setItem('client_id', clientId);
        }
        return clientId;
    }

    cleanupRequestLog() {
        setInterval(() => {
            const now = Date.now();
            for (const [clientId, requests] of this.requestLog.entries()) {
                const validRequests = requests.filter(timestamp => 
                    now - timestamp < this.config.rateLimitWindow
                );
                
                if (validRequests.length === 0) {
                    this.requestLog.delete(clientId);
                } else {
                    this.requestLog.set(clientId, validRequests);
                }
            }
        }, this.config.rateLimitWindow);
    }

    // Security Headers
    setupSecurityHeaders() {
        // Add security-related meta tags
        this.addSecurityMetaTags();
        
        // Setup HTTPS enforcement
        this.enforceHTTPS();
    }

    addSecurityMetaTags() {
        const securityHeaders = [
            { name: 'X-Content-Type-Options', content: 'nosniff' },
            { name: 'X-Frame-Options', content: 'DENY' },
            { name: 'X-XSS-Protection', content: '1; mode=block' },
            { name: 'Referrer-Policy', content: 'strict-origin-when-cross-origin' }
        ];
        
        securityHeaders.forEach(header => {
            if (!document.querySelector(`meta[http-equiv="${header.name}"]`)) {
                const meta = document.createElement('meta');
                meta.setAttribute('http-equiv', header.name);
                meta.setAttribute('content', header.content);
                document.head.appendChild(meta);
            }
        });
    }

    enforceHTTPS() {
        if (location.protocol !== 'https:' && location.hostname !== 'localhost') {
            // In production, redirect to HTTPS
            if (location.hostname !== '127.0.0.1') {
                location.replace('https:' + window.location.href.substring(window.location.protocol.length));
            }
        }
    }

    // Security Event Monitoring
    monitorSecurityEvents() {
        this.setupErrorMonitoring();
        this.setupConsoleMonitoring();
        this.setupDevToolsDetection();
    }

    setupErrorMonitoring() {
        window.addEventListener('error', (e) => {
            this.logSecurityEvent('javascript_error', {
                message: e.message,
                filename: e.filename,
                lineno: e.lineno,
                colno: e.colno
            });
        });
        
        window.addEventListener('unhandledrejection', (e) => {
            this.logSecurityEvent('unhandled_promise_rejection', {
                reason: e.reason
            });
        });
    }

    setupConsoleMonitoring() {
        const originalConsoleError = console.error;
        console.error = (...args) => {
            this.logSecurityEvent('console_error', { args });
            originalConsoleError.apply(console, args);
        };
    }

    setupDevToolsDetection() {
        let devtools = false;
        const threshold = 160;
        
        setInterval(() => {
            if (window.outerHeight - window.innerHeight > threshold || 
                window.outerWidth - window.innerWidth > threshold) {
                if (!devtools) {
                    devtools = true;
                    this.logSecurityEvent('devtools_opened', {
                        timestamp: Date.now(),
                        userAgent: navigator.userAgent
                    });
                }
            } else {
                devtools = false;
            }
        }, 500);
    }

    // File Upload Security
    validateFileUpload(file) {
        const errors = [];
        
        // Check file size
        if (file.size > this.config.maxFileSize) {
            errors.push(`File size exceeds ${this.config.maxFileSize / 1024 / 1024}MB limit`);
        }
        
        // Check file type
        const extension = file.name.split('.').pop().toLowerCase();
        if (!this.config.allowedFileTypes.includes(extension)) {
            errors.push(`File type .${extension} is not allowed`);
        }
        
        // Check for executable files
        const dangerousExtensions = ['exe', 'bat', 'cmd', 'com', 'pif', 'scr', 'vbs', 'js'];
        if (dangerousExtensions.includes(extension)) {
            errors.push('Executable files are not allowed');
        }
        
        return {
            isValid: errors.length === 0,
            errors: errors
        };
    }

    // Security Event Handling
    handleSecurityViolation(message, type) {
        this.logSecurityEvent('security_violation', {
            type: type,
            message: message,
            timestamp: Date.now(),
            url: window.location.href,
            userAgent: navigator.userAgent
        });
        
        // Show user-friendly message
        this.showSecurityWarning('Security violation detected. Please contact support if this was unexpected.');
    }

    logSecurityEvent(eventType, data) {
        const event = {
            type: eventType,
            timestamp: Date.now(),
            data: data,
            sessionId: sessionStorage.getItem('client_id')
        };
        
        // Store in local storage for debugging
        const events = JSON.parse(localStorage.getItem('security_events') || '[]');
        events.push(event);
        
        // Keep only last 100 events
        if (events.length > 100) {
            events.splice(0, events.length - 100);
        }
        
        localStorage.setItem('security_events', JSON.stringify(events));
        
        // In production, send to security monitoring service
        console.warn('Security Event:', event);
    }

    showSecurityWarning(message) {
        const warning = document.createElement('div');
        warning.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #fff3cd;
            border: 1px solid #ffeaa7;
            color: #856404;
            padding: 1rem;
            border-radius: 4px;
            z-index: 10000;
            max-width: 300px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        `;
        warning.innerHTML = `
            <strong>Security Warning:</strong><br>
            ${message}
            <button onclick="this.parentElement.remove()" style="float: right; background: none; border: none; font-size: 1.2rem; cursor: pointer;">×</button>
        `;
        
        document.body.appendChild(warning);
        
        // Auto-remove after 10 seconds
        setTimeout(() => {
            if (warning.parentNode) {
                warning.remove();
            }
        }, 10000);
    }

    // Public API
    getSecurityEvents() {
        return JSON.parse(localStorage.getItem('security_events') || '[]');
    }

    clearSecurityEvents() {
        localStorage.removeItem('security_events');
    }

    generateNewCSRFToken() {
        return this.generateCSRFToken();
    }

    validateFileUploadSecurity(file) {
        return this.validateFileUpload(file);
    }

    sanitizeUserInput(input) {
        return this.sanitizeInput(input);
    }

    checkInputSecurity(input) {
        return this.validateInput(input);
    }
}

// Initialize security validator
document.addEventListener('DOMContentLoaded', () => {
    window.securityValidator = new SecurityValidator();
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SecurityValidator;
}