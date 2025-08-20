/* =================================================================
   ADVANCED PRODUCT SEARCH & COMPARISON SYSTEM
   Enhanced search functionality with filters, sorting, and comparison
   ================================================================= */

class AdvancedProductSearch {
    constructor() {
        this.products = [];
        this.filteredProducts = [];
        this.searchFilters = {
            category: '',
            pixelPitch: '',
            application: '',
            priceRange: '',
            brightness: '',
            resolution: '',
            size: ''
        };
        this.sortBy = 'name';
        this.sortOrder = 'asc';
        this.currentPage = 1;
        this.itemsPerPage = 12;
        this.searchHistory = [];
        this.favorites = [];
        
        this.init();
    }
    
    async init() {
        await this.loadProducts();
        this.setupSearchInterface();
        this.loadUserPreferences();
        this.initializeFilters();
        this.renderProducts();
        
        console.log('Advanced Product Search initialized');
    }
    
    async loadProducts() {
        try {
            // In production, this would fetch from API
            this.products = this.getMockProducts();
            this.filteredProducts = [...this.products];
        } catch (error) {
            console.error('Failed to load products:', error);
            this.products = [];
            this.filteredProducts = [];
        }
    }
    
    getMockProducts() {
        return [
            {
                id: 'p125-fine-pitch',
                name: 'P1.25 Fine Pitch LED Display',
                category: 'Fine Pitch',
                pixelPitch: '1.25mm',
                application: ['Indoor', 'Control Room', 'Broadcast'],
                price: 2500,
                brightness: '800 nits',
                resolution: '1920x1080',
                size: '500x500mm',
                features: ['High Resolution', 'Low Power', 'Seamless'],
                image: 'https://via.placeholder.com/300x200/1e40af/ffffff?text=P1.25+LED',
                description: 'Ultra-high resolution indoor LED display perfect for control rooms',
                specifications: {
                    pixelPitch: '1.25mm',
                    brightness: '800 nits',
                    viewingAngle: '160°',
                    refreshRate: '3840Hz',
                    powerConsumption: '180W/m²',
                    operatingTemp: '-20°C to +60°C'
                }
            },
            {
                id: 'p156-fine-pitch',
                name: 'P1.56 Fine Pitch LED Display',
                category: 'Fine Pitch',
                pixelPitch: '1.56mm',
                application: ['Indoor', 'Meeting Room', 'Retail'],
                price: 2000,
                brightness: '900 nits',
                resolution: '1920x1080',
                size: '500x500mm',
                features: ['Cost Effective', 'High Brightness', 'Easy Install'],
                image: 'https://via.placeholder.com/300x200/f97316/ffffff?text=P1.56+LED',
                description: 'Cost-effective fine pitch LED for meeting rooms and retail',
                specifications: {
                    pixelPitch: '1.56mm',
                    brightness: '900 nits',
                    viewingAngle: '160°',
                    refreshRate: '3840Hz',
                    powerConsumption: '200W/m²',
                    operatingTemp: '-20°C to +60°C'
                }
            },
            {
                id: 'p4-outdoor',
                name: 'P4 Outdoor LED Display',
                category: 'Outdoor',
                pixelPitch: '4mm',
                application: ['Outdoor', 'Advertising', 'Stadium'],
                price: 800,
                brightness: '6000 nits',
                resolution: '1920x1080',
                size: '960x960mm',
                features: ['Weather Resistant', 'High Brightness', 'Wide Viewing'],
                image: 'https://via.placeholder.com/300x200/10b981/ffffff?text=P4+Outdoor',
                description: 'Weather-resistant outdoor LED display for advertising',
                specifications: {
                    pixelPitch: '4mm',
                    brightness: '6000 nits',
                    viewingAngle: '140°',
                    refreshRate: '1920Hz',
                    powerConsumption: '400W/m²',
                    operatingTemp: '-40°C to +80°C'
                }
            },
            {
                id: 'p6-outdoor',
                name: 'P6 Outdoor LED Display',
                category: 'Outdoor',
                pixelPitch: '6mm',
                application: ['Outdoor', 'Billboard', 'Sports'],
                price: 600,
                brightness: '6500 nits',
                resolution: '1280x720',
                size: '960x960mm',
                features: ['Cost Effective', 'High Brightness', 'Durable'],
                image: 'https://via.placeholder.com/300x200/6366f1/ffffff?text=P6+Outdoor',
                description: 'Cost-effective outdoor LED for large displays',
                specifications: {
                    pixelPitch: '6mm',
                    brightness: '6500 nits',
                    viewingAngle: '140°',
                    refreshRate: '1920Hz',
                    powerConsumption: '350W/m²',
                    operatingTemp: '-40°C to +80°C'
                }
            },
            {
                id: 'p3-rental',
                name: 'P3 Rental LED Display',
                category: 'Rental',
                pixelPitch: '3mm',
                application: ['Events', 'Concerts', 'Exhibitions'],
                price: 1200,
                brightness: '4500 nits',
                resolution: '1920x1080',
                size: '500x500mm',
                features: ['Lightweight', 'Quick Setup', 'Portable'],
                image: 'https://via.placeholder.com/300x200/ec4899/ffffff?text=P3+Rental',
                description: 'Lightweight rental LED panel for events and concerts',
                specifications: {
                    pixelPitch: '3mm',
                    brightness: '4500 nits',
                    viewingAngle: '160°',
                    refreshRate: '3840Hz',
                    powerConsumption: '300W/m²',
                    operatingTemp: '-20°C to +60°C'
                }
            },
            {
                id: 'transparent-led',
                name: 'Transparent LED Display',
                category: 'Transparent',
                pixelPitch: '10mm',
                application: ['Retail', 'Glass Wall', 'Architecture'],
                price: 3000,
                brightness: '4000 nits',
                resolution: '1920x1080',
                size: '1000x500mm',
                features: ['See-through', 'Architectural', 'Energy Efficient'],
                image: 'https://via.placeholder.com/300x200/8b5cf6/ffffff?text=Transparent',
                description: 'See-through LED display for retail windows and architecture',
                specifications: {
                    pixelPitch: '10mm',
                    brightness: '4000 nits',
                    viewingAngle: '140°',
                    refreshRate: '1920Hz',
                    powerConsumption: '250W/m²',
                    operatingTemp: '-20°C to +60°C'
                }
            }
        ];
    }
    
    setupSearchInterface() {
        // Create search container if it doesn't exist
        let searchContainer = document.getElementById('advanced-search-container');
        if (!searchContainer) {
            searchContainer = document.createElement('div');
            searchContainer.id = 'advanced-search-container';
            
            // Find a good place to insert the search interface
            const productsSection = document.querySelector('.product-grid')?.parentElement;
            if (productsSection) {
                productsSection.insertBefore(searchContainer, productsSection.firstChild);
            } else {
                document.body.appendChild(searchContainer);
            }
        }
        
        searchContainer.innerHTML = this.getSearchInterfaceHTML();
        this.attachSearchEventListeners();
    }
    
    getSearchInterfaceHTML() {
        return `
            <div class="advanced-search-panel">
                <div class="search-header">
                    <h3>Advanced Product Search</h3>
                    <button class="toggle-search-btn" onclick="this.parentElement.parentElement.classList.toggle('collapsed')">
                        <span class="toggle-icon">−</span>
                    </button>
                </div>
                
                <div class="search-content">
                    <!-- Main Search Bar -->
                    <div class="search-bar-container">
                        <input type="text" id="main-search-input" class="main-search-input" 
                               placeholder="Search products by name, features, or specifications...">
                        <button class="search-btn" onclick="window.advancedSearch.performSearch()">
                            <span>🔍</span>
                        </button>
                        <button class="voice-search-btn" onclick="window.advancedSearch.startVoiceSearch()" title="Voice Search">
                            <span>🎤</span>
                        </button>
                    </div>
                    
                    <!-- Quick Filters -->
                    <div class="quick-filters">
                        <button class="filter-chip" data-filter="category" data-value="">All Categories</button>
                        <button class="filter-chip" data-filter="category" data-value="Fine Pitch">Fine Pitch</button>
                        <button class="filter-chip" data-filter="category" data-value="Outdoor">Outdoor</button>
                        <button class="filter-chip" data-filter="category" data-value="Rental">Rental</button>
                        <button class="filter-chip" data-filter="category" data-value="Transparent">Transparent</button>
                    </div>
                    
                    <!-- Advanced Filters -->
                    <div class="advanced-filters">
                        <div class="filter-row">
                            <div class="filter-group">
                                <label for="pixel-pitch-filter">Pixel Pitch</label>
                                <select id="pixel-pitch-filter" class="filter-select">
                                    <option value="">All Pixel Pitches</option>
                                    <option value="1.25mm">P1.25 (1.25mm)</option>
                                    <option value="1.56mm">P1.56 (1.56mm)</option>
                                    <option value="3mm">P3 (3mm)</option>
                                    <option value="4mm">P4 (4mm)</option>
                                    <option value="6mm">P6 (6mm)</option>
                                    <option value="10mm">P10 (10mm)</option>
                                </select>
                            </div>
                            
                            <div class="filter-group">
                                <label for="application-filter">Application</label>
                                <select id="application-filter" class="filter-select">
                                    <option value="">All Applications</option>
                                    <option value="Indoor">Indoor</option>
                                    <option value="Outdoor">Outdoor</option>
                                    <option value="Events">Events</option>
                                    <option value="Retail">Retail</option>
                                    <option value="Control Room">Control Room</option>
                                    <option value="Advertising">Advertising</option>
                                </select>
                            </div>
                            
                            <div class="filter-group">
                                <label for="price-range-filter">Price Range</label>
                                <select id="price-range-filter" class="filter-select">
                                    <option value="">All Prices</option>
                                    <option value="0-1000">Under $1,000</option>
                                    <option value="1000-2000">$1,000 - $2,000</option>
                                    <option value="2000-3000">$2,000 - $3,000</option>
                                    <option value="3000+">Over $3,000</option>
                                </select>
                            </div>
                            
                            <div class="filter-group">
                                <label for="brightness-filter">Brightness</label>
                                <select id="brightness-filter" class="filter-select">
                                    <option value="">All Brightness</option>
                                    <option value="0-1000">Under 1,000 nits</option>
                                    <option value="1000-3000">1,000 - 3,000 nits</option>
                                    <option value="3000-5000">3,000 - 5,000 nits</option>
                                    <option value="5000+">Over 5,000 nits</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Sort and View Options -->
                    <div class="search-controls">
                        <div class="sort-controls">
                            <label for="sort-by">Sort by:</label>
                            <select id="sort-by" class="sort-select">
                                <option value="name">Name</option>
                                <option value="price">Price</option>
                                <option value="category">Category</option>
                                <option value="pixelPitch">Pixel Pitch</option>
                                <option value="brightness">Brightness</option>
                            </select>
                            <select id="sort-order" class="sort-select">
                                <option value="asc">Ascending</option>
                                <option value="desc">Descending</option>
                            </select>
                        </div>
                        
                        <div class="view-controls">
                            <button class="view-btn active" data-view="grid" title="Grid View">⊞</button>
                            <button class="view-btn" data-view="list" title="List View">☰</button>
                            <button class="view-btn" data-view="compare" title="Compare View">⚖</button>
                        </div>
                        
                        <div class="search-actions">
                            <button class="action-btn" onclick="window.advancedSearch.clearFilters()">Clear Filters</button>
                            <button class="action-btn" onclick="window.advancedSearch.saveSearch()">Save Search</button>
                        </div>
                    </div>
                    
                    <!-- Search Results Info -->
                    <div class="search-results-info">
                        <span id="results-count">0 products found</span>
                        <span id="search-time"></span>
                    </div>
                </div>
            </div>
            
            <!-- Search Results Container -->
            <div id="search-results-container" class="search-results-container">
                <!-- Results will be rendered here -->
            </div>
            
            <!-- Pagination -->
            <div id="search-pagination" class="search-pagination">
                <!-- Pagination will be rendered here -->
            </div>
        `;
    }
    
    attachSearchEventListeners() {
        // Main search input
        const searchInput = document.getElementById('main-search-input');
        if (searchInput) {
            searchInput.addEventListener('input', this.debounce(() => {
                this.performSearch();
            }, 300));
            
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.performSearch();
                }
            });
        }
        
        // Filter selects
        const filterSelects = document.querySelectorAll('.filter-select');
        filterSelects.forEach(select => {
            select.addEventListener('change', () => {
                this.updateFilters();
                this.performSearch();
            });
        });
        
        // Quick filter chips
        const filterChips = document.querySelectorAll('.filter-chip');
        filterChips.forEach(chip => {
            chip.addEventListener('click', () => {
                // Remove active class from all chips in the same group
                const filterType = chip.dataset.filter;
                document.querySelectorAll(`[data-filter="${filterType}"]`).forEach(c => 
                    c.classList.remove('active'));
                
                // Add active class to clicked chip
                chip.classList.add('active');
                
                // Update filter and search
                this.searchFilters[filterType] = chip.dataset.value;
                this.performSearch();
            });
        });
        
        // Sort controls
        const sortBy = document.getElementById('sort-by');
        const sortOrder = document.getElementById('sort-order');
        
        if (sortBy) {
            sortBy.addEventListener('change', () => {
                this.sortBy = sortBy.value;
                this.performSearch();
            });
        }
        
        if (sortOrder) {
            sortOrder.addEventListener('change', () => {
                this.sortOrder = sortOrder.value;
                this.performSearch();
            });
        }
        
        // View controls
        const viewBtns = document.querySelectorAll('.view-btn');
        viewBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                viewBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.changeView(btn.dataset.view);
            });
        });
        
        // Toggle search panel
        const toggleBtn = document.querySelector('.toggle-search-btn');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => {
                const panel = document.querySelector('.advanced-search-panel');
                const icon = toggleBtn.querySelector('.toggle-icon');
                
                if (panel.classList.contains('collapsed')) {
                    icon.textContent = '−';
                } else {
                    icon.textContent = '+';
                }
            });
        }
    }
    
    updateFilters() {
        this.searchFilters.pixelPitch = document.getElementById('pixel-pitch-filter')?.value || '';
        this.searchFilters.application = document.getElementById('application-filter')?.value || '';
        this.searchFilters.priceRange = document.getElementById('price-range-filter')?.value || '';
        this.searchFilters.brightness = document.getElementById('brightness-filter')?.value || '';
    }
    
    performSearch() {
        const startTime = performance.now();
        
        // Get search query
        const searchQuery = document.getElementById('main-search-input')?.value.toLowerCase() || '';
        
        // Update filters
        this.updateFilters();
        
        // Filter products
        this.filteredProducts = this.products.filter(product => {
            // Text search
            if (searchQuery) {
                const searchableText = [
                    product.name,
                    product.description,
                    product.category,
                    ...product.features,
                    ...product.application,
                    Object.values(product.specifications).join(' ')
                ].join(' ').toLowerCase();
                
                if (!searchableText.includes(searchQuery)) {
                    return false;
                }
            }
            
            // Category filter
            if (this.searchFilters.category && product.category !== this.searchFilters.category) {
                return false;
            }
            
            // Pixel pitch filter
            if (this.searchFilters.pixelPitch && product.pixelPitch !== this.searchFilters.pixelPitch) {
                return false;
            }
            
            // Application filter
            if (this.searchFilters.application && !product.application.includes(this.searchFilters.application)) {
                return false;
            }
            
            // Price range filter
            if (this.searchFilters.priceRange) {
                const [min, max] = this.searchFilters.priceRange.split('-').map(p => 
                    p.includes('+') ? Infinity : parseInt(p));
                if (product.price < min || product.price > max) {
                    return false;
                }
            }
            
            // Brightness filter
            if (this.searchFilters.brightness) {
                const brightness = parseInt(product.brightness);
                const [min, max] = this.searchFilters.brightness.split('-').map(b => 
                    b.includes('+') ? Infinity : parseInt(b));
                if (brightness < min || brightness > max) {
                    return false;
                }
            }
            
            return true;
        });
        
        // Sort products
        this.sortProducts();
        
        // Update search history
        if (searchQuery) {
            this.addToSearchHistory(searchQuery);
        }
        
        // Render results
        this.renderProducts();
        
        // Update results info
        const endTime = performance.now();
        const searchTime = Math.round(endTime - startTime);
        
        document.getElementById('results-count').textContent = 
            `${this.filteredProducts.length} product${this.filteredProducts.length !== 1 ? 's' : ''} found`;
        document.getElementById('search-time').textContent = 
            `(${searchTime}ms)`;
    }
    
    sortProducts() {
        this.filteredProducts.sort((a, b) => {
            let aValue = a[this.sortBy];
            let bValue = b[this.sortBy];
            
            // Handle special cases
            if (this.sortBy === 'price') {
                aValue = parseFloat(aValue);
                bValue = parseFloat(bValue);
            } else if (this.sortBy === 'brightness') {
                aValue = parseInt(aValue);
                bValue = parseInt(bValue);
            } else if (this.sortBy === 'pixelPitch') {
                aValue = parseFloat(aValue);
                bValue = parseFloat(bValue);
            }
            
            if (this.sortOrder === 'desc') {
                return bValue > aValue ? 1 : -1;
            } else {
                return aValue > bValue ? 1 : -1;
            }
        });
    }
    
    renderProducts() {
        const container = document.getElementById('search-results-container');
        if (!container) return;
        
        const currentView = document.querySelector('.view-btn.active')?.dataset.view || 'grid';
        
        if (this.filteredProducts.length === 0) {
            container.innerHTML = this.getNoResultsHTML();
            return;
        }
        
        // Calculate pagination
        const totalPages = Math.ceil(this.filteredProducts.length / this.itemsPerPage);
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        const pageProducts = this.filteredProducts.slice(startIndex, endIndex);
        
        // Render products based on view
        switch (currentView) {
            case 'grid':
                container.innerHTML = this.getGridViewHTML(pageProducts);
                break;
            case 'list':
                container.innerHTML = this.getListViewHTML(pageProducts);
                break;
            case 'compare':
                container.innerHTML = this.getCompareViewHTML(pageProducts);
                break;
        }
        
        // Render pagination
        this.renderPagination(totalPages);
        
        // Attach product event listeners
        this.attachProductEventListeners();
    }
    
    getGridViewHTML(products) {
        return `
            <div class="products-grid">
                ${products.map(product => `
                    <div class="product-card enhanced" data-product-id="${product.id}">
                        <div class="product-image-container">
                            <img src="${product.image}" alt="${product.name}" class="product-image" loading="lazy">
                            <div class="product-actions">
                                <button class="action-btn favorite-btn ${this.favorites.includes(product.id) ? 'active' : ''}" 
                                        data-product-id="${product.id}" title="Add to Favorites">
                                    ♥
                                </button>
                                <button class="action-btn compare-btn" data-product-id="${product.id}" title="Add to Compare">
                                    ⚖
                                </button>
                                <button class="action-btn quick-view-btn" data-product-id="${product.id}" title="Quick View">
                                    👁
                                </button>
                            </div>
                            <div class="product-badges">
                                <span class="badge category-badge">${product.category}</span>
                                ${product.features.slice(0, 2).map(feature => 
                                    `<span class="badge feature-badge">${feature}</span>`
                                ).join('')}
                            </div>
                        </div>
                        <div class="product-content">
                            <h3 class="product-title">${product.name}</h3>
                            <p class="product-description">${product.description}</p>
                            <div class="product-specs">
                                <span class="spec-item">📐 ${product.pixelPitch}</span>
                                <span class="spec-item">💡 ${product.brightness}</span>
                                <span class="spec-item">📺 ${product.resolution}</span>
                            </div>
                            <div class="product-price">
                                <span class="price">$${product.price.toLocaleString()}</span>
                                <span class="price-unit">per panel</span>
                            </div>
                            <div class="product-actions-bottom">
                                <button class="btn btn-primary btn-sm" onclick="window.advancedSearch.requestQuote('${product.id}')">
                                    Request Quote
                                </button>
                                <button class="btn btn-secondary btn-sm" onclick="window.advancedSearch.viewDetails('${product.id}')">
                                    View Details
                                </button>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }
    
    getListViewHTML(products) {
        return `
            <div class="products-list">
                ${products.map(product => `
                    <div class="product-list-item" data-product-id="${product.id}">
                        <div class="product-image-small">
                            <img src="${product.image}" alt="${product.name}" loading="lazy">
                        </div>
                        <div class="product-info">
                            <h3 class="product-title">${product.name}</h3>
                            <p class="product-description">${product.description}</p>
                            <div class="product-specs-inline">
                                <span>Category: ${product.category}</span> |
                                <span>Pixel Pitch: ${product.pixelPitch}</span> |
                                <span>Brightness: ${product.brightness}</span> |
                                <span>Applications: ${product.application.join(', ')}</span>
                            </div>
                        </div>
                        <div class="product-price-actions">
                            <div class="price-large">$${product.price.toLocaleString()}</div>
                            <div class="action-buttons">
                                <button class="btn btn-sm favorite-btn ${this.favorites.includes(product.id) ? 'active' : ''}" 
                                        data-product-id="${product.id}">♥</button>
                                <button class="btn btn-sm compare-btn" data-product-id="${product.id}">⚖</button>
                                <button class="btn btn-primary btn-sm" onclick="window.advancedSearch.requestQuote('${product.id}')">
                                    Quote
                                </button>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }
    
    getCompareViewHTML(products) {
        const selectedProducts = products.filter(p => 
            window.productComparison?.selectedProducts.includes(p.id));
        
        if (selectedProducts.length === 0) {
            return `
                <div class="compare-empty">
                    <h3>No products selected for comparison</h3>
                    <p>Select products using the compare button (⚖) to see them here.</p>
                </div>
            `;
        }
        
        return `
            <div class="products-compare">
                <div class="compare-table-container">
                    <table class="compare-table">
                        <thead>
                            <tr>
                                <th>Specification</th>
                                ${selectedProducts.map(product => `
                                    <th class="product-column">
                                        <img src="${product.image}" alt="${product.name}" class="compare-image">
                                        <h4>${product.name}</h4>
                                        <button class="remove-compare-btn" data-product-id="${product.id}">×</button>
                                    </th>
                                `).join('')}
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td class="spec-name">Category</td>
                                ${selectedProducts.map(product => `<td>${product.category}</td>`).join('')}
                            </tr>
                            <tr>
                                <td class="spec-name">Pixel Pitch</td>
                                ${selectedProducts.map(product => `<td>${product.pixelPitch}</td>`).join('')}
                            </tr>
                            <tr>
                                <td class="spec-name">Brightness</td>
                                ${selectedProducts.map(product => `<td>${product.brightness}</td>`).join('')}
                            </tr>
                            <tr>
                                <td class="spec-name">Resolution</td>
                                ${selectedProducts.map(product => `<td>${product.resolution}</td>`).join('')}
                            </tr>
                            <tr>
                                <td class="spec-name">Size</td>
                                ${selectedProducts.map(product => `<td>${product.size}</td>`).join('')}
                            </tr>
                            <tr>
                                <td class="spec-name">Applications</td>
                                ${selectedProducts.map(product => `<td>${product.application.join(', ')}</td>`).join('')}
                            </tr>
                            <tr>
                                <td class="spec-name">Price</td>
                                ${selectedProducts.map(product => `<td class="price-cell">$${product.price.toLocaleString()}</td>`).join('')}
                            </tr>
                            <tr>
                                <td class="spec-name">Actions</td>
                                ${selectedProducts.map(product => `
                                    <td>
                                        <button class="btn btn-primary btn-sm" onclick="window.advancedSearch.requestQuote('${product.id}')">
                                            Request Quote
                                        </button>
                                    </td>
                                `).join('')}
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }
    
    getNoResultsHTML() {
        return `
            <div class="no-results">
                <div class="no-results-icon">🔍</div>
                <h3>No products found</h3>
                <p>Try adjusting your search criteria or filters.</p>
                <div class="no-results-suggestions">
                    <h4>Suggestions:</h4>
                    <ul>
                        <li>Check your spelling</li>
                        <li>Use more general terms</li>
                        <li>Remove some filters</li>
                        <li>Try searching for product categories</li>
                    </ul>
                </div>
                <button class="btn btn-primary" onclick="window.advancedSearch.clearFilters()">
                    Clear All Filters
                </button>
            </div>
        `;
    }
    
    renderPagination(totalPages) {
        const paginationContainer = document.getElementById('search-pagination');
        if (!paginationContainer || totalPages <= 1) {
            paginationContainer.innerHTML = '';
            return;
        }
        
        let paginationHTML = '<div class="pagination">';
        
        // Previous button
        if (this.currentPage > 1) {
            paginationHTML += `<button class="page-btn" onclick="window.advancedSearch.goToPage(${this.currentPage - 1})">‹ Previous</button>`;
        }
        
        // Page numbers
        const startPage = Math.max(1, this.currentPage - 2);
        const endPage = Math.min(totalPages, this.currentPage + 2);
        
        if (startPage > 1) {
            paginationHTML += `<button class="page-btn" onclick="window.advancedSearch.goToPage(1)">1</button>`;
            if (startPage > 2) {
                paginationHTML += '<span class="page-ellipsis">...</span>';
            }
        }
        
        for (let i = startPage; i <= endPage; i++) {
            paginationHTML += `<button class="page-btn ${i === this.currentPage ? 'active' : ''}" 
                               onclick="window.advancedSearch.goToPage(${i})">${i}</button>`;
        }
        
        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                paginationHTML += '<span class="page-ellipsis">...</span>';
            }
            paginationHTML += `<button class="page-btn" onclick="window.advancedSearch.goToPage(${totalPages})">${totalPages}</button>`;
        }
        
        // Next button
        if (this.currentPage < totalPages) {
            paginationHTML += `<button class="page-btn" onclick="window.advancedSearch.goToPage(${this.currentPage + 1})">Next ›</button>`;
        }
        
        paginationHTML += '</div>';
        paginationContainer.innerHTML = paginationHTML;
    }
    
    attachProductEventListeners() {
        // Favorite buttons
        document.querySelectorAll('.favorite-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleFavorite(btn.dataset.productId);
            });
        });
        
        // Compare buttons
        document.querySelectorAll('.compare-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (window.productComparison) {
                    window.productComparison.toggleProduct(btn.dataset.productId);
                }
            });
        });
        
        // Quick view buttons
        document.querySelectorAll('.quick-view-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.showQuickView(btn.dataset.productId);
            });
        });
        
        // Remove from compare buttons
        document.querySelectorAll('.remove-compare-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (window.productComparison) {
                    window.productComparison.removeProduct(btn.dataset.productId);
                    this.renderProducts(); // Refresh compare view
                }
            });
        });
    }
    
    // Utility methods
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
    
    goToPage(page) {
        this.currentPage = page;
        this.renderProducts();
        
        // Scroll to top of results
        document.getElementById('search-results-container')?.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
        });
    }
    
    changeView(view) {
        this.renderProducts();
    }
    
    clearFilters() {
        // Reset all filters
        this.searchFilters = {
            category: '',
            pixelPitch: '',
            application: '',
            priceRange: '',
            brightness: '',
            resolution: '',
            size: ''
        };
        
        // Reset UI
        document.getElementById('main-search-input').value = '';
        document.querySelectorAll('.filter-select').forEach(select => select.value = '');
        document.querySelectorAll('.filter-chip').forEach(chip => chip.classList.remove('active'));
        document.querySelector('.filter-chip[data-value=""]')?.classList.add('active');
        
        // Reset pagination
        this.currentPage = 1;
        
        // Perform search
        this.performSearch();
    }
    
    toggleFavorite(productId) {
        const index = this.favorites.indexOf(productId);
        if (index > -1) {
            this.favorites.splice(index, 1);
        } else {
            this.favorites.push(productId);
        }
        
        this.saveFavorites();
        this.renderProducts(); // Refresh to update favorite buttons
    }
    
    showQuickView(productId) {
        const product = this.products.find(p => p.id === productId);
        if (!product) return;
        
        const modal = document.createElement('div');
        modal.className = 'quick-view-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>${product.name}</h3>
                    <button class="modal-close" onclick="this.closest('.quick-view-modal').remove()">×</button>
                </div>
                <div class="modal-body">
                    <div class="quick-view-content">
                        <div class="quick-view-image">
                            <img src="${product.image}" alt="${product.name}">
                        </div>
                        <div class="quick-view-details">
                            <p class="product-description">${product.description}</p>
                            <div class="product-specs-detailed">
                                <h4>Specifications:</h4>
                                <ul>
                                    ${Object.entries(product.specifications).map(([key, value]) => 
                                        `<li><strong>${key}:</strong> ${value}</li>`
                                    ).join('')}
                                </ul>
                            </div>
                            <div class="product-features">
                                <h4>Features:</h4>
                                <div class="features-list">
                                    ${product.features.map(feature => 
                                        `<span class="feature-tag">${feature}</span>`
                                    ).join('')}
                                </div>
                            </div>
                            <div class="product-applications">
                                <h4>Applications:</h4>
                                <div class="applications-list">
                                    ${product.application.map(app => 
                                        `<span class="application-tag">${app}</span>`
                                    ).join('')}
                                </div>
                            </div>
                            <div class="product-price-large">
                                <span class="price">$${product.price.toLocaleString()}</span>
                                <span class="price-unit">per panel</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" onclick="this.closest('.quick-view-modal').remove()">Close</button>
                    <button class="btn btn-primary" onclick="window.advancedSearch.requestQuote('${product.id}')">Request Quote</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Close on backdrop click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }
    
    requestQuote(productId) {
        const product = this.products.find(p => p.id === productId);
        if (!product) return;
        
        // In production, this would open a quote form or redirect to contact page
        alert(`Quote request for ${product.name}\nPrice: $${product.price.toLocaleString()}\n\nThis would normally open a quote form.`);
    }
    
    viewDetails(productId) {
        // In production, this would navigate to product detail page
        window.location.href = `/products/${productId}.html`;
    }
    
    startVoiceSearch() {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            alert('Voice search is not supported in your browser.');
            return;
        }
        
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';
        
        recognition.onstart = () => {
            document.querySelector('.voice-search-btn').classList.add('listening');
        };
        
        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            document.getElementById('main-search-input').value = transcript;
            this.performSearch();
        };
        
        recognition.onend = () => {
            document.querySelector('.voice-search-btn').classList.remove('listening');
        };
        
        recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            document.querySelector('.voice-search-btn').classList.remove('listening');
        };
        
        recognition.start();
    }
    
    addToSearchHistory(query) {
        if (!this.searchHistory.includes(query)) {
            this.searchHistory.unshift(query);
            if (this.searchHistory.length > 10) {
                this.searchHistory.pop();
            }
            this.saveSearchHistory();
        }
    }
    
    saveSearch() {
        const searchData = {
            query: document.getElementById('main-search-input').value,
            filters: { ...this.searchFilters },
            sortBy: this.sortBy,
            sortOrder: this.sortOrder,
            timestamp: Date.now()
        };
        
        const savedSearches = JSON.parse(localStorage.getItem('saved_searches') || '[]');
        savedSearches.unshift(searchData);
        
        if (savedSearches.length > 5) {
            savedSearches.pop();
        }
        
        localStorage.setItem('saved_searches', JSON.stringify(savedSearches));
        alert('Search saved successfully!');
    }
    
    loadUserPreferences() {
        // Load favorites
        try {
            this.favorites = JSON.parse(localStorage.getItem('product_favorites') || '[]');
        } catch (error) {
            this.favorites = [];
        }
        
        // Load search history
        try {
            this.searchHistory = JSON.parse(localStorage.getItem('search_history') || '[]');
        } catch (error) {
            this.searchHistory = [];
        }
    }
    
    saveFavorites() {
        localStorage.setItem('product_favorites', JSON.stringify(this.favorites));
    }
    
    saveSearchHistory() {
        localStorage.setItem('search_history', JSON.stringify(this.searchHistory));
    }
    
    initializeFilters() {
        // Set default active filter chip
        document.querySelector('.filter-chip[data-value=""]')?.classList.add('active');
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.advancedSearch = new AdvancedProductSearch();
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AdvancedProductSearch;
}