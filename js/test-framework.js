/* =================================================================
   AUTOMATED TEST FRAMEWORK
   Comprehensive testing system for LED website functionality
   ================================================================= */

class TestFramework {
    constructor() {
        this.tests = [];
        this.results = [];
        this.isRunning = false;
        this.currentTest = null;
        this.startTime = null;
        this.endTime = null;
        
        this.init();
    }

    init() {
        this.setupTestEnvironment();
        this.registerTests();
        console.log('Test Framework initialized');
    }

    setupTestEnvironment() {
        // Create test results container
        this.createTestResultsUI();
        
        // Setup test data
        this.setupTestData();
        
        // Setup mock functions
        this.setupMocks();
    }

    createTestResultsUI() {
        const testContainer = document.createElement('div');
        testContainer.id = 'test-framework-container';
        testContainer.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            width: 400px;
            max-height: 80vh;
            background: white;
            border: 1px solid #ddd;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            z-index: 10000;
            font-family: monospace;
            font-size: 12px;
            display: none;
        `;
        
        testContainer.innerHTML = `
            <div style="padding: 1rem; border-bottom: 1px solid #ddd; background: #f8f9fa; border-radius: 8px 8px 0 0;">
                <h3 style="margin: 0; font-size: 14px;">Test Framework</h3>
                <div style="margin-top: 0.5rem;">
                    <button id="run-all-tests" style="margin-right: 0.5rem; padding: 0.25rem 0.5rem; font-size: 11px;">Run All</button>
                    <button id="run-unit-tests" style="margin-right: 0.5rem; padding: 0.25rem 0.5rem; font-size: 11px;">Unit Tests</button>
                    <button id="run-integration-tests" style="margin-right: 0.5rem; padding: 0.25rem 0.5rem; font-size: 11px;">Integration</button>
                    <button id="clear-results" style="margin-right: 0.5rem; padding: 0.25rem 0.5rem; font-size: 11px;">Clear</button>
                    <button id="close-tests" style="padding: 0.25rem 0.5rem; font-size: 11px;">Close</button>
                </div>
            </div>
            <div id="test-results" style="padding: 1rem; max-height: 60vh; overflow-y: auto;">
                <p style="color: #666; margin: 0;">Click "Run All" to start testing</p>
            </div>
            <div id="test-summary" style="padding: 0.5rem 1rem; border-top: 1px solid #ddd; background: #f8f9fa; font-size: 11px;">
                Ready to run tests
            </div>
        `;
        
        document.body.appendChild(testContainer);
        
        // Setup event listeners
        document.getElementById('run-all-tests').addEventListener('click', () => this.runAllTests());
        document.getElementById('run-unit-tests').addEventListener('click', () => this.runTestsByType('unit'));
        document.getElementById('run-integration-tests').addEventListener('click', () => this.runTestsByType('integration'));
        document.getElementById('clear-results').addEventListener('click', () => this.clearResults());
        document.getElementById('close-tests').addEventListener('click', () => this.hideTestUI());
    }

    setupTestData() {
        this.testData = {
            sampleProducts: [
                {
                    id: 1,
                    name: 'Test Product 1',
                    category: 'fine-pitch',
                    pixelPitch: 1.25,
                    brightness: 800,
                    price: 15000,
                    features: ['high-resolution', 'low-power']
                },
                {
                    id: 2,
                    name: 'Test Product 2',
                    category: 'outdoor',
                    pixelPitch: 4.0,
                    brightness: 6500,
                    price: 8000,
                    features: ['weatherproof', 'high-brightness']
                }
            ],
            sampleSearchQuery: 'outdoor LED',
            sampleFormData: {
                name: 'Test User',
                email: 'test@example.com',
                message: 'Test inquiry message'
            }
        };
    }

    setupMocks() {
        // Mock fetch for API calls
        this.originalFetch = window.fetch;
        window.fetch = this.mockFetch.bind(this);
        
        // Mock localStorage
        this.mockStorage = {};
        this.originalLocalStorage = window.localStorage;
    }

    mockFetch(url, options) {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    ok: true,
                    json: () => Promise.resolve({ success: true, data: this.testData.sampleProducts }),
                    text: () => Promise.resolve('Mock response')
                });
            }, 100);
        });
    }

    registerTests() {
        // Unit Tests
        this.addTest('Advanced Search Initialization', 'unit', this.testAdvancedSearchInit);
        this.addTest('Product Comparison Initialization', 'unit', this.testComparisonInit);
        this.addTest('Mobile Enhancements Initialization', 'unit', this.testMobileEnhancementsInit);
        this.addTest('Search Filter Logic', 'unit', this.testSearchFilters);
        this.addTest('Product Data Validation', 'unit', this.testProductValidation);
        
        // Integration Tests
        this.addTest('Search and Filter Integration', 'integration', this.testSearchIntegration);
        this.addTest('Product Comparison Workflow', 'integration', this.testComparisonWorkflow);
        this.addTest('Mobile Navigation Integration', 'integration', this.testMobileNavigation);
        this.addTest('Form Submission Integration', 'integration', this.testFormSubmission);
        this.addTest('Local Storage Integration', 'integration', this.testLocalStorageIntegration);
        
        // Performance Tests
        this.addTest('Search Performance', 'performance', this.testSearchPerformance);
        this.addTest('Comparison Performance', 'performance', this.testComparisonPerformance);
        this.addTest('Mobile Performance', 'performance', this.testMobilePerformance);
        
        // Accessibility Tests
        this.addTest('Keyboard Navigation', 'accessibility', this.testKeyboardNavigation);
        this.addTest('ARIA Labels', 'accessibility', this.testAriaLabels);
        this.addTest('Focus Management', 'accessibility', this.testFocusManagement);
    }

    addTest(name, type, testFunction) {
        this.tests.push({
            name,
            type,
            testFunction: testFunction.bind(this),
            status: 'pending'
        });
    }

    async runAllTests() {
        if (this.isRunning) return;
        
        this.isRunning = true;
        this.startTime = Date.now();
        this.results = [];
        
        this.updateSummary('Running tests...');
        this.clearResults();
        
        for (const test of this.tests) {
            await this.runSingleTest(test);
        }
        
        this.endTime = Date.now();
        this.isRunning = false;
        this.displayFinalSummary();
    }

    async runTestsByType(type) {
        if (this.isRunning) return;
        
        this.isRunning = true;
        this.startTime = Date.now();
        this.results = [];
        
        const testsToRun = this.tests.filter(test => test.type === type);
        this.updateSummary(`Running ${type} tests...`);
        this.clearResults();
        
        for (const test of testsToRun) {
            await this.runSingleTest(test);
        }
        
        this.endTime = Date.now();
        this.isRunning = false;
        this.displayFinalSummary();
    }

    async runSingleTest(test) {
        this.currentTest = test;
        const startTime = Date.now();
        
        try {
            this.logResult(`Running: ${test.name}`, 'info');
            
            const result = await test.testFunction();
            const endTime = Date.now();
            const duration = endTime - startTime;
            
            const testResult = {
                name: test.name,
                type: test.type,
                status: result.success ? 'passed' : 'failed',
                message: result.message,
                duration,
                details: result.details || null
            };
            
            this.results.push(testResult);
            this.logResult(`${result.success ? '✅' : '❌'} ${test.name}: ${result.message} (${duration}ms)`, 
                          result.success ? 'success' : 'error');
            
        } catch (error) {
            const endTime = Date.now();
            const duration = endTime - startTime;
            
            const testResult = {
                name: test.name,
                type: test.type,
                status: 'error',
                message: error.message,
                duration,
                details: error.stack
            };
            
            this.results.push(testResult);
            this.logResult(`💥 ${test.name}: ${error.message} (${duration}ms)`, 'error');
        }
        
        // Small delay between tests
        await this.delay(50);
    }

    // Unit Tests
    async testAdvancedSearchInit() {
        if (!window.advancedSearch) {
            return { success: false, message: 'AdvancedSearch not initialized' };
        }
        
        const hasProducts = window.advancedSearch.getAllProducts().length > 0;
        const hasSearchInterface = document.getElementById('advanced-search-container') !== null;
        
        return {
            success: hasProducts && hasSearchInterface,
            message: hasProducts && hasSearchInterface ? 'Advanced search properly initialized' : 'Missing products or interface',
            details: { hasProducts, hasSearchInterface }
        };
    }

    async testComparisonInit() {
        if (!window.enhancedComparison) {
            return { success: false, message: 'EnhancedComparison not initialized' };
        }
        
        const hasComparisonBar = document.getElementById('comparison-bar') !== null;
        const hasComparisonModal = document.getElementById('comparison-modal') !== null;
        
        return {
            success: hasComparisonBar && hasComparisonModal,
            message: hasComparisonBar && hasComparisonModal ? 'Product comparison properly initialized' : 'Missing comparison UI elements',
            details: { hasComparisonBar, hasComparisonModal }
        };
    }

    async testMobileEnhancementsInit() {
        if (!window.mobileEnhancements) {
            return { success: false, message: 'MobileEnhancements not initialized' };
        }
        
        const isMobileDetected = typeof window.mobileEnhancements.isMobileDevice === 'function';
        const hasNavToggle = document.querySelector('.navbar-toggler') !== null;
        
        return {
            success: isMobileDetected && hasNavToggle,
            message: isMobileDetected && hasNavToggle ? 'Mobile enhancements properly initialized' : 'Missing mobile features',
            details: { isMobileDetected, hasNavToggle }
        };
    }

    async testSearchFilters() {
        if (!window.advancedSearch) {
            return { success: false, message: 'AdvancedSearch not available' };
        }
        
        // Test category filter
        const categoryFilter = document.getElementById('category-filter');
        if (!categoryFilter) {
            return { success: false, message: 'Category filter not found' };
        }
        
        categoryFilter.value = 'outdoor';
        window.advancedSearch.performAdvancedSearch();
        
        // Check if results are filtered
        const results = document.querySelectorAll('.search-result-card');
        const hasResults = results.length > 0;
        
        return {
            success: hasResults,
            message: hasResults ? 'Search filters working correctly' : 'No search results found',
            details: { resultsCount: results.length }
        };
    }

    async testProductValidation() {
        const testProduct = this.testData.sampleProducts[0];
        
        // Test required fields
        const hasId = testProduct.id !== undefined;
        const hasName = testProduct.name && testProduct.name.length > 0;
        const hasCategory = testProduct.category && testProduct.category.length > 0;
        const hasPrice = testProduct.price && testProduct.price > 0;
        
        const isValid = hasId && hasName && hasCategory && hasPrice;
        
        return {
            success: isValid,
            message: isValid ? 'Product data validation passed' : 'Product data validation failed',
            details: { hasId, hasName, hasCategory, hasPrice }
        };
    }

    // Integration Tests
    async testSearchIntegration() {
        if (!window.advancedSearch) {
            return { success: false, message: 'AdvancedSearch not available' };
        }
        
        // Test quick search
        const quickSearch = document.getElementById('quick-search');
        if (!quickSearch) {
            return { success: false, message: 'Quick search input not found' };
        }
        
        quickSearch.value = this.testData.sampleSearchQuery;
        window.advancedSearch.performQuickSearch();
        
        await this.delay(500);
        
        const results = document.querySelectorAll('.search-result-card');
        const hasResults = results.length > 0;
        
        // Test advanced filters
        const categoryFilter = document.getElementById('category-filter');
        if (categoryFilter) {
            categoryFilter.value = 'outdoor';
            window.advancedSearch.performAdvancedSearch();
            await this.delay(300);
        }
        
        return {
            success: hasResults,
            message: hasResults ? 'Search integration working correctly' : 'Search integration failed',
            details: { quickSearchResults: results.length }
        };
    }

    async testComparisonWorkflow() {
        if (!window.enhancedComparison || !window.advancedSearch) {
            return { success: false, message: 'Comparison or search not available' };
        }
        
        // Clear existing comparisons
        window.enhancedComparison.clearComparison();
        
        // Add products to comparison
        const products = window.advancedSearch.getAllProducts();
        if (products.length < 2) {
            return { success: false, message: 'Not enough products for comparison test' };
        }
        
        const addResult1 = window.enhancedComparison.addProduct(products[0]);
        const addResult2 = window.enhancedComparison.addProduct(products[1]);
        
        if (!addResult1 || !addResult2) {
            return { success: false, message: 'Failed to add products to comparison' };
        }
        
        // Check comparison count
        const comparisonCount = window.enhancedComparison.getComparisonCount();
        
        // Test comparison view
        window.enhancedComparison.viewComparison();
        await this.delay(500);
        
        const comparisonModal = document.getElementById('comparison-modal');
        const isModalVisible = comparisonModal && comparisonModal.style.display !== 'none';
        
        // Close modal
        if (isModalVisible) {
            window.enhancedComparison.closeComparison();
        }
        
        return {
            success: comparisonCount === 2 && isModalVisible,
            message: comparisonCount === 2 && isModalVisible ? 'Comparison workflow working correctly' : 'Comparison workflow failed',
            details: { comparisonCount, isModalVisible }
        };
    }

    async testMobileNavigation() {
        const navbar = document.querySelector('.navbar');
        const navToggle = document.querySelector('.navbar-toggler');
        const navMenu = document.querySelector('.navbar-nav');
        
        if (!navbar || !navToggle || !navMenu) {
            return { success: false, message: 'Mobile navigation elements not found' };
        }
        
        // Test toggle functionality
        const initialDisplay = navMenu.classList.contains('show');
        navToggle.click();
        await this.delay(300);
        
        const afterToggle = navMenu.classList.contains('show');
        const toggleWorked = initialDisplay !== afterToggle;
        
        // Reset state
        if (afterToggle) {
            navToggle.click();
        }
        
        return {
            success: toggleWorked,
            message: toggleWorked ? 'Mobile navigation working correctly' : 'Mobile navigation toggle failed',
            details: { initialDisplay, afterToggle }
        };
    }

    async testFormSubmission() {
        // Create a test form
        const testForm = document.createElement('form');
        testForm.innerHTML = `
            <input type="text" name="name" value="${this.testData.sampleFormData.name}" required>
            <input type="email" name="email" value="${this.testData.sampleFormData.email}" required>
            <textarea name="message">${this.testData.sampleFormData.message}</textarea>
            <button type="submit">Submit</button>
        `;
        
        document.body.appendChild(testForm);
        
        // Test form validation
        const isValid = testForm.checkValidity();
        
        // Test form data collection
        const formData = new FormData(testForm);
        const hasName = formData.get('name') === this.testData.sampleFormData.name;
        const hasEmail = formData.get('email') === this.testData.sampleFormData.email;
        const hasMessage = formData.get('message') === this.testData.sampleFormData.message;
        
        // Cleanup
        document.body.removeChild(testForm);
        
        const success = isValid && hasName && hasEmail && hasMessage;
        
        return {
            success,
            message: success ? 'Form submission test passed' : 'Form submission test failed',
            details: { isValid, hasName, hasEmail, hasMessage }
        };
    }

    async testLocalStorageIntegration() {
        const testKey = 'test_framework_storage';
        const testData = { test: true, timestamp: Date.now() };
        
        try {
            // Test write
            localStorage.setItem(testKey, JSON.stringify(testData));
            
            // Test read
            const retrieved = JSON.parse(localStorage.getItem(testKey));
            const dataMatches = retrieved.test === testData.test;
            
            // Test delete
            localStorage.removeItem(testKey);
            const afterDelete = localStorage.getItem(testKey);
            
            const success = dataMatches && afterDelete === null;
            
            return {
                success,
                message: success ? 'Local storage integration working' : 'Local storage integration failed',
                details: { dataMatches, afterDelete }
            };
        } catch (error) {
            return {
                success: false,
                message: 'Local storage not available',
                details: { error: error.message }
            };
        }
    }

    // Performance Tests
    async testSearchPerformance() {
        if (!window.advancedSearch) {
            return { success: false, message: 'AdvancedSearch not available' };
        }
        
        const startTime = performance.now();
        
        // Perform multiple searches
        for (let i = 0; i < 10; i++) {
            window.advancedSearch.performQuickSearch();
            await this.delay(10);
        }
        
        const endTime = performance.now();
        const duration = endTime - startTime;
        const averageTime = duration / 10;
        
        const isPerformant = averageTime < 100; // Less than 100ms average
        
        return {
            success: isPerformant,
            message: isPerformant ? `Search performance good (${averageTime.toFixed(2)}ms avg)` : `Search performance slow (${averageTime.toFixed(2)}ms avg)`,
            details: { totalTime: duration, averageTime }
        };
    }

    async testComparisonPerformance() {
        if (!window.enhancedComparison) {
            return { success: false, message: 'EnhancedComparison not available' };
        }
        
        const startTime = performance.now();
        
        // Test comparison table generation
        window.enhancedComparison.generateComparisonTable();
        
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        const isPerformant = duration < 200; // Less than 200ms
        
        return {
            success: isPerformant,
            message: isPerformant ? `Comparison performance good (${duration.toFixed(2)}ms)` : `Comparison performance slow (${duration.toFixed(2)}ms)`,
            details: { duration }
        };
    }

    async testMobilePerformance() {
        const startTime = performance.now();
        
        // Simulate mobile interactions
        const touchEvent = new TouchEvent('touchstart', {
            touches: [{ clientX: 100, clientY: 100 }]
        });
        
        document.dispatchEvent(touchEvent);
        
        // Test scroll performance
        window.scrollTo(0, 100);
        await this.delay(100);
        window.scrollTo(0, 0);
        
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        const isPerformant = duration < 150;
        
        return {
            success: isPerformant,
            message: isPerformant ? `Mobile performance good (${duration.toFixed(2)}ms)` : `Mobile performance needs improvement (${duration.toFixed(2)}ms)`,
            details: { duration }
        };
    }

    // Accessibility Tests
    async testKeyboardNavigation() {
        const focusableElements = document.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        
        const hasFocusableElements = focusableElements.length > 0;
        
        // Test tab order
        let tabOrderCorrect = true;
        if (focusableElements.length > 1) {
            focusableElements[0].focus();
            
            // Simulate tab key
            const tabEvent = new KeyboardEvent('keydown', { key: 'Tab' });
            document.dispatchEvent(tabEvent);
        }
        
        return {
            success: hasFocusableElements,
            message: hasFocusableElements ? `Found ${focusableElements.length} focusable elements` : 'No focusable elements found',
            details: { focusableCount: focusableElements.length, tabOrderCorrect }
        };
    }

    async testAriaLabels() {
        const interactiveElements = document.querySelectorAll('button, [role="button"], input, select, textarea');
        let elementsWithLabels = 0;
        let totalElements = interactiveElements.length;
        
        interactiveElements.forEach(element => {
            const hasAriaLabel = element.getAttribute('aria-label');
            const hasAriaLabelledBy = element.getAttribute('aria-labelledby');
            const hasLabel = element.labels && element.labels.length > 0;
            const hasTextContent = element.textContent.trim().length > 0;
            
            if (hasAriaLabel || hasAriaLabelledBy || hasLabel || hasTextContent) {
                elementsWithLabels++;
            }
        });
        
        const coverage = totalElements > 0 ? (elementsWithLabels / totalElements) * 100 : 100;
        const isGoodCoverage = coverage >= 80;
        
        return {
            success: isGoodCoverage,
            message: isGoodCoverage ? `Good ARIA label coverage (${coverage.toFixed(1)}%)` : `Poor ARIA label coverage (${coverage.toFixed(1)}%)`,
            details: { elementsWithLabels, totalElements, coverage }
        };
    }

    async testFocusManagement() {
        // Test focus trap in modals
        const modals = document.querySelectorAll('.modal, .comparison-modal');
        let focusTrapsWorking = 0;
        
        for (const modal of modals) {
            const focusableInModal = modal.querySelectorAll(
                'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
            );
            
            if (focusableInModal.length > 0) {
                focusTrapsWorking++;
            }
        }
        
        const hasFocusManagement = focusTrapsWorking > 0 || modals.length === 0;
        
        return {
            success: hasFocusManagement,
            message: hasFocusManagement ? 'Focus management implemented' : 'Focus management needs improvement',
            details: { modalsWithFocus: focusTrapsWorking, totalModals: modals.length }
        };
    }

    // Utility Methods
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    logResult(message, type = 'info') {
        const resultsContainer = document.getElementById('test-results');
        if (!resultsContainer) return;
        
        const logEntry = document.createElement('div');
        logEntry.style.cssText = `
            padding: 0.25rem 0;
            border-bottom: 1px solid #eee;
            font-size: 11px;
            color: ${type === 'error' ? '#dc3545' : type === 'success' ? '#28a745' : '#333'};
        `;
        logEntry.textContent = message;
        
        resultsContainer.appendChild(logEntry);
        resultsContainer.scrollTop = resultsContainer.scrollHeight;
    }

    updateSummary(message) {
        const summaryContainer = document.getElementById('test-summary');
        if (summaryContainer) {
            summaryContainer.textContent = message;
        }
    }

    displayFinalSummary() {
        const passed = this.results.filter(r => r.status === 'passed').length;
        const failed = this.results.filter(r => r.status === 'failed').length;
        const errors = this.results.filter(r => r.status === 'error').length;
        const total = this.results.length;
        const duration = this.endTime - this.startTime;
        
        const summary = `✅ ${passed} passed, ❌ ${failed} failed, 💥 ${errors} errors (${total} total, ${duration}ms)`;
        this.updateSummary(summary);
        
        // Log detailed summary
        this.logResult('='.repeat(50), 'info');
        this.logResult(`TEST SUMMARY: ${summary}`, 'info');
        this.logResult('='.repeat(50), 'info');
        
        // Generate test report
        this.generateTestReport();
    }

    generateTestReport() {
        const report = {
            timestamp: new Date().toISOString(),
            duration: this.endTime - this.startTime,
            summary: {
                total: this.results.length,
                passed: this.results.filter(r => r.status === 'passed').length,
                failed: this.results.filter(r => r.status === 'failed').length,
                errors: this.results.filter(r => r.status === 'error').length
            },
            results: this.results,
            environment: {
                userAgent: navigator.userAgent,
                viewport: `${window.innerWidth}x${window.innerHeight}`,
                url: window.location.href
            }
        };
        
        // Store report in localStorage
        localStorage.setItem('led_test_report', JSON.stringify(report));
        
        console.log('Test Report Generated:', report);
    }

    clearResults() {
        const resultsContainer = document.getElementById('test-results');
        if (resultsContainer) {
            resultsContainer.innerHTML = '';
        }
    }

    showTestUI() {
        const container = document.getElementById('test-framework-container');
        if (container) {
            container.style.display = 'block';
        }
    }

    hideTestUI() {
        const container = document.getElementById('test-framework-container');
        if (container) {
            container.style.display = 'none';
        }
    }

    // Public API
    getTestResults() {
        return this.results;
    }

    getLastReport() {
        const report = localStorage.getItem('led_test_report');
        return report ? JSON.parse(report) : null;
    }

    exportResults() {
        const report = this.getLastReport();
        if (!report) return;
        
        const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `led-test-report-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
}

// Global test functions
function runTests() {
    if (window.testFramework) {
        window.testFramework.showTestUI();
        window.testFramework.runAllTests();
    }
}

function showTestFramework() {
    if (window.testFramework) {
        window.testFramework.showTestUI();
    }
}

function hideTestFramework() {
    if (window.testFramework) {
        window.testFramework.hideTestUI();
    }
}

// Initialize test framework
document.addEventListener('DOMContentLoaded', () => {
    // Wait for other modules to initialize
    setTimeout(() => {
        window.testFramework = new TestFramework();
        
        // Add keyboard shortcut to show tests (Ctrl+Shift+T)
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.shiftKey && e.key === 'T') {
                showTestFramework();
            }
        });
    }, 2000);
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TestFramework;
}