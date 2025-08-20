# JavaScript功能说明

## 已实现的功能

### 1. 联系表单系统 (InquiryForm)
- **实时表单验证**: 用户输入时进行实时验证
- **AJAX提交**: 异步提交表单数据到服务器
- **错误处理**: 显示详细的验证错误和提交错误
- **成功反馈**: 提交成功后显示确认消息
- **支持字段**: 姓名、邮箱、公司、电话、消息

### 2. 产品对比系统 (ProductComparison)
- **产品选择**: 最多可选择3个产品进行对比
- **本地存储**: 对比选择会保存在浏览器本地存储中
- **对比界面**: 弹窗显示产品对比表格
- **状态管理**: 实时更新按钮状态和对比栏
- **数据获取**: 从服务器API获取产品详细信息

### 3. 图片懒加载 (lazyLoadImages)
- **性能优化**: 只在图片进入视口时才加载
- **加载动画**: 图片加载时显示渐变动画
- **错误处理**: 处理图片加载失败的情况
- **使用方法**: 给图片添加 `lazy` 类和 `data-src` 属性

### 4. 移动端导航增强 (initializeMobileNav)
- **汉堡菜单**: 移动端折叠菜单功能
- **动画效果**: 菜单图标变换动画
- **外部点击关闭**: 点击菜单外部自动关闭
- **链接点击关闭**: 点击导航链接后自动关闭菜单

### 5. 语言切换器 (initializeLanguageSwitcher)
- **双语支持**: 中英文切换功能
- **本地存储**: 记住用户的语言偏好
- **按钮状态**: 动态更新按钮显示文本
- **扩展性**: 为未来的多语言内容切换预留接口

### 6. 返回顶部按钮 (initializeScrollToTop)
- **智能显示**: 滚动超过300px时显示按钮
- **平滑滚动**: 点击后平滑滚动到页面顶部
- **固定定位**: 固定在页面右下角
- **响应式**: 移动端适配

## 使用方法

### 联系表单
```html
<form id="inquiry-form">
    <input type="text" name="name" required>
    <input type="email" name="email" required>
    <input type="text" name="company">
    <input type="tel" name="phone">
    <textarea name="message" required></textarea>
    <button type="submit">Submit</button>
</form>
```

### 产品对比按钮
```html
<button class="btn btn-compare" data-product-id="product-id">Add to Compare</button>
```

### 懒加载图片
```html
<img class="lazy" data-src="image-url.jpg" alt="Description">
```

### 语言切换按钮
```html
<button class="lang-switcher">EN/中</button>
```

## CSS类说明

- `.lazy`: 懒加载图片类
- `.btn-compare`: 产品对比按钮样式
- `.lang-switcher`: 语言切换按钮样式
- `.scroll-to-top`: 返回顶部按钮样式
- `.comparison-bar`: 产品对比底部栏样式
- `.form-message`: 表单消息样式
- `.toast-message`: 提示消息样式

## 测试页面

访问 `test-js.html` 可以测试所有JavaScript功能的工作状态。

## 浏览器兼容性

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## 依赖项

- 无外部JavaScript依赖
- 使用现代浏览器原生API (Intersection Observer, Fetch, LocalStorage)