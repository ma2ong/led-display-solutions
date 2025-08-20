/* =================================================================
   MOBILE OPTIMIZER MODULE
   Handles mobile-specific optimizations and responsive design enhancements
   ================================================================= */
class MobileOptimizer {
    constructor() {
        this.config = {
            breakpoints: {
                mobile: 768,
                tablet: 1024,
                desktop: 1200
            },
            touchOptimizations: true,
            gestureSupport: true,
            orientationHandling: true,
            performanceOptimizations: true,
            accessibilityEnhancements: true,
            offlineSupport: false,
            pushNotifications: false
        };
        
        this.deviceInfo = {
            isMobile: false,
            isTablet: false,
            isDesktop: false,
            orientation: 'portrait',
            touchSupport: false,
            screenSize: {
                width: window.innerWidth,
                height: window.innerHeight
            },
            devicePixelRatio: window.devicePixelRatio || 1,
            connectionType: 'unknown'
        };
        
        this.gestureHandlers = new Map();
        this.touchStartPos = { x: 0, y: 0 };
        this.touchEndPos = { x: 0, y: 0 };
        
        this.init();
    }
    
    init() {
        this.detectDevice();
        this.setupResponsiveBreakpoints();
        this.setupTouchOptimizations();
        this.setupGestureHandling();
        this.setupOrientationHandling();
        this.setupPerformanceOptimizations();
        this.setupAccessibilityEnhancements();
        this.setupMobileNavigation();
        this.setupMobileFormsOptimization();
        this.setupViewportOptimizations();
        
        console.log('Mobile Optimizer initialized', this.deviceInfo);
    }
    
    detectDevice() {
        const userAgent = navigator.userAgent.toLowerCase();
        const width = window.innerWidth;
        
        // Detect device type
        this.deviceInfo.isMobile = width < this.config.breakpoints.mobile;
        this.deviceInfo.isTablet = width >= this.config.breakpoints.mobile && width < this.config.breakpoints.desktop;
        this.deviceInfo.isDesktop = width >= this.config.breakpoints.desktop;
        
        // Detect touch support
        this.deviceInfo.touchSupport = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        
        // Detect orientation
        this.deviceInfo.orientation = window.innerHeight > window.innerWidth ? 'portrait' : 'landscape';
        
        // Update screen size
        this.deviceInfo.screenSize = {
            width: window.innerWidth,
            height: window.innerHeight
        };
        
        // Detect connection type
        if ('connection' in navigator) {
            this.deviceInfo.connectionType = navigator.connection.effectiveType || 'unknown';
        }
        
        // Add device classes to body
        document.body.classList.remove('mobile', 'tablet', 'desktop', 'touch', 'no-touch');
        
        if (this.deviceInfo.isMobile) document.body.classList.add('mobile');
        if (this.deviceInfo.isTablet) document.body.classList.add('tablet');
        if (this.deviceInfo.isDesktop) document.body.classList.add('desktop');
        if (this.deviceInfo.touchSupport) document.body.classList.add('touch');
        if (!this.deviceInfo.touchSupport) document.body.classList.add('no-touch');
    }
    
    setupResponsiveBreakpoints() {
        // Create CSS custom properties for breakpoints
        const root = document.documentElement;
        root.style.setProperty('--mobile-breakpoint', this.config.breakpoints.mobile + 'px');
        root.style.setProperty('--tablet-breakpoint', this.config.breakpoints.tablet + 'px');
        root.style.setProperty('--desktop-breakpoint', this.config.breakpoints.desktop + 'px');
        
        // Listen for resize events
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                this.handleResize();
            }, 250);
        });
        
        // Initial responsive adjustments
        this.applyResponsiveAdjustments();
    }
    
    handleResize() {
        const oldDeviceInfo = { ...this.deviceInfo };
        this.detectDevice();
        
        // Check if device type changed
        if (oldDeviceInfo.isMobile !== this.deviceInfo.isMobile ||
            oldDeviceInfo.isTablet !== this.deviceInfo.isTablet ||
            oldDeviceInfo.isDesktop !== this.deviceInfo.isDesktop) {
            
            this.applyResponsiveAdjustments();
            this.dispatchDeviceChangeEvent();
        }
        
        // Update responsive elements
        this.updateResponsiveElements();
    }
    
    applyResponsiveAdjustments() {
        // Adjust navigation for mobile
        this.adjustMobileNavigation();
        
        // Adjust forms for mobile
        this.adjustMobileForms();
        
        // Adjust images for mobile
        this.adjustMobileImages();
        
        // Adjust tables for mobile
        this.adjustMobileTables();
        
        // Adjust modals for mobile
        this.adjustMobileModals();
    }
    
    adjustMobileNavigation() {
        const navbar = document.querySelector('.navbar, .nav, .navigation');
        if (!navbar) return;
        
        if (this.deviceInfo.isMobile) {
            navbar.classList.add('mobile-nav');
            
            // Create mobile menu toggle if it doesn't exist
            if (!navbar.querySelector('.mobile-menu-toggle')) {
                this.createMobileMenuToggle(navbar);
            }
            
            // Convert dropdown menus to accordion style
            this.convertDropdownsToAccordion(navbar);
        } else {
            navbar.classList.remove('mobile-nav');
            this.restoreDesktopNavigation(navbar);
        }
    }
    
    createMobileMenuToggle(navbar) {
        const toggle = document.createElement('button');
        toggle.className = 'mobile-menu-toggle';
        toggle.setAttribute('aria-label', 'Toggle mobile menu');
        toggle.innerHTML = `
            <span class="hamburger-line"></span>
            <span class="hamburger-line"></span>
            <span class="hamburger-line"></span>
        `;
        
        toggle.addEventListener('click', () => {
            this.toggleMobileMenu(navbar);
        });
        
        // Insert toggle button
        const navContainer = navbar.querySelector('.nav-container, .navbar-container') || navbar;
        navContainer.insertBefore(toggle, navContainer.firstChild);
    }
    
    toggleMobileMenu(navbar) {
        const menu = navbar.querySelector('.nav-menu, .navbar-nav, .menu');
        const toggle = navbar.querySelector('.mobile-menu-toggle');
        
        if (menu) {
            const isOpen = menu.classList.contains('mobile-menu-open');
            
            if (isOpen) {
                menu.classList.remove('mobile-menu-open');
                toggle.classList.remove('active');
                document.body.classList.remove('mobile-menu-open');
            } else {
                menu.classList.add('mobile-menu-open');
                toggle.classList.add('active');
                document.body.classList.add('mobile-menu-open');
            }
        }
    }
    
    convertDropdownsToAccordion(navbar) {
        const dropdowns = navbar.querySelectorAll('.dropdown, .nav-item-dropdown');
        
        dropdowns.forEach(dropdown => {
            const toggle = dropdown.querySelector('a, button');
            const menu = dropdown.querySelector('.dropdown-menu, .submenu');
            
            if (toggle && menu) {
                toggle.addEventListener('click', (e) => {
                    if (this.deviceInfo.isMobile) {
                        e.preventDefault();
                        menu.classList.toggle('mobile-submenu-open');
                        toggle.classList.toggle('mobile-submenu-active');
                    }
                });
            }
        });
    }
    
    restoreDesktopNavigation(navbar) {
        // Remove mobile-specific classes and event listeners
        const toggle = navbar.querySelector('.mobile-menu-toggle');
        if (toggle) {
            toggle.remove();
        }
        
        const menu = navbar.querySelector('.nav-menu, .navbar-nav, .menu');
        if (menu) {
            menu.classList.remove('mobile-menu-open');
        }
        
        document.body.classList.remove('mobile-menu-open');
    }
    
    adjustMobileForms() {
        const forms = document.querySelectorAll('form');
        
        forms.forEach(form => {
            if (this.deviceInfo.isMobile) {
                form.classList.add('mobile-form');
                
                // Adjust input types for mobile
                this.optimizeFormInputs(form);
                
                // Add mobile-friendly validation
                this.addMobileValidation(form);
                
                // Optimize form layout
                this.optimizeFormLayout(form);
            } else {
                form.classList.remove('mobile-form');
            }
        });
    }
    
    optimizeFormInputs(form) {
        const inputs = form.querySelectorAll('input, textarea, select');
        
        inputs.forEach(input => {
            // Add appropriate input modes for mobile keyboards
            if (input.type === 'email' && !input.inputMode) {
                input.inputMode = 'email';
            }
            if (input.type === 'tel' && !input.inputMode) {
                input.inputMode = 'tel';
            }
            if (input.type === 'number' && !input.inputMode) {
                input.inputMode = 'numeric';
            }
            if (input.type === 'url' && !input.inputMode) {
                input.inputMode = 'url';
            }
            
            // Add autocomplete attributes
            if (input.name === 'email' && !input.autocomplete) {
                input.autocomplete = 'email';
            }
            if (input.name === 'phone' && !input.autocomplete) {
                input.autocomplete = 'tel';
            }
            if (input.name === 'name' && !input.autocomplete) {
                input.autocomplete = 'name';
            }
            
            // Increase touch target size
            if (this.deviceInfo.touchSupport) {
                input.style.minHeight = '44px';
                input.style.minWidth = '44px';
            }
        });
    }
    
    addMobileValidation(form) {
        const inputs = form.querySelectorAll('input[required], textarea[required], select[required]');
        
        inputs.forEach(input => {
            input.addEventListener('blur', () => {
                this.validateMobileInput(input);
            });
            
            input.addEventListener('input', () => {
                this.clearMobileValidationError(input);
            });
        });
    }
    
    validateMobileInput(input) {
        const isValid = input.checkValidity();
        
        if (!isValid) {
            this.showMobileValidationError(input, input.validationMessage);
        } else {
            this.clearMobileValidationError(input);
        }
    }
    
    showMobileValidationError(input, message) {
        this.clearMobileValidationError(input);
        
        const errorElement = document.createElement('div');
        errorElement.className = 'mobile-validation-error';
        errorElement.textContent = message;
        
        input.parentNode.insertBefore(errorElement, input.nextSibling);
        input.classList.add('mobile-input-error');
    }
    
    clearMobileValidationError(input) {
        const errorElement = input.parentNode.querySelector('.mobile-validation-error');
        if (errorElement) {
            errorElement.remove();
        }
        input.classList.remove('mobile-input-error');
    }
    
    optimizeFormLayout(form) {
        // Stack form elements vertically on mobile
        const formGroups = form.querySelectorAll('.form-group, .input-group, .field-group');
        
        formGroups.forEach(group => {
            if (this.deviceInfo.isMobile) {
                group.classList.add('mobile-form-group');
            } else {
                group.classList.remove('mobile-form-group');
            }
        });
    }
    
    adjustMobileImages() {
        const images = document.querySelectorAll('img');
        
        images.forEach(img => {
            if (this.deviceInfo.isMobile) {
                // Add mobile-specific classes
                img.classList.add('mobile-image');
                
                // Optimize loading for mobile
                if (!img.loading) {
                    img.loading = 'lazy';
                }
                
                // Add touch-friendly image viewing
                this.addImageTouchHandling(img);
            } else {
                img.classList.remove('mobile-image');
            }
        });
    }
    
    addImageTouchHandling(img) {
        if (!this.deviceInfo.touchSupport) return;
        
        img.addEventListener('touchstart', (e) => {
            this.touchStartPos = {
                x: e.touches[0].clientX,
                y: e.touches[0].clientY
            };
        });
        
        img.addEventListener('touchend', (e) => {
            this.touchEndPos = {
                x: e.changedTouches[0].clientX,
                y: e.changedTouches[0].clientY
            };
            
            // Check for tap (no significant movement)
            const deltaX = Math.abs(this.touchEndPos.x - this.touchStartPos.x);
            const deltaY = Math.abs(this.touchEndPos.y - this.touchStartPos.y);
            
            if (deltaX < 10 && deltaY < 10) {
                this.handleImageTap(img);
            }
        });
    }
    
    handleImageTap(img) {
        // Create image overlay for full-screen viewing
        this.createImageOverlay(img);
    }
    
    createImageOverlay(img) {
        const overlay = document.createElement('div');
        overlay.className = 'mobile-image-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.9);
            z-index: 10000;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
        `;
        
        const overlayImg = document.createElement('img');
        overlayImg.src = img.src;
        overlayImg.alt = img.alt;
        overlayImg.style.cssText = `
            max-width: 90%;
            max-height: 90%;
            object-fit: contain;
        `;
        
        const closeBtn = document.createElement('button');
        closeBtn.innerHTML = '×';
        closeBtn.style.cssText = `
            position: absolute;
            top: 20px;
            right: 20px;
            background: rgba(255, 255, 255, 0.8);
            border: none;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            font-size: 24px;
            cursor: pointer;
        `;
        
        overlay.appendChild(overlayImg);
        overlay.appendChild(closeBtn);
        
        // Close overlay on click
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay || e.target === closeBtn) {
                overlay.remove();
                document.body.style.overflow = '';
            }
        });
        
        document.body.appendChild(overlay);
        document.body.style.overflow = 'hidden';
    }
    
    adjustMobileTables() {
        const tables = document.querySelectorAll('table');
        
        tables.forEach(table => {
            if (this.deviceInfo.isMobile) {
                this.makeMobileResponsiveTable(table);
            } else {
                this.restoreDesktopTable(table);
            }
        });
    }
    
    makeMobileResponsiveTable(table) {
        if (table.classList.contains('mobile-table-processed')) return;
        
        table.classList.add('mobile-table-processed');
        
        // Wrap table in scrollable container
        const wrapper = document.createElement('div');
        wrapper.className = 'mobile-table-wrapper';
        wrapper.style.cssText = `
            overflow-x: auto;
            -webkit-overflow-scrolling: touch;
            margin: 1rem 0;
        `;
        
        table.parentNode.insertBefore(wrapper, table);
        wrapper.appendChild(table);
        
        // Add mobile table styles
        table.classList.add('mobile-table');
    }
    
    restoreDesktopTable(table) {
        if (!table.classList.contains('mobile-table-processed')) return;
        
        const wrapper = table.parentNode;
        if (wrapper.classList.contains('mobile-table-wrapper')) {
            wrapper.parentNode.insertBefore(table, wrapper);
            wrapper.remove();
        }
        
        table.classList.remove('mobile-table', 'mobile-table-processed');
    }
    
    adjustMobileModals() {
        const modals = document.querySelectorAll('.modal, .popup, .dialog');
        
        modals.forEach(modal => {
            if (this.deviceInfo.isMobile) {
                modal.classList.add('mobile-modal');
                this.optimizeModalForMobile(modal);
            } else {
                modal.classList.remove('mobile-modal');
            }
        });
    }
    
    optimizeModalForMobile(modal) {
        // Ensure modal is full-screen on mobile
        const modalContent = modal.querySelector('.modal-content, .popup-content, .dialog-content');
        if (modalContent) {
            modalContent.classList.add('mobile-modal-content');
        }
        
        // Add swipe-to-close functionality
        this.addModalSwipeHandling(modal);
    }
    
    addModalSwipeHandling(modal) {
        if (!this.deviceInfo.touchSupport) return;
        
        let startY = 0;
        let currentY = 0;
        let isDragging = false;
        
        modal.addEventListener('touchstart', (e) => {
            startY = e.touches[0].clientY;
            isDragging = true;
        });
        
        modal.addEventListener('touchmove', (e) => {
            if (!isDragging) return;
            
            currentY = e.touches[0].clientY;
            const deltaY = currentY - startY;
            
            // Only allow downward swipe
            if (deltaY > 0) {
                modal.style.transform = `translateY(${deltaY}px)`;
            }
        });
        
        modal.addEventListener('touchend', () => {
            if (!isDragging) return;
            
            const deltaY = currentY - startY;
            
            // Close modal if swiped down significantly
            if (deltaY > 100) {
                this.closeModal(modal);
            } else {
                // Snap back to original position
                modal.style.transform = '';
            }
            
            isDragging = false;
        });
    }
    
    closeModal(modal) {
        modal.style.display = 'none';
        modal.classList.remove('show', 'active');
        document.body.style.overflow = '';
    }
    
    setupTouchOptimizations() {
        if (!this.config.touchOptimizations || !this.deviceInfo.touchSupport) return;
        
        // Add touch-friendly button sizes
        this.optimizeTouchTargets();
        
        // Add touch feedback
        this.addTouchFeedback();
        
        // Optimize scrolling
        this.optimizeScrolling();
    }
    
    optimizeTouchTargets() {
        const touchTargets = document.querySelectorAll('button, a, input, select, textarea, [role="button"]');
        
        touchTargets.forEach(target => {
            const computedStyle = window.getComputedStyle(target);
            const minSize = 44; // 44px minimum touch target size
            
            if (parseInt(computedStyle.height) < minSize) {
                target.style.minHeight = minSize + 'px';
            }
            
            if (parseInt(computedStyle.width) < minSize && target.tagName !== 'INPUT') {
                target.style.minWidth = minSize + 'px';
            }
            
            // Add touch-friendly padding
            if (!target.style.padding) {
                target.style.padding = '0.5rem';
            }
        });
    }
    
    addTouchFeedback() {
        const interactiveElements = document.querySelectorAll('button, a, [role="button"], .clickable');
        
        interactiveElements.forEach(element => {
            element.addEventListener('touchstart', () => {
                element.classList.add('touch-active');
            });
            
            element.addEventListener('touchend', () => {
                setTimeout(() => {
                    element.classList.remove('touch-active');
                }, 150);
            });
            
            element.addEventListener('touchcancel', () => {
                element.classList.remove('touch-active');
            });
        });
    }
    
    optimizeScrolling() {
        // Add smooth scrolling for touch devices
        document.documentElement.style.webkitOverflowScrolling = 'touch';
        
        // Optimize scroll performance
        const scrollableElements = document.querySelectorAll('.scrollable, .overflow-auto, .overflow-scroll');
        
        scrollableElements.forEach(element => {
            element.style.webkitOverflowScrolling = 'touch';
            element.style.overscrollBehavior = 'contain';
        });
    }
    
    setupGestureHandling() {
        if (!this.config.gestureSupport || !this.deviceInfo.touchSupport) return;
        
        // Setup swipe gestures
        this.setupSwipeGestures();
        
        // Setup pinch gestures
        this.setupPinchGestures();
        
        // Setup tap gestures
        this.setupTapGestures();
    }
    
    setupSwipeGestures() {
        let startX = 0;
        let startY = 0;
        let endX = 0;
        let endY = 0;
        
        document.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
        });
        
        document.addEventListener('touchend', (e) => {
            endX = e.changedTouches[0].clientX;
            endY = e.changedTouches[0].clientY;
            
            this.handleSwipeGesture(startX, startY, endX, endY, e.target);
        });
    }
    
    handleSwipeGesture(startX, startY, endX, endY, target) {
        const deltaX = endX - startX;
        const deltaY = endY - startY;
        const minSwipeDistance = 50;
        
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
            // Horizontal swipe
            if (Math.abs(deltaX) > minSwipeDistance) {
                const direction = deltaX > 0 ? 'right' : 'left';
                this.dispatchGestureEvent('swipe', { direction, target, deltaX, deltaY });
            }
        } else {
            // Vertical swipe
            if (Math.abs(deltaY) > minSwipeDistance) {
                const direction = deltaY > 0 ? 'down' : 'up';
                this.dispatchGestureEvent('swipe', { direction, target, deltaX, deltaY });
            }
        }
    }
    
    setupPinchGestures() {
        let initialDistance = 0;
        let currentDistance = 0;
        
        document.addEventListener('touchstart', (e) => {
            if (e.touches.length === 2) {
                initialDistance = this.getDistance(e.touches[0], e.touches[1]);
            }
        });
        
        document.addEventListener('touchmove', (e) => {
            if (e.touches.length === 2) {
                currentDistance = this.getDistance(e.touches[0], e.touches[1]);
                const scale = currentDistance / initialDistance;
                
                this.dispatchGestureEvent('pinch', { scale, target: e.target });
            }
        });
    }
    
    getDistance(touch1, touch2) {
        const deltaX = touch2.clientX - touch1.clientX;
        const deltaY = touch2.clientY - touch1.clientY;
        return Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    }
    
    setupTapGestures() {
        let tapTimeout;
        let tapCount = 0;
        
        document.addEventListener('touchend', (e) => {
            tapCount++;
            
            if (tapCount === 1) {
                tapTimeout = setTimeout(() => {
                    this.dispatchGestureEvent('tap', { target: e.target, tapCount: 1 });
                    tapCount = 0;
                }, 300);
            } else if (tapCount === 2) {
                clearTimeout(tapTimeout);
                this.dispatchGestureEvent('doubletap', { target: e.target, tapCount: 2 });
                tapCount = 0;
            }
        });
    }
    
    dispatchGestureEvent(type, detail) {
        const event = new CustomEvent(`mobile${type}`, {
            detail: detail,
            bubbles: true,
            cancelable: true
        });
        
        detail.target.dispatchEvent(event);
    }
    
    setupOrientationHandling() {
        if (!this.config.orientationHandling) return;
        
        window.addEventListener('orientationchange', () => {
            setTimeout(() => {
                this.handleOrientationChange();
            }, 100);
        });
        
        // Also listen for resize events as fallback
        window.addEventListener('resize', () => {
            this.updateOrientation();
        });
    }
    
    handleOrientationChange() {
        this.updateOrientation();
        this.adjustLayoutForOrientation();
        this.dispatchOrientationEvent();
    }
    
    updateOrientation() {
        const oldOrientation = this.deviceInfo.orientation;
        this.deviceInfo.orientation = window.innerHeight > window.innerWidth ? 'portrait' : 'landscape';
        
        document.body.classList.remove('portrait', 'landscape');
        document.body.classList.add(this.deviceInfo.orientation);
        
        return oldOrientation !== this.deviceInfo.orientation;
    }
    
    adjustLayoutForOrientation() {
        // Adjust navigation for landscape mode
        const navbar = document.querySelector('.navbar, .nav');
        if (navbar && this.deviceInfo.isMobile) {
            if (this.deviceInfo.orientation === 'landscape') {
                navbar.classList.add('landscape-nav');
            } else {
                navbar.classList.remove('landscape-nav');
            }
        }
        
        // Adjust modals for orientation
        const modals = document.querySelectorAll('.modal.show, .popup.active');
        modals.forEach(modal => {
            if (this.deviceInfo.orientation === 'landscape') {
                modal.classList.add('landscape-modal');
            } else {
                modal.classList.remove('landscape-modal');
            }
        });
    }
    
    dispatchOrientationEvent() {
        const event = new CustomEvent('mobileorientationchange', {
            detail: {
                orientation: this.deviceInfo.orientation,
                screenSize: this.deviceInfo.screenSize
            },
            bubbles: true
        });
        
        document.dispatchEvent(event);
    }
    
    setupPerformanceOptimizations() {
        if (!this.config.performanceOptimizations) return;
        
        // Optimize images for mobile
        this.optimizeImagesForMobile();
        
        // Lazy load content
        this.setupLazyLoading();
        
        // Optimize animations
        this.optimizeAnimations();
        
        // Reduce network requests
        this.optimizeNetworkRequests();
    }
    
    optimizeImagesForMobile() {
        const images = document.querySelectorAll('img');
        
        images.forEach(img => {
            if (this.deviceInfo.isMobile) {
                // Add loading="lazy" if not present
                if (!img.loading) {
                    img.loading = 'lazy';
                }
                
                // Add decoding="async" for better performance
                if (!img.decoding) {
                    img.decoding = 'async';
                }
                
                // Use smaller images on mobile if available
                this.useResponsiveImages(img);
            }
        });
    }
    
    useResponsiveImages(img) {
        const src = img.src;
        if (!src) return;
        
        // Check if there's a mobile version available
        const mobileSrc = src.replace(/\.(jpg|jpeg|png|webp)$/i, '-mobile.$1');
        
        // Test if mobile version exists (simplified check)
        if (this.deviceInfo.isMobile && this.deviceInfo.screenSize.width < 768) {
            const testImg = new Image();
            testImg.onload = () => {
                img.src = mobileSrc;
            };
            testImg.onerror = () => {
                // Mobile version doesn't exist, keep original
            };
            testImg.src = mobileSrc;
        }
    }
    
    setupLazyLoading() {
        // Enhanced lazy loading for mobile
        const lazyElements = document.querySelectorAll('[data-lazy], .lazy');
        
        if ('IntersectionObserver' in window) {
            const lazyObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        this.loadLazyElement(entry.target);
                        lazyObserver.unobserve(entry.target);
                    }
                });
            }, {
                rootMargin: this.deviceInfo.isMobile ? '50px' : '100px'
            });
            
            lazyElements.forEach(element => {
                lazyObserver.observe(element);
            });
        }
    }
    
    loadLazyElement(element) {
        if (element.tagName === 'IMG') {
            const dataSrc = element.getAttribute('data-src');
            if (dataSrc) {
                element.src = dataSrc;
                element.removeAttribute('data-src');
            }
        }
        
        element.classList.remove('lazy');
        element.classList.add('loaded');
    }
    
    optimizeAnimations() {
        // Reduce animations on mobile for better performance
        if (this.deviceInfo.isMobile) {
            // Check if user prefers reduced motion
            const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
            
            if (prefersReducedMotion || this.deviceInfo.connectionType === 'slow-2g') {
                document.body.classList.add('reduce-animations');
            }
        }
    }
    
    optimizeNetworkRequests() {
        // Optimize for slow connections
        if (this.deviceInfo.connectionType === 'slow-2g' || this.deviceInfo.connectionType === '2g') {
            document.body.classList.add('slow-connection');
            
            // Disable non-essential features
            this.disableNonEssentialFeatures();
        }
    }
    
    disableNonEssentialFeatures() {
        // Disable auto-playing videos
        const videos = document.querySelectorAll('video[autoplay]');
        videos.forEach(video => {
            video.removeAttribute('autoplay');
            video.preload = 'none';
        });
        
        // Disable heavy animations
        document.body.classList.add('disable-heavy-animations');
    }
    
    setupAccessibilityEnhancements() {
        if (!this.config.accessibilityEnhancements) return;
        
        // Enhance touch accessibility
        this.enhanceTouchAccessibility();
        
        // Improve focus management
        this.improveFocusManagement();
        
        // Add screen reader optimizations
        this.addScreenReaderOptimizations();
    }
    
    enhanceTouchAccessibility() {
        // Add touch-friendly focus indicators
        const focusableElements = document.querySelectorAll('button, a, input, select, textarea, [tabindex]');
        
        focusableElements.forEach(element => {
            element.addEventListener('focus', () => {
                if (this.deviceInfo.touchSupport) {
                    element.classList.add('touch-focus');
                }
            });
            
            element.addEventListener('blur', () => {
                element.classList.remove('touch-focus');
            });
        });
    }
    
    improveFocusManagement() {
        // Improve focus management for mobile
        if (this.deviceInfo.isMobile) {
            // Skip to main content link
            this.addSkipToMainLink();
            
            // Manage focus for modals
            this.manageFocusForModals();
        }
    }
    
    addSkipToMainLink() {
        if (document.querySelector('.skip-to-main')) return;
        
        const skipLink = document.createElement('a');
        skipLink.href = '#main';
        skipLink.className = 'skip-to-main';
        skipLink.textContent = 'Skip to main content';
        skipLink.style.cssText = `
            position: absolute;
            top: -40px;
            left: 6px;
            background: #000;
            color: #fff;
            padding: 8px;
            text-decoration: none;
            z-index: 10000;
        `;
        
        skipLink.addEventListener('focus', () => {
            skipLink.style.top = '6px';
        });
        
        skipLink.addEventListener('blur', () => {
            skipLink.style.top = '-40px';
        });
        
        document.body.insertBefore(skipLink, document.body.firstChild);
    }
    
    manageFocusForModals() {
        const modals = document.querySelectorAll('.modal, .popup, .dialog');
        
        modals.forEach(modal => {
            modal.addEventListener('show', () => {
                this.trapFocusInModal(modal);
            });
            
            modal.addEventListener('hide', () => {
                this.restoreFocus();
            });
        });
    }
    
    trapFocusInModal(modal) {
        const focusableElements = modal.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];
        
        modal.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                if (e.shiftKey) {
                    if (document.activeElement === firstElement) {
                        lastElement.focus();
                        e.preventDefault();
                    }
                } else {
                    if (document.activeElement === lastElement) {
                        firstElement.focus();
                        e.preventDefault();
                    }
                }
            }
        });
        
        firstElement.focus();
    }
    
    restoreFocus() {
        // Restore focus to previously focused element
        if (this.previouslyFocusedElement) {
            this.previouslyFocusedElement.focus();
        }
    }
    
    addScreenReaderOptimizations() {
        // Add ARIA labels for mobile-specific elements
        const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
        if (mobileMenuToggle && !mobileMenuToggle.getAttribute('aria-label')) {
            mobileMenuToggle.setAttribute('aria-label', 'Toggle mobile navigation menu');
        }
        
        // Add live regions for dynamic content
        this.addLiveRegions();
    }
    
    addLiveRegions() {
        if (!document.querySelector('#mobile-announcements')) {
            const liveRegion = document.createElement('div');
            liveRegion.id = 'mobile-announcements';
            liveRegion.setAttribute('aria-live', 'polite');
            liveRegion.setAttribute('aria-atomic', 'true');
            liveRegion.style.cssText = `
                position: absolute;
                left: -10000px;
                width: 1px;
                height: 1px;
                overflow: hidden;
            `;
            
            document.body.appendChild(liveRegion);
        }
    }
    
    setupMobileNavigation() {
        // Enhanced mobile navigation features
        this.setupMobileMenuGestures();
        this.setupMobileSearchOptimization();
    }
    
    setupMobileMenuGestures() {
        if (!this.deviceInfo.touchSupport) return;
        
        // Add swipe gesture to open/close mobile menu
        document.addEventListener('mobileswipe', (e) => {
            if (e.detail.direction === 'right' && e.detail.deltaX > 100) {
                const navbar = document.querySelector('.navbar, .nav');
                if (navbar && this.deviceInfo.isMobile) {
                    this.toggleMobileMenu(navbar);
                }
            }
        });
    }
    
    setupMobileSearchOptimization() {
        const searchInputs = document.querySelectorAll('input[type="search"], .search-input');
        
        searchInputs.forEach(input => {
            if (this.deviceInfo.isMobile) {
                // Optimize search input for mobile
                input.setAttribute('autocomplete', 'off');
                input.setAttribute('autocorrect', 'off');
                input.setAttribute('autocapitalize', 'off');
                input.setAttribute('spellcheck', 'false');
                
                // Add mobile search suggestions
                this.addMobileSearchSuggestions(input);
            }
        });
    }
    
    addMobileSearchSuggestions(input) {
        // Create suggestions container
        const suggestionsContainer = document.createElement('div');
        suggestionsContainer.className = 'mobile-search-suggestions';
        suggestionsContainer.style.cssText = `
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            background: white;
            border: 1px solid #ddd;
            border-top: none;
            max-height: 200px;
            overflow-y: auto;
            z-index: 1000;
            display: none;
        `;
        
        input.parentNode.style.position = 'relative';
        input.parentNode.appendChild(suggestionsContainer);
        
        // Add search suggestions logic
        input.addEventListener('input', () => {
            this.updateSearchSuggestions(input, suggestionsContainer);
        });
        
        input.addEventListener('blur', () => {
            setTimeout(() => {
                suggestionsContainer.style.display = 'none';
            }, 200);
        });
    }
    
    updateSearchSuggestions(input, container) {
        const query = input.value.toLowerCase();
        
        if (query.length < 2) {
            container.style.display = 'none';
            return;
        }
        
        // Sample suggestions (in real app, this would come from API)
        const suggestions = [
            'LED Display',
            'Fine Pitch LED',
            'Outdoor LED Screen',
            'Rental LED Panel',
            'Transparent LED',
            'Creative LED Display'
        ].filter(suggestion => 
            suggestion.toLowerCase().includes(query)
        );
        
        if (suggestions.length > 0) {
            container.innerHTML = suggestions.map(suggestion => `
                <div class="suggestion-item" style="padding: 0.5rem; cursor: pointer; border-bottom: 1px solid #eee;">
                    ${suggestion}
                </div>
            `).join('');
            
            container.style.display = 'block';
            
            // Add click handlers
            container.querySelectorAll('.suggestion-item').forEach(item => {
                item.addEventListener('click', () => {
                    input.value = item.textContent;
                    container.style.display = 'none';
                    input.focus();
                });
            });
        } else {
            container.style.display = 'none';
        }
    }
    
    setupMobileFormsOptimization() {
        // Additional mobile form optimizations
        this.setupMobileKeyboardOptimization();
        this.setupMobileFormNavigation();
    }
    
    setupMobileKeyboardOptimization() {
        const inputs = document.querySelectorAll('input, textarea');
        
        inputs.forEach(input => {
            if (this.deviceInfo.isMobile) {
                // Prevent zoom on focus for iOS
                if (parseFloat(input.style.fontSize) < 16) {
                    input.style.fontSize = '16px';
                }
                
                // Add mobile-specific input attributes
                this.addMobileInputAttributes(input);
            }
        });
    }
    
    addMobileInputAttributes(input) {
        // Add appropriate input modes and patterns
        switch (input.type) {
            case 'email':
                input.inputMode = 'email';
                input.autocomplete = 'email';
                break;
            case 'tel':
                input.inputMode = 'tel';
                input.autocomplete = 'tel';
                break;
            case 'number':
                input.inputMode = 'numeric';
                break;
            case 'url':
                input.inputMode = 'url';
                input.autocomplete = 'url';
                break;
            case 'search':
                input.inputMode = 'search';
                input.autocomplete = 'off';
                input.autocorrect = 'off';
                input.autocapitalize = 'off';
                input.spellcheck = false;
                break;
        }
    }
    
    setupMobileFormNavigation() {
        const forms = document.querySelectorAll('form');
        
        forms.forEach(form => {
            if (this.deviceInfo.isMobile) {
                this.addMobileFormNavigation(form);
            }
        });
    }
    
    addMobileFormNavigation(form) {
        const inputs = form.querySelectorAll('input, textarea, select');
        
        inputs.forEach((input, index) => {
            // Add next/previous navigation
            if (index < inputs.length - 1) {
                input.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter' && input.type !== 'textarea') {
                        e.preventDefault();
                        inputs[index + 1].focus();
                    }
                });
            }
        });
    }
    
    setupViewportOptimizations() {
        // Optimize viewport for mobile
        this.optimizeViewportMeta();
        this.handleViewportChanges();
    }
    
    optimizeViewportMeta() {
        let viewportMeta = document.querySelector('meta[name="viewport"]');
        
        if (!viewportMeta) {
            viewportMeta = document.createElement('meta');
            viewportMeta.name = 'viewport';
            document.head.appendChild(viewportMeta);
        }
        
        // Set optimal viewport settings
        viewportMeta.content = 'width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes';
    }
    
    handleViewportChanges() {
        // Handle viewport changes (e.g., keyboard appearance)
        if ('visualViewport' in window) {
            window.visualViewport.addEventListener('resize', () => {
                this.handleVisualViewportChange();
            });
        }
    }
    
    handleVisualViewportChange() {
        const viewport = window.visualViewport;
        const viewportHeight = viewport.height;
        const windowHeight = window.innerHeight;
        
        // Detect if keyboard is open
        const keyboardOpen = viewportHeight < windowHeight * 0.75;
        
        if (keyboardOpen) {
            document.body.classList.add('keyboard-open');
        } else {
            document.body.classList.remove('keyboard-open');
        }
    }
    
    updateResponsiveElements() {
        // Update elements that need responsive adjustments
        this.updateResponsiveText();
        this.updateResponsiveSpacing();
        this.updateResponsiveComponents();
    }
    
    updateResponsiveText() {
        // Adjust text sizes for mobile
        const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
        
        headings.forEach(heading => {
            if (this.deviceInfo.isMobile) {
                heading.classList.add('mobile-heading');
            } else {
                heading.classList.remove('mobile-heading');
            }
        });
    }
    
    updateResponsiveSpacing() {
        // Adjust spacing for mobile
        const sections = document.querySelectorAll('section, .section, .container');
        
        sections.forEach(section => {
            if (this.deviceInfo.isMobile) {
                section.classList.add('mobile-spacing');
            } else {
                section.classList.remove('mobile-spacing');
            }
        });
    }
    
    updateResponsiveComponents() {
        // Update custom components for mobile
        const components = document.querySelectorAll('[data-mobile-responsive]');
        
        components.forEach(component => {
            const mobileClass = component.dataset.mobileResponsive;
            
            if (this.deviceInfo.isMobile) {
                component.classList.add(mobileClass);
            } else {
                component.classList.remove(mobileClass);
            }
        });
    }
    
    dispatchDeviceChangeEvent() {
        const event = new CustomEvent('mobiledevicechange', {
            detail: {
                deviceInfo: this.deviceInfo,
                isMobile: this.deviceInfo.isMobile,
                isTablet: this.deviceInfo.isTablet,
                isDesktop: this.deviceInfo.isDesktop
            },
            bubbles: true
        });
        
        document.dispatchEvent(event);
    }
    
    // Public API methods
    getDeviceInfo() {
        return { ...this.deviceInfo };
    }
    
    isMobile() {
        return this.deviceInfo.isMobile;
    }
    
    isTablet() {
        return this.deviceInfo.isTablet;
    }
    
    isDesktop() {
        return this.deviceInfo.isDesktop;
    }
    
    hasTouchSupport() {
        return this.deviceInfo.touchSupport;
    }
    
    getOrientation() {
        return this.deviceInfo.orientation;
    }
    
    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
    }
    
    announceToScreenReader(message) {
        const liveRegion = document.getElementById('mobile-announcements');
        if (liveRegion) {
            liveRegion.textContent = message;
            
            // Clear after announcement
            setTimeout(() => {
                liveRegion.textContent = '';
            }, 1000);
        }
    }
    
    optimizeForSlowConnection() {
        this.disableNonEssentialFeatures();
        document.body.classList.add('slow-connection-mode');
        this.announceToScreenReader('Optimized for slow connection');
    }
    
    enableHighPerformanceMode() {
        document.body.classList.add('high-performance-mode');
        this.config.performanceOptimizations = true;
        this.announceToScreenReader('High performance mode enabled');
    }
}

// Initialize Mobile Optimizer when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.mobileOptimizer = new MobileOptimizer();
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MobileOptimizer;
}