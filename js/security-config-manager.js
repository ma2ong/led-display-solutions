/* =================================================================
   SECURITY CONFIGURATION MANAGER
   Dynamic security configuration and policy management
   ================================================================= */
class SecurityConfigManager {
    constructor() {
        this.config = null;
        this.policies = new Map();
        this.rules = new Map();
        this.alerts = [];
        this.compliance = {};
        this.init();
    }

    async init() {
        try {
            await this.loadConfiguration();
            this.setupPolicyEngine();
            this.setupComplianceChecks();
            this.setupConfigValidation();
            this.setupDynamicRules();
            console.log('Security Configuration Manager initialized');
        } catch (error) {
            console.error('Security Configuration Manager initialization failed:', error);
        }
    }

    async loadConfiguration() {
        try {
            const response = await fetch('security-config.json');
            this.config = await response.json();
            this.validateConfiguration();
        } catch (error) {
            console.warn('Could not load security configuration:', error);
            this.config = this.getDefaultConfiguration();
        }
    }

    getDefaultConfiguration() {
        return {
            security: {
                level: 'medium',
                strictMode: false,
                autoUpdate: true,
                policies: {
                    passwordPolicy: {
                        minLength: 8,
                        requireUppercase: true,
                        requireLowercase: true,
                        requireNumbers: true,
                        requireSpecialChars: true,
                        maxAge: 90,
                        preventReuse: 5
                    },
                    accessPolicy: {
                        maxLoginAttempts: 5,
                        lockoutDuration: 300000,
                        sessionTimeout: 1800000,
                        requireMFA: false
                    },
                    dataPolicy: {
                        encryptionRequired: true,
                        dataRetention: 365,
                        anonymization: true,
                        auditTrail: true
                    }
                }
            }
        };
    }

    validateConfiguration() {
        const errors = [];
        const warnings = [];

        // Validate security level
        const validLevels = ['low', 'medium', 'high', 'maximum'];
        if (!validLevels.includes(this.config.security?.level)) {
            errors.push('Invalid security level specified');
        }

        // Validate CSRF configuration
        const csrf = this.config.security?.csrfProtection;
        if (csrf?.enabled && (!csrf.tokenLength || csrf.tokenLength < 16)) {
            warnings.push('CSRF token length should be at least 16 characters');
        }

        // Validate rate limiting
        const rateLimit = this.config.security?.rateLimiting;
        if (rateLimit?.enabled && rateLimit.maxRequests > 1000) {
            warnings.push('Rate limit seems very high, consider lowering for better security');
        }

        // Validate file upload settings
        const fileUpload = this.config.security?.fileUpload;
        if (fileUpload?.enabled && fileUpload.maxFileSize > 10485760) { // 10MB
            warnings.push('File upload size limit is very high');
        }

        // Log validation results
        if (errors.length > 0) {
            console.error('Security configuration errors:', errors);
            this.alerts.push({
                type: 'error',
                message: 'Configuration validation failed',
                details: errors,
                timestamp: Date.now()
            });
        }

        if (warnings.length > 0) {
            console.warn('Security configuration warnings:', warnings);
            this.alerts.push({
                type: 'warning',
                message: 'Configuration validation warnings',
                details: warnings,
                timestamp: Date.now()
            });
        }

        return { errors, warnings };
    }

    setupPolicyEngine() {
        // Password Policy
        this.policies.set('password', {
            name: 'Password Policy',
            rules: this.config.security?.policies?.passwordPolicy || {},
            validate: (password) => this.validatePassword(password),
            enforce: true
        });

        // Access Policy
        this.policies.set('access', {
            name: 'Access Control Policy',
            rules: this.config.security?.policies?.accessPolicy || {},
            validate: (attempt) => this.validateAccess(attempt),
            enforce: true
        });

        // Data Policy
        this.policies.set('data', {
            name: 'Data Protection Policy',
            rules: this.config.security?.policies?.dataPolicy || {},
            validate: (data) => this.validateDataHandling(data),
            enforce: true
        });

        // Content Policy
        this.policies.set('content', {
            name: 'Content Security Policy',
            rules: this.config.security?.xssProtection?.contentSecurityPolicy || {},
            validate: (content) => this.validateContent(content),
            enforce: true
        });
    }

    validatePassword(password) {
        const policy = this.policies.get('password').rules;
        const issues = [];

        if (password.length < (policy.minLength || 8)) {
            issues.push(`Password must be at least ${policy.minLength || 8} characters long`);
        }

        if (policy.requireUppercase && !/[A-Z]/.test(password)) {
            issues.push('Password must contain at least one uppercase letter');
        }

        if (policy.requireLowercase && !/[a-z]/.test(password)) {
            issues.push('Password must contain at least one lowercase letter');
        }

        if (policy.requireNumbers && !/\d/.test(password)) {
            issues.push('Password must contain at least one number');
        }

        if (policy.requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
            issues.push('Password must contain at least one special character');
        }

        // Check against common passwords
        const commonPasswords = [
            'password', '123456', 'password123', 'admin', 'qwerty',
            'letmein', 'welcome', 'monkey', '1234567890'
        ];

        if (commonPasswords.includes(password.toLowerCase())) {
            issues.push('Password is too common');
        }

        return {
            valid: issues.length === 0,
            issues,
            strength: this.calculatePasswordStrength(password)
        };
    }

    calculatePasswordStrength(password) {
        let score = 0;
        
        // Length bonus
        score += Math.min(password.length * 2, 20);
        
        // Character variety bonus
        if (/[a-z]/.test(password)) score += 5;
        if (/[A-Z]/.test(password)) score += 5;
        if (/\d/.test(password)) score += 5;
        if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 10;
        
        // Pattern penalties
        if (/(.)\1{2,}/.test(password)) score -= 10; // Repeated characters
        if (/123|abc|qwe/i.test(password)) score -= 10; // Sequential patterns
        
        if (score >= 70) return 'strong';
        if (score >= 50) return 'medium';
        if (score >= 30) return 'weak';
        return 'very-weak';
    }

    validateAccess(attempt) {
        const policy = this.policies.get('access').rules;
        const issues = [];

        // Check login attempts
        const clientId = attempt.clientId || 'unknown';
        const attempts = this.getLoginAttempts(clientId);
        
        if (attempts >= (policy.maxLoginAttempts || 5)) {
            issues.push('Maximum login attempts exceeded');
        }

        // Check session validity
        if (attempt.sessionAge > (policy.sessionTimeout || 1800000)) {
            issues.push('Session has expired');
        }

        // Check MFA requirement
        if (policy.requireMFA && !attempt.mfaVerified) {
            issues.push('Multi-factor authentication required');
        }

        return {
            valid: issues.length === 0,
            issues,
            lockoutRemaining: this.getLockoutRemaining(clientId)
        };
    }

    validateDataHandling(data) {
        const policy = this.policies.get('data').rules;
        const issues = [];

        // Check encryption requirement
        if (policy.encryptionRequired && !data.encrypted) {
            issues.push('Data must be encrypted');
        }

        // Check data retention
        if (data.age > (policy.dataRetention * 24 * 60 * 60 * 1000)) {
            issues.push('Data exceeds retention period');
        }

        // Check for PII
        if (this.containsPII(data.content) && !data.anonymized) {
            issues.push('PII data must be anonymized');
        }

        return {
            valid: issues.length === 0,
            issues,
            requiresAudit: policy.auditTrail
        };
    }

    validateContent(content) {
        const policy = this.policies.get('content').rules;
        const issues = [];

        if (!policy.enabled) {
            return { valid: true, issues: [] };
        }

        // Check CSP directives
        const directives = policy.directives || {};
        
        // Validate script sources
        if (content.type === 'script' && directives['script-src']) {
            const allowedSources = directives['script-src'];
            if (!this.isSourceAllowed(content.source, allowedSources)) {
                issues.push('Script source not allowed by CSP');
            }
        }

        // Validate style sources
        if (content.type === 'style' && directives['style-src']) {
            const allowedSources = directives['style-src'];
            if (!this.isSourceAllowed(content.source, allowedSources)) {
                issues.push('Style source not allowed by CSP');
            }
        }

        return {
            valid: issues.length === 0,
            issues
        };
    }

    setupComplianceChecks() {
        // GDPR Compliance
        this.compliance.gdpr = {
            enabled: this.config.compliance?.gdpr?.enabled || false,
            checks: [
                () => this.checkDataRetention(),
                () => this.checkConsentManagement(),
                () => this.checkDataPortability(),
                () => this.checkRightToBeForgotten()
            ]
        };

        // CCPA Compliance
        this.compliance.ccpa = {
            enabled: this.config.compliance?.ccpa?.enabled || false,
            checks: [
                () => this.checkDoNotSell(),
                () => this.checkPrivacyRights(),
                () => this.checkDataDisclosure()
            ]
        };

        // PCI DSS Compliance
        this.compliance.pci = {
            enabled: this.config.compliance?.pci?.enabled || false,
            checks: [
                () => this.checkCardDataHandling(),
                () => this.checkNetworkSecurity(),
                () => this.checkAccessControls()
            ]
        };
    }

    setupConfigValidation() {
        // Real-time configuration validation
        this.configWatcher = new Proxy(this.config, {
            set: (target, property, value) => {
                const oldValue = target[property];
                target[property] = value;
                
                // Validate the change
                const validation = this.validateConfigChange(property, value, oldValue);
                if (!validation.valid) {
                    console.warn('Configuration change validation failed:', validation.issues);
                    this.alerts.push({
                        type: 'warning',
                        message: 'Configuration change validation failed',
                        details: validation.issues,
                        timestamp: Date.now()
                    });
                }
                
                return true;
            }
        });
    }

    validateConfigChange(property, newValue, oldValue) {
        const issues = [];

        // Security level changes
        if (property === 'level') {
            if (newValue === 'low' && oldValue !== 'low') {
                issues.push('Lowering security level may increase risk');
            }
        }

        // Rate limiting changes
        if (property === 'maxRequests' && newValue > oldValue * 2) {
            issues.push('Significant increase in rate limit may impact security');
        }

        // File upload changes
        if (property === 'maxFileSize' && newValue > oldValue * 2) {
            issues.push('Significant increase in file size limit may impact security');
        }

        return {
            valid: issues.length === 0,
            issues
        };
    }

    setupDynamicRules() {
        // Threat-based rule adjustment
        this.rules.set('adaptive-rate-limiting', {
            name: 'Adaptive Rate Limiting',
            condition: () => this.detectHighThreatLevel(),
            action: () => this.tightenRateLimits(),
            enabled: true
        });

        this.rules.set('suspicious-activity-blocking', {
            name: 'Suspicious Activity Blocking',
            condition: () => this.detectSuspiciousActivity(),
            action: () => this.blockSuspiciousIPs(),
            enabled: true
        });

        this.rules.set('emergency-lockdown', {
            name: 'Emergency Lockdown',
            condition: () => this.detectSecurityBreach(),
            action: () => this.activateEmergencyMode(),
            enabled: true
        });

        // Execute rules periodically
        setInterval(() => this.executeRules(), 60000); // Every minute
    }

    executeRules() {
        for (const [name, rule] of this.rules.entries()) {
            if (rule.enabled && rule.condition()) {
                console.log(`Executing security rule: ${rule.name}`);
                rule.action();
                
                this.alerts.push({
                    type: 'info',
                    message: `Security rule executed: ${rule.name}`,
                    timestamp: Date.now()
                });
            }
        }
    }

    // Compliance Check Methods
    checkDataRetention() {
        const retentionPeriod = this.config.compliance?.gdpr?.dataRetentionPeriod || 365;
        const cutoffDate = Date.now() - (retentionPeriod * 24 * 60 * 60 * 1000);
        
        // This would typically check actual data stores
        return {
            compliant: true,
            message: `Data retention policy: ${retentionPeriod} days`,
            details: `Cutoff date: ${new Date(cutoffDate).toLocaleDateString()}`
        };
    }

    checkConsentManagement() {
        const hasConsentBanner = document.querySelector('.cookie-consent, .gdpr-consent');
        return {
            compliant: !!hasConsentBanner,
            message: hasConsentBanner ? 'Consent banner present' : 'Consent banner missing',
            details: 'GDPR requires explicit consent for data processing'
        };
    }

    checkDataPortability() {
        // Check if data export functionality exists
        const hasExportFeature = this.config.compliance?.gdpr?.dataPortability || false;
        return {
            compliant: hasExportFeature,
            message: hasExportFeature ? 'Data portability supported' : 'Data portability not implemented',
            details: 'Users must be able to export their data'
        };
    }

    checkRightToBeForgotten() {
        const hasDeleteFeature = this.config.compliance?.gdpr?.rightToBeForgotten || false;
        return {
            compliant: hasDeleteFeature,
            message: hasDeleteFeature ? 'Right to be forgotten supported' : 'Right to be forgotten not implemented',
            details: 'Users must be able to request data deletion'
        };
    }

    // Threat Detection Methods
    detectHighThreatLevel() {
        if (!window.securityEnhancer) return false;
        
        const report = window.securityEnhancer.getSecurityReport();
        const recentEvents = report.overview.recentEvents;
        
        // High threat if more than 20 security events in the last hour
        return recentEvents > 20;
    }

    detectSuspiciousActivity() {
        if (!window.securityEnhancer) return false;
        
        const report = window.securityEnhancer.getSecurityReport();
        const events = report.events || [];
        
        // Look for patterns indicating suspicious activity
        const xssAttempts = events.filter(e => e.type.includes('XSS')).length;
        const csrfAttempts = events.filter(e => e.type.includes('CSRF')).length;
        const rateLimitViolations = events.filter(e => e.type.includes('rate limit')).length;
        
        return xssAttempts > 5 || csrfAttempts > 3 || rateLimitViolations > 10;
    }

    detectSecurityBreach() {
        // This would integrate with actual security monitoring systems
        // For demo purposes, we'll simulate breach detection
        return false;
    }

    // Dynamic Response Methods
    tightenRateLimits() {
        if (this.config.security?.rateLimiting) {
            const currentLimit = this.config.security.rateLimiting.maxRequests;
            this.config.security.rateLimiting.maxRequests = Math.max(10, currentLimit * 0.5);
            
            console.log(`Rate limits tightened to ${this.config.security.rateLimiting.maxRequests} requests`);
        }
    }

    blockSuspiciousIPs() {
        // This would integrate with firewall or load balancer
        console.log('Blocking suspicious IP addresses');
        
        if (window.securityEnhancer) {
            // Add to blocked IPs list
            const clientId = window.securityEnhancer.getClientId();
            window.securityEnhancer.blockedIPs.add(clientId);
        }
    }

    activateEmergencyMode() {
        console.log('EMERGENCY MODE ACTIVATED');
        
        // Tighten all security settings
        if (this.config.security) {
            this.config.security.level = 'maximum';
            this.config.security.strictMode = true;
            
            if (this.config.security.rateLimiting) {
                this.config.security.rateLimiting.maxRequests = 5;
                this.config.security.rateLimiting.windowSize = 300000; // 5 minutes
            }
            
            if (this.config.security.sessionSecurity) {
                this.config.security.sessionSecurity.sessionTimeout = 300000; // 5 minutes
            }
        }
        
        // Notify administrators
        this.sendEmergencyAlert();
    }

    sendEmergencyAlert() {
        const alert = {
            type: 'EMERGENCY',
            message: 'Security emergency mode activated',
            timestamp: Date.now(),
            severity: 'CRITICAL',
            details: 'Automatic security response triggered due to detected threats'
        };
        
        // This would send to monitoring systems, email, SMS, etc.
        console.error('SECURITY EMERGENCY:', alert);
        
        this.alerts.push(alert);
    }

    // Utility Methods
    getLoginAttempts(clientId) {
        const attempts = localStorage.getItem(`login_attempts_${clientId}`);
        return attempts ? parseInt(attempts) : 0;
    }

    getLockoutRemaining(clientId) {
        const lockoutTime = localStorage.getItem(`lockout_time_${clientId}`);
        if (!lockoutTime) return 0;
        
        const remaining = parseInt(lockoutTime) + 300000 - Date.now(); // 5 minute lockout
        return Math.max(0, remaining);
    }

    containsPII(content) {
        if (!content) return false;
        
        const piiPatterns = [
            /\b\d{3}-\d{2}-\d{4}\b/, // SSN
            /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/, // Credit card
            /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/, // Email
            /\b\d{3}[\s-]?\d{3}[\s-]?\d{4}\b/ // Phone number
        ];
        
        return piiPatterns.some(pattern => pattern.test(content));
    }

    isSourceAllowed(source, allowedSources) {
        if (!source || !allowedSources) return false;
        
        return allowedSources.some(allowed => {
            if (allowed === "'self'") return source === window.location.origin;
            if (allowed === "'unsafe-inline'") return true;
            if (allowed === "*") return true;
            return source.startsWith(allowed);
        });
    }

    // Public API Methods
    updateConfiguration(newConfig) {
        const oldConfig = JSON.parse(JSON.stringify(this.config));
        this.config = { ...this.config, ...newConfig };
        
        const validation = this.validateConfiguration();
        if (validation.errors.length > 0) {
            this.config = oldConfig; // Rollback
            throw new Error('Configuration update failed validation');
        }
        
        this.setupPolicyEngine(); // Refresh policies
        return validation;
    }

    getSecurityLevel() {
        return this.config.security?.level || 'medium';
    }

    setSecurityLevel(level) {
        const validLevels = ['low', 'medium', 'high', 'maximum'];
        if (!validLevels.includes(level)) {
            throw new Error('Invalid security level');
        }
        
        this.config.security.level = level;
        this.applySecurityLevel(level);
    }

    applySecurityLevel(level) {
        const settings = {
            low: {
                rateLimiting: { maxRequests: 200, windowSize: 60000 },
                sessionTimeout: 3600000, // 1 hour
                strictMode: false
            },
            medium: {
                rateLimiting: { maxRequests: 100, windowSize: 60000 },
                sessionTimeout: 1800000, // 30 minutes
                strictMode: false
            },
            high: {
                rateLimiting: { maxRequests: 50, windowSize: 60000 },
                sessionTimeout: 900000, // 15 minutes
                strictMode: true
            },
            maximum: {
                rateLimiting: { maxRequests: 20, windowSize: 60000 },
                sessionTimeout: 300000, // 5 minutes
                strictMode: true
            }
        };
        
        const levelSettings = settings[level];
        if (levelSettings) {
            Object.assign(this.config.security, levelSettings);
        }
    }

    runComplianceCheck(standard) {
        if (!this.compliance[standard]) {
            throw new Error(`Unknown compliance standard: ${standard}`);
        }
        
        const compliance = this.compliance[standard];
        if (!compliance.enabled) {
            return { compliant: false, message: `${standard.toUpperCase()} compliance not enabled` };
        }
        
        const results = compliance.checks.map(check => check());
        const allCompliant = results.every(result => result.compliant);
        
        return {
            compliant: allCompliant,
            standard: standard.toUpperCase(),
            results,
            summary: `${results.filter(r => r.compliant).length}/${results.length} checks passed`
        };
    }

    exportConfiguration() {
        const exportData = {
            configuration: this.config,
            policies: Object.fromEntries(this.policies),
            rules: Object.fromEntries(this.rules),
            alerts: this.alerts.slice(-50), // Last 50 alerts
            compliance: this.compliance,
            timestamp: new Date().toISOString()
        };
        
        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `security-config-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    getConfigurationReport() {
        return {
            overview: {
                securityLevel: this.getSecurityLevel(),
                strictMode: this.config.security?.strictMode || false,
                policiesActive: this.policies.size,
                rulesActive: Array.from(this.rules.values()).filter(r => r.enabled).length,
                alertsRecent: this.alerts.filter(a => Date.now() - a.timestamp < 3600000).length
            },
            validation: this.validateConfiguration(),
            policies: Array.from(this.policies.entries()).map(([name, policy]) => ({
                name: policy.name,
                enforce: policy.enforce,
                rules: Object.keys(policy.rules).length
            })),
            compliance: Object.entries(this.compliance).map(([standard, config]) => ({
                standard: standard.toUpperCase(),
                enabled: config.enabled,
                checks: config.checks.length
            })),
            alerts: this.alerts.slice(-10) // Last 10 alerts
        };
    }
}

// Initialize Security Configuration Manager
document.addEventListener('DOMContentLoaded', () => {
    window.securityConfigManager = new SecurityConfigManager();
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SecurityConfigManager;
}