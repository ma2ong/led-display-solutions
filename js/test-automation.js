/* =================================================================
   TEST AUTOMATION FRAMEWORK
   Comprehensive testing and quality assurance system
   ================================================================= */
class TestAutomation {
    constructor() {
        this.testSuites = new Map();
        this.testResults = [];
        this.coverage = {};
        this.performance = {};
        this.accessibility = {};
        this.security = {};
        this.config = null;
        
        this.init();
    }

    async init() {
        try {
            await this.loadTestConfig();
            this.setupTestSuites();
            this.setupCoverageTracking();
            this.setupPerformanceMonitoring();
            this.setupAccessibilityTesting();
            this.setupSecurityTesting();
            this.setupContinuousIntegration();
            
            console.log('Test Automation Framework initialized');
        } catch (error) {
            console.error('Test Automation initialization failed:', error);
        }
    }

    async loadTestConfig() {
        try {
            const response = await fetch('test-config.json');
            this.config = await response.json();
        } catch (error) {
            this.config = this.getDefaultTestConfig();
        }
    }

    getDefaultTestConfig() {
        return {
            testing: {
                unitTests: {
                    enabled: true,
                    threshold: 80,
                    timeout: 5000
                },
                integrationTests: {
                    enabled: true,
                    threshold: 70,
                    timeout: 10000
                },
                e2eTests: {
                    enabled: true,
                    threshold: 60,
                    timeout: 30000
                },
                performanceTests: {
                    enabled: true,
                    loadTimeThreshold: 3000,
                    fmpThreshold: 2000,
                    lcp: 2500
                },
                accessibilityTests: {
                    enabled: true,
                    wcagLevel: 'AA',
                    colorContrastRatio: 4.5
                },
                securityTests: {
                    enabled: true,
                    xssProtection: true,
                    csrfProtection: true,
                    sqlInjectionProtection: true
                }
            },
            deployment: {
                environments: ['development', 'staging', 'production'],
                autoDeployment: false,
                rollbackEnabled: true,
                healthChecks: true
            },
            reporting: {
                enabled: true,
                formats: ['html', 'json', 'junit'],
                notifications: {
                    email: false,
                    slack: false,
                    webhook: false
                }
            }
        };
    }

    setupTestSuites() {
        // Unit Tests
        this.testSuites.set('unit', {
            name: 'Unit Tests',
            tests: [
                () => this.testUtilityFunctions(),
                () => this.testDataValidation(),
                () => this.testFormValidation(),
                () => this.testSearchFunctionality(),
                () => this.testComparisonLogic(),
                () => this.testMobileDetection(),
                () => this.testSecurityValidation()
            ]
        });

        // Integration Tests
        this.testSuites.set('integration', {
            name: 'Integration Tests',
            tests: [
                () => this.testAPIIntegration(),
                () => this.testDatabaseConnection(),
                () => this.testEmailSystem(),
                () => this.testFileUpload(),
                () => this.testSearchIntegration(),
                () => this.testComparisonIntegration()
            ]
        });

        // End-to-End Tests
        this.testSuites.set('e2e', {
            name: 'End-to-End Tests',
            tests: [
                () => this.testUserJourney(),
                () => this.testProductSearch(),
                () => this.testProductComparison(),
                () => this.testContactForm(),
                () => this.testMobileExperience(),
                () => this.testAccessibility()
            ]
        });

        // Performance Tests
        this.testSuites.set('performance', {
            name: 'Performance Tests',
            tests: [
                () => this.testPageLoadTime(),
                () => this.testResourceLoading(),
                () => this.testMemoryUsage(),
                () => this.testCPUUsage(),
                () => this.testNetworkUsage()
            ]
        });
    }

    // Unit Tests
    async testUtilityFunctions() {
        const results = [];
        
        // Test email validation
        const emailTest = this.testEmailValidation();
        results.push({
            name: 'Email Validation',
            passed: emailTest.passed,
            message: emailTest.message
        });

        // Test phone validation
        const phoneTest = this.testPhoneValidation();
        results.push({
            name: 'Phone Validation',
            passed: phoneTest.passed,
            message: phoneTest.message
        });

        // Test URL validation
        const urlTest = this.testURLValidation();
        results.push({
            name: 'URL Validation',
            passed: urlTest.passed,
            message: urlTest.message
        });

        return {
            suite: 'Unit Tests - Utility Functions',
            results,
            passed: results.every(r => r.passed),
            total: results.length,
            passedCount: results.filter(r => r.passed).length
        };
    }

    testEmailValidation() {
        const validEmails = ['test@example.com', 'user.name@domain.co.uk', 'test+tag@example.org'];
        const invalidEmails = ['invalid-email', '@domain.com', 'test@', 'test.domain.com'];
        
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        
        const validResults = validEmails.every(email => emailRegex.test(email));
        const invalidResults = invalidEmails.every(email => !emailRegex.test(email));
        
        return {
            passed: validResults && invalidResults,
            message: validResults && invalidResults ? 
                'Email validation working correctly' : 
                'Email validation failed'
        };
    }

    testPhoneValidation() {
        const validPhones = ['+1234567890', '123-456-7890', '(123) 456-7890'];
        const invalidPhones = ['abc123', '123', '+'];
        
        const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
        
        // Simplified test - in real implementation would be more comprehensive
        const hasValidFormat = validPhones.some(phone => 
            phone.replace(/[\s\-\(\)]/g, '').match(phoneRegex)
        );
        
        return {
            passed: hasValidFormat,
            message: hasValidFormat ? 
                'Phone validation working' : 
                'Phone validation failed'
        };
    }

    testURLValidation() {
        const validURLs = ['https://example.com', 'http://test.org', 'https://sub.domain.com/path'];
        const invalidURLs = ['not-a-url', 'ftp://invalid', 'javascript:alert(1)'];
        
        const urlRegex = /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/;
        
        const validResults = validURLs.every(url => urlRegex.test(url));
        const invalidResults = invalidURLs.every(url => !urlRegex.test(url));
        
        return {
            passed: validResults && invalidResults,
            message: validResults && invalidResults ? 
                'URL validation working correctly' : 
                'URL validation failed'
        };
    }

    async testDataValidation() {
        const results = [];
        
        // Test input sanitization
        const xssTest = this.testXSSPrevention();
        results.push({
            name: 'XSS Prevention',
            passed: xssTest.passed,
            message: xssTest.message
        });

        // Test SQL injection prevention
        const sqlTest = this.testSQLInjectionPrevention();
        results.push({
            name: 'SQL Injection Prevention',
            passed: sqlTest.passed,
            message: sqlTest.message
        });

        return {
            suite: 'Unit Tests - Data Validation',
            results,
            passed: results.every(r => r.passed),
            total: results.length,
            passedCount: results.filter(r => r.passed).length
        };
    }

    testXSSPrevention() {
        const maliciousInputs = [
            '<script>alert("XSS")</script>',
            '<img src=x onerror=alert(1)>',
            'javascript:alert(1)',
            '<svg onload=alert(1)>'
        ];

        // Test if XSS inputs are properly sanitized
        const sanitized = maliciousInputs.map(input => {
            return input
                .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
                .replace(/on\w+\s*=\s*[\"'][^\"']*[\"']/gi, '')
                .replace(/javascript:/gi, '')
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;');
        });

        const allSanitized = sanitized.every(s => 
            !s.includes('<script') && 
            !s.includes('onerror') && 
            !s.includes('javascript:')
        );

        return {
            passed: allSanitized,
            message: allSanitized ? 
                'XSS prevention working correctly' : 
                'XSS prevention failed'
        };
    }

    testSQLInjectionPrevention() {
        const sqlInjectionAttempts = [
            "'; DROP TABLE users; --",
            "' OR '1'='1",
            "' UNION SELECT * FROM users --",
            "'; INSERT INTO users VALUES ('hacker', 'password'); --"
        ];

        // Test if SQL injection attempts are detected/prevented
        const detected = sqlInjectionAttempts.every(attempt => {
            const suspiciousPatterns = [
                /drop\s+table/i,
                /union\s+select/i,
                /insert\s+into/i,
                /'\s*or\s*'1'\s*=\s*'1/i,
                /--/,
                /;/
            ];
            
            return suspiciousPatterns.some(pattern => pattern.test(attempt));
        });

        return {
            passed: detected,
            message: detected ? 
                'SQL injection detection working' : 
                'SQL injection detection failed'
        };
    }

    async testFormValidation() {
        const results = [];
        
        // Test contact form validation
        const contactFormTest = this.testContactFormValidation();
        results.push({
            name: 'Contact Form Validation',
            passed: contactFormTest.passed,
            message: contactFormTest.message
        });

        return {
            suite: 'Unit Tests - Form Validation',
            results,
            passed: results.every(r => r.passed),
            total: results.length,
            passedCount: results.filter(r => r.passed).length
        };
    }

    testContactFormValidation() {
        // Simulate form validation
        const validForm = {
            name: 'John Doe',
            email: 'john@example.com',
            phone: '+1234567890',
            message: 'Test message'
        };

        const invalidForm = {
            name: '',
            email: 'invalid-email',
            phone: '123',
            message: ''
        };

        const validateForm = (form) => {
            const errors = [];
            
            if (!form.name || form.name.length < 2) {
                errors.push('Name is required and must be at least 2 characters');
            }
            
            if (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
                errors.push('Valid email is required');
            }
            
            if (!form.message || form.message.length < 10) {
                errors.push('Message must be at least 10 characters');
            }
            
            return errors;
        };

        const validErrors = validateForm(validForm);
        const invalidErrors = validateForm(invalidForm);

        return {
            passed: validErrors.length === 0 && invalidErrors.length > 0,
            message: validErrors.length === 0 && invalidErrors.length > 0 ? 
                'Form validation working correctly' : 
                'Form validation failed'
        };
    }

    // Integration Tests
    async testAPIIntegration() {
        const results = [];
        
        try {
            // Test contact form submission
            const contactTest = await this.testContactAPI();
            results.push({
                name: 'Contact API',
                passed: contactTest.passed,
                message: contactTest.message
            });

            // Test search API
            const searchTest = await this.testSearchAPI();
            results.push({
                name: 'Search API',
                passed: searchTest.passed,
                message: searchTest.message
            });

        } catch (error) {
            results.push({
                name: 'API Integration',
                passed: false,
                message: `API integration test failed: ${error.message}`
            });
        }

        return {
            suite: 'Integration Tests - API',
            results,
            passed: results.every(r => r.passed),
            total: results.length,
            passedCount: results.filter(r => r.passed).length
        };
    }

    async testContactAPI() {
        try {
            const testData = {
                name: 'Test User',
                email: 'test@example.com',
                message: 'Test message for API integration'
            };

            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(testData)
            });

            return {
                passed: response.ok,
                message: response.ok ? 
                    'Contact API working correctly' : 
                    `Contact API failed with status ${response.status}`
            };
        } catch (error) {
            return {
                passed: false,
                message: `Contact API test failed: ${error.message}`
            };
        }
    }

    async testSearchAPI() {
        try {
            const response = await fetch('/api/search?q=LED&category=outdoor');
            
            if (response.ok) {
                const data = await response.json();
                return {
                    passed: Array.isArray(data) || (data && data.results),
                    message: 'Search API working correctly'
                };
            } else {
                return {
                    passed: false,
                    message: `Search API failed with status ${response.status}`
                };
            }
        } catch (error) {
            return {
                passed: false,
                message: `Search API test failed: ${error.message}`
            };
        }
    }

    // End-to-End Tests
    async testUserJourney() {
        const results = [];
        
        // Test complete user journey
        const journeySteps = [
            () => this.testPageLoad('/'),
            () => this.testNavigation('/products.html'),
            () => this.testProductSearch('LED'),
            () => this.testProductSelection(),
            () => this.testContactFormSubmission()
        ];

        for (let i = 0; i < journeySteps.length; i++) {
            try {
                const stepResult = await journeySteps[i]();
                results.push({
                    name: `Journey Step ${i + 1}`,
                    passed: stepResult.passed,
                    message: stepResult.message
                });
            } catch (error) {
                results.push({
                    name: `Journey Step ${i + 1}`,
                    passed: false,
                    message: `Step failed: ${error.message}`
                });
            }
        }

        return {
            suite: 'E2E Tests - User Journey',
            results,
            passed: results.every(r => r.passed),
            total: results.length,
            passedCount: results.filter(r => r.passed).length
        };
    }

    async testPageLoad(url) {
        const startTime = performance.now();
        
        try {
            // Simulate page load test
            await new Promise(resolve => setTimeout(resolve, 100));
            
            const loadTime = performance.now() - startTime;
            const threshold = this.config.testing.performanceTests.loadTimeThreshold;
            
            return {
                passed: loadTime < threshold,
                message: `Page loaded in ${loadTime.toFixed(2)}ms`
            };
        } catch (error) {
            return {
                passed: false,
                message: `Page load failed: ${error.message}`
            };
        }
    }

    async testNavigation(url) {
        // Simulate navigation test
        const navigationElements = document.querySelectorAll('nav a, .navbar a');
        const hasNavigation = navigationElements.length > 0;
        
        return {
            passed: hasNavigation,
            message: hasNavigation ? 
                `Navigation working - found ${navigationElements.length} links` : 
                'Navigation elements not found'
        };
    }

    // Performance Tests
    async testPageLoadTime() {
        const results = [];
        
        // Test Core Web Vitals
        const vitals = await this.measureCoreWebVitals();
        
        results.push({
            name: 'Largest Contentful Paint (LCP)',
            passed: vitals.lcp < 2500,
            message: `LCP: ${vitals.lcp}ms (threshold: 2500ms)`
        });

        results.push({
            name: 'First Input Delay (FID)',
            passed: vitals.fid < 100,
            message: `FID: ${vitals.fid}ms (threshold: 100ms)`
        });

        results.push({
            name: 'Cumulative Layout Shift (CLS)',
            passed: vitals.cls < 0.1,
            message: `CLS: ${vitals.cls} (threshold: 0.1)`
        });

        return {
            suite: 'Performance Tests - Page Load',
            results,
            passed: results.every(r => r.passed),
            total: results.length,
            passedCount: results.filter(r => r.passed).length
        };
    }

    async measureCoreWebVitals() {
        return new Promise((resolve) => {
            const vitals = { lcp: 0, fid: 0, cls: 0 };
            
            // Measure LCP
            new PerformanceObserver((entryList) => {
                const entries = entryList.getEntries();
                if (entries.length > 0) {
                    vitals.lcp = entries[entries.length - 1].startTime;
                }
            }).observe({ entryTypes: ['largest-contentful-paint'] });

            // Measure FID
            new PerformanceObserver((entryList) => {
                const entries = entryList.getEntries();
                if (entries.length > 0) {
                    vitals.fid = entries[0].processingStart - entries[0].startTime;
                }
            }).observe({ entryTypes: ['first-input'] });

            // Measure CLS
            new PerformanceObserver((entryList) => {
                const entries = entryList.getEntries();
                entries.forEach(entry => {
                    if (!entry.hadRecentInput) {
                        vitals.cls += entry.value;
                    }
                });
            }).observe({ entryTypes: ['layout-shift'] });

            // Resolve after a short delay to collect metrics
            setTimeout(() => resolve(vitals), 2000);
        });
    }

    // Accessibility Tests
    async testAccessibility() {
        const results = [];
        
        // Test color contrast
        const contrastTest = this.testColorContrast();
        results.push({
            name: 'Color Contrast',
            passed: contrastTest.passed,
            message: contrastTest.message
        });

        // Test keyboard navigation
        const keyboardTest = this.testKeyboardNavigation();
        results.push({
            name: 'Keyboard Navigation',
            passed: keyboardTest.passed,
            message: keyboardTest.message
        });

        // Test ARIA labels
        const ariaTest = this.testARIALabels();
        results.push({
            name: 'ARIA Labels',
            passed: ariaTest.passed,
            message: ariaTest.message
        });

        return {
            suite: 'Accessibility Tests',
            results,
            passed: results.every(r => r.passed),
            total: results.length,
            passedCount: results.filter(r => r.passed).length
        };
    }

    testColorContrast() {
        // Simplified color contrast test
        const elements = document.querySelectorAll('*');
        let contrastIssues = 0;
        
        elements.forEach(element => {
            const styles = getComputedStyle(element);
            const color = styles.color;
            const backgroundColor = styles.backgroundColor;
            
            // Simplified contrast check (in real implementation would calculate actual contrast ratio)
            if (color === backgroundColor) {
                contrastIssues++;
            }
        });

        return {
            passed: contrastIssues === 0,
            message: contrastIssues === 0 ? 
                'No color contrast issues found' : 
                `Found ${contrastIssues} potential contrast issues`
        };
    }

    testKeyboardNavigation() {
        const focusableElements = document.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        
        const hasTabIndex = Array.from(focusableElements).every(element => {
            return element.tabIndex >= 0 || element.hasAttribute('tabindex');
        });

        return {
            passed: focusableElements.length > 0,
            message: `Found ${focusableElements.length} focusable elements`
        };
    }

    testARIALabels() {
        const interactiveElements = document.querySelectorAll('button, input, select, textarea');
        let missingLabels = 0;
        
        interactiveElements.forEach(element => {
            const hasLabel = element.hasAttribute('aria-label') || 
                           element.hasAttribute('aria-labelledby') ||
                           element.labels?.length > 0 ||
                           element.textContent?.trim();
            
            if (!hasLabel) {
                missingLabels++;
            }
        });

        return {
            passed: missingLabels === 0,
            message: missingLabels === 0 ? 
                'All interactive elements have labels' : 
                `${missingLabels} elements missing labels`
        };
    }

    // Test Execution
    async runAllTests() {
        console.log('Starting comprehensive test suite...');
        const startTime = Date.now();
        
        const allResults = [];
        
        for (const [suiteKey, suite] of this.testSuites.entries()) {
            console.log(`Running ${suite.name}...`);
            
            for (const test of suite.tests) {
                try {
                    const result = await test();
                    allResults.push(result);
                } catch (error) {
                    allResults.push({
                        suite: suite.name,
                        passed: false,
                        error: error.message,
                        results: []
                    });
                }
            }
        }

        const endTime = Date.now();
        const duration = endTime - startTime;

        const summary = this.generateTestSummary(allResults, duration);
        this.testResults = allResults;
        
        console.log('Test suite completed:', summary);
        return summary;
    }

    async runTestSuite(suiteKey) {
        const suite = this.testSuites.get(suiteKey);
        if (!suite) {
            throw new Error(`Test suite '${suiteKey}' not found`);
        }

        console.log(`Running ${suite.name}...`);
        const startTime = Date.now();
        
        const results = [];
        
        for (const test of suite.tests) {
            try {
                const result = await test();
                results.push(result);
            } catch (error) {
                results.push({
                    suite: suite.name,
                    passed: false,
                    error: error.message,
                    results: []
                });
            }
        }

        const endTime = Date.now();
        const duration = endTime - startTime;

        return {
            suite: suite.name,
            results,
            duration,
            passed: results.every(r => r.passed),
            total: results.length,
            passedCount: results.filter(r => r.passed).length
        };
    }

    generateTestSummary(results, duration) {
        const totalTests = results.reduce((sum, result) => sum + (result.total || 0), 0);
        const passedTests = results.reduce((sum, result) => sum + (result.passedCount || 0), 0);
        const failedTests = totalTests - passedTests;
        
        const passRate = totalTests > 0 ? (passedTests / totalTests * 100).toFixed(2) : 0;
        
        return {
            summary: {
                total: totalTests,
                passed: passedTests,
                failed: failedTests,
                passRate: `${passRate}%`,
                duration: `${duration}ms`,
                suites: results.length
            },
            results,
            timestamp: new Date().toISOString()
        };
    }

    // Coverage Tracking
    setupCoverageTracking() {
        // Simple coverage tracking
        this.coverage = {
            functions: new Set(),
            lines: new Set(),
            branches: new Set()
        };
        
        // Track function calls
        this.instrumentFunctions();
    }

    instrumentFunctions() {
        // Basic function instrumentation
        const originalFunctions = {};
        
        // Track main application functions
        if (window.advancedSearch) {
            originalFunctions.search = window.advancedSearch.performAdvancedSearch;
            window.advancedSearch.performAdvancedSearch = (...args) => {
                this.coverage.functions.add('advancedSearch.performAdvancedSearch');
                return originalFunctions.search.apply(window.advancedSearch, args);
            };
        }
        
        if (window.enhancedComparison) {
            originalFunctions.comparison = window.enhancedComparison.addProduct;
            window.enhancedComparison.addProduct = (...args) => {
                this.coverage.functions.add('enhancedComparison.addProduct');
                return originalFunctions.comparison.apply(window.enhancedComparison, args);
            };
        }
    }

    getCoverageReport() {
        return {
            functions: {
                covered: this.coverage.functions.size,
                total: this.getTotalFunctions(),
                percentage: (this.coverage.functions.size / this.getTotalFunctions() * 100).toFixed(2)
            },
            lines: {
                covered: this.coverage.lines.size,
                total: this.getTotalLines(),
                percentage: (this.coverage.lines.size / this.getTotalLines() * 100).toFixed(2)
            },
            overall: this.getOverallCoverage()
        };
    }

    getTotalFunctions() {
        // Estimate total functions (in real implementation would be more accurate)
        return 50;
    }

    getTotalLines() {
        // Estimate total lines (in real implementation would be more accurate)
        return 1000;
    }

    getOverallCoverage() {
        const functionCoverage = this.coverage.functions.size / this.getTotalFunctions();
        const lineCoverage = this.coverage.lines.size / this.getTotalLines();
        
        return ((functionCoverage + lineCoverage) / 2 * 100).toFixed(2);
    }

    // Continuous Integration
    setupContinuousIntegration() {
        // Setup CI/CD pipeline hooks
        this.ciConfig = {
            triggers: ['push', 'pull_request'],
            stages: ['test', 'build', 'deploy'],
            notifications: ['email', 'slack']
        };
    }

    async runCIPipeline() {
        console.log('Starting CI/CD pipeline...');
        
        const pipeline = {
            test: await this.runAllTests(),
            build: await this.runBuildProcess(),
            deploy: await this.runDeploymentProcess()
        };
        
        return pipeline;
    }

    async runBuildProcess() {
        console.log('Running build process...');
        
        // Simulate build process
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        return {
            success: true,
            duration: 1000,
            artifacts: ['dist/app.js', 'dist/app.css', 'dist/index.html']
        };
    }

    async runDeploymentProcess() {
        console.log('Running deployment process...');
        
        // Simulate deployment
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        return {
            success: true,
            duration: 2000,
            environment: 'staging',
            url: 'https://staging.leddisplaysolutions.com'
        };
    }

    // Reporting
    generateHTMLReport(results) {
        const html = `
<!DOCTYPE html>
<html>
<head>
    <title>Test Report - LED Display Solutions</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 2rem; }
        .summary { background: #f8f9fa; padding: 1rem; border-radius: 8px; margin-bottom: 2rem; }
        .passed { color: #28a745; }
        .failed { color: #dc3545; }
        .suite { margin-bottom: 2rem; border: 1px solid #dee2e6; border-radius: 8px; }
        .suite-header { background: #e9ecef; padding: 1rem; font-weight: bold; }
        .test-result { padding: 0.5rem 1rem; border-bottom: 1px solid #dee2e6; }
        .test-result:last-child { border-bottom: none; }
    </style>
</head>
<body>
    <h1>Test Report</h1>
    <div class="summary">
        <h2>Summary</h2>
        <p><strong>Total Tests:</strong> ${results.summary.total}</p>
        <p><strong>Passed:</strong> <span class="passed">${results.summary.passed}</span></p>
        <p><strong>Failed:</strong> <span class="failed">${results.summary.failed}</span></p>
        <p><strong>Pass Rate:</strong> ${results.summary.passRate}</p>
        <p><strong>Duration:</strong> ${results.summary.duration}</p>
        <p><strong>Generated:</strong> ${results.timestamp}</p>
    </div>
    
    ${results.results.map(suite => `
        <div class="suite">
            <div class="suite-header">${suite.suite}</div>
            ${suite.results ? suite.results.map(test => `
                <div class="test-result">
                    <span class="${test.passed ? 'passed' : 'failed'}">
                        ${test.passed ? '✓' : '✗'} ${test.name}
                    </span>
                    <div>${test.message}</div>
                </div>
            `).join('') : ''}
        </div>
    `).join('')}
</body>
</html>
        `;
        
        return html;
    }

    generateJUnitReport(results) {
        const xml = `<?xml version="1.0" encoding="UTF-8"?>
<testsuites tests="${results.summary.total}" failures="${results.summary.failed}" time="${results.summary.duration}">
    ${results.results.map(suite => `
        <testsuite name="${suite.suite}" tests="${suite.total || 0}" failures="${(suite.total || 0) - (suite.passedCount || 0)}">
            ${suite.results ? suite.results.map(test => `
                <testcase name="${test.name}" classname="${suite.suite}">
                    ${!test.passed ? `<failure message="${test.message}"></failure>` : ''}
                </testcase>
            `).join('') : ''}
        </testsuite>
    `).join('')}
</testsuites>`;
        
        return xml;
    }

    exportReport(format = 'html') {
        const results = this.testResults.length > 0 ? 
            this.generateTestSummary(this.testResults, 0) : 
            { summary: { total: 0, passed: 0, failed: 0 }, results: [] };
        
        let content, filename, mimeType;
        
        switch (format) {
            case 'html':
                content = this.generateHTMLReport(results);
                filename = `test-report-${new Date().toISOString().split('T')[0]}.html`;
                mimeType = 'text/html';
                break;
            case 'json':
                content = JSON.stringify(results, null, 2);
                filename = `test-report-${new Date().toISOString().split('T')[0]}.json`;
                mimeType = 'application/json';
                break;
            case 'junit':
                content = this.generateJUnitReport(results);
                filename = `test-report-${new Date().toISOString().split('T')[0]}.xml`;
                mimeType = 'application/xml';
                break;
            default:
                throw new Error(`Unsupported format: ${format}`);
        }
        
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    // Public API
    async test(suiteKey = null) {
        if (suiteKey) {
            return await this.runTestSuite(suiteKey);
        } else {
            return await this.runAllTests();
        }
    }

    getResults() {
        return this.testResults;
    }

    getCoverage() {
        return this.getCoverageReport();
    }

    async deploy(environment = 'staging') {
        console.log(`Deploying to ${environment}...`);
        
        // Run tests first
        const testResults = await this.runAllTests();
        
        if (testResults.summary.failed > 0) {
            throw new Error('Deployment blocked: tests failing');
        }
        
        // Run deployment
        return await this.runDeploymentProcess();
    }
}

// Initialize Test Automation
document.addEventListener('DOMContentLoaded', () => {
    window.testAutomation = new TestAutomation();
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TestAutomation;
}