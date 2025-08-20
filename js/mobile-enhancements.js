/* =================================================================
   MOBILE ENHANCEMENTS MODULE
   Enhanced mobile experience and touch interactions
   ================================================================= */

class MobileEnhancements {
    constructor() {
        this.isMobile = this.detectMobile();
        this.isTablet = this.detectTablet();
        this.touchStartY = 0;
        this.touchEndY = 0;
        this.isScrolling = false;
        this.lastScrollTop = 0;
        this.navbarHeight = 0;
        
        this.init();
    }

    init() {
        this.setupMobileNavigation();
        this.setupTouchGestures();
        this.setupMobileSearch();
        this.setupMobileComparison();
        this.setupViewportHandling();
        this.setupPerformanceOptimizations();
        this.setupAccessibilityEnhancements();
        
        console.log('Mobile Enhancements initialized', {
            isMobile: this.isMobile,
            isTablet: this.isTablet,
            userAgent: navigator.userAgent
        });
    }

    detectMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
               window.innerWidth <= 768;
    }

    detectTablet() {
        return /iPad|Android/i.test(navigator.userAgent) && 
               window.innerWidth > 768 && window.innerWidth <= 1024;
    }

    setupMobileNavigation() {
        // Create mobile navigation toggle
        this.createMobileNavToggle();
        
        // Handle navigation clicks
        this.setupNavigationHandlers();
        
        // Handle scroll behavior for navigation
        this.setupScrollNavigation();
    }

    createMobileNavToggle() {
        const navbar = document.querySelector('.navbar');
        if (!navbar) return;

        // Add mobile toggle button if it doesn't exist
        let toggleBtn = navbar.querySelector('.navbar-toggler');
        if (!toggleBtn) {
            toggleBtn = document.createElement('button');
            toggleBtn.className = 'navbar-toggler';
            toggleBtn.innerHTML = '<span class="navbar-toggler-icon">☰</span>';
            toggleBtn.setAttribute('aria-label', 'Toggle navigation');
            toggleBtn.setAttribute('aria-expanded', 'false');
            
            const brand = navbar.querySelector('.navbar-brand');
            if (brand) {
                brand.parentNode.insertBefore(toggleBtn, brand.nextSibling);
            } else {
                navbar.appendChild(toggleBtn);
            }
        }

        // Add mobile navigation functionality
        const navMenu = navbar.querySelector('.navbar-nav');
        if (navMenu) {
            toggleBtn.addEventListener('click', () => {
                const isExpanded = navMenu.classList.contains('show');
                
                if (isExpanded) {
                    navMenu.classList.remove('show');
                    toggleBtn.setAttribute('aria-expanded', 'false');
                    toggleBtn.querySelector('.navbar-toggler-icon').textContent = '☰';
                } else {
                    navMenu.classList.add('show');
                    toggleBtn.setAttribute('aria-expanded', 'true');
                    toggleBtn.querySelector('.navbar-toggler-icon').textContent = '✕';
                }
            });

            // Close menu when clicking outside
            document.addEventListener('click', (e) => {
                if (!navbar.contains(e.target) && navMenu.classList.contains('show')) {
                    navMenu.classList.remove('show');
                    toggleBtn.setAttribute('aria-expanded', 'false');
                    toggleBtn.querySelector('.navbar-toggler-icon').textContent = '☰';
                }
            });

            // Close menu when clicking on nav links
            navMenu.querySelectorAll('.nav-link').forEach(link => {
                link.addEventListener('click', () => {
                    if (this.isMobile) {
                        navMenu.classList.remove('show');
                        toggleBtn.setAttribute('aria-expanded', 'false');
                        toggleBtn.querySelector('.navbar-toggler-icon').textContent = '☰';
                    }
                });
            });
        }
    }

    setupNavigationHandlers() {
        // Smooth scrolling for anchor links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector(anchor.getAttribute('href'));
                if (target) {
                    const offsetTop = target.offsetTop - (this.navbarHeight || 60);
                    window.scrollTo({
                        top: offsetTop,
                        behavior: 'smooth'
                    });
                }
            });
        });
    }

    setupScrollNavigation() {
        const navbar = document.querySelector('.navbar');
        if (!navbar) return;

        this.navbarHeight = navbar.offsetHeight;
        let ticking = false;

        const updateNavbar = () => {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            
            if (scrollTop > this.lastScrollTop && scrollTop > this.navbarHeight) {
                // Scrolling down
                navbar.style.transform = `translateY(-${this.navbarHeight}px)`;
            } else {
                // Scrolling up
                navbar.style.transform = 'translateY(0)';
            }
            
            this.lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
            ticking = false;
        };

        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(updateNavbar);
                ticking = true;
            }
        });

        // Add transition for smooth hide/show
        navbar.style.transition = 'transform 0.3s ease-in-out';
        navbar.style.position = 'fixed';
        navbar.style.top = '0';
        navbar.style.width = '100%';
        navbar.style.zIndex = '1000';
    }

    setupTouchGestures() {
        // Swipe gestures for navigation
        this.setupSwipeGestures();
        
        // Touch feedback for buttons
        this.setupTouchFeedback();
        
        // Pull to refresh (if needed)
        this.setupPullToRefresh();
    }

    setupSwipeGestures() {
        let startX = 0;
        let startY = 0;
        let endX = 0;
        let endY = 0;

        document.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
        }, { passive: true });

        document.addEventListener('touchend', (e) => {
            endX = e.changedTouches[0].clientX;
            endY = e.changedTouches[0].clientY;
            
            this.handleSwipe(startX, startY, endX, endY);
        }, { passive: true });
    }

    handleSwipe(startX, startY, endX, endY) {
        const deltaX = endX - startX;
        const deltaY = endY - startY;
        const minSwipeDistance = 50;

        // Horizontal swipe
        if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > minSwipeDistance) {
            if (deltaX > 0) {
                // Swipe right
                this.handleSwipeRight();
            } else {
                // Swipe left
                this.handleSwipeLeft();
            }
        }
        
        // Vertical swipe
        if (Math.abs(deltaY) > Math.abs(deltaX) && Math.abs(deltaY) > minSwipeDistance) {
            if (deltaY > 0) {
                // Swipe down
                this.handleSwipeDown();
            } else {
                // Swipe up
                this.handleSwipeUp();
            }
        }
    }

    handleSwipeRight() {
        // Open mobile menu if closed
        const navbar = document.querySelector('.navbar');
        const navMenu = navbar?.querySelector('.navbar-nav');
        const toggleBtn = navbar?.querySelector('.navbar-toggler');
        
        if (navMenu && !navMenu.classList.contains('show')) {
            navMenu.classList.add('show');
            if (toggleBtn) {
                toggleBtn.setAttribute('aria-expanded', 'true');
                toggleBtn.querySelector('.navbar-toggler-icon').textContent = '✕';
            }
        }
    }

    handleSwipeLeft() {
        // Close mobile menu if open
        const navbar = document.querySelector('.navbar');
        const navMenu = navbar?.querySelector('.navbar-nav');
        const toggleBtn = navbar?.querySelector('.navbar-toggler');
        
        if (navMenu && navMenu.classList.contains('show')) {
            navMenu.classList.remove('show');
            if (toggleBtn) {
                toggleBtn.setAttribute('aria-expanded', 'false');
                toggleBtn.querySelector('.navbar-toggler-icon').textContent = '☰';
            }
        }
    }

    handleSwipeDown() {
        // Show navbar if hidden
        const navbar = document.querySelector('.navbar');
        if (navbar) {
            navbar.style.transform = 'translateY(0)';
        }
    }

    handleSwipeUp() {
        // Hide navbar
        const navbar = document.querySelector('.navbar');
        if (navbar && window.pageYOffset > this.navbarHeight) {
            navbar.style.transform = `translateY(-${this.navbarHeight}px)`;
        }
    }

    setupTouchFeedback() {
        // Add touch feedback to buttons
        document.querySelectorAll('.btn, button, .nav-link, .product-card').forEach(element => {
            element.addEventListener('touchstart', () => {
                element.style.transform = 'scale(0.98)';
                element.style.opacity = '0.8';
            }, { passive: true });

            element.addEventListener('touchend', () => {
                setTimeout(() => {
                    element.style.transform = '';
                    element.style.opacity = '';
                }, 150);
            }, { passive: true });

            element.addEventListener('touchcancel', () => {
                element.style.transform = '';
                element.style.opacity = '';
            }, { passive: true });
        });
    }

    setupPullToRefresh() {
        if (!this.isMobile) return;

        let startY = 0;
        let currentY = 0;
        let pullDistance = 0;
        const maxPullDistance = 100;
        const refreshThreshold = 60;

        document.addEventListener('touchstart', (e) => {
            if (window.pageYOffset === 0) {
                startY = e.touches[0].clientY;
            }
        }, { passive: true });

        document.addEventListener('touchmove', (e) => {
            if (window.pageYOffset === 0 && startY) {
                currentY = e.touches[0].clientY;
                pullDistance = Math.min(currentY - startY, maxPullDistance);
                
                if (pullDistance > 0) {
                    document.body.style.transform = `translateY(${pullDistance * 0.5}px)`;
                    document.body.style.transition = 'none';
                }
            }
        }, { passive: true });

        document.addEventListener('touchend', () => {
            if (pullDistance > refreshThreshold) {
                this.refreshPage();
            }
            
            document.body.style.transform = '';
            document.body.style.transition = 'transform 0.3s ease';
            startY = 0;
            pullDistance = 0;
        }, { passive: true });
    }

    refreshPage() {
        // Show refresh indicator
        this.showRefreshIndicator();
        
        // Simulate refresh (in real app, this would reload data)
        setTimeout(() => {
            this.hideRefreshIndicator();
            // window.location.reload(); // Uncomment for actual refresh
        }, 1500);
    }

    showRefreshIndicator() {
        let indicator = document.getElementById('refresh-indicator');
        if (!indicator) {
            indicator = document.createElement('div');
            indicator.id = 'refresh-indicator';
            indicator.style.cssText = `
                position: fixed;
                top: 20px;
                left: 50%;
                transform: translateX(-50%);
                background: #007bff;
                color: white;
                padding: 0.5rem 1rem;
                border-radius: 20px;
                z-index: 10000;
                font-size: 0.9rem;
            `;
            indicator.textContent = 'Refreshing...';
            document.body.appendChild(indicator);
        }
        indicator.style.display = 'block';
    }

    hideRefreshIndicator() {
        const indicator = document.getElementById('refresh-indicator');
        if (indicator) {
            indicator.style.display = 'none';
        }
    }

    setupMobileSearch() {
        // Optimize search interface for mobile
        const searchContainer = document.getElementById('advanced-search-container');
        if (!searchContainer) return;

        // Make search collapsible on mobile
        const searchHeader = searchContainer.querySelector('.search-header');
        const searchContent = searchContainer.querySelector('.search-content');
        
        if (this.isMobile && searchContent) {
            searchContent.style.display = 'none';
            
            if (searchHeader) {
                searchHeader.style.cursor = 'pointer';
                searchHeader.addEventListener('click', () => {
                    const isVisible = searchContent.style.display !== 'none';
                    searchContent.style.display = isVisible ? 'none' : 'block';
                    
                    const toggleIcon = searchHeader.querySelector('.toggle-icon');
                    if (toggleIcon) {
                        toggleIcon.textContent = isVisible ? '▶' : '▼';
                    }
                });
            }
        }

        // Optimize search input for mobile
        const quickSearch = document.getElementById('quick-search');
        if (quickSearch) {
            quickSearch.setAttribute('autocomplete', 'off');
            quickSearch.setAttribute('autocorrect', 'off');
            quickSearch.setAttribute('autocapitalize', 'off');
            quickSearch.setAttribute('spellcheck', 'false');
        }

        // Add mobile-specific search shortcuts
        this.addMobileSearchShortcuts();
    }

    addMobileSearchShortcuts() {
        if (!this.isMobile) return;

        const searchContainer = document.getElementById('advanced-search-container');
        if (!searchContainer) return;

        const shortcutsContainer = document.createElement('div');
        shortcutsContainer.className = 'mobile-search-shortcuts';
        shortcutsContainer.style.cssText = `
            padding: 1rem;
            background: #f8f9fa;
            border-top: 1px solid #ddd;
            display: flex;
            gap: 0.5rem;
            flex-wrap: wrap;
            justify-content: center;
        `;

        const shortcuts = [
            { text: 'Outdoor', filter: 'category', value: 'outdoor' },
            { text: 'Fine Pitch', filter: 'category', value: 'fine-pitch' },
            { text: 'Rental', filter: 'category', value: 'rental' },
            { text: 'High Brightness', filter: 'brightness', value: '6000+' }
        ];

        shortcuts.forEach(shortcut => {
            const btn = document.createElement('button');
            btn.className = 'btn btn-sm btn-outline-primary';
            btn.textContent = shortcut.text;
            btn.style.cssText = `
                padding: 0.5rem 1rem;
                border-radius: 20px;
                font-size: 0.8rem;
                white-space: nowrap;
            `;
            
            btn.addEventListener('click', () => {
                const filterElement = document.getElementById(shortcut.filter + '-filter');
                if (filterElement) {
                    filterElement.value = shortcut.value;
                    if (window.advancedSearch) {
                        window.advancedSearch.performAdvancedSearch();
                    }
                }
            });
            
            shortcutsContainer.appendChild(btn);
        });

        const searchContent = searchContainer.querySelector('.search-content');
        if (searchContent) {
            searchContent.appendChild(shortcutsContainer);
        }
    }

    setupMobileComparison() {
        // Optimize comparison interface for mobile
        if (!this.isMobile) return;

        // Override comparison view for mobile
        const originalGenerateComparisonTable = window.enhancedComparison?.generateComparisonTable;
        if (originalGenerateComparisonTable) {
            window.enhancedComparison.generateComparisonTable = () => {
                const content = document.getElementById('comparison-content');
                const viewMode = document.getElementById('comparison-view-mode')?.value || 'compact';
                
                // Force compact view on mobile
                if (this.isMobile) {
                    const viewSelect = document.getElementById('comparison-view-mode');
                    if (viewSelect && viewSelect.value !== 'compact') {
                        viewSelect.value = 'compact';
                    }
                }
                
                originalGenerateComparisonTable.call(window.enhancedComparison);
                
                // Add mobile-specific enhancements
                this.enhanceMobileComparison();
            };
        }
    }

    enhanceMobileComparison() {
        const comparisonCards = document.querySelectorAll('.comparison-card');
        comparisonCards.forEach(card => {
            // Add swipe to remove functionality
            let startX = 0;
            let currentX = 0;
            let isDragging = false;

            card.addEventListener('touchstart', (e) => {
                startX = e.touches[0].clientX;
                isDragging = true;
                card.style.transition = 'none';
            }, { passive: true });

            card.addEventListener('touchmove', (e) => {
                if (!isDragging) return;
                
                currentX = e.touches[0].clientX;
                const deltaX = currentX - startX;
                
                if (Math.abs(deltaX) > 10) {
                    card.style.transform = `translateX(${deltaX}px)`;
                    card.style.opacity = Math.max(0.3, 1 - Math.abs(deltaX) / 200);
                }
            }, { passive: true });

            card.addEventListener('touchend', () => {
                if (!isDragging) return;
                
                const deltaX = currentX - startX;
                isDragging = false;
                
                card.style.transition = 'transform 0.3s ease, opacity 0.3s ease';
                
                if (Math.abs(deltaX) > 100) {
                    // Remove from comparison
                    const productId = card.dataset.productId;
                    if (productId && window.enhancedComparison) {
                        window.enhancedComparison.removeProduct(parseInt(productId));
                    }
                } else {
                    // Snap back
                    card.style.transform = '';
                    card.style.opacity = '';
                }
            }, { passive: true });
        });
    }

    setupViewportHandling() {
        // Handle viewport changes (orientation, keyboard)
        this.handleViewportChanges();
        
        // Handle virtual keyboard
        this.handleVirtualKeyboard();
        
        // Handle safe areas (iPhone X+)
        this.handleSafeAreas();
    }

    handleViewportChanges() {
        let resizeTimer;
        
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                this.updateMobileState();
                this.adjustLayoutForOrientation();
            }, 250);
        });

        window.addEventListener('orientationchange', () => {
            setTimeout(() => {
                this.updateMobileState();
                this.adjustLayoutForOrientation();
            }, 500);
        });
    }

    updateMobileState() {
        const wasMobile = this.isMobile;
        this.isMobile = this.detectMobile();
        this.isTablet = this.detectTablet();
        
        if (wasMobile !== this.isMobile) {
            // Mobile state changed, reinitialize
            this.init();
        }
    }

    adjustLayoutForOrientation() {
        const isLandscape = window.innerWidth > window.innerHeight;
        document.body.classList.toggle('landscape', isLandscape);
        document.body.classList.toggle('portrait', !isLandscape);
        
        // Adjust comparison modal for landscape
        const comparisonModal = document.getElementById('comparison-modal');
        if (comparisonModal && this.isMobile && isLandscape) {
            const modalContent = comparisonModal.querySelector('.comparison-modal-content');
            if (modalContent) {
                modalContent.style.height = '90vh';
                modalContent.style.overflowY = 'auto';
            }
        }
    }

    handleVirtualKeyboard() {
        if (!this.isMobile) return;

        let initialViewportHeight = window.innerHeight;
        
        window.addEventListener('resize', () => {
            const currentHeight = window.innerHeight;
            const heightDifference = initialViewportHeight - currentHeight;
            
            if (heightDifference > 150) {
                // Virtual keyboard is likely open
                document.body.classList.add('keyboard-open');
                
                // Adjust fixed elements
                const comparisonBar = document.getElementById('comparison-bar');
                if (comparisonBar) {
                    comparisonBar.style.bottom = '0';
                }
            } else {
                // Virtual keyboard is likely closed
                document.body.classList.remove('keyboard-open');
                
                const comparisonBar = document.getElementById('comparison-bar');
                if (comparisonBar) {
                    comparisonBar.style.bottom = '0';
                }
            }
        });
    }

    handleSafeAreas() {
        // Add CSS custom properties for safe areas
        const style = document.createElement('style');
        style.textContent = `
            :root {
                --safe-area-inset-top: env(safe-area-inset-top, 0px);
                --safe-area-inset-right: env(safe-area-inset-right, 0px);
                --safe-area-inset-bottom: env(safe-area-inset-bottom, 0px);
                --safe-area-inset-left: env(safe-area-inset-left, 0px);
            }
            
            .navbar {
                padding-top: calc(0.5rem + var(--safe-area-inset-top));
                padding-left: calc(1rem + var(--safe-area-inset-left));
                padding-right: calc(1rem + var(--safe-area-inset-right));
            }
            
            .comparison-bar {
                padding-bottom: calc(1rem + var(--safe-area-inset-bottom));
                padding-left: calc(1rem + var(--safe-area-inset-left));
                padding-right: calc(1rem + var(--safe-area-inset-right));
            }
        `;
        document.head.appendChild(style);
    }

    setupPerformanceOptimizations() {
        // Lazy load images
        this.setupLazyLoading();
        
        // Optimize scroll performance
        this.optimizeScrollPerformance();
        
        // Reduce animations on low-end devices
        this.optimizeAnimations();
    }

    setupLazyLoading() {
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.src = img.dataset.src;
                        img.classList.remove('lazy');
                        imageObserver.unobserve(img);
                    }
                });
            });

            document.querySelectorAll('img[data-src]').forEach(img => {
                imageObserver.observe(img);
            });
        }
    }

    optimizeScrollPerformance() {
        // Use passive event listeners for scroll
        let ticking = false;
        
        const optimizedScrollHandler = () => {
            // Batch DOM reads and writes
            if (!ticking) {
                requestAnimationFrame(() => {
                    // Perform scroll-related updates here
                    ticking = false;
                });
                ticking = true;
            }
        };

        window.addEventListener('scroll', optimizedScrollHandler, { passive: true });
    }

    optimizeAnimations() {
        // Detect low-end devices
        const isLowEndDevice = navigator.hardwareConcurrency <= 2 || 
                              navigator.deviceMemory <= 2;
        
        if (isLowEndDevice) {
            document.body.classList.add('reduced-animations');
            
            // Add CSS for reduced animations
            const style = document.createElement('style');
            style.textContent = `
                .reduced-animations * {
                    animation-duration: 0.1s !important;
                    transition-duration: 0.1s !important;
                }
            `;
            document.head.appendChild(style);
        }
    }

    setupAccessibilityEnhancements() {
        // Improve touch targets
        this.improveTouchTargets();
        
        // Add focus management
        this.setupFocusManagement();
        
        // Improve screen reader support
        this.improveScreenReaderSupport();
    }

    improveTouchTargets() {
        // Ensure minimum touch target size of 44px
        const style = document.createElement('style');
        style.textContent = `
            @media (max-width: 768px) {
                .btn, button, .nav-link, input[type="checkbox"], input[type="radio"] {
                    min-height: 44px;
                    min-width: 44px;
                }
                
                .btn {
                    padding: 0.75rem 1rem;
                }
            }
        `;
        document.head.appendChild(style);
    }

    setupFocusManagement() {
        // Trap focus in modals
        const modals = document.querySelectorAll('.modal, .comparison-modal');
        modals.forEach(modal => {
            this.trapFocus(modal);
        });
    }

    trapFocus(element) {
        const focusableElements = element.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        
        const firstFocusable = focusableElements[0];
        const lastFocusable = focusableElements[focusableElements.length - 1];

        element.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                if (e.shiftKey) {
                    if (document.activeElement === firstFocusable) {
                        lastFocusable.focus();
                        e.preventDefault();
                    }
                } else {
                    if (document.activeElement === lastFocusable) {
                        firstFocusable.focus();
                        e.preventDefault();
                    }
                }
            }
        });
    }

    improveScreenReaderSupport() {
        // Add ARIA labels and descriptions
        document.querySelectorAll('.btn').forEach(btn => {
            if (!btn.getAttribute('aria-label') && !btn.textContent.trim()) {
                btn.setAttribute('aria-label', 'Button');
            }
        });

        // Announce dynamic content changes
        this.createAriaLiveRegion();
    }

    createAriaLiveRegion() {
        const liveRegion = document.createElement('div');
        liveRegion.id = 'aria-live-region';
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

    announceToScreenReader(message) {
        const liveRegion = document.getElementById('aria-live-region');
        if (liveRegion) {
            liveRegion.textContent = message;
            setTimeout(() => {
                liveRegion.textContent = '';
            }, 1000);
        }
    }

    // Public API methods
    isMobileDevice() {
        return this.isMobile;
    }

    isTabletDevice() {
        return this.isTablet;
    }

    showMobileNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `mobile-notification mobile-notification-${type}`;
        notification.style.cssText = `
            position: fixed;
            top: calc(20px + var(--safe-area-inset-top, 0px));
            left: 1rem;
            right: 1rem;
            padding: 1rem;
            border-radius: 8px;
            color: white;
            z-index: 10000;
            font-size: 0.9rem;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            transform: translateY(-100px);
            transition: transform 0.3s ease;
        `;
        
        switch (type) {
            case 'success':
                notification.style.background = '#28a745';
                break;
            case 'error':
                notification.style.background = '#dc3545';
                break;
            case 'warning':
                notification.style.background = '#ffc107';
                notification.style.color = '#000';
                break;
            default:
                notification.style.background = '#17a2b8';
        }
        
        notification.innerHTML = `
            <div style="display: flex; align-items: center; gap: 0.5rem;">
                <span style="flex: 1;">${message}</span>
                <button onclick="this.parentElement.parentElement.remove()" 
                        style="background: none; border: none; color: inherit; font-size: 1.2rem; cursor: pointer; padding: 0; min-width: 30px; min-height: 30px;">×</button>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateY(0)';
        }, 100);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.transform = 'translateY(-100px)';
                setTimeout(() => {
                    notification.remove();
                }, 300);
            }
        }, 5000);
        
        // Announce to screen readers
        this.announceToScreenReader(message);
    }
}

// Initialize mobile enhancements when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.mobileEnhancements = new MobileEnhancements();
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MobileEnhancements;
}