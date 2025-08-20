# 多语言国际化系统使用指南
# I18n System Usage Guide

## 概述 / Overview

本系统为LED网站提供了完整的中英文双语支持，包括自动语言检测、本地存储偏好设置和动态内容翻译。

This system provides complete Chinese-English bilingual support for the LED website, including automatic language detection, local storage preferences, and dynamic content translation.

## 功能特性 / Features

### 1. 自动语言检测 / Automatic Language Detection
- 检测浏览器语言设置
- 支持中文（zh）和英文（en）
- 默认回退到英文

### 2. 语言偏好存储 / Language Preference Storage
- 使用localStorage保存用户语言偏好
- 页面刷新后保持语言设置
- 跨页面语言一致性

### 3. 动态内容翻译 / Dynamic Content Translation
- 使用`data-i18n`属性标记可翻译元素
- 实时切换页面内容语言
- 支持属性翻译（如placeholder、title等）

### 4. 语言切换器 / Language Switcher
- 所有页面统一的语言切换按钮
- 点击切换中英文
- 视觉反馈和状态指示

## 使用方法 / Usage

### 1. 基本HTML标记 / Basic HTML Markup

为需要翻译的元素添加`data-i18n`属性：

```html
<!-- 导航菜单 -->
<a href="index.html" data-i18n="nav.home">Home</a>
<a href="about.html" data-i18n="nav.about">About Us</a>

<!-- 按钮 -->
<button data-i18n="btn.learn-more">Learn More</button>

<!-- 表单标签 -->
<label for="name" data-i18n="form.name">Your Name</label>

<!-- 公司信息 -->
<span data-i18n="company.name">Shenzhen Lianjin Optoelectronics Co., Ltd.</span>
```

### 2. 属性翻译 / Attribute Translation

对于需要翻译属性的元素，使用`data-i18n-attr`：

```html
<input type="text" 
       data-i18n="form.name" 
       data-i18n-attr="placeholder" 
       placeholder="Your Name">
```

### 3. JavaScript API

#### 获取翻译文本 / Get Translation Text
```javascript
// 使用全局函数
const text = t('nav.home');

// 使用i18n实例
const text = window.i18n.t('nav.home');

// 带参数的翻译
const text = window.i18n.t('welcome.message', { name: 'John' });
```

#### 切换语言 / Switch Language
```javascript
// 切换语言
window.i18n.toggleLanguage();

// 设置特定语言
window.i18n.setLanguage('zh');
window.i18n.setLanguage('en');

// 获取当前语言
const currentLang = window.i18n.getCurrentLanguage();
```

#### 监听语言变更事件 / Listen to Language Change Events
```javascript
document.addEventListener('languageChanged', (event) => {
    const { language, translations } = event.detail;
    console.log(`Language changed to: ${language}`);
    
    // 更新自定义组件的语言
    updateCustomComponentLanguage(language);
});
```

## 翻译键值对照表 / Translation Key Reference

### 导航菜单 / Navigation
- `nav.home` - 首页 / Home
- `nav.about` - 关于我们 / About Us
- `nav.products` - 产品中心 / Products
- `nav.solutions` - 解决方案 / Solutions
- `nav.cases` - 案例展示 / Cases
- `nav.news` - 新闻资讯 / News
- `nav.support` - 技术支持 / Support
- `nav.contact` - 联系我们 / Contact

### 产品类别 / Product Categories
- `products.fine-pitch` - 小间距LED显示屏 / Fine Pitch LED
- `products.outdoor` - 户外LED显示屏 / Outdoor LED
- `products.rental` - 租赁LED显示屏 / Rental LED
- `products.creative` - 创意LED显示屏 / Creative LED
- `products.transparent` - 透明LED显示屏 / Transparent LED

### 通用按钮 / Common Buttons
- `btn.learn-more` - 了解更多 / Learn More
- `btn.get-quote` - 获取报价 / Get a Quote
- `btn.contact-us` - 联系我们 / Contact Us
- `btn.inquire-now` - 立即询价 / Inquire Now
- `btn.view-details` - 查看详情 / View Details

### 表单标签 / Form Labels
- `form.name` - 您的姓名 / Your Name
- `form.email` - 邮箱地址 / Email Address
- `form.company` - 公司名称 / Company Name
- `form.phone` - 联系电话 / Phone Number
- `form.message` - 您的留言 / Your Message
- `form.submit` - 提交询盘 / Submit Inquiry

## 添加新翻译 / Adding New Translations

### 1. 修改翻译资源 / Modify Translation Resources

在`js/i18n.js`文件中的`loadTranslations()`方法中添加新的翻译键值对：

```javascript
// 英文翻译
this.translations.en = {
    // 现有翻译...
    'new.key': 'New English Text',
    // ...
};

// 中文翻译
this.translations.zh = {
    // 现有翻译...
    'new.key': '新的中文文本',
    // ...
};
```

### 2. 在HTML中使用 / Use in HTML

```html
<span data-i18n="new.key">New English Text</span>
```

## 测试 / Testing

### 测试页面 / Test Page
访问`test-i18n.html`页面进行功能测试：
- 语言切换功能
- 翻译内容显示
- 本地存储功能
- 事件监听功能

### 浏览器控制台 / Browser Console
打开浏览器开发者工具查看：
- i18n系统初始化日志
- 语言切换事件日志
- 翻译加载状态

## 性能优化 / Performance Optimization

### 1. 延迟加载 / Lazy Loading
- 翻译资源内置在JavaScript中，无需额外HTTP请求
- 支持动态加载外部翻译文件（预留接口）

### 2. 缓存策略 / Caching Strategy
- 语言偏好保存在localStorage中
- 避免重复的DOM查询和更新

### 3. 最小化重绘 / Minimize Reflow
- 使用CSS过渡效果平滑切换
- 批量更新DOM元素

## 扩展功能 / Extended Features

### 1. 支持更多语言 / Support More Languages
在`detectLanguage()`和`loadTranslations()`方法中添加新语言支持。

### 2. 服务器端翻译 / Server-side Translation
使用`loadTranslationFile()`方法从服务器动态加载翻译资源。

### 3. 翻译管理界面 / Translation Management Interface
可以开发管理界面来编辑和管理翻译内容。

## 故障排除 / Troubleshooting

### 常见问题 / Common Issues

1. **翻译不显示**
   - 检查`data-i18n`属性是否正确
   - 确认翻译键在资源文件中存在
   - 查看浏览器控制台错误信息

2. **语言切换不工作**
   - 确认i18n.js文件已正确加载
   - 检查语言切换按钮的class是否为`lang-switcher`
   - 查看控制台是否有JavaScript错误

3. **语言偏好不保存**
   - 检查浏览器是否支持localStorage
   - 确认没有隐私模式限制

### 调试方法 / Debugging Methods

```javascript
// 检查i18n系统状态
console.log('I18n initialized:', !!window.i18n);
console.log('Current language:', window.i18n?.getCurrentLanguage());
console.log('Available translations:', Object.keys(window.i18n?.translations || {}));

// 测试翻译功能
console.log('Translation test:', window.i18n?.t('nav.home'));
```

## 更新日志 / Changelog

### v1.0.0 (2024-08-11)
- 初始版本发布
- 支持中英文双语切换
- 完整的翻译资源库
- 自动语言检测和本地存储
- 与现有系统的完整集成

---

如有问题或建议，请联系开发团队。
For questions or suggestions, please contact the development team.