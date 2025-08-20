# 🚀 Vercel部署指南 - LED Display Solutions

## 📋 部署步骤

### 1. 准备GitHub仓库

#### 方法一：使用自动化脚本
```bash
cd led-website
python deploy_git_vercel.py
```

#### 方法二：手动操作
```bash
# 初始化Git仓库
git init
git branch -M main

# 添加所有文件
git add .
git commit -m "🎉 Initial commit - LED Display Solutions"

# 添加GitHub远程仓库
git remote add origin https://github.com/yourusername/led-display-solutions.git
git push -u origin main
```

### 2. 部署到Vercel

#### 步骤1：访问Vercel
1. 打开 [https://vercel.com](https://vercel.com)
2. 使用GitHub账户登录

#### 步骤2：创建新项目
1. 点击 "New Project"
2. 选择刚才创建的GitHub仓库
3. 点击 "Import"

#### 步骤3：配置项目
Vercel会自动检测到Python项目，但需要配置环境变量：

**必需的环境变量：**
```
FLASK_ENV=production
SECRET_KEY=your-super-secret-key-here
PYTHONPATH=/var/task
```

**可选的环境变量：**
```
MAIL_SERVER=smtp.gmail.com
MAIL_PORT=587
MAIL_USE_TLS=True
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password
```

#### 步骤4：部署
1. 点击 "Deploy"
2. 等待构建完成（通常需要1-3分钟）
3. 获得生产环境URL

## 🔧 项目配置

### 文件结构
```
led-website/
├── api/
│   └── index.py          # Vercel入口文件
├── vercel.json           # Vercel配置
├── requirements.txt      # Python依赖
├── integrated_server.py  # 主应用文件
└── ...其他项目文件
```

### Vercel配置说明

**vercel.json** 配置了：
- Python运行时环境
- 路由规则
- 静态文件处理
- 安全头设置
- 缓存策略

**api/index.py** 是Vercel的入口点：
- 处理所有HTTP请求
- 初始化数据库
- 导出Flask应用实例

## 🌐 访问地址

部署成功后，你将获得以下访问地址：

### 主要页面
- **主页**: `https://your-app.vercel.app/`
- **产品页面**: `https://your-app.vercel.app/products.html`
- **联系页面**: `https://your-app.vercel.app/contact.html`

### 管理后台
- **管理仪表板**: `https://your-app.vercel.app/admin/templates/dashboard.html`
- **登录页面**: `https://your-app.vercel.app/admin/templates/login.html`
- **产品管理**: `https://your-app.vercel.app/admin/templates/products.html`
- **询盘管理**: `https://your-app.vercel.app/admin/templates/inquiries.html`

### 测试页面
- **综合测试**: `https://your-app.vercel.app/test-comprehensive.html`
- **移动端测试**: `https://your-app.vercel.app/test-mobile-complete.html`
- **安全测试**: `https://your-app.vercel.app/test-security-complete.html`
- **部署仪表板**: `https://your-app.vercel.app/test-deployment-dashboard.html`

## 🔐 默认登录信息

**管理员账户**
- 用户名: `admin`
- 密码: `admin123`

⚠️ **重要**: 部署到生产环境后，请立即更改默认密码！

## 🔄 自动部署

配置完成后，每次推送到GitHub的main分支都会自动触发Vercel部署：

```bash
# 更新代码
git add .
git commit -m "🚀 Update: your changes"
git push origin main
```

## 📊 监控和日志

### Vercel控制台
1. 访问 [https://vercel.com/dashboard](https://vercel.com/dashboard)
2. 选择你的项目
3. 查看部署状态、日志和分析

### 功能监控
- **部署状态**: 实时部署进度
- **函数日志**: Python应用日志
- **性能分析**: 响应时间和错误率
- **访问统计**: 流量和用户分析

## 🛠 故障排除

### 常见问题

#### 1. 部署失败
**问题**: 构建过程中出现错误
**解决方案**:
- 检查 `requirements.txt` 中的依赖版本
- 确保所有文件都已推送到GitHub
- 查看Vercel构建日志

#### 2. 数据库错误
**问题**: SQLite数据库相关错误
**解决方案**:
- Vercel是无服务器环境，数据库会在每次部署时重置
- 考虑使用外部数据库服务（如PlanetScale、Supabase）

#### 3. 静态文件404
**问题**: CSS、JS文件无法加载
**解决方案**:
- 检查 `vercel.json` 中的路由配置
- 确保文件路径正确

#### 4. 环境变量问题
**问题**: 应用无法读取环境变量
**解决方案**:
- 在Vercel控制台中检查环境变量设置
- 确保变量名称正确

### 调试技巧

1. **查看部署日志**
   - 在Vercel控制台的"Functions"标签页查看详细日志

2. **本地测试**
   ```bash
   # 设置生产环境变量
   export FLASK_ENV=production
   export SECRET_KEY=your-secret-key
   
   # 运行应用
   python integrated_server.py
   ```

3. **检查路由**
   - 确保所有路由都在 `vercel.json` 中正确配置

## 🔧 高级配置

### 自定义域名
1. 在Vercel控制台选择项目
2. 进入"Settings" > "Domains"
3. 添加自定义域名
4. 配置DNS记录

### 环境分离
```bash
# 创建不同环境的分支
git checkout -b staging
git push origin staging

# 在Vercel中为不同分支创建不同的部署
```

### 性能优化
- 启用Vercel的Edge Functions
- 配置CDN缓存策略
- 优化静态资源

## 📞 支持

如果遇到问题：
1. 查看Vercel官方文档: [https://vercel.com/docs](https://vercel.com/docs)
2. 检查项目的GitHub Issues
3. 联系技术支持

---

**🎉 恭喜！你的LED Display Solutions网站已成功部署到Vercel！**