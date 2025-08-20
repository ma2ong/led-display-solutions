/* =================================================================
   MOBILE EXPERIENCE ENHANCER
   Advanced mobile UX improvements and touch interactions
   ================================================================= */
class MobileExperienceEnhancer {
    constructor() {
        this.isMobile = this.detectMobile();
        this.isTablet = this.detectTablet();
        this.deviceInfo = this.getDeviceInfo();
        this.touchCapabilities = this.detectTouchCapabilities();
        this.networkInfo = this.getNetworkInfo();
        this.performanceMetrics = {};
        
        this.init();
    }

    async init() {
        try {
            this.setupAdvancedTouchHandling();
            this.setupIntelligentNavigation();
            this.setupAdaptiveUI();
            this.setupPerformanceOptimization();
            this.setupOfflineSupport();
            this.setupAdvancedGestures();
            this.setupSmartKeyboard();
            this.setupContextualHelp();
            this.setupMobileAnalytics();
            
            console.log('Mobile Experience Enhancer initialized', {
                device: this.deviceInfo,
                touch: this.touchCapabilities,
                network: this.networkInfo
            });
        } catch (error) {
            console.error('Mobile Experience Enhancer initialization failed:', error);
        }
    }

    detectMobile() {
        const userAgent = navigator.userAgent.toLowerCase();
        const mobileKeywords = [
            'android', 'webos', 'iphone', 'ipad', 'ipod', 'blackberry', 
            'windows phone', 'opera mini', 'iemobile', 'mobile'
        ];
        
        return mobileKeywords.some(keyword => userAgent.includes(keyword)) ||
               window.innerWidth <= 768 ||
               ('ontouchstart' in window);
    }

    detectTablet() {
        const userAgent = navigator.userAgent.toLowerCase();
        const isTabletUA = /ipad|android(?!.*mobile)|tablet/i.test(userAgent);
        const isTabletSize = window.innerWidth >= 768 && window.innerWidth <= 1024;
        
        return isTabletUA || (isTabletSize && this.isMobile);
    }

    getDeviceInfo() {
        return {
            userAgent: navigator.userAgent,
            platform: navigator.platform,
            language: navigator.language,
            cookieEnabled: navigator.cookieEnabled,
            onLine: navigator.onLine,
            hardwareConcurrency: navigator.hardwareConcurrency || 1,
            deviceMemory: navigator.deviceMemory || 1,
            maxTouchPoints: navigator.maxTouchPoints || 0,
            screenWidth: screen.width,
            screenHeight: screen.height,
            viewportWidth: window.innerWidth,
            viewportHeight: window.innerHeight,
            pixelRatio: window.devicePixelRatio || 1,
            colorDepth: screen.colorDepth,
            orientation: screen.orientation?.type || 'unknown'
        };
    }

    detectTouchCapabilities() {
        return {
            touchSupport: 'ontouchstart' in window,
            multiTouch: navigator.maxTouchPoints > 1,
            forceTouch: 'ontouchforcechange' in window,
            pointerEvents: 'onpointerdown' in window,
            maxTouchPoints: navigator.maxTouchPoints || 0
        };
    }

    getNetworkInfo() {
        const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
        
        return {
            effectiveType: connection?.effectiveType || 'unknown',
            downlink: connection?.downlink || 0,
            rtt: connection?.rtt || 0,
            saveData: connection?.saveData || false,
            type: connection?.type || 'unknown'
        };
    }

    setupAdvancedTouchHandling() {
        this.setupMultiTouchGestures();
        this.setupPressureTouch();
        this.setupTouchFeedback();
        this.setupTouchOptimization();
    }

    setupMultiTouchGestures() {
        let touches = {};
        let gestureState = {
            pinching: false,
            rotating: false,
            panning: false,
            initialDistance: 0,
            initialAngle: 0,
            scale: 1,
            rotation: 0
        };

        document.addEventListener('touchstart', (e) => {
            Array.from(e.touches).forEach(touch => {
                touches[touch.identifier] = {
                    startX: touch.clientX,
                    startY: touch.clientY,
                    currentX: touch.clientX,
                    currentY: touch.clientY,
                    startTime: Date.now()
                };
            });

            if (e.touches.length === 2) {
                const touch1 = e.touches[0];
                const touch2 = e.touches[1];
                
                gestureState.initialDistance = this.getDistance(touch1, touch2);
                gestureState.initialAngle = this.getAngle(touch1, touch2);
                gestureState.pinching = true;
            }
        }, { passive: false });

        document.addEventListener('touchmove', (e) => {
            Array.from(e.touches).forEach(touch => {
                if (touches[touch.identifier]) {
                    touches[touch.identifier].currentX = touch.clientX;
                    touches[touch.identifier].currentY = touch.clientY;
                }
            });

            if (e.touches.length === 2 && gestureState.pinching) {
                const touch1 = e.touches[0];
                const touch2 = e.touches[1];
                
                const currentDistance = this.getDistance(touch1, touch2);
                const currentAngle = this.getAngle(touch1, touch2);
                
                gestureState.scale = currentDistance / gestureState.initialDistance;
                gestureState.rotation = currentAngle - gestureState.initialAngle;
                
                this.handlePinchGesture(gestureState.scale, gestureState.rotation, e);
            }
        }, { passive: false });

        document.addEventListener('touchend', (e) => {
            Array.from(e.changedTouches).forEach(touch => {
                const touchData = touches[touch.identifier];
                if (touchData) {
                    this.handleTouchEnd(touchData, touch);
                    delete touches[touch.identifier];
                }
            });

            if (e.touches.length < 2) {
                gestureState.pinching = false;
                gestureState.scale = 1;
                gestureState.rotation = 0;
            }
        }, { passive: true });
    }

    getDistance(touch1, touch2) {
        const dx = touch2.clientX - touch1.clientX;
        const dy = touch2.clientY - touch1.clientY;
        return Math.sqrt(dx * dx + dy * dy);
    }

    getAngle(touch1, touch2) {
        return Math.atan2(touch2.clientY - touch1.clientY, touch2.clientX - touch1.clientX);
    }

    handlePinchGesture(scale, rotation, event) {
        const target = event.target.closest('.zoomable, .product-image, .gallery-image');
        if (!target) return;

        // Apply zoom transformation
        if (Math.abs(scale - 1) > 0.1) {
            const currentScale = parseFloat(target.dataset.scale || 1);
            const newScale = Math.max(0.5, Math.min(3, currentScale * scale));
            
            target.style.transform = `scale(${newScale})`;
            target.dataset.scale = newScale;
            
            // Prevent default zoom behavior
            event.preventDefault();
        }
    }

    handleTouchEnd(touchData, touch) {
        const duration = Date.now() - touchData.startTime;
        const deltaX = touch.clientX - touchData.startX;
        const deltaY = touch.clientY - touchData.startY;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        const velocity = distance / duration;

        // Classify gesture
        if (duration < 200 && distance < 10) {
            this.handleTap(touch);
        } else if (duration < 500 && distance < 10) {
            this.handleLongPress(touch);
        } else if (velocity > 0.5) {
            this.handleSwipe(deltaX, deltaY, velocity, touch);
        }
    }

    handleTap(touch) {
        const element = document.elementFromPoint(touch.clientX, touch.clientY);
        if (element) {
            // Add tap animation
            this.addTapAnimation(element);
            
            // Handle special tap behaviors
            if (element.classList.contains('product-card')) {
                this.handleProductCardTap(element);
            }
        }
    }

    handleLongPress(touch) {
        const element = document.elementFromPoint(touch.clientX, touch.clientY);
        if (element) {
            // Show context menu or additional options
            this.showContextMenu(element, touch.clientX, touch.clientY);
        }
    }

    handleSwipe(deltaX, deltaY, velocity, touch) {
        const element = document.elementFromPoint(touch.clientX, touch.clientY);
        const swipeThreshold = 50;
        
        if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > swipeThreshold) {
            // Horizontal swipe
            if (deltaX > 0) {
                this.handleSwipeRight(element);
            } else {
                this.handleSwipeLeft(element);
            }
        } else if (Math.abs(deltaY) > swipeThreshold) {
            // Vertical swipe
            if (deltaY > 0) {
                this.handleSwipeDown(element);
            } else {
                this.handleSwipeUp(element);
            }
        }
    }

    setupPressureTouch() {
        if (!this.touchCapabilities.forceTouch) return;

        document.addEventListener('touchforcechange', (e) => {
            const touch = e.touches[0];
            const force = touch.force || 0;
            
            if (force > 0.5) {
                const element = document.elementFromPoint(touch.clientX, touch.clientY);
                this.handlePressureTouch(element, force);
            }
        }, { passive: true });
    }

    handlePressureTouch(element, force) {
        if (element?.classList.contains('product-card')) {
            // Show quick preview with pressure touch
            this.showQuickPreview(element, force);
        }
    }

    setupTouchFeedback() {
        // Haptic feedback (if supported)
        this.setupHapticFeedback();
        
        // Visual feedback
        this.setupVisualFeedback();
        
        // Audio feedback
        this.setupAudioFeedback();
    }

    setupHapticFeedback() {
        if (!('vibrate' in navigator)) return;

        document.addEventListener('touchstart', (e) => {
            const element = e.target;
            if (element.classList.contains('btn') || element.tagName === 'BUTTON') {
                navigator.vibrate(10); // Short vibration
            }
        }, { passive: true });
    }

    setupVisualFeedback() {
        const style = document.createElement('style');
        style.textContent = `
            .touch-feedback {
                position: relative;
                overflow: hidden;
            }
            
            .touch-feedback::after {
                content: '';
                position: absolute;
                top: 50%;
                left: 50%;
                width: 0;
                height: 0;
                border-radius: 50%;
                background: rgba(255, 255, 255, 0.5);
                transform: translate(-50%, -50%);
                transition: width 0.3s ease, height 0.3s ease;
                pointer-events: none;
            }
            
            .touch-feedback.active::after {
                width: 100px;
                height: 100px;
            }
        `;
        document.head.appendChild(style);

        document.addEventListener('touchstart', (e) => {
            const element = e.target.closest('.btn, button, .nav-link');
            if (element) {
                element.classList.add('touch-feedback', 'active');
                setTimeout(() => {
                    element.classList.remove('active');
                }, 300);
            }
        }, { passive: true });
    }

    setupAudioFeedback() {
        // Create audio context for sound feedback
        if ('AudioContext' in window || 'webkitAudioContext' in window) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.setupTouchSounds();
        }
    }

    setupTouchSounds() {
        const playTouchSound = (frequency = 800, duration = 50) => {
            if (!this.audioContext) return;
            
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
            oscillator.type = 'sine';
            
            gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration / 1000);
            
            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + duration / 1000);
        };

        document.addEventListener('touchstart', (e) => {
            if (e.target.classList.contains('btn') || e.target.tagName === 'BUTTON') {
                playTouchSound(800, 50);
            }
        }, { passive: true });
    }

    setupIntelligentNavigation() {
        this.setupSmartScrolling();
        this.setupPredictiveNavigation();
        this.setupContextualNavigation();
        this.setupNavigationHistory();
    }

    setupSmartScrolling() {
        let scrollTimeout;
        let isScrolling = false;
        let scrollDirection = 'down';
        let lastScrollTop = 0;

        const smartScrollHandler = () => {
            const currentScrollTop = window.pageYOffset;
            scrollDirection = currentScrollTop > lastScrollTop ? 'down' : 'up';
            lastScrollTop = currentScrollTop;

            if (!isScrolling) {
                isScrolling = true;
                document.body.classList.add('scrolling');
                
                // Hide/show navigation based on scroll direction
                this.handleScrollNavigation(scrollDirection);
            }

            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                isScrolling = false;
                document.body.classList.remove('scrolling');
                this.handleScrollEnd();
            }, 150);
        };

        window.addEventListener('scroll', smartScrollHandler, { passive: true });
    }

    handleScrollNavigation(direction) {
        const navbar = document.querySelector('.navbar');
        const comparisonBar = document.getElementById('comparison-bar');
        
        if (direction === 'down' && window.pageYOffset > 100) {
            // Hide navigation when scrolling down
            if (navbar) navbar.style.transform = 'translateY(-100%)';
            if (comparisonBar) comparisonBar.style.transform = 'translateY(100%)';
        } else if (direction === 'up') {
            // Show navigation when scrolling up
            if (navbar) navbar.style.transform = 'translateY(0)';
            if (comparisonBar) comparisonBar.style.transform = 'translateY(0)';
        }
    }

    handleScrollEnd() {
        // Snap to sections if near boundaries
        const sections = document.querySelectorAll('section, .product-section');
        const scrollTop = window.pageYOffset;
        const viewportHeight = window.innerHeight;
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionCenter = sectionTop + sectionHeight / 2;
            
            if (Math.abs(scrollTop + viewportHeight / 2 - sectionCenter) < 50) {
                // Snap to section
                window.scrollTo({
                    top: sectionTop,
                    behavior: 'smooth'
                });
            }
        });
    }

    setupPredictiveNavigation() {
        // Track user behavior to predict next actions
        this.userBehavior = {
            pageViews: [],
            interactions: [],
            preferences: {}
        };

        // Track page views
        this.trackPageView();
        
        // Track interactions
        this.trackInteractions();
        
        // Preload likely next pages
        this.preloadPredictedPages();
    }

    trackPageView() {
        const pageData = {
            url: window.location.href,
            timestamp: Date.now(),
            referrer: document.referrer,
            timeOnPage: 0
        };
        
        this.userBehavior.pageViews.push(pageData);
        
        // Track time on page
        window.addEventListener('beforeunload', () => {
            pageData.timeOnPage = Date.now() - pageData.timestamp;
        });
    }

    trackInteractions() {
        document.addEventListener('click', (e) => {
            const interaction = {
                type: 'click',
                element: e.target.tagName,
                className: e.target.className,
                timestamp: Date.now(),
                x: e.clientX,
                y: e.clientY
            };
            
            this.userBehavior.interactions.push(interaction);
            this.analyzeUserPreferences();
        }, { passive: true });
    }

    analyzeUserPreferences() {
        const interactions = this.userBehavior.interactions;
        const recentInteractions = interactions.slice(-20); // Last 20 interactions
        
        // Analyze product category preferences
        const categoryClicks = {};
        recentInteractions.forEach(interaction => {
            if (interaction.className.includes('product-card')) {
                const category = this.extractCategoryFromElement(interaction);
                categoryClicks[category] = (categoryClicks[category] || 0) + 1;
            }
        });
        
        this.userBehavior.preferences.categories = categoryClicks;
    }

    preloadPredictedPages() {
        const preferences = this.userBehavior.preferences;
        const currentPage = window.location.pathname;
        
        // Predict next likely pages based on current page and preferences
        const predictions = this.getPredictedPages(currentPage, preferences);
        
        predictions.forEach(url => {
            this.preloadPage(url);
        });
    }

    getPredictedPages(currentPage, preferences) {
        const predictions = [];
        
        if (currentPage === '/' || currentPage === '/index.html') {
            // From homepage, likely to visit product pages
            predictions.push('/products.html');
            
            // Based on category preferences
            if (preferences.categories?.outdoor > 2) {
                predictions.push('/outdoor.html');
            }
            if (preferences.categories?.['fine-pitch'] > 2) {
                predictions.push('/fine-pitch.html');
            }
        } else if (currentPage.includes('product')) {
            // From product pages, likely to visit contact or comparison
            predictions.push('/contact.html');
        }
        
        return predictions;
    }

    preloadPage(url) {
        const link = document.createElement('link');
        link.rel = 'prefetch';
        link.href = url;
        document.head.appendChild(link);
    }

    setupAdaptiveUI() {
        this.adaptToDeviceCapabilities();
        this.adaptToNetworkConditions();
        this.adaptToUserPreferences();
        this.setupDynamicLayout();
    }

    adaptToDeviceCapabilities() {
        const device = this.deviceInfo;
        
        // Adapt to low-end devices
        if (device.hardwareConcurrency <= 2 || device.deviceMemory <= 2) {
            document.body.classList.add('low-end-device');
            this.enableLowEndOptimizations();
        }
        
        // Adapt to high-DPI displays
        if (device.pixelRatio > 2) {
            document.body.classList.add('high-dpi');
            this.enableHighDPIOptimizations();
        }
        
        // Adapt to touch capabilities
        if (this.touchCapabilities.multiTouch) {
            document.body.classList.add('multi-touch');
        }
    }

    enableLowEndOptimizations() {
        // Reduce animations
        const style = document.createElement('style');
        style.textContent = `
            .low-end-device * {
                animation-duration: 0.1s !important;
                transition-duration: 0.1s !important;
            }
            
            .low-end-device .parallax,
            .low-end-device .complex-animation {
                animation: none !important;
                transform: none !important;
            }
        `;
        document.head.appendChild(style);
        
        // Disable expensive features
        this.disableExpensiveFeatures();
    }

    enableHighDPIOptimizations() {
        // Load high-resolution images
        document.querySelectorAll('img[data-src-2x]').forEach(img => {
            img.src = img.dataset.src2x;
        });
        
        // Adjust font rendering
        const style = document.createElement('style');
        style.textContent = `
            .high-dpi {
                -webkit-font-smoothing: antialiased;
                -moz-osx-font-smoothing: grayscale;
            }
        `;
        document.head.appendChild(style);
    }

    adaptToNetworkConditions() {
        const network = this.networkInfo;
        
        if (network.saveData || network.effectiveType === 'slow-2g' || network.effectiveType === '2g') {
            document.body.classList.add('slow-network');
            this.enableDataSavingMode();
        }
        
        // Monitor network changes
        if (navigator.connection) {
            navigator.connection.addEventListener('change', () => {
                this.networkInfo = this.getNetworkInfo();
                this.adaptToNetworkConditions();
            });
        }
    }

    enableDataSavingMode() {
        // Disable auto-loading of images
        document.querySelectorAll('img[data-src]').forEach(img => {
            img.style.display = 'none';
            
            // Add load button
            const loadBtn = document.createElement('button');
            loadBtn.textContent = 'Load Image';
            loadBtn.className = 'btn btn-sm btn-outline-primary';
            loadBtn.onclick = () => {
                img.src = img.dataset.src;
                img.style.display = '';
                loadBtn.remove();
            };
            
            img.parentNode.insertBefore(loadBtn, img);
        });
        
        // Reduce video quality
        document.querySelectorAll('video').forEach(video => {
            video.preload = 'none';
        });
    }

    setupDynamicLayout() {
        // Adjust layout based on screen size and orientation
        this.adjustLayoutForScreen();
        
        // Handle orientation changes
        window.addEventListener('orientationchange', () => {
            setTimeout(() => this.adjustLayoutForScreen(), 500);
        });
        
        // Handle resize
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => this.adjustLayoutForScreen(), 250);
        });
    }

    adjustLayoutForScreen() {
        const width = window.innerWidth;
        const height = window.innerHeight;
        const isLandscape = width > height;
        
        document.body.classList.toggle('landscape', isLandscape);
        document.body.classList.toggle('portrait', !isLandscape);
        
        // Adjust grid layouts
        const grids = document.querySelectorAll('.product-grid, .comparison-grid');
        grids.forEach(grid => {
            if (width < 576) {
                grid.style.gridTemplateColumns = '1fr';
            } else if (width < 768) {
                grid.style.gridTemplateColumns = 'repeat(2, 1fr)';
            } else if (width < 992) {
                grid.style.gridTemplateColumns = 'repeat(3, 1fr)';
            } else {
                grid.style.gridTemplateColumns = 'repeat(4, 1fr)';
            }
        });
        
        // Adjust modal sizes
        const modals = document.querySelectorAll('.modal, .comparison-modal');
        modals.forEach(modal => {
            const content = modal.querySelector('.modal-content, .comparison-modal-content');
            if (content) {
                if (isLandscape && this.isMobile) {
                    content.style.height = '90vh';
                    content.style.width = '95vw';
                } else {
                    content.style.height = '';
                    content.style.width = '';
                }
            }
        });
    }

    setupOfflineSupport() {
        // Register service worker for offline functionality
        if ('serviceWorker' in navigator) {
            this.registerServiceWorker();
        }
        
        // Handle online/offline events
        this.setupOfflineHandling();
        
        // Cache critical resources
        this.setupResourceCaching();
    }

    async registerServiceWorker() {
        try {
            const registration = await navigator.serviceWorker.register('/sw.js');
            console.log('Service Worker registered:', registration);
            
            // Handle updates
            registration.addEventListener('updatefound', () => {
                const newWorker = registration.installing;
                newWorker.addEventListener('statechange', () => {
                    if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                        this.showUpdateNotification();
                    }
                });
            });
        } catch (error) {
            console.log('Service Worker registration failed:', error);
        }
    }

    setupOfflineHandling() {
        window.addEventListener('online', () => {
            this.handleOnline();
        });
        
        window.addEventListener('offline', () => {
            this.handleOffline();
        });
        
        // Check initial state
        if (!navigator.onLine) {
            this.handleOffline();
        }
    }

    handleOnline() {
        document.body.classList.remove('offline');
        this.showNotification('Connection restored', 'success');
        
        // Sync any pending data
        this.syncPendingData();
    }

    handleOffline() {
        document.body.classList.add('offline');
        this.showNotification('You are offline. Some features may be limited.', 'warning');
        
        // Enable offline mode
        this.enableOfflineMode();
    }

    enableOfflineMode() {
        // Hide features that require internet
        document.querySelectorAll('.online-only').forEach(element => {
            element.style.display = 'none';
        });
        
        // Show offline alternatives
        document.querySelectorAll('.offline-alternative').forEach(element => {
            element.style.display = 'block';
        });
    }

    setupSmartKeyboard() {
        // Optimize keyboard behavior for mobile
        this.setupKeyboardOptimization();
        this.setupInputEnhancements();
        this.setupAutoComplete();
    }

    setupKeyboardOptimization() {
        // Adjust viewport when keyboard appears
        let initialViewportHeight = window.innerHeight;
        
        window.addEventListener('resize', () => {
            const currentHeight = window.innerHeight;
            const heightDifference = initialViewportHeight - currentHeight;
            
            if (heightDifference > 150) {
                // Keyboard is likely open
                document.body.classList.add('keyboard-open');
                this.adjustForKeyboard(heightDifference);
            } else {
                // Keyboard is likely closed
                document.body.classList.remove('keyboard-open');
                this.resetKeyboardAdjustments();
            }
        });
    }

    adjustForKeyboard(keyboardHeight) {
        // Scroll active input into view
        const activeElement = document.activeElement;
        if (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA')) {
            setTimeout(() => {
                activeElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 300);
        }
        
        // Adjust fixed elements
        const fixedElements = document.querySelectorAll('.fixed-bottom, .comparison-bar');
        fixedElements.forEach(element => {
            element.style.bottom = '0px';
        });
    }

    resetKeyboardAdjustments() {
        const fixedElements = document.querySelectorAll('.fixed-bottom, .comparison-bar');
        fixedElements.forEach(element => {
            element.style.bottom = '';
        });
    }

    setupInputEnhancements() {
        // Add input type optimizations
        document.querySelectorAll('input').forEach(input => {
            const type = input.type || 'text';
            
            // Set appropriate keyboard types
            if (input.name?.includes('email') || input.type === 'email') {
                input.setAttribute('inputmode', 'email');
                input.setAttribute('autocomplete', 'email');
            } else if (input.name?.includes('phone') || input.type === 'tel') {
                input.setAttribute('inputmode', 'tel');
                input.setAttribute('autocomplete', 'tel');
            } else if (input.name?.includes('search')) {
                input.setAttribute('inputmode', 'search');
            }
            
            // Disable autocorrect for certain fields
            if (input.name?.includes('code') || input.name?.includes('id')) {
                input.setAttribute('autocorrect', 'off');
                input.setAttribute('autocapitalize', 'off');
                input.setAttribute('spellcheck', 'false');
            }
        });
    }

    setupContextualHelp() {
        // Add contextual help and tooltips
        this.setupSmartTooltips();
        this.setupProgressIndicators();
        this.setupOnboarding();
    }

    setupSmartTooltips() {
        // Create smart tooltips that adapt to screen size
        document.querySelectorAll('[data-tooltip]').forEach(element => {
            this.createSmartTooltip(element);
        });
    }

    createSmartTooltip(element) {
        const tooltipText = element.dataset.tooltip;
        if (!tooltipText) return;
        
        const tooltip = document.createElement('div');
        tooltip.className = 'smart-tooltip';
        tooltip.textContent = tooltipText;
        tooltip.style.cssText = `
            position: absolute;
            background: rgba(0, 0, 0, 0.9);
            color: white;
            padding: 0.5rem;
            border-radius: 4px;
            font-size: 0.8rem;
            max-width: 200px;
            z-index: 10000;
            opacity: 0;
            pointer-events: none;
            transition: opacity 0.3s ease;
        `;
        
        document.body.appendChild(tooltip);
        
        const showTooltip = (e) => {
            const rect = element.getBoundingClientRect();
            const tooltipRect = tooltip.getBoundingClientRect();
            
            // Position tooltip
            let left = rect.left + rect.width / 2 - tooltipRect.width / 2;
            let top = rect.top - tooltipRect.height - 10;
            
            // Adjust if tooltip goes off screen
            if (left < 10) left = 10;
            if (left + tooltipRect.width > window.innerWidth - 10) {
                left = window.innerWidth - tooltipRect.width - 10;
            }
            if (top < 10) {
                top = rect.bottom + 10;
            }
            
            tooltip.style.left = left + 'px';
            tooltip.style.top = top + 'px';
            tooltip.style.opacity = '1';
        };
        
        const hideTooltip = () => {
            tooltip.style.opacity = '0';
        };
        
        element.addEventListener('mouseenter', showTooltip);
        element.addEventListener('mouseleave', hideTooltip);
        element.addEventListener('touchstart', showTooltip, { passive: true });
        element.addEventListener('touchend', hideTooltip, { passive: true });
    }

    setupMobileAnalytics() {
        // Track mobile-specific metrics
        this.trackMobileMetrics();
        this.trackTouchInteractions();
        this.trackPerformanceMetrics();
    }

    trackMobileMetrics() {
        const metrics = {
            deviceInfo: this.deviceInfo,
            touchCapabilities: this.touchCapabilities,
            networkInfo: this.networkInfo,
            sessionStart: Date.now(),
            interactions: 0,
            scrollDepth: 0,
            timeOnPage: 0
        };
        
        // Track scroll depth
        let maxScrollDepth = 0;
        window.addEventListener('scroll', () => {
            const scrollPercent = (window.pageYOffset / (document.body.scrollHeight - window.innerHeight)) * 100;
            maxScrollDepth = Math.max(maxScrollDepth, scrollPercent);
            metrics.scrollDepth = maxScrollDepth;
        }, { passive: true });
        
        // Track interactions
        document.addEventListener('touchstart', () => {
            metrics.interactions++;
        }, { passive: true });
        
        // Send metrics on page unload
        window.addEventListener('beforeunload', () => {
            metrics.timeOnPage = Date.now() - metrics.sessionStart;
            this.sendMobileMetrics(metrics);
        });
    }

    sendMobileMetrics(metrics) {
        // Send to analytics service
        if (navigator.sendBeacon) {
            navigator.sendBeacon('/api/mobile-analytics', JSON.stringify(metrics));
        }
    }

    // Utility Methods
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `mobile-notification ${type}`;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: ${type === 'success' ? '#28a745' : type === 'warning' ? '#ffc107' : '#007bff'};
            color: white;
            padding: 1rem;
            border-radius: 8px;
            z-index: 10000;
            max-width: 90vw;
            text-align: center;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        `;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    addTapAnimation(element) {
        element.style.transform = 'scale(0.95)';
        element.style.transition = 'transform 0.1s ease';
        
        setTimeout(() => {
            element.style.transform = '';
        }, 100);
    }

    // Public API
    getMobileCapabilities() {
        return {
            device: this.deviceInfo,
            touch: this.touchCapabilities,
            network: this.networkInfo,
            isMobile: this.isMobile,
            isTablet: this.isTablet
        };
    }

    optimizeForDevice() {
        this.adaptToDeviceCapabilities();
        this.adaptToNetworkConditions();
    }

    enableAccessibilityMode() {
        document.body.classList.add('accessibility-mode');
        
        // Increase touch targets
        const style = document.createElement('style');
        style.textContent = `
            .accessibility-mode .btn,
            .accessibility-mode button,
            .accessibility-mode .nav-link {
                min-height: 48px;
                min-width: 48px;
                padding: 1rem;
            }
        `;
        document.head.appendChild(style);
    }
}

// Initialize Mobile Experience Enhancer
document.addEventListener('DOMContentLoaded', () => {
    window.mobileExperienceEnhancer = new MobileExperienceEnhancer();
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MobileExperienceEnhancer;
}