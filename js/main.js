/* =================================================================
   LED B2B WEBSITE - MAIN JAVASCRIPT
   VERSION: 1.0
   ================================================================= */

document.addEventListener('DOMContentLoaded', () => {
    console.log('Shenzhen Lejin Optoelectronics Website Initialized');
    
    // Initialize core functionalities
    lazyLoadImages();
    initializeMobileNav();
    
    // Initialize functional modules
    // Use enhanced comparison if available, otherwise fallback to basic comparison
    if (typeof EnhancedProductComparison !== 'undefined') {
        window.productComparison = new EnhancedProductComparison();
    } else {
        window.productComparison = new ProductComparison();
    }
    
    // Initialize advanced search if available
    if (typeof AdvancedSearch !== 'undefined') {
        window.advancedSearch = new AdvancedSearch();
    }
    
    // Use enhanced form if available, otherwise fallback to basic form
    if (typeof EnhancedInquiryForm !== 'undefined') {
        window.inquiryForm = new EnhancedInquiryForm();
    } else {
        window.inquiryForm = new InquiryForm();
    }
    
    // Initialize other features
    initializeLanguageSwitcher();
    initializeScrollToTop();
    
    // Initialize i18n system if available
    if (typeof initializeI18n === 'function') {
        initializeI18n();
    }
    
    // Initialize breadcrumb navigation if available
    if (typeof initializeBreadcrumb === 'function') {
        initializeBreadcrumb();
    }
});

// Listen for language change events
document.addEventListener('languageChanged', (event) => {
    const { language } = event.detail;
    
    // Update product comparison texts
    if (window.productComparison) {
        window.productComparison.updateLanguageTexts();
    }
    
    // Update form placeholders and labels
    if (window.inquiryForm) {
        window.inquiryForm.updateLanguageTexts();
    }
    
    console.log(`Language changed to: ${language}`);
});

/**
 * -----------------------------------------------------------------
 * 1. IMAGE LAZY LOADING SYSTEM
 * Uses Intersection Observer for efficient loading of images.
 * Images must have a `data-src` attribute and a `lazy` class.
 * -----------------------------------------------------------------
 */
const lazyLoadImages = () => {
  const images = document.querySelectorAll('img[data-src].lazy');
  if (!images.length) return;

  const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        const src = img.dataset.src;
        
        // Start loading the image
        img.src = src;
        
        // Optional: add a 'loaded' class for fade-in animations
        img.classList.add('loaded');

        // Once loaded, remove the lazy class and stop observing
        img.onload = () => {
            img.classList.remove('lazy');
            observer.unobserve(img);
        };
        // Handle potential loading errors
        img.onerror = () => {
            console.error(`Failed to load image: ${src}`);
            img.classList.remove('lazy');
            observer.unobserve(img);
        };
      }
    });
  }, {
      rootMargin: '0px 0px 100px 0px' // Start loading images 100px before they enter the viewport
  });
  
  images.forEach(img => imageObserver.observe(img));
};


/**
 * -----------------------------------------------------------------
 * 2. PRODUCT COMPARISON SYSTEM
 * Manages the logic for selecting and comparing products.
 * -----------------------------------------------------------------
 */
class ProductComparison {
  constructor() {
    this.selectedProducts = [];
    this.maxCompare = 3;
    this.storageKey = 'led_product_comparison';
    
    // Load saved comparisons from localStorage
    this.loadFromStorage();
    this.init();
    console.log('ProductComparison module initialized.');
  }
  
  init() {
    // Create comparison bar if it doesn't exist
    this.createComparisonBar();
    
    // Add event listeners to compare buttons
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('btn-compare')) {
        const productId = e.target.dataset.productId;
        if (productId) {
          this.toggleProduct(productId);
        }
      }
    });
    
    // Update UI on initialization
    this.updateCompareUI();
  }
  
  loadFromStorage() {
    try {
      const saved = localStorage.getItem(this.storageKey);
      if (saved) {
        this.selectedProducts = JSON.parse(saved);
      }
    } catch (error) {
      console.warn('Failed to load comparison data from storage:', error);
      this.selectedProducts = [];
    }
  }
  
  saveToStorage() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.selectedProducts));
    } catch (error) {
      console.warn('Failed to save comparison data to storage:', error);
    }
  }
  
  toggleProduct(productId) {
    if (this.selectedProducts.includes(productId)) {
      this.removeProduct(productId);
    } else {
      this.addProduct(productId);
    }
  }
  
  addProduct(productId) {
    if (this.selectedProducts.includes(productId)) {
      console.warn(`Product ${productId} is already in the comparison list.`);
      return false;
    }

    if (this.selectedProducts.length >= this.maxCompare) {
      this.showMessage(`You can only compare up to ${this.maxCompare} products at a time.`, 'warning');
      return false;
    }
    
    this.selectedProducts.push(productId);
    this.saveToStorage();
    this.updateCompareUI();
    this.showMessage('Product added to comparison', 'success');
    
    console.log(`Product ${productId} added. Current list:`, this.selectedProducts);
    return true;
  }

  removeProduct(productId) {
    this.selectedProducts = this.selectedProducts.filter(id => id !== productId);
    this.saveToStorage();
    this.updateCompareUI();
    this.showMessage('Product removed from comparison', 'info');
    
    console.log(`Product ${productId} removed. Current list:`, this.selectedProducts);
  }
  
  createComparisonBar() {
    if (document.querySelector('.comparison-bar')) return;
    
    const bar = document.createElement('div');
    bar.className = 'comparison-bar';
    bar.innerHTML = `
      <div class="comparison-content">
        <div class="comparison-info">
          <span class="comparison-count">0</span> products selected for comparison
        </div>
        <div class="comparison-actions">
          <button class="btn btn-secondary btn-sm" onclick="window.productComparison.clearAll()">Clear All</button>
          <button class="btn btn-primary btn-sm" onclick="window.productComparison.showComparison()">Compare</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(bar);
  }
  
  updateCompareUI() {
    const count = this.selectedProducts.length;
    const bar = document.querySelector('.comparison-bar');
    const countElement = document.querySelector('.comparison-count');
    
    if (countElement) {
      countElement.textContent = count;
    }
    
    if (bar) {
      if (count > 0) {
        bar.classList.add('visible');
      } else {
        bar.classList.remove('visible');
      }
    }
    
    // Update compare buttons
    document.querySelectorAll('.btn-compare').forEach(btn => {
      const productId = btn.dataset.productId;
      if (this.selectedProducts.includes(productId)) {
        btn.textContent = 'Remove from Compare';
        btn.classList.add('active');
      } else {
        btn.textContent = 'Add to Compare';
        btn.classList.remove('active');
      }
    });
  }
  
  clearAll() {
    this.selectedProducts = [];
    this.saveToStorage();
    this.updateCompareUI();
    this.showMessage('All products removed from comparison', 'info');
  }
  
  async showComparison() {
    if (this.selectedProducts.length < 2) {
      this.showMessage('Please select at least 2 products to compare.', 'warning');
      return;
    }
    
    try {
      // Fetch product data
      const products = await this.fetchProductData(this.selectedProducts);
      this.generateCompareTable(products);
    } catch (error) {
      console.error('Failed to load comparison data:', error);
      this.showMessage('Failed to load product data for comparison.', 'error');
    }
  }
  
  async fetchProductData(productIds) {
    const products = [];
    
    for (const id of productIds) {
      try {
        const response = await fetch(`/api/products/${id}`);
        if (response.ok) {
          const product = await response.json();
          products.push(product);
        }
      } catch (error) {
        console.warn(`Failed to fetch product ${id}:`, error);
      }
    }
    
    return products;
  }
  
  generateCompareTable(products) {
    // Create modal for comparison
    const modal = document.createElement('div');
    modal.className = 'comparison-modal';
    modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h2>Product Comparison</h2>
          <button class="modal-close">&times;</button>
        </div>
        <div class="modal-body">
          <div class="comparison-table-container">
            ${this.buildComparisonTable(products)}
          </div>
        </div>
      </div>
    `;
    
    // Add event listeners
    modal.querySelector('.modal-close').addEventListener('click', () => {
      modal.remove();
    });
    
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.remove();
      }
    });
    
    document.body.appendChild(modal);
  }
  
  buildComparisonTable(products) {
    if (products.length === 0) {
      return '<p>No product data available for comparison.</p>';
    }
    
    const specs = ['name', 'category', 'description', 'specs'];
    
    let table = '<table class="comparison-table"><thead><tr><th>Feature</th>';
    
    // Add product headers
    products.forEach(product => {
      table += `<th>${product.name || 'Unknown Product'}</th>`;
    });
    table += '</tr></thead><tbody>';
    
    // Add specification rows
    specs.forEach(spec => {
      table += `<tr><td class="spec-name">${this.formatSpecName(spec)}</td>`;
      products.forEach(product => {
        const value = product[spec] || 'N/A';
        table += `<td>${this.formatSpecValue(value)}</td>`;
      });
      table += '</tr>';
    });
    
    table += '</tbody></table>';
    return table;
  }
  
  formatSpecName(spec) {
    const names = {
      'name': 'Product Name',
      'category': 'Category',
      'description': 'Description',
      'specs': 'Specifications'
    };
    return names[spec] || spec.charAt(0).toUpperCase() + spec.slice(1);
  }
  
  formatSpecValue(value) {
    if (typeof value === 'string' && value.length > 100) {
      return value.substring(0, 100) + '...';
    }
    return value;
  }
  
  showMessage(text, type = 'info') {
    const message = document.createElement('div');
    message.className = `toast-message ${type}`;
    message.textContent = text;
    
    document.body.appendChild(message);
    
    // Show animation
    setTimeout(() => message.classList.add('show'), 100);
    
    // Auto-hide after 3 seconds
    setTimeout(() => {
      message.classList.remove('show');
      setTimeout(() => message.remove(), 300);
    }, 3000);
  }
  
  updateLanguageTexts() {
    // Update comparison bar text
    const comparisonInfo = document.querySelector('.comparison-info');
    if (comparisonInfo && window.i18n) {
      const count = this.selectedProducts.length;
      comparisonInfo.innerHTML = `<span class="comparison-count">${count}</span> ${window.i18n.t('compare.selected-for-comparison')}`;
    }
    
    // Update compare buttons
    document.querySelectorAll('.btn-compare').forEach(btn => {
      const productId = btn.dataset.productId;
      if (this.selectedProducts.includes(productId)) {
        btn.textContent = window.i18n ? window.i18n.t('btn.remove-from-compare') : 'Remove from Compare';
      } else {
        btn.textContent = window.i18n ? window.i18n.t('btn.add-to-compare') : 'Add to Compare';
      }
    });
    
    // Update comparison modal title
    const modalTitle = document.querySelector('.comparison-modal h2');
    if (modalTitle && window.i18n) {
      modalTitle.textContent = window.i18n.t('compare.title');
    }
  }
}


/**
 * -----------------------------------------------------------------
 * 3. INQUIRY FORM SYSTEM
 * Handles form validation and submission with real functionality.
 * -----------------------------------------------------------------
 */
class InquiryForm {
  constructor(formId = '#inquiry-form') {
    this.form = document.querySelector(formId);
    this.formData = {};
    this.validationRules = {
      name: {
        pattern: /.{2,}/,
        message: 'Name must be at least 2 characters long'
      },
      email: {
        pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        message: 'Please enter a valid email address'
      },
      phone: {
        pattern: /^[\+]?[(]?[0-9\s\-\(\)]{10,}$/,
        message: 'Please enter a valid phone number (optional)'
      },
      company: {
        pattern: /.*/,
        message: ''
      },
      message: {
        pattern: /.{10,1000}/,
        message: 'Message must be between 10 and 1000 characters'
      },
      privacy_consent: {
        pattern: /^1$/,
        message: 'You must agree to the privacy policy to continue'
      }
    };
    
    this.maxCharacters = 1000;
    this.isSubmitting = false;
    
    this.init();
    console.log('Enhanced InquiryForm module initialized.');
  }
  
  init() {
    if (!this.form) {
      console.warn('Inquiry form not found on this page.');
      return;
    }
    
    // Add event listeners
    this.form.addEventListener('submit', (e) => this.handleSubmit(e));
    
    // Add real-time validation
    const inputs = this.form.querySelectorAll('input, textarea, select');
    inputs.forEach(input => {
      input.addEventListener('blur', (e) => this.validateField(e.target.name, e.target.value, true));
      input.addEventListener('input', (e) => {
        this.clearError(e.target);
        
        // Special handling for message character count
        if (e.target.name === 'message') {
          this.updateCharacterCount(e.target);
        }
      });
      
      // Handle checkbox validation
      if (input.type === 'checkbox') {
        input.addEventListener('change', (e) => {
          this.validateField(e.target.name, e.target.checked ? '1' : '0', true);
        });
      }
    });
    
    // Initialize character count
    const messageField = this.form.querySelector('[name="message"]');
    if (messageField) {
      this.updateCharacterCount(messageField);
    }
    
    // Auto-save form data to localStorage
    this.loadSavedData();
    this.setupAutoSave();
  }
  
  validateField(fieldName, value, showError = false) {
    const rule = this.validationRules[fieldName];
    if (!rule) return true;
    
    const isValid = rule.pattern.test(value.trim());
    
    if (showError) {
      const field = this.form.querySelector(`[name="${fieldName}"]`);
      if (field) {
        this.showFieldError(field, isValid ? '' : rule.message);
      }
    }
    
    return isValid;
  }
  
  showFieldError(field, message) {
    // Remove existing error
    this.clearError(field);
    
    if (message) {
      field.classList.add('error');
      const errorDiv = document.createElement('div');
      errorDiv.className = 'field-error';
      errorDiv.textContent = message;
      field.parentNode.appendChild(errorDiv);
    }
  }
  
  clearError(field) {
    field.classList.remove('error');
    const existingError = field.parentNode.querySelector('.field-error');
    if (existingError) {
      existingError.remove();
    }
  }
  
  async handleSubmit(e) {
    e.preventDefault();
    
    // Prevent double submission
    if (this.isSubmitting) {
      return;
    }
    
    this.isSubmitting = true;
    this.setSubmitButtonState(true);
    
    // Remove any existing messages
    const existingMessages = this.form.parentNode.querySelectorAll('.form-success-message, .form-error-message');
    existingMessages.forEach(msg => msg.remove());
    
    try {
      // Gather form data
      const formData = new FormData(this.form);
      const data = Object.fromEntries(formData.entries());
      
      // Handle checkboxes that aren't checked
      const checkboxes = this.form.querySelectorAll('input[type="checkbox"]');
      checkboxes.forEach(checkbox => {
        if (!checkbox.checked) {
          data[checkbox.name] = '0';
        }
      });
      
      // Validate all fields
      let allFieldsValid = true;
      const requiredFields = ['name', 'email', 'message', 'privacy_consent'];
      
      for (const fieldName of requiredFields) {
        const value = data[fieldName] || '';
        if (!this.validateField(fieldName, value, true)) {
          allFieldsValid = false;
        }
      }
      
      // Validate optional fields that have values
      for (const [name, value] of Object.entries(data)) {
        if (value && !requiredFields.includes(name)) {
          this.validateField(name, value, true);
        }
      }
      
      if (!allFieldsValid) {
        throw new Error('Please correct the errors in the form before submitting.');
      }
      
      // Add additional data
      data.language = document.documentElement.lang || 'en';
      data.source = 'website';
      data.user_agent = navigator.userAgent;
      data.timestamp = new Date().toISOString();
      
      // Submit to server
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });
      
      const responseData = await response.json();
      
      if (!response.ok) {
        throw new Error(responseData.error || 'Failed to submit inquiry. Please try again.');
      }
      
      // Success
      this.showSuccessMessage();
      this.form.reset();
      
      // Reset character count
      const charCountElement = document.getElementById('char-count');
      if (charCountElement) {
        charCountElement.textContent = '0';
        charCountElement.parentElement.classList.remove('warning', 'error');
      }
      
      // Track successful submission (for analytics)
      if (typeof gtag !== 'undefined') {
        gtag('event', 'form_submit', {
          'event_category': 'Contact',
          'event_label': 'Inquiry Form'
        });
      }
      
    } catch (error) {
      console.error('Form submission error:', error);
      this.showErrorMessage(error.message);
      
      // Track failed submission (for analytics)
      if (typeof gtag !== 'undefined') {
        gtag('event', 'form_error', {
          'event_category': 'Contact',
          'event_label': 'Inquiry Form',
          'value': error.message
        });
      }
    } finally {
      this.isSubmitting = false;
      this.setSubmitButtonState(false);
    }
  }
  
  updateCharacterCount(messageField) {
    const charCount = messageField.value.length;
    const charCountElement = document.getElementById('char-count');
    
    if (charCountElement) {
      charCountElement.textContent = charCount;
      
      const parent = charCountElement.parentElement;
      parent.classList.remove('warning', 'error');
      
      if (charCount > this.maxCharacters) {
        parent.classList.add('error');
      } else if (charCount > this.maxCharacters * 0.8) {
        parent.classList.add('warning');
      }
    }
  }
  
  loadSavedData() {
    try {
      const savedData = localStorage.getItem('inquiry_form_data');
      if (savedData) {
        const data = JSON.parse(savedData);
        
        // Fill form fields with saved data
        Object.keys(data).forEach(key => {
          const field = this.form.querySelector(`[name="${key}"]`);
          if (field) {
            if (field.type === 'checkbox') {
              field.checked = data[key] === '1';
            } else {
              field.value = data[key];
            }
          }
        });
        
        // Update character count if message was loaded
        const messageField = this.form.querySelector('[name="message"]');
        if (messageField && messageField.value) {
          this.updateCharacterCount(messageField);
        }
      }
    } catch (error) {
      console.warn('Failed to load saved form data:', error);
    }
  }
  
  setupAutoSave() {
    const inputs = this.form.querySelectorAll('input, textarea, select');
    inputs.forEach(input => {
      input.addEventListener('input', () => {
        this.saveFormData();
      });
      
      if (input.type === 'checkbox') {
        input.addEventListener('change', () => {
          this.saveFormData();
        });
      }
    });
  }
  
  saveFormData() {
    try {
      const formData = new FormData(this.form);
      const data = {};
      
      for (const [key, value] of formData.entries()) {
        data[key] = value;
      }
      
      // Handle checkboxes that aren't checked
      const checkboxes = this.form.querySelectorAll('input[type="checkbox"]');
      checkboxes.forEach(checkbox => {
        if (!checkbox.checked) {
          data[checkbox.name] = '0';
        }
      });
      
      localStorage.setItem('inquiry_form_data', JSON.stringify(data));
    } catch (error) {
      console.warn('Failed to save form data:', error);
    }
  }
  
  clearSavedData() {
    try {
      localStorage.removeItem('inquiry_form_data');
    } catch (error) {
      console.warn('Failed to clear saved form data:', error);
    }
  }
  
  showSuccessMessage() {
    const message = document.createElement('div');
    message.className = 'form-success-message';
    message.innerHTML = `
      <div>
        <strong>Thank you for your inquiry!</strong><br>
        We have received your message and will respond within 24 hours. 
        A confirmation email has been sent to your email address.
      </div>
    `;
    this.form.parentNode.insertBefore(message, this.form);
    
    // Clear saved form data
    this.clearSavedData();
    
    // Auto-hide after 8 seconds
    setTimeout(() => {
      if (message.parentNode) {
        message.remove();
      }
    }, 8000);
  }
  
  showErrorMessage(errorText) {
    const message = document.createElement('div');
    message.className = 'form-error-message';
    message.innerHTML = `
      <div>
        <strong>Submission Failed</strong><br>
        ${errorText}
      </div>
    `;
    this.form.parentNode.insertBefore(message, this.form);
    
    // Auto-hide after 8 seconds
    setTimeout(() => {
      if (message.parentNode) {
        message.remove();
      }
    }, 8000);
  }
  
  setSubmitButtonState(isLoading) {
    const submitBtn = this.form.querySelector('button[type="submit"]');
    const btnText = submitBtn.querySelector('.btn-text');
    const btnLoading = submitBtn.querySelector('.btn-loading');
    
    if (isLoading) {
      btnText.style.display = 'none';
      btnLoading.style.display = 'flex';
      submitBtn.disabled = true;
    } else {
      btnText.style.display = 'inline';
      btnLoading.style.display = 'none';
      submitBtn.disabled = false;
    }
  }
  
  updateLanguageTexts() {
    if (!this.form || !window.i18n) return;
    
    // Update form labels
    const labelMappings = {
      'name': 'form.name',
      'email': 'form.email',
      'company': 'form.company',
      'phone': 'form.phone',
      'country': 'form.country',
      'message': 'form.message'
    };
    
    Object.entries(labelMappings).forEach(([fieldName, i18nKey]) => {
      const field = this.form.querySelector(`[name="${fieldName}"]`);
      if (field) {
        const label = this.form.querySelector(`label[for="${fieldName}"]`);
        if (label) {
          const isRequired = field.hasAttribute('required');
          const requiredMark = isRequired ? ' *' : '';
          label.textContent = window.i18n.t(i18nKey) + requiredMark;
        }
      }
    });
    
    // Update submit button text
    const submitBtn = this.form.querySelector('button[type="submit"] .btn-text');
    if (submitBtn) {
      submitBtn.textContent = window.i18n.t('form.submit');
    }
    
    // Update validation messages
    this.validationRules.name.message = window.i18n.t('validation.name-required');
    this.validationRules.email.message = window.i18n.t('validation.email-invalid');
    this.validationRules.message.message = window.i18n.t('validation.message-length');
    this.validationRules.privacy_consent.message = window.i18n.t('validation.privacy-required');
  }
}

/**
 * -----------------------------------------------------------------
 * 4. SMOOTH SCROLLING FOR ANCHOR LINKS
 * -----------------------------------------------------------------
 */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
            targetElement.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

/**
 * -----------------------------------------------------------------
 * 5. MOBILE NAVIGATION TOGGLE
 * -----------------------------------------------------------------
 */
const initializeMobileNav = () => {
    const navbarToggler = document.querySelector('.navbar-toggler');
    const navbarCollapse = document.querySelector('.navbar-collapse');

    if (navbarToggler && navbarCollapse) {
        navbarToggler.addEventListener('click', () => {
            navbarCollapse.classList.toggle('show');
            navbarToggler.classList.toggle('active');
        });
        
        // Close mobile menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!navbarToggler.contains(e.target) && !navbarCollapse.contains(e.target)) {
                navbarCollapse.classList.remove('show');
                navbarToggler.classList.remove('active');
            }
        });
        
        // Close mobile menu when clicking on a link
        navbarCollapse.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                navbarCollapse.classList.remove('show');
                navbarToggler.classList.remove('active');
            });
        });
    }
};

/**
 * -----------------------------------------------------------------
 * 6. LANGUAGE SWITCHER (Legacy compatibility)
 * -----------------------------------------------------------------
 */
const initializeLanguageSwitcher = () => {
    // This function is now handled by the i18n system
    // Keeping for backward compatibility
    console.log('Language switcher initialization delegated to i18n system');
};

const updateLanguageButton = (button, lang) => {
    // Legacy function - now handled by i18n system
    button.textContent = lang === 'en' ? 'EN/中' : '中/EN';
    button.setAttribute('data-lang', lang);
};

const applyLanguageChanges = (lang) => {
    // Legacy function - now handled by i18n system
    console.log(`Language switched to: ${lang} (legacy function)`);
    document.documentElement.lang = lang;
};

/**
 * -----------------------------------------------------------------
 * 7. SCROLL TO TOP BUTTON
 * -----------------------------------------------------------------
 */
const initializeScrollToTop = () => {
    // Create scroll to top button
    const scrollBtn = document.createElement('button');
    scrollBtn.className = 'scroll-to-top';
    scrollBtn.innerHTML = '↑';
    scrollBtn.setAttribute('aria-label', 'Scroll to top');
    scrollBtn.style.display = 'none';
    
    document.body.appendChild(scrollBtn);
    
    // Show/hide button based on scroll position
    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 300) {
            scrollBtn.style.display = 'block';
        } else {
            scrollBtn.style.display = 'none';
        }
    });
    
    // Scroll to top when clicked
    scrollBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
};
