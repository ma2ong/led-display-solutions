/* =================================================================
   ADVANCED SEARCH MODULE
   Handles advanced product search and filtering functionality
   ================================================================= */
class AdvancedSearch {
    constructor() {
        this.products = [];
        this.filters = {
            category: '',
            pixelPitch: '',
            brightness: '',
            priceRange: '',
            application: '',
            resolution: '',
            size: '',
            features: []
        };
        this.searchHistory = [];
        this.savedSearches = [];
        this.init();
    }

    async init() {
        try {
            await this.loadProducts();
            this.setupSearchInterface();
            this.loadSearchHistory();
            this.loadSavedSearches();
            console.log('Advanced Search initialized');
        } catch (error) {
            console.error('Advanced Search initialization failed:', error);
        }
    }

    async loadProducts() {
        // In production, this would fetch from an API
        this.products = [
            {
                id: 1,
                name: 'P1.25 Fine Pitch LED Display',
                category: 'fine-pitch',
                pixelPitch: 1.25,
                brightness: 800,
                price: 15000,
                application: ['control-room', 'broadcast', 'conference'],
                resolution: '1920x1080',
                size: '55-inch',
                features: ['high-resolution', 'low-power', 'seamless'],
                description: 'Ultra-high resolution indoor LED display perfect for control rooms',
                image: '/images/products/p125-fine-pitch.jpg',
                specifications: {
                    pixelPitch: '1.25mm',
                    brightness: '800 nits',
                    refreshRate: '3840Hz',
                    viewingAngle: '160°',
                    powerConsumption: '150W/m²',
                    operatingTemp: '-20°C to +60°C'
                }
            },
            {
                id: 2,
                name: 'P1.56 Fine Pitch LED Wall',
                category: 'fine-pitch',
                pixelPitch: 1.56,
                brightness: 1000,
                price: 12000,
                application: ['retail', 'corporate', 'exhibition'],
                resolution: '1920x1080',
                size: '65-inch',
                features: ['high-brightness', 'wide-angle', 'energy-efficient'],
                description: 'High-quality fine pitch LED wall for commercial applications',
                image: '/images/products/p156-fine-pitch.jpg',
                specifications: {
                    pixelPitch: '1.56mm',
                    brightness: '1000 nits',
                    refreshRate: '3840Hz',
                    viewingAngle: '170°',
                    powerConsumption: '180W/m²',
                    operatingTemp: '-10°C to +50°C'
                }
            },
            {
                id: 3,
                name: 'P4 Outdoor LED Display',
                category: 'outdoor',
                pixelPitch: 4.0,
                brightness: 6500,
                price: 8000,
                application: ['advertising', 'stadium', 'outdoor-events'],
                resolution: '1024x768',
                size: '75-inch',
                features: ['weatherproof', 'high-brightness', 'durable'],
                description: 'Weather-resistant outdoor LED display for advertising',
                image: '/images/products/p4-outdoor.jpg',
                specifications: {
                    pixelPitch: '4.0mm',
                    brightness: '6500 nits',
                    refreshRate: '1920Hz',
                    viewingAngle: '140°',
                    powerConsumption: '400W/m²',
                    operatingTemp: '-40°C to +70°C',
                    ipRating: 'IP65'
                }
            },
            {
                id: 4,
                name: 'P6 Outdoor LED Screen',
                category: 'outdoor',
                pixelPitch: 6.0,
                brightness: 7000,
                price: 6000,
                application: ['advertising', 'transportation', 'public-info'],
                resolution: '768x576',
                size: '85-inch',
                features: ['high-brightness', 'cost-effective', 'reliable'],
                description: 'Cost-effective outdoor LED screen for large displays',
                image: '/images/products/p6-outdoor.jpg',
                specifications: {
                    pixelPitch: '6.0mm',
                    brightness: '7000 nits',
                    refreshRate: '1920Hz',
                    viewingAngle: '140°',
                    powerConsumption: '350W/m²',
                    operatingTemp: '-40°C to +70°C',
                    ipRating: 'IP65'
                }
            },
            {
                id: 5,
                name: 'P3.91 Rental LED Panel',
                category: 'rental',
                pixelPitch: 3.91,
                brightness: 4500,
                price: 10000,
                application: ['events', 'concerts', 'exhibitions'],
                resolution: '1024x1024',
                size: '50-inch',
                features: ['lightweight', 'quick-setup', 'portable'],
                description: 'Lightweight rental LED panel for events and exhibitions',
                image: '/images/products/p391-rental.jpg',
                specifications: {
                    pixelPitch: '3.91mm',
                    brightness: '4500 nits',
                    refreshRate: '3840Hz',
                    viewingAngle: '160°',
                    powerConsumption: '280W/m²',
                    weight: '6.5kg/panel',
                    setupTime: '< 5 minutes'
                }
            },
            {
                id: 6,
                name: 'Transparent LED Display',
                category: 'transparent',
                pixelPitch: 10.0,
                brightness: 4000,
                price: 20000,
                application: ['retail', 'architecture', 'museums'],
                resolution: '640x480',
                size: '60-inch',
                features: ['transparent', 'innovative', 'architectural'],
                description: 'See-through LED display for creative installations',
                image: '/images/products/transparent-led.jpg',
                specifications: {
                    pixelPitch: '10.0mm',
                    brightness: '4000 nits',
                    transparency: '70%',
                    viewingAngle: '140°',
                    powerConsumption: '200W/m²',
                    thickness: '12mm'
                }
            }
        ];
    }

    setupSearchInterface() {
        // Create advanced search interface if it doesn't exist
        if (!document.getElementById('advanced-search-container')) {
            this.createSearchInterface();
        }
        // Setup event listeners
        this.setupEventListeners();
    }

    createSearchInterface() {
        const searchContainer = document.createElement('div');
        searchContainer.id = 'advanced-search-container';
        searchContainer.className = 'advanced-search-container';
        searchContainer.style.cssText = `
            background: white;
            border: 1px solid #ddd;
            border-radius: 8px;
            margin: 2rem 0;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        `;
        
        searchContainer.innerHTML = `
            <div class="search-header" style="padding: 1rem; border-bottom: 1px solid #eee; display: flex; justify-content: space-between; align-items: center;">
                <h3 style="margin: 0; color: #333;">Advanced Product Search</h3>
                <button class="toggle-search-btn" onclick="toggleAdvancedSearch()" style="background: none; border: none; font-size: 1.5rem; cursor: pointer; color: #666;">
                    <span class="toggle-icon">▼</span>
                </button>
            </div>
            <div class="search-content" id="search-content" style="padding: 1.5rem;">
                <!-- Quick Search -->
                <div class="search-section" style="margin-bottom: 1.5rem;">
                    <label for="quick-search" style="display: block; margin-bottom: 0.5rem; font-weight: bold;">Quick Search:</label>
                    <div class="search-input-group" style="display: flex; gap: 0.5rem;">
                        <input type="text" id="quick-search" placeholder="Search products, features, specifications..." style="flex: 1; padding: 0.75rem; border: 1px solid #ddd; border-radius: 4px;">
                        <button class="search-btn" onclick="performQuickSearch()" style="padding: 0.75rem 1.5rem; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;">
                            <span class="search-icon">🔍</span>
                        </button>
                    </div>
                </div>
                
                <!-- Advanced Filters -->
                <div class="filters-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 1.5rem;">
                    <div class="filter-group">
                        <label for="category-filter" style="display: block; margin-bottom: 0.5rem; font-weight: bold;">Category:</label>
                        <select id="category-filter" style="width: 100%; padding: 0.5rem; border: 1px solid #ddd; border-radius: 4px;">
                            <option value="">All Categories</option>
                            <option value="fine-pitch">Fine Pitch LED</option>
                            <option value="outdoor">Outdoor LED</option>
                            <option value="rental">Rental LED</option>
                            <option value="transparent">Transparent LED</option>
                        </select>
                    </div>
                    <div class="filter-group">
                        <label for="pixel-pitch-filter" style="display: block; margin-bottom: 0.5rem; font-weight: bold;">Pixel Pitch:</label>
                        <select id="pixel-pitch-filter" style="width: 100%; padding: 0.5rem; border: 1px solid #ddd; border-radius: 4px;">
                            <option value="">Any Pitch</option>
                            <option value="0-2">0-2mm (Ultra Fine)</option>
                            <option value="2-4">2-4mm (Fine)</option>
                            <option value="4-8">4-8mm (Standard)</option>
                            <option value="8+">8mm+ (Large)</option>
                        </select>
                    </div>
                    <div class="filter-group">
                        <label for="brightness-filter" style="display: block; margin-bottom: 0.5rem; font-weight: bold;">Brightness:</label>
                        <select id="brightness-filter" style="width: 100%; padding: 0.5rem; border: 1px solid #ddd; border-radius: 4px;">
                            <option value="">Any Brightness</option>
                            <option value="0-1000">0-1000 nits (Indoor)</option>
                            <option value="1000-3000">1000-3000 nits (Semi-outdoor)</option>
                            <option value="3000-6000">3000-6000 nits (Outdoor)</option>
                            <option value="6000+">6000+ nits (High Brightness)</option>
                        </select>
                    </div>
                    <div class="filter-group">
                        <label for="price-filter" style="display: block; margin-bottom: 0.5rem; font-weight: bold;">Price Range:</label>
                        <select id="price-filter" style="width: 100%; padding: 0.5rem; border: 1px solid #ddd; border-radius: 4px;">
                            <option value="">Any Price</option>
                            <option value="0-5000">$0 - $5,000</option>
                            <option value="5000-10000">$5,000 - $10,000</option>
                            <option value="10000-15000">$10,000 - $15,000</option>
                            <option value="15000+">$15,000+</option>
                        </select>
                    </div>
                    <div class="filter-group">
                        <label for="application-filter" style="display: block; margin-bottom: 0.5rem; font-weight: bold;">Application:</label>
                        <select id="application-filter" style="width: 100%; padding: 0.5rem; border: 1px solid #ddd; border-radius: 4px;">
                            <option value="">Any Application</option>
                            <option value="control-room">Control Room</option>
                            <option value="retail">Retail</option>
                            <option value="advertising">Advertising</option>
                            <option value="events">Events</option>
                            <option value="broadcast">Broadcast</option>
                            <option value="corporate">Corporate</option>
                        </select>
                    </div>
                    <div class="filter-group">
                        <label for="size-filter" style="display: block; margin-bottom: 0.5rem; font-weight: bold;">Size:</label>
                        <select id="size-filter" style="width: 100%; padding: 0.5rem; border: 1px solid #ddd; border-radius: 4px;">
                            <option value="">Any Size</option>
                            <option value="small">Small (< 55")</option>
                            <option value="medium">Medium (55" - 75")</option>
                            <option value="large">Large (> 75")</option>
                        </select>
                    </div>
                </div>
                
                <!-- Feature Checkboxes -->
                <div class="features-section" style="margin-bottom: 1.5rem;">
                    <label style="display: block; margin-bottom: 0.5rem; font-weight: bold;">Features:</label>
                    <div class="features-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 0.5rem;">
                        <label class="feature-checkbox" style="display: flex; align-items: center; gap: 0.5rem;">
                            <input type="checkbox" value="high-resolution"> High Resolution
                        </label>
                        <label class="feature-checkbox" style="display: flex; align-items: center; gap: 0.5rem;">
                            <input type="checkbox" value="weatherproof"> Weatherproof
                        </label>
                        <label class="feature-checkbox" style="display: flex; align-items: center; gap: 0.5rem;">
                            <input type="checkbox" value="energy-efficient"> Energy Efficient
                        </label>
                        <label class="feature-checkbox" style="display: flex; align-items: center; gap: 0.5rem;">
                            <input type="checkbox" value="lightweight"> Lightweight
                        </label>
                        <label class="feature-checkbox" style="display: flex; align-items: center; gap: 0.5rem;">
                            <input type="checkbox" value="high-brightness"> High Brightness
                        </label>
                        <label class="feature-checkbox" style="display: flex; align-items: center; gap: 0.5rem;">
                            <input type="checkbox" value="seamless"> Seamless
                        </label>
                    </div>
                </div>
                
                <!-- Search Actions -->
                <div class="search-actions" style="display: flex; gap: 1rem; margin-bottom: 1.5rem;">
                    <button class="btn btn-primary" onclick="performAdvancedSearch()" style="padding: 0.75rem 1.5rem; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;">Search Products</button>
                    <button class="btn btn-secondary" onclick="clearAllFilters()" style="padding: 0.75rem 1.5rem; background: #6c757d; color: white; border: none; border-radius: 4px; cursor: pointer;">Clear Filters</button>
                    <button class="btn btn-accent" onclick="saveCurrentSearch()" style="padding: 0.75rem 1.5rem; background: #28a745; color: white; border: none; border-radius: 4px; cursor: pointer;">Save Search</button>
                </div>
                
                <!-- Saved Searches -->
                <div class="saved-searches-section">
                    <h4 style="margin-bottom: 1rem;">Saved Searches:</h4>
                    <div id="saved-searches-list" class="saved-searches-list">
                        <!-- Saved searches will be populated here -->
                    </div>
                </div>
            </div>
            
            <!-- Search Results -->
            <div class="search-results" id="search-results" style="margin-top: 2rem;">
                <!-- Results will be populated here -->
            </div>
        `;
        
        // Insert at the beginning of the main content or products section
        const targetElement = document.querySelector('.products-section, main, .container');
        if (targetElement) {
            targetElement.insertBefore(searchContainer, targetElement.firstChild);
        } else {
            document.body.appendChild(searchContainer);
        }
    }

    setupEventListeners() {
        // Quick search input
        const quickSearch = document.getElementById('quick-search');
        if (quickSearch) {
            quickSearch.addEventListener('input', this.debounce(() => {
                this.performQuickSearch();
            }, 300));
            
            quickSearch.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.performQuickSearch();
                }
            });
        }

        // Filter change listeners
        const filters = ['category-filter', 'pixel-pitch-filter', 'brightness-filter', 
                        'price-filter', 'application-filter', 'size-filter'];
        filters.forEach(filterId => {
            const filter = document.getElementById(filterId);
            if (filter) {
                filter.addEventListener('change', () => {
                    this.updateFilters();
                    this.performAdvancedSearch();
                });
            }
        });

        // Feature checkboxes
        const featureCheckboxes = document.querySelectorAll('.feature-checkbox input[type="checkbox"]');
        featureCheckboxes.forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                this.updateFilters();
                this.performAdvancedSearch();
            });
        });
    }

    updateFilters() {
        this.filters.category = document.getElementById('category-filter')?.value || '';
        this.filters.pixelPitch = document.getElementById('pixel-pitch-filter')?.value || '';
        this.filters.brightness = document.getElementById('brightness-filter')?.value || '';
        this.filters.priceRange = document.getElementById('price-filter')?.value || '';
        this.filters.application = document.getElementById('application-filter')?.value || '';
        this.filters.size = document.getElementById('size-filter')?.value || '';
        
        // Update features array
        const featureCheckboxes = document.querySelectorAll('.feature-checkbox input[type="checkbox"]:checked');
        this.filters.features = Array.from(featureCheckboxes).map(cb => cb.value);
    }

    performQuickSearch() {
        const query = document.getElementById('quick-search')?.value.toLowerCase() || '';
        
        if (query.length < 2) {
            this.displayResults(this.products);
            return;
        }

        const results = this.products.filter(product => {
            return product.name.toLowerCase().includes(query) ||
                   product.description.toLowerCase().includes(query) ||
                   product.features.some(feature => feature.toLowerCase().includes(query)) ||
                   Object.values(product.specifications).some(spec => 
                       spec.toString().toLowerCase().includes(query)
                   );
        });

        this.displayResults(results);
        this.addToSearchHistory(query, 'quick');
    }

    performAdvancedSearch() {
        this.updateFilters();
        let results = [...this.products];

        // Apply category filter
        if (this.filters.category) {
            results = results.filter(product => product.category === this.filters.category);
        }

        // Apply pixel pitch filter
        if (this.filters.pixelPitch) {
            results = results.filter(product => {
                const pitch = product.pixelPitch;
                switch (this.filters.pixelPitch) {
                    case '0-2': return pitch <= 2;
                    case '2-4': return pitch > 2 && pitch <= 4;
                    case '4-8': return pitch > 4 && pitch <= 8;
                    case '8+': return pitch > 8;
                    default: return true;
                }
            });
        }

        // Apply brightness filter
        if (this.filters.brightness) {
            results = results.filter(product => {
                const brightness = product.brightness;
                switch (this.filters.brightness) {
                    case '0-1000': return brightness <= 1000;
                    case '1000-3000': return brightness > 1000 && brightness <= 3000;
                    case '3000-6000': return brightness > 3000 && brightness <= 6000;
                    case '6000+': return brightness > 6000;
                    default: return true;
                }
            });
        }

        // Apply price filter
        if (this.filters.priceRange) {
            results = results.filter(product => {
                const price = product.price;
                switch (this.filters.priceRange) {
                    case '0-5000': return price <= 5000;
                    case '5000-10000': return price > 5000 && price <= 10000;
                    case '10000-15000': return price > 10000 && price <= 15000;
                    case '15000+': return price > 15000;
                    default: return true;
                }
            });
        }

        // Apply application filter
        if (this.filters.application) {
            results = results.filter(product => 
                product.application.includes(this.filters.application)
            );
        }

        // Apply size filter
        if (this.filters.size) {
            results = results.filter(product => {
                const sizeNum = parseInt(product.size);
                switch (this.filters.size) {
                    case 'small': return sizeNum < 55;
                    case 'medium': return sizeNum >= 55 && sizeNum <= 75;
                    case 'large': return sizeNum > 75;
                    default: return true;
                }
            });
        }

        // Apply features filter
        if (this.filters.features.length > 0) {
            results = results.filter(product => 
                this.filters.features.every(feature => 
                    product.features.includes(feature)
                )
            );
        }

        this.displayResults(results);
        this.addToSearchHistory(this.filters, 'advanced');
    }

    displayResults(results) {
        const resultsContainer = document.getElementById('search-results');
        if (!resultsContainer) return;

        if (results.length === 0) {
            resultsContainer.innerHTML = `
                <div class="no-results" style="text-align: center; padding: 3rem; background: #f8f9fa; border-radius: 8px;">
                    <h3 style="color: #666; margin-bottom: 1rem;">No products found</h3>
                    <p style="color: #888; margin-bottom: 2rem;">Try adjusting your search criteria or filters.</p>
                    <button class="btn btn-primary" onclick="clearAllFilters()" style="padding: 0.75rem 1.5rem; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;">Clear All Filters</button>
                </div>
            `;
            return;
        }

        const resultsHTML = `
            <div class="results-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; padding: 1rem; background: #f8f9fa; border-radius: 8px;">
                <h3 style="margin: 0; color: #333;">Search Results (${results.length} products found)</h3>
                <div class="results-actions" style="display: flex; gap: 1rem; align-items: center;">
                    <select id="sort-results" onchange="sortResults(this.value)" style="padding: 0.5rem; border: 1px solid #ddd; border-radius: 4px;">
                        <option value="relevance">Sort by Relevance</option>
                        <option value="price-low">Price: Low to High</option>
                        <option value="price-high">Price: High to Low</option>
                        <option value="name">Name: A to Z</option>
                        <option value="pixel-pitch">Pixel Pitch</option>
                        <option value="brightness">Brightness</option>
                    </select>
                    <button class="btn btn-secondary" onclick="exportResults()" style="padding: 0.5rem 1rem; background: #6c757d; color: white; border: none; border-radius: 4px; cursor: pointer;">Export Results</button>
                </div>
            </div>
            <div class="results-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)); gap: 1.5rem;">
                ${results.map(product => this.createProductCard(product)).join('')}
            </div>
        `;
        
        resultsContainer.innerHTML = resultsHTML;
    }

    createProductCard(product) {
        return `
            <div class="product-card search-result-card" data-product-id="${product.id}" style="border: 1px solid #ddd; border-radius: 8px; overflow: hidden; background: white; box-shadow: 0 2px 8px rgba(0,0,0,0.1); transition: transform 0.2s ease;">
                <div class="product-image-container" style="position: relative;">
                    <img src="${product.image}" alt="${product.name}" class="product-image" loading="lazy" style="width: 100%; height: 200px; object-fit: cover;">
                    <div class="product-actions" style="position: absolute; top: 0.5rem; right: 0.5rem; display: flex; gap: 0.5rem;">
                        <button class="action-btn compare-btn" onclick="addToComparison(${product.id})" 
                                title="Add to Comparison" style="background: rgba(0,0,0,0.7); color: white; border: none; border-radius: 50%; width: 35px; height: 35px; cursor: pointer;">
                            <span class="icon">⚖️</span>
                        </button>
                        <button class="action-btn favorite-btn" onclick="toggleFavorite(${product.id})" 
                                title="Add to Favorites" style="background: rgba(0,0,0,0.7); color: white; border: none; border-radius: 50%; width: 35px; height: 35px; cursor: pointer;">
                            <span class="icon">❤️</span>
                        </button>
                        <button class="action-btn share-btn" onclick="shareProduct(${product.id})" 
                                title="Share Product" style="background: rgba(0,0,0,0.7); color: white; border: none; border-radius: 50%; width: 35px; height: 35px; cursor: pointer;">
                            <span class="icon">📤</span>
                        </button>
                    </div>
                </div>
                <div class="product-content" style="padding: 1.5rem;">
                    <h4 class="product-title" style="margin: 0 0 0.5rem 0; color: #333; font-size: 1.2rem;">${product.name}</h4>
                    <p class="product-description" style="color: #666; margin-bottom: 1rem; font-size: 0.9rem;">${product.description}</p>
                    
                    <div class="product-specs" style="margin-bottom: 1rem;">
                        <div class="spec-item" style="display: flex; justify-content: space-between; margin-bottom: 0.25rem;">
                            <span class="spec-label" style="font-weight: bold; color: #555;">Pixel Pitch:</span>
                            <span class="spec-value" style="color: #333;">${product.specifications.pixelPitch}</span>
                        </div>
                        <div class="spec-item" style="display: flex; justify-content: space-between; margin-bottom: 0.25rem;">
                            <span class="spec-label" style="font-weight: bold; color: #555;">Brightness:</span>
                            <span class="spec-value" style="color: #333;">${product.specifications.brightness}</span>
                        </div>
                        <div class="spec-item" style="display: flex; justify-content: space-between; margin-bottom: 0.25rem;">
                            <span class="spec-label" style="font-weight: bold; color: #555;">Size:</span>
                            <span class="spec-value" style="color: #333;">${product.size}</span>
                        </div>
                    </div>
                    
                    <div class="product-features" style="margin-bottom: 1rem;">
                        ${product.features.map(feature => 
                            `<span class="feature-tag" style="display: inline-block; background: #e9ecef; color: #495057; padding: 0.25rem 0.5rem; border-radius: 4px; font-size: 0.8rem; margin: 0.25rem 0.25rem 0.25rem 0;">${feature.replace('-', ' ')}</span>`
                        ).join('')}
                    </div>
                    
                    <div class="product-footer">
                        <div class="product-price" style="margin-bottom: 1rem;">
                            <span class="price-label" style="color: #666; font-size: 0.9rem;">Starting from:</span>
                            <span class="price-value" style="color: #28a745; font-weight: bold; font-size: 1.2rem; margin-left: 0.5rem;">$${product.price.toLocaleString()}</span>
                        </div>
                        <div class="product-actions-footer" style="display: flex; gap: 0.5rem;">
                            <button class="btn btn-primary btn-sm" onclick="viewProductDetails(${product.id})" style="flex: 1; padding: 0.5rem; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;">
                                View Details
                            </button>
                            <button class="btn btn-accent btn-sm" onclick="requestQuote(${product.id})" style="flex: 1; padding: 0.5rem; background: #28a745; color: white; border: none; border-radius: 4px; cursor: pointer;">
                                Get Quote
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    sortResults(sortBy) {
        const resultsGrid = document.querySelector('.results-grid');
        if (!resultsGrid) return;

        const productCards = Array.from(resultsGrid.querySelectorAll('.product-card'));
        
        productCards.sort((a, b) => {
            const productA = this.products.find(p => p.id == a.dataset.productId);
            const productB = this.products.find(p => p.id == b.dataset.productId);

            switch (sortBy) {
                case 'price-low':
                    return productA.price - productB.price;
                case 'price-high':
                    return productB.price - productA.price;
                case 'name':
                    return productA.name.localeCompare(productB.name);
                case 'pixel-pitch':
                    return productA.pixelPitch - productB.pixelPitch;
                case 'brightness':
                    return productB.brightness - productA.brightness;
                default:
                    return 0;
            }
        });

        // Re-append sorted cards
        productCards.forEach(card => resultsGrid.appendChild(card));
    }

    clearAllFilters() {
        // Reset all filter inputs
        document.getElementById('quick-search').value = '';
        document.getElementById('category-filter').value = '';
        document.getElementById('pixel-pitch-filter').value = '';
        document.getElementById('brightness-filter').value = '';
        document.getElementById('price-filter').value = '';
        document.getElementById('application-filter').value = '';
        document.getElementById('size-filter').value = '';
        
        // Uncheck all feature checkboxes
        document.querySelectorAll('.feature-checkbox input[type="checkbox"]').forEach(cb => {
            cb.checked = false;
        });

        // Reset filters object
        this.filters = {
            category: '',
            pixelPitch: '',
            brightness: '',
            priceRange: '',
            application: '',
            resolution: '',
            size: '',
            features: []
        };

        // Display all products
        this.displayResults(this.products);
    }

    saveCurrentSearch() {
        const searchName = prompt('Enter a name for this search:');
        if (!searchName) return;

        const searchData = {
            id: Date.now(),
            name: searchName,
            filters: { ...this.filters },
            quickSearch: document.getElementById('quick-search')?.value || '',
            timestamp: new Date().toISOString()
        };

        this.savedSearches.push(searchData);
        this.saveSavedSearches();
        this.displaySavedSearches();
        this.showNotification(`Search "${searchName}" saved successfully!`, 'success');
    }

    loadSavedSearch(searchId) {
        const savedSearch = this.savedSearches.find(s => s.id === searchId);
        if (!savedSearch) return;

        // Apply saved filters
        this.filters = { ...savedSearch.filters };
        
        // Update UI
        document.getElementById('quick-search').value = savedSearch.quickSearch || '';
        document.getElementById('category-filter').value = savedSearch.filters.category || '';
        document.getElementById('pixel-pitch-filter').value = savedSearch.filters.pixelPitch || '';
        document.getElementById('brightness-filter').value = savedSearch.filters.brightness || '';
        document.getElementById('price-filter').value = savedSearch.filters.priceRange || '';
        document.getElementById('application-filter').value = savedSearch.filters.application || '';
        document.getElementById('size-filter').value = savedSearch.filters.size || '';
        
        // Update feature checkboxes
        document.querySelectorAll('.feature-checkbox input[type="checkbox"]').forEach(cb => {
            cb.checked = savedSearch.filters.features.includes(cb.value);
        });

        // Perform search
        this.performAdvancedSearch();
        this.showNotification(`Loaded search "${savedSearch.name}"`, 'info');
    }

    deleteSavedSearch(searchId) {
        this.savedSearches = this.savedSearches.filter(s => s.id !== searchId);
        this.saveSavedSearches();
        this.displaySavedSearches();
        this.showNotification('Search deleted', 'info');
    }

    displaySavedSearches() {
        const container = document.getElementById('saved-searches-list');
        if (!container) return;

        if (this.savedSearches.length === 0) {
            container.innerHTML = '<p class="no-saved-searches" style="color: #666; font-style: italic;">No saved searches yet.</p>';
            return;
        }

        container.innerHTML = this.savedSearches.map(search => `
            <div class="saved-search-item" style="display: flex; justify-content: space-between; align-items: center; padding: 0.75rem; border: 1px solid #ddd; border-radius: 4px; margin-bottom: 0.5rem; background: #f8f9fa;">
                <div class="saved-search-info">
                    <span class="saved-search-name" style="font-weight: bold; color: #333;">${search.name}</span>
                    <span class="saved-search-date" style="color: #666; font-size: 0.9rem; margin-left: 1rem;">${new Date(search.timestamp).toLocaleDateString()}</span>
                </div>
                <div class="saved-search-actions" style="display: flex; gap: 0.5rem;">
                    <button class="btn btn-sm btn-primary" onclick="advancedSearch.loadSavedSearch(${search.id})" style="padding: 0.25rem 0.75rem; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;">
                        Load
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="advancedSearch.deleteSavedSearch(${search.id})" style="padding: 0.25rem 0.75rem; background: #dc3545; color: white; border: none; border-radius: 4px; cursor: pointer;">
                        Delete
                    </button>
                </div>
            </div>
        `).join('');
    }

    addToSearchHistory(query, type) {
        const historyItem = {
            query: query,
            type: type,
            timestamp: new Date().toISOString()
        };
        
        this.searchHistory.unshift(historyItem);
        
        // Keep only last 20 searches
        if (this.searchHistory.length > 20) {
            this.searchHistory = this.searchHistory.slice(0, 20);
        }
        
        this.saveSearchHistory();
    }

    loadSearchHistory() {
        const saved = localStorage.getItem('led_search_history');
        if (saved) {
            try {
                this.searchHistory = JSON.parse(saved);
            } catch (error) {
                console.warn('Failed to load search history:', error);
                this.searchHistory = [];
            }
        }
    }

    saveSearchHistory() {
        localStorage.setItem('led_search_history', JSON.stringify(this.searchHistory));
    }

    loadSavedSearches() {
        const saved = localStorage.getItem('led_saved_searches');
        if (saved) {
            try {
                this.savedSearches = JSON.parse(saved);
                this.displaySavedSearches();
            } catch (error) {
                console.warn('Failed to load saved searches:', error);
                this.savedSearches = [];
            }
        }
    }

    saveSavedSearches() {
        localStorage.setItem('led_saved_searches', JSON.stringify(this.savedSearches));
    }

    exportResults() {
        const results = document.querySelectorAll('.search-result-card');
        const exportData = Array.from(results).map(card => {
            const productId = parseInt(card.dataset.productId);
            return this.products.find(p => p.id === productId);
        }).filter(Boolean);

        const csvContent = this.convertToCSV(exportData);
        this.downloadCSV(csvContent, 'led-search-results.csv');
        this.showNotification('Results exported successfully!', 'success');
    }

    convertToCSV(data) {
        const headers = ['Name', 'Category', 'Pixel Pitch', 'Brightness', 'Price', 'Size', 'Features'];
        const csvRows = [headers.join(',')];
        
        data.forEach(product => {
            const row = [
                `"${product.name}"`,
                product.category,
                product.pixelPitch,
                product.brightness,
                product.price,
                product.size,
                `"${product.features.join(', ')}"`
            ];
            csvRows.push(row.join(','));
        });
        
        return csvRows.join('\n');
    }

    downloadCSV(content, filename) {
        const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', filename);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1rem;
            border-radius: 8px;
            color: white;
            z-index: 10000;
            max-width: 300px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
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
                <span>${message}</span>
                <button onclick="this.parentElement.parentElement.remove()" 
                        style="background: none; border: none; color: inherit; font-size: 1.2rem; cursor: pointer; margin-left: auto;">×</button>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 5000);
    }

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Public API methods
    getProduct(id) {
        return this.products.find(p => p.id === id);
    }

    getAllProducts() {
        return [...this.products];
    }

    getSearchHistory() {
        return [...this.searchHistory];
    }

    getSavedSearches() {
        return [...this.savedSearches];
    }
}

// Global functions for onclick handlers
function toggleAdvancedSearch() {
    const content = document.getElementById('search-content');
    const toggleIcon = document.querySelector('.toggle-icon');
    
    if (content.style.display === 'none') {
        content.style.display = 'block';
        toggleIcon.textContent = '▼';
    } else {
        content.style.display = 'none';
        toggleIcon.textContent = '▶';
    }
}

function performQuickSearch() {
    if (window.advancedSearch) {
        window.advancedSearch.performQuickSearch();
    }
}

function performAdvancedSearch() {
    if (window.advancedSearch) {
        window.advancedSearch.performAdvancedSearch();
    }
}

function clearAllFilters() {
    if (window.advancedSearch) {
        window.advancedSearch.clearAllFilters();
    }
}

function saveCurrentSearch() {
    if (window.advancedSearch) {
        window.advancedSearch.saveCurrentSearch();
    }
}

function sortResults(sortBy) {
    if (window.advancedSearch) {
        window.advancedSearch.sortResults(sortBy);
    }
}

function exportResults() {
    if (window.advancedSearch) {
        window.advancedSearch.exportResults();
    }
}

function addToComparison(productId) {
    if (window.enhancedComparison) {
        const product = window.advancedSearch?.getProduct(productId);
        if (product) {
            window.enhancedComparison.addProduct(product);
        }
    }
}

function toggleFavorite(productId) {
    // Implement favorite functionality
    const favorites = JSON.parse(localStorage.getItem('led_favorites') || '[]');
    const productIndex = favorites.findIndex(fav => fav.id === productId);
    
    if (productIndex > -1) {
        favorites.splice(productIndex, 1);
        if (window.advancedSearch) {
            window.advancedSearch.showNotification('Removed from favorites', 'info');
        }
    } else {
        const product = window.advancedSearch?.getProduct(productId);
        if (product) {
            favorites.push({
                id: product.id,
                name: product.name,
                price: product.price,
                image: product.image,
                addedDate: new Date().toISOString()
            });
            if (window.advancedSearch) {
                window.advancedSearch.showNotification('Added to favorites', 'success');
            }
        }
    }
    
    localStorage.setItem('led_favorites', JSON.stringify(favorites));
}

function shareProduct(productId) {
    const product = window.advancedSearch?.getProduct(productId);
    if (product && navigator.share) {
        navigator.share({
            title: product.name,
            text: product.description,
            url: window.location.href + '#product-' + productId
        });
    } else {
        // Fallback: copy to clipboard
        const url = window.location.href + '#product-' + productId;
        navigator.clipboard.writeText(url).then(() => {
            if (window.advancedSearch) {
                window.advancedSearch.showNotification('Product link copied to clipboard!', 'success');
            }
        });
    }
}

function viewProductDetails(productId) {
    // Implement product details view
    window.location.href = `/product-detail.html?id=${productId}`;
}

function requestQuote(productId) {
    // Implement quote request
    window.location.href = `/contact.html?product=${productId}`;
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.advancedSearch = new AdvancedSearch();
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AdvancedSearch;
}