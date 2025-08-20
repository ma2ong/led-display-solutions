/**
 * 增强的联系表单系统
 * Enhanced Contact Form System
 */

class EnhancedInquiryForm {
    constructor(formId = '#inquiry-form') {
        this.form = document.querySelector(formId);
        this.formData = {};
        this.isSubmitting = false;
        this.maxCharacters = 1000;
        this.autoSaveInterval = null;
        
        // 验证规则
        this.validationRules = {
            name: {
                pattern: /^.{2,50}$/,
                message: 'Name must be between 2 and 50 characters',
                required: true
            },
            email: {
                pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: 'Please enter a valid email address',
                required: true
            },
            phone: {
                pattern: /^[\+]?[(]?[0-9\s\-\(\)]{10,20}$/,
                message: 'Please enter a valid phone number',
                required: false
            },
            company: {
                pattern: /^.{0,100}$/,
                message: 'Company name must be less than 100 characters',
                required: false
            },
            message: {
                pattern: /^.{10,1000}$/,
                message: 'Message must be between 10 and 1000 characters',
                required: true
            },
            privacy_consent: {
                pattern: /^1$/,
                message: 'You must agree to the privacy policy to continue',
                required: true
            }
        };
        
        this.init();
    }
    
    init() {
        if (!this.form) {
            console.warn('Inquiry form not found on this page.');
            return;
        }
        
        this.setupEventListeners();
        this.setupRealTimeValidation();
        this.setupCharacterCount();
        this.setupAutoSave();
        this.loadSavedData();
        this.setupFormSecurity();
        
        console.log('Enhanced InquiryForm initialized successfully');
    }
    
    setupEventListeners() {
        // 表单提交事件
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        
        // 防止表单重复提交
        this.form.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && e.target.type !== 'textarea') {
                e.preventDefault();
            }
        });
        
        // 页面离开前的提醒
        window.addEventListener('beforeunload', (e) => {
            if (this.hasUnsavedChanges()) {
                e.preventDefault();
                e.returnValue = '';
            }
        });
    }
    
    setupRealTimeValidation() {
        const inputs = this.form.querySelectorAll('input, textarea, select');
        
        inputs.forEach(input => {
            // 失去焦点时验证
            input.addEventListener('blur', (e) => {
                this.validateField(e.target.name, e.target.value, true);
            });
            
            // 输入时清除错误并实时验证
            input.addEventListener('input', (e) => {
                this.clearError(e.target);
                
                // 延迟验证，避免过于频繁
                clearTimeout(this.validationTimeout);
                this.validationTimeout = setTimeout(() => {
                    this.validateField(e.target.name, e.target.value, false);
                }, 500);
                
                // 特殊处理
                if (e.target.name === 'message') {
                    this.updateCharacterCount(e.target);
                }
                
                if (e.target.name === 'email') {
                    this.checkEmailDomain(e.target.value);
                }
            });
            
            // 复选框特殊处理
            if (input.type === 'checkbox') {
                input.addEventListener('change', (e) => {
                    this.validateField(e.target.name, e.target.checked ? '1' : '0', true);
                });
            }
        });
    }
    
    setupCharacterCount() {
        const messageField = this.form.querySelector('[name=\"message\"]');
        if (messageField) {
            this.updateCharacterCount(messageField);
        }
    }
    
    setupAutoSave() {
        // 每30秒自动保存一次
        this.autoSaveInterval = setInterval(() => {
            this.saveFormData();
        }, 30000);
        
        // 输入时也保存
        const inputs = this.form.querySelectorAll('input, textarea, select');
        inputs.forEach(input => {
            input.addEventListener('input', () => {
                clearTimeout(this.autoSaveTimeout);
                this.autoSaveTimeout = setTimeout(() => {
                    this.saveFormData();
                }, 2000);
            });
        });
    }
    
    setupFormSecurity() {
        // 添加CSRF令牌（如果需要）
        this.addCSRFToken();
        
        // 添加蜜罐字段防止垃圾邮件
        this.addHoneypot();
        
        // 限制提交频率
        this.setupRateLimit();
    }
    
    addCSRFToken() {
        // 简单的时间戳令牌
        const token = btoa(Date.now().toString());
        const tokenField = document.createElement('input');
        tokenField.type = 'hidden';
        tokenField.name = 'csrf_token';
        tokenField.value = token;
        this.form.appendChild(tokenField);
    }
    
    addHoneypot() {
        const honeypot = document.createElement('input');
        honeypot.type = 'text';
        honeypot.name = 'website';
        honeypot.style.display = 'none';
        honeypot.tabIndex = -1;
        honeypot.autocomplete = 'off';
        this.form.appendChild(honeypot);
    }
    
    setupRateLimit() {
        const lastSubmit = localStorage.getItem('last_form_submit');
        if (lastSubmit) {
            const timeDiff = Date.now() - parseInt(lastSubmit);
            if (timeDiff < 60000) { // 1分钟内不能重复提交
                this.showMessage('Please wait before submitting another inquiry.', 'warning');
                this.disableSubmitButton(60 - Math.floor(timeDiff / 1000));
            }
        }
    }
    
    validateField(fieldName, value, showError = false) {
        const rule = this.validationRules[fieldName];
        if (!rule) return true;
        
        let isValid = true;
        let message = '';
        
        // 检查必填字段
        if (rule.required && (!value || value.trim() === '')) {
            isValid = false;
            message = `${this.getFieldLabel(fieldName)} is required`;
        }
        // 检查格式
        else if (value && value.trim() !== '' && !rule.pattern.test(value.trim())) {
            isValid = false;
            message = rule.message;
        }
        
        if (showError) {
            const field = this.form.querySelector(`[name=\"${fieldName}\"]`);
            if (field) {
                this.showFieldError(field, isValid ? '' : message);
            }
        }
        
        return isValid;
    }
    
    getFieldLabel(fieldName) {
        const field = this.form.querySelector(`[name=\"${fieldName}\"]`);
        const label = this.form.querySelector(`label[for=\"${fieldName}\"]`);
        return label ? label.textContent.replace('*', '').trim() : fieldName;
    }
    
    showFieldError(field, message) {
        this.clearError(field);
        
        if (message) {
            field.classList.add('error');
            field.setAttribute('aria-invalid', 'true');
            
            const errorDiv = document.createElement('div');
            errorDiv.className = 'field-error';
            errorDiv.textContent = message;
            errorDiv.setAttribute('role', 'alert');
            
            field.parentNode.appendChild(errorDiv);
            
            // 添加错误图标
            const errorIcon = document.createElement('span');
            errorIcon.className = 'error-icon';
            errorIcon.innerHTML = '⚠️';
            field.parentNode.appendChild(errorIcon);
        }
    }
    
    clearError(field) {
        field.classList.remove('error');
        field.removeAttribute('aria-invalid');
        
        const existingError = field.parentNode.querySelector('.field-error');
        if (existingError) {
            existingError.remove();
        }
        
        const existingIcon = field.parentNode.querySelector('.error-icon');
        if (existingIcon) {
            existingIcon.remove();
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
                messageField.classList.add('error');
            } else if (charCount > this.maxCharacters * 0.8) {
                parent.classList.add('warning');
            }
        }
    }
    
    checkEmailDomain(email) {
        if (!email || !email.includes('@')) return;
        
        const domain = email.split('@')[1];
        const commonDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com'];
        const businessDomains = ['company.com', 'business.com'];
        
        // 可以添加域名验证逻辑
        if (domain && !commonDomains.includes(domain.toLowerCase())) {
            // 这可能是商业邮箱，可以给予提示
            console.log('Business email detected:', domain);
        }
    }
    
    async handleSubmit(e) {
        e.preventDefault();
        
        if (this.isSubmitting) {
            return;
        }
        
        // 检查蜜罐字段
        const honeypot = this.form.querySelector('[name=\"website\"]');
        if (honeypot && honeypot.value) {
            console.warn('Spam detected');
            return;
        }
        
        this.isSubmitting = true;
        this.setSubmitButtonState(true);
        
        try {
            // 收集表单数据
            const formData = this.collectFormData();
            
            // 验证所有字段
            if (!this.validateAllFields(formData)) {
                throw new Error('Please correct the errors in the form before submitting.');
            }
            
            // 显示提交进度
            this.showSubmissionProgress();
            
            // 提交到服务器
            const response = await this.submitToServer(formData);
            
            if (response.success) {
                this.handleSubmissionSuccess(response);
            } else {
                throw new Error(response.error || 'Submission failed');
            }
            
        } catch (error) {
            this.handleSubmissionError(error);
        } finally {
            this.isSubmitting = false;
            this.setSubmitButtonState(false);
        }
    }
    
    collectFormData() {
        const formData = new FormData(this.form);
        const data = {};
        
        // 收集所有表单数据
        for (const [key, value] of formData.entries()) {
            data[key] = value;
        }
        
        // 处理复选框
        const checkboxes = this.form.querySelectorAll('input[type=\"checkbox\"]');
        checkboxes.forEach(checkbox => {
            if (!checkbox.checked) {
                data[checkbox.name] = '0';
            }
        });
        
        // 添加额外信息
        data.language = document.documentElement.lang || 'en';
        data.source = 'website';
        data.user_agent = navigator.userAgent;
        data.timestamp = new Date().toISOString();
        data.timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        data.screen_resolution = `${screen.width}x${screen.height}`;
        
        return data;
    }
    
    validateAllFields(data) {
        let allValid = true;
        
        // 验证所有必填字段
        Object.keys(this.validationRules).forEach(fieldName => {
            const value = data[fieldName] || '';
            if (!this.validateField(fieldName, value, true)) {
                allValid = false;
            }
        });
        
        return allValid;
    }
    
    showSubmissionProgress() {
        // 创建进度指示器
        const progressBar = document.createElement('div');
        progressBar.className = 'submission-progress';
        progressBar.innerHTML = `
            <div class=\"progress-bar\">
                <div class=\"progress-fill\"></div>
            </div>
            <div class=\"progress-text\">Submitting your inquiry...</div>
        `;
        
        this.form.appendChild(progressBar);
        
        // 模拟进度
        let progress = 0;
        const progressFill = progressBar.querySelector('.progress-fill');
        const progressInterval = setInterval(() => {
            progress += Math.random() * 20;
            if (progress > 90) progress = 90;
            progressFill.style.width = progress + '%';
        }, 200);
        
        // 保存引用以便后续清理
        this.progressInterval = progressInterval;
        this.progressBar = progressBar;
    }
    
    async submitToServer(data) {
        try {
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                },
                body: JSON.stringify(data)
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            return await response.json();
            
        } catch (error) {
            console.error('Submission error:', error);
            throw error;
        }
    }
    
    handleSubmissionSuccess(response) {
        // 清理进度指示器
        this.cleanupProgress();
        
        // 记录提交时间
        localStorage.setItem('last_form_submit', Date.now().toString());
        
        // 清除保存的表单数据
        this.clearSavedData();
        
        // 显示成功消息
        this.showSuccessMessage(response);
        
        // 重置表单
        this.form.reset();
        this.updateCharacterCount(this.form.querySelector('[name=\"message\"]'));
        
        // 发送成功事件
        this.dispatchEvent('formSubmissionSuccess', response);
        
        // 可选：跳转到感谢页面
        if (response.redirect_url) {
            setTimeout(() => {
                window.location.href = response.redirect_url;
            }, 3000);
        }
    }
    
    handleSubmissionError(error) {
        // 清理进度指示器
        this.cleanupProgress();
        
        // 显示错误消息
        this.showErrorMessage(error.message);
        
        // 发送错误事件
        this.dispatchEvent('formSubmissionError', { error: error.message });
        
        // 记录错误（用于分析）
        console.error('Form submission failed:', error);
    }
    
    cleanupProgress() {
        if (this.progressInterval) {
            clearInterval(this.progressInterval);
            this.progressInterval = null;
        }
        
        if (this.progressBar) {
            this.progressBar.remove();
            this.progressBar = null;
        }
    }
    
    showSuccessMessage(response) {
        const message = document.createElement('div');
        message.className = 'form-success-message';
        message.innerHTML = `
            <div class=\"success-icon\">✅</div>
            <div class=\"success-content\">
                <h3>Thank you for your inquiry!</h3>
                <p>${response.message || 'We have received your message and will respond within 24 hours.'}</p>
                ${response.inquiry_id ? `<p class=\"inquiry-id\">Reference ID: ${response.inquiry_id}</p>` : ''}
            </div>
        `;
        
        this.form.parentNode.insertBefore(message, this.form);
        
        // 滚动到成功消息
        message.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // 自动隐藏
        setTimeout(() => {
            if (message.parentNode) {
                message.remove();
            }
        }, 10000);
    }
    
    showErrorMessage(errorText) {
        const message = document.createElement('div');
        message.className = 'form-error-message';
        message.innerHTML = `
            <div class=\"error-icon\">❌</div>
            <div class=\"error-content\">
                <h3>Submission Failed</h3>
                <p>${errorText}</p>
                <p>Please try again or contact us directly if the problem persists.</p>
            </div>
        `;
        
        this.form.parentNode.insertBefore(message, this.form);
        
        // 滚动到错误消息
        message.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // 自动隐藏
        setTimeout(() => {
            if (message.parentNode) {
                message.remove();
            }
        }, 8000);
    }
    
    setSubmitButtonState(isLoading) {
        const submitBtn = this.form.querySelector('button[type=\"submit\"]');
        const btnText = submitBtn.querySelector('.btn-text');
        const btnLoading = submitBtn.querySelector('.btn-loading');
        
        if (isLoading) {
            btnText.style.display = 'none';
            btnLoading.style.display = 'flex';
            submitBtn.disabled = true;
            submitBtn.classList.add('loading');
        } else {
            btnText.style.display = 'inline';
            btnLoading.style.display = 'none';
            submitBtn.disabled = false;
            submitBtn.classList.remove('loading');
        }
    }
    
    disableSubmitButton(seconds) {
        const submitBtn = this.form.querySelector('button[type=\"submit\"]');
        const originalText = submitBtn.querySelector('.btn-text').textContent;
        
        submitBtn.disabled = true;
        
        const countdown = setInterval(() => {
            submitBtn.querySelector('.btn-text').textContent = `Please wait ${seconds}s`;
            seconds--;
            
            if (seconds <= 0) {
                clearInterval(countdown);
                submitBtn.disabled = false;
                submitBtn.querySelector('.btn-text').textContent = originalText;
            }
        }, 1000);
    }
    
    saveFormData() {
        try {
            const formData = new FormData(this.form);
            const data = {};
            
            for (const [key, value] of formData.entries()) {
                data[key] = value;
            }
            
            // 处理复选框
            const checkboxes = this.form.querySelectorAll('input[type=\"checkbox\"]');
            checkboxes.forEach(checkbox => {
                data[checkbox.name] = checkbox.checked ? '1' : '0';
            });
            
            localStorage.setItem('inquiry_form_data', JSON.stringify(data));
            console.log('Form data auto-saved');
        } catch (error) {
            console.warn('Failed to save form data:', error);
        }
    }
    
    loadSavedData() {
        try {
            const savedData = localStorage.getItem('inquiry_form_data');
            if (savedData) {
                const data = JSON.parse(savedData);
                
                // 填充表单字段
                Object.keys(data).forEach(key => {
                    const field = this.form.querySelector(`[name=\"${key}\"]`);
                    if (field) {
                        if (field.type === 'checkbox') {
                            field.checked = data[key] === '1';
                        } else {
                            field.value = data[key];
                        }
                    }
                });
                
                // 更新字符计数
                const messageField = this.form.querySelector('[name=\"message\"]');
                if (messageField && messageField.value) {
                    this.updateCharacterCount(messageField);
                }
                
                console.log('Form data loaded from storage');
            }
        } catch (error) {
            console.warn('Failed to load saved form data:', error);
        }
    }
    
    clearSavedData() {
        try {
            localStorage.removeItem('inquiry_form_data');
        } catch (error) {
            console.warn('Failed to clear saved form data:', error);
        }
    }
    
    hasUnsavedChanges() {
        const currentData = this.collectFormData();
        const savedData = localStorage.getItem('inquiry_form_data');
        
        if (!savedData) return false;
        
        try {
            const saved = JSON.parse(savedData);
            return JSON.stringify(currentData) !== JSON.stringify(saved);
        } catch {
            return false;
        }
    }
    
    dispatchEvent(eventName, detail) {
        const event = new CustomEvent(eventName, {
            detail: detail,
            bubbles: true,
            cancelable: true
        });
        this.form.dispatchEvent(event);
    }
    
    updateLanguageTexts() {
        if (!this.form || !window.i18n) return;
        
        // 更新验证消息
        if (window.i18n.getCurrentLanguage() === 'zh') {
            this.validationRules.name.message = '姓名必须在2到50个字符之间';
            this.validationRules.email.message = '请输入有效的邮箱地址';
            this.validationRules.phone.message = '请输入有效的电话号码';
            this.validationRules.company.message = '公司名称必须少于100个字符';
            this.validationRules.message.message = '留言必须在10到1000个字符之间';
            this.validationRules.privacy_consent.message = '您必须同意隐私政策才能继续';
        } else {
            this.validationRules.name.message = 'Name must be between 2 and 50 characters';
            this.validationRules.email.message = 'Please enter a valid email address';
            this.validationRules.phone.message = 'Please enter a valid phone number';
            this.validationRules.company.message = 'Company name must be less than 100 characters';
            this.validationRules.message.message = 'Message must be between 10 and 1000 characters';
            this.validationRules.privacy_consent.message = 'You must agree to the privacy policy to continue';
        }
    }
    
    destroy() {
        // 清理定时器
        if (this.autoSaveInterval) {
            clearInterval(this.autoSaveInterval);
        }
        
        if (this.autoSaveTimeout) {
            clearTimeout(this.autoSaveTimeout);
        }
        
        if (this.validationTimeout) {
            clearTimeout(this.validationTimeout);
        }
        
        // 清理进度指示器
        this.cleanupProgress();
        
        console.log('EnhancedInquiryForm destroyed');
    }
}

// 全局实例
window.enhancedInquiryForm = null;

// 初始化函数
function initializeEnhancedForm() {
    if (!window.enhancedInquiryForm) {
        window.enhancedInquiryForm = new EnhancedInquiryForm();
    }
    return window.enhancedInquiryForm;
}

// 导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { EnhancedInquiryForm, initializeEnhancedForm };
}