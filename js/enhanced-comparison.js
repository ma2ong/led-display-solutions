/* =================================================================
   ENHANCED PRODUCT COMPARISON MODULE
   Advanced product comparison with detailed specifications
   ================================================================= */
class EnhancedProductComparison {
    constructor() {
        this.comparedProducts = [];
        this.maxComparisons = 4;
        this.comparisonCategories = {
            basic: ['name', 'category', 'price', 'description'],
            display: ['pixelPitch', 'brightness', 'resolution', 'size'],
            technical: ['refreshRate', 'viewingAngle', 'powerConsumption', 'operatingTemp'],
            features: ['features', 'application', 'ipRating', 'weight']
        };
        this.init();
    }

    init() {
        this.loadComparedProducts();
        this.createComparisonInterface();
        this.setupEventListeners();
        
        console.log('Enhanced Product Comparison initialized');
    }
    
    createComparisonInterface() {
        // Create floating comparison bar
        this.createComparisonBar();
        
        // Create comparison modal
        this.createComparisonModal();
    }
    
    createComparisonBar() {
        const comparisonBar = document.createElement('div');
        comparisonBar.id = 'comparison-bar';
        comparisonBar.className = 'comparison-bar';
        comparisonBar.style.cssText = `
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            background: var(--primary-blue, #007bff);
            color: white;
            padding: 1rem;
            transform: translateY(100%);
            transition: transform 0.3s ease;
            z-index: 1000;
            box-shadow: 0 -4px 12px rgba(0,0,0,0.3);
        `;
        
        comparisonBar.innerHTML = `
            <div class="comparison-bar-content" style="display: flex; justify-content: space-between; align-items: center;">
                <div class="comparison-info">
                    <span class="comparison-count">0</span> products selected for comparison
                </div>
                <div class="comparison-actions">
                    <button class="btn btn-light btn-sm" onclick="enhancedComparison.viewComparison()" style="margin-right: 0.5rem;">
                        Compare Products
                    </button>
                    <button class="btn btn-secondary btn-sm" onclick="enhancedComparison.clearComparison()" style="margin-right: 0.5rem;">
                        Clear All
                    </button>
                    <button class="btn btn-link btn-sm" onclick="enhancedComparison.hideComparisonBar()" style="color: white;">
                        ×
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(comparisonBar);
    }
    
    createComparisonModal() {
        const modal = document.createElement('div');
        modal.id = 'comparison-modal';
        modal.className = 'comparison-modal';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.8);
            z-index: 2000;
            display: none;
            overflow-y: auto;
        `;
        
        modal.innerHTML = `
            <div class="comparison-modal-content" style="background: white; margin: 2rem; border-radius: 8px; max-width: 1200px; margin: 2rem auto;">
                <div class="comparison-header" style="padding: 1.5rem; border-bottom: 1px solid #ddd; display: flex; justify-content: space-between; align-items: center;">
                    <h2 style="margin: 0;">Product Comparison</h2>
                    <div class="comparison-header-actions" style="display: flex; gap: 1rem; align-items: center;">
                        <select id="comparison-view-mode" style="padding: 0.5rem;">
                            <option value="detailed">Detailed View</option>
                            <option value="compact">Compact View</option>
                            <option value="differences">Show Differences Only</option>
                        </select>
                        <button class="btn btn-secondary" onclick="enhancedComparison.exportComparison()">
                            Export PDF
                        </button>
                        <button class="btn btn-accent" onclick="enhancedComparison.shareComparison()">
                            Share
                        </button>
                        <button class="btn btn-link" onclick="enhancedComparison.closeComparison()" style="font-size: 1.5rem;">
                            ×
                        </button>
                    </div>
                </div>
                
                <div class="comparison-content" id="comparison-content" style="padding: 1.5rem;">
                    <!-- Comparison table will be generated here -->
                </div>
                
                <div class="comparison-footer" style="padding: 1.5rem; border-top: 1px solid #ddd;">
                    <div class="comparison-actions" style="display: flex; gap: 1rem; justify-content: center;">
                        <button class="btn btn-primary" onclick="enhancedComparison.requestQuoteForAll()">
                            Request Quote for Selected
                        </button>
                        <button class="btn btn-secondary" onclick="enhancedComparison.addToWishlist()">
                            Add to Wishlist
                        </button>
                        <button class="btn btn-accent" onclick="enhancedComparison.scheduleDemo()">
                            Schedule Demo
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    }
    
    setupEventListeners() {
        // View mode change
        document.addEventListener('change', (e) => {
            if (e.target.id === 'comparison-view-mode') {
                this.updateComparisonView(e.target.value);
            }
        });
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeComparison();
            }
            if (e.ctrlKey && e.key === 'c') {
                if (this.comparedProducts.length > 0) {
                    this.viewComparison();
                }
            }
        });
    }
    
    addProduct(product) {
        // Check if product is already in comparison
        if (this.comparedProducts.find(p => p.id === product.id)) {
            this.showNotification('Product is already in comparison', 'warning');
            return false;
        }
        
        // Check maximum limit
        if (this.comparedProducts.length >= this.maxComparisons) {
            this.showNotification(`Maximum ${this.maxComparisons} products can be compared`, 'warning');
            return false;
        }
        
        this.comparedProducts.push(product);
        this.updateComparisonBar();
        this.saveComparedProducts();
        
        this.showNotification(`${product.name} added to comparison`, 'success');
        return true;
    }
    
    removeProduct(productId) {
        this.comparedProducts = this.comparedProducts.filter(p => p.id !== productId);
        this.updateComparisonBar();
        this.saveComparedProducts();
        
        if (this.comparedProducts.length === 0) {
            this.hideComparisonBar();
        }
        
        // Update comparison view if open
        if (document.getElementById('comparison-modal').style.display !== 'none') {
            this.generateComparisonTable();
        }
    }
    
    updateComparisonBar() {
        const bar = document.getElementById('comparison-bar');
        const count = document.querySelector('.comparison-count');
        
        if (count) {
            count.textContent = this.comparedProducts.length;
        }
        
        if (this.comparedProducts.length > 0) {
            bar.style.transform = 'translateY(0)';
        } else {
            bar.style.transform = 'translateY(100%)';
        }
    }
    
    viewComparison() {
        if (this.comparedProducts.length < 2) {
            this.showNotification('Please select at least 2 products to compare', 'warning');
            return;
        }
        
        const modal = document.getElementById('comparison-modal');
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
        
        this.generateComparisonTable();
    }
    
    closeComparison() {
        const modal = document.getElementById('comparison-modal');
        modal.style.display = 'none';
        document.body.style.overflow = '';
    }
    
    generateComparisonTable() {
        const content = document.getElementById('comparison-content');
        const viewMode = document.getElementById('comparison-view-mode')?.value || 'detailed';
        
        if (this.comparedProducts.length === 0) {
            content.innerHTML = '<p class="no-products">No products selected for comparison.</p>';
            return;
        }
        
        let tableHTML = '<div class="comparison-table-container">';
        
        // Generate table based on view mode
        switch (viewMode) {
            case 'compact':
                tableHTML += this.generateCompactTable();
                break;
            case 'differences':
                tableHTML += this.generateDifferencesTable();
                break;
            default:
                tableHTML += this.generateDetailedTable();
        }
        
        tableHTML += '</div>';
        content.innerHTML = tableHTML;
    }
    
    generateDetailedTable() {
        let html = '<table class="comparison-table detailed-table" style="width: 100%; border-collapse: collapse;">';
        
        // Header with product images and names
        html += '<thead><tr><th class="spec-header" style="padding: 1rem; border: 1px solid #ddd; background: #f8f9fa;">Specification</th>';
        this.comparedProducts.forEach(product => {
            html += `
                <th class="product-header" style="padding: 1rem; border: 1px solid #ddd; background: #f8f9fa; text-align: center;">
                    <div class="product-header-content">
                        <img src="${product.image || '/images/placeholder.jpg'}" alt="${product.name}" class="product-thumb" style="width: 80px; height: 80px; object-fit: cover; border-radius: 4px; margin-bottom: 0.5rem;">
                        <div class="product-info">
                            <h4 style="margin: 0.5rem 0; font-size: 1rem;">${product.name}</h4>
                            <p class="product-category" style="margin: 0; color: #666; font-size: 0.9rem;">${product.category?.replace('-', ' ') || 'LED Display'}</p>
                            <button class="btn btn-sm btn-danger" onclick="enhancedComparison.removeProduct(${product.id})" style="margin-top: 0.5rem; padding: 0.25rem 0.5rem; font-size: 0.8rem;">
                                Remove
                            </button>
                        </div>
                    </div>
                </th>
            `;
        });
        html += '</tr></thead><tbody>';
        
        // Generate rows for each category
        Object.entries(this.comparisonCategories).forEach(([categoryName, specs]) => {
            html += `<tr class="category-header"><td colspan="${this.comparedProducts.length + 1}" style="padding: 1rem; background: #e9ecef; font-weight: bold; text-transform: uppercase;">
                        <h3 style="margin: 0;">${categoryName.charAt(0).toUpperCase() + categoryName.slice(1)} Information</h3>
                     </td></tr>`;
            
            specs.forEach(spec => {
                html += this.generateSpecRow(spec);
            });
        });
        
        html += '</tbody></table>';
        return html;
    }
    
    generateCompactTable() {
        let html = '<div class="comparison-cards" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem;">';
        
        this.comparedProducts.forEach(product => {
            html += `
                <div class="comparison-card" style="border: 1px solid #ddd; border-radius: 8px; overflow: hidden;">
                    <div class="card-header" style="position: relative; padding: 1rem; background: #f8f9fa;">
                        <img src="${product.image || '/images/placeholder.jpg'}" alt="${product.name}" class="product-image" style="width: 100%; height: 200px; object-fit: cover; border-radius: 4px; margin-bottom: 1rem;">
                        <h3 style="margin: 0; font-size: 1.2rem;">${product.name}</h3>
                        <button class="remove-btn" onclick="enhancedComparison.removeProduct(${product.id})" style="position: absolute; top: 1rem; right: 1rem; background: #dc3545; color: white; border: none; border-radius: 50%; width: 30px; height: 30px; cursor: pointer;">
                            ×
                        </button>
                    </div>
                    
                    <div class="card-content" style="padding: 1rem;">
                        <div class="key-specs">
                            <div class="spec-item" style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                                <span class="spec-label" style="font-weight: bold;">Pixel Pitch:</span>
                                <span class="spec-value">${product.specifications?.pixelPitch || product.pixelPitch + 'mm' || 'N/A'}</span>
                            </div>
                            <div class="spec-item" style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                                <span class="spec-label" style="font-weight: bold;">Brightness:</span>
                                <span class="spec-value">${product.specifications?.brightness || product.brightness + ' nits' || 'N/A'}</span>
                            </div>
                            <div class="spec-item" style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                                <span class="spec-label" style="font-weight: bold;">Price:</span>
                                <span class="spec-value price" style="color: #28a745; font-weight: bold;">$${product.price?.toLocaleString() || 'Contact for price'}</span>
                            </div>
                        </div>
                        
                        <div class="features-list" style="margin: 1rem 0;">
                            ${(product.features || []).map(feature => 
                                `<span class="feature-tag" style="display: inline-block; background: #e9ecef; padding: 0.25rem 0.5rem; border-radius: 4px; font-size: 0.8rem; margin: 0.25rem 0.25rem 0.25rem 0;">${feature.replace('-', ' ')}</span>`
                            ).join('')}
                        </div>
                        
                        <div class="card-actions" style="display: flex; gap: 0.5rem;">
                            <button class="btn btn-primary btn-sm" onclick="viewProductDetails(${product.id})" style="flex: 1; padding: 0.5rem; border: none; background: #007bff; color: white; border-radius: 4px; cursor: pointer;">
                                View Details
                            </button>
                            <button class="btn btn-accent btn-sm" onclick="requestQuote(${product.id})" style="flex: 1; padding: 0.5rem; border: none; background: #28a745; color: white; border-radius: 4px; cursor: pointer;">
                                Get Quote
                            </button>
                        </div>
                    </div>
                </div>
            `;
        });
        
        html += '</div>';
        return html;
    }
    
    generateDifferencesTable() {
        let html = '<table class="comparison-table differences-table" style="width: 100%; border-collapse: collapse;">';
        
        // Header
        html += '<thead><tr><th class="spec-header" style="padding: 1rem; border: 1px solid #ddd; background: #f8f9fa;">Specification</th>';
        this.comparedProducts.forEach(product => {
            html += `<th class="product-header" style="padding: 1rem; border: 1px solid #ddd; background: #f8f9fa;">${product.name}</th>`;
        });
        html += '</tr></thead><tbody>';
        
        // Only show specs where products differ
        const allSpecs = ['name', 'pixelPitch', 'brightness', 'price', 'resolution', 'size'];
        
        allSpecs.forEach(spec => {
            const values = this.comparedProducts.map(product => this.getProductValue(product, spec));
            const hasDifferences = new Set(values).size > 1;
            
            if (hasDifferences) {
                html += this.generateSpecRow(spec, true);
            }
        });
        
        html += '</tbody></table>';
        return html;
    }
    
    generateSpecRow(spec, highlightDifferences = false) {
        const specLabel = this.getSpecLabel(spec);
        let html = `<tr class="spec-row"><td class="spec-name" style="padding: 0.75rem; border: 1px solid #ddd; font-weight: bold; background: #f8f9fa;">${specLabel}</td>`;
        
        const values = this.comparedProducts.map(product => this.getProductValue(product, spec));
        const hasVariations = new Set(values).size > 1;
        
        this.comparedProducts.forEach((product, index) => {
            const value = values[index];
            const cellClass = highlightDifferences && hasVariations ? 'different-value' : '';
            const cellStyle = `padding: 0.75rem; border: 1px solid #ddd; ${cellClass ? 'background: #fff3cd;' : ''}`;
            
            html += `<td class="spec-value ${cellClass}" style="${cellStyle}">${this.formatSpecValue(spec, value)}</td>`;
        });
        
        html += '</tr>';
        return html;
    }
    
    getProductValue(product, spec) {
        switch (spec) {
            case 'name': return product.name;
            case 'category': return product.category;
            case 'price': return product.price;
            case 'description': return product.description;
            case 'pixelPitch': return product.pixelPitch;
            case 'brightness': return product.brightness;
            case 'resolution': return product.resolution;
            case 'size': return product.size;
            case 'features': return product.features;
            case 'application': return product.application;
            default:
                return product.specifications?.[spec] || 'N/A';
        }
    }
    
    getSpecLabel(spec) {
        const labels = {
            name: 'Product Name',
            category: 'Category',
            price: 'Price',
            description: 'Description',
            pixelPitch: 'Pixel Pitch',
            brightness: 'Brightness',
            resolution: 'Resolution',
            size: 'Size',
            features: 'Features',
            application: 'Applications',
            refreshRate: 'Refresh Rate',
            viewingAngle: 'Viewing Angle',
            powerConsumption: 'Power Consumption',
            operatingTemp: 'Operating Temperature',
            ipRating: 'IP Rating',
            weight: 'Weight'
        };
        
        return labels[spec] || spec.charAt(0).toUpperCase() + spec.slice(1);
    }
    
    formatSpecValue(spec, value) {
        if (value === null || value === undefined || value === 'N/A') {
            return '<span class="na-value" style="color: #6c757d; font-style: italic;">N/A</span>';
        }
        
        switch (spec) {
            case 'price':
                return `<span class="price-value" style="color: #28a745; font-weight: bold;">$${value.toLocaleString()}</span>`;
            case 'features':
            case 'application':
                if (Array.isArray(value)) {
                    return value.map(item => 
                        `<span class="tag" style="display: inline-block; background: #e9ecef; padding: 0.25rem 0.5rem; border-radius: 4px; font-size: 0.8rem; margin: 0.25rem 0.25rem 0.25rem 0;">${item.replace('-', ' ')}</span>`
                    ).join(' ');
                }
                return value;
            case 'category':
                return value.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
            default:
                return value;
        }
    }
    
    updateComparisonView(viewMode) {
        this.generateComparisonTable();
    }
    
    clearComparison() {
        this.comparedProducts = [];
        this.updateComparisonBar();
        this.saveComparedProducts();
        
        // Update comparison view if open
        if (document.getElementById('comparison-modal').style.display !== 'none') {
            this.generateComparisonTable();
        }
        
        this.showNotification('Comparison cleared', 'info');
    }
    
    hideComparisonBar() {
        const bar = document.getElementById('comparison-bar');
        bar.style.transform = 'translateY(100%)';
    }
    
    exportComparison() {
        // Generate PDF export (simplified version)
        const content = document.getElementById('comparison-content').innerHTML;
        const printWindow = window.open('', '_blank');
        
        printWindow.document.write(`
            <html>
                <head>
                    <title>Product Comparison</title>
                    <style>
                        body { font-family: Arial, sans-serif; margin: 20px; }
                        .comparison-table { width: 100%; border-collapse: collapse; }
                        .comparison-table th, .comparison-table td { 
                            border: 1px solid #ddd; 
                            padding: 8px; 
                            text-align: left; 
                        }
                        .comparison-table th { background-color: #f5f5f5; }
                        .product-thumb { width: 50px; height: 50px; object-fit: cover; }
                        .feature-tag, .tag { 
                            background: #e9ecef; 
                            padding: 2px 6px; 
                            border-radius: 3px; 
                            font-size: 0.8em; 
                            margin: 1px;
                        }
                        .price-value { font-weight: bold; color: #28a745; }
                        .na-value { color: #6c757d; font-style: italic; }
                    </style>
                </head>
                <body>
                    <h1>LED Display Product Comparison</h1>
                    <p>Generated on: ${new Date().toLocaleDateString()}</p>
                    ${content}
                </body>
            </html>
        `);
        
        printWindow.document.close();
        printWindow.print();
        
        this.showNotification('Comparison exported for printing', 'success');
    }
    
    shareComparison() {
        const productNames = this.comparedProducts.map(p => p.name).join(', ');
        const shareData = {
            title: 'LED Display Product Comparison',
            text: `Compare these LED displays: ${productNames}`,
            url: window.location.href + '#comparison'
        };
        
        if (navigator.share) {
            navigator.share(shareData);
        } else {
            // Fallback: copy to clipboard
            const shareText = `${shareData.title}\n${shareData.text}\n${shareData.url}`;
            navigator.clipboard.writeText(shareText).then(() => {
                this.showNotification('Comparison link copied to clipboard!', 'success');
            });
        }
    }
    
    requestQuoteForAll() {
        const productIds = this.comparedProducts.map(p => p.id).join(',');
        window.location.href = `/contact.html?products=${productIds}&action=quote`;
    }
    
    addToWishlist() {
        // Implement wishlist functionality
        const wishlist = JSON.parse(localStorage.getItem('led_wishlist') || '[]');
        
        this.comparedProducts.forEach(product => {
            if (!wishlist.find(item => item.id === product.id)) {
                wishlist.push({
                    id: product.id,
                    name: product.name,
                    price: product.price,
                    image: product.image,
                    addedDate: new Date().toISOString()
                });
            }
        });
        
        localStorage.setItem('led_wishlist', JSON.stringify(wishlist));
        this.showNotification(`${this.comparedProducts.length} products added to wishlist`, 'success');
    }
    
    scheduleDemo() {
        const productIds = this.comparedProducts.map(p => p.id).join(',');
        window.location.href = `/contact.html?products=${productIds}&action=demo`;
    }
    
    loadComparedProducts() {
        const saved = localStorage.getItem('led_compared_products');
        if (saved) {
            try {
                this.comparedProducts = JSON.parse(saved);
                this.updateComparisonBar();
            } catch (error) {
                console.warn('Failed to load compared products:', error);
                this.comparedProducts = [];
            }
        }
    }
    
    saveComparedProducts() {
        localStorage.setItem('led_compared_products', JSON.stringify(this.comparedProducts));
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
    
    // Public API methods
    getComparedProducts() {
        return [...this.comparedProducts];
    }
    
    getComparisonCount() {
        return this.comparedProducts.length;
    }
    
    isProductInComparison(productId) {
        return this.comparedProducts.some(p => p.id === productId);
    }
}

// Global functions for onclick handlers
function viewProductDetails(productId) {
    window.location.href = `/product-detail.html?id=${productId}`;
}

function requestQuote(productId) {
    window.location.href = `/contact.html?product=${productId}`;
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.enhancedComparison = new EnhancedProductComparison();
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EnhancedProductComparison;
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
            animation: slideInRight 0.3s ease;
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
    
    // Public API methods
    getComparedProducts() {
        return [...this.comparedProducts];
    }
    
    getComparisonCount() {
        return this.comparedProducts.length;
    }
    
    isProductInComparison(productId) {
        return this.comparedProducts.some(p => p.id === productId);
    }
    
    getMaxComparisons() {
        return this.maxComparisons;
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

function addToComparison(productId) {
    if (window.enhancedComparison) {
        // Get product data from advanced search or main product data
        let product = null;
        
        if (window.advancedSearch) {
            product = window.advancedSearch.getProduct(productId);
        }
        
        // Fallback: create basic product object if not found
        if (!product) {
            const productCard = document.querySelector(`[data-product-id="${productId}"]`);
            if (productCard) {
                const name = productCard.querySelector('.product-title, h3, h4')?.textContent || 'Unknown Product';
                const price = productCard.querySelector('.price-value')?.textContent?.replace(/[^0-9]/g, '') || '0';
                const image = productCard.querySelector('img')?.src || '/images/placeholder.jpg';
                
                product = {
                    id: productId,
                    name: name,
                    price: parseInt(price),
                    image: image,
                    category: 'unknown',
                    pixelPitch: 0,
                    brightness: 0,
                    resolution: 'N/A',
                    size: 'N/A',
                    features: [],
                    application: [],
                    specifications: {}
                };
            }
        }
        
        if (product) {
            window.enhancedComparison.addProduct(product);
        }
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
    window.enhancedComparison = new EnhancedProductComparison();
});

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
`;
document.head.appendChild(style);

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EnhancedProductComparison;
}