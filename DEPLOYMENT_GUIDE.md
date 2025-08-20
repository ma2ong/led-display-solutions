# 🚀 LED Display Solutions - 部署指南

## 📋 部署选项

### 1. 🆓 免费部署选项

#### A. Heroku (推荐)
```bash
# 1. 安装Heroku CLI
# 2. 登录Heroku
heroku login

# 3. 创建应用
heroku create led-display-solutions

# 4. 设置环境变量
heroku config:set FLASK_ENV=production
heroku config:set SECRET_KEY=your-secret-key-here

# 5. 部署
git add .
git commit -m "Deploy to Heroku"
git push heroku main
```

#### B. Railway
```bash
# 1. 安装Railway CLI
npm install -g @railway/cli

# 2. 登录Railway
railway login

# 3. 初始化项目
railway init

# 4. 部署
railway up
```

#### C. Render
1. 连接GitHub仓库
2. 选择Python环境
3. 设置启动命令: `python integrated_server.py`
4. 设置环境变量

#### D. PythonAnywhere
1. 上传文件到PythonAnywhere
2. 创建Web应用
3. 配置WSGI文件
4. 设置静态文件路径

### 2. 💰 付费部署选项

#### A. AWS (Amazon Web Services)
- EC2 + RDS
- Elastic Beanstalk
- Lambda + API Gateway

#### B. Google Cloud Platform
- App Engine
- Compute Engine
- Cloud Run

#### C. DigitalOcean
- Droplets
- App Platform

#### D. 阿里云/腾讯云
- ECS服务器
- 轻量应用服务器

## 🔧 部署前准备

### 1. 环境配置文件

创建 `requirements.txt`:
```
Flask==2.3.3
Flask-CORS==4.0.0
Flask-Login==0.6.3
Werkzeug==2.3.7
```

创建 `Procfile` (Heroku):
```
web: python integrated_server.py
```

创建 `runtime.txt` (Heroku):
```
python-3.11.5
```

### 2. 环境变量设置
```bash
export FLASK_ENV=production
export SECRET_KEY=your-super-secret-key
export DATABASE_URL=sqlite:///production.db
```

## 🚀 一键部署脚本

### Heroku部署脚本
```bash
#!/bin/bash
echo "🚀 开始部署到Heroku..."

# 检查Heroku CLI
if ! command -v heroku &> /dev/null; then
    echo "❌ 请先安装Heroku CLI"
    exit 1
fi

# 登录检查
heroku auth:whoami || heroku login

# 创建应用
read -p "输入应用名称: " app_name
heroku create $app_name

# 设置环境变量
heroku config:set FLASK_ENV=production --app $app_name
heroku config:set SECRET_KEY=$(python -c 'import secrets; print(secrets.token_hex(16))') --app $app_name

# 部署
git add .
git commit -m "Deploy to Heroku"
git push heroku main

echo "✅ 部署完成!"
echo "🌐 访问地址: https://$app_name.herokuapp.com"
```

## 📁 部署文件结构

```
led-website/
├── integrated_server.py          # 主服务器文件
├── database_manager.py           # 数据库管理
├── email_templates.py           # 邮件模板
├── requirements.txt             # Python依赖
├── Procfile                    # Heroku配置
├── runtime.txt                 # Python版本
├── .env                       # 环境变量
├── static/                    # 静态文件
├── templates/                 # 模板文件
└── admin/                     # 管理后台
```

## 🔒 生产环境安全配置

### 1. 环境变量
```python
import os
from dotenv import load_dotenv

load_dotenv()

SECRET_KEY = os.environ.get('SECRET_KEY')
DATABASE_URL = os.environ.get('DATABASE_URL')
MAIL_SERVER = os.environ.get('MAIL_SERVER')
MAIL_USERNAME = os.environ.get('MAIL_USERNAME')
MAIL_PASSWORD = os.environ.get('MAIL_PASSWORD')
```

### 2. 数据库配置
```python
if os.environ.get('DATABASE_URL'):
    # 生产环境使用PostgreSQL
    app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL')
else:
    # 开发环境使用SQLite
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///database.db'
```

### 3. 安全头设置
```python
@app.after_request
def after_request(response):
    response.headers['X-Content-Type-Options'] = 'nosniff'
    response.headers['X-Frame-Options'] = 'DENY'
    response.headers['X-XSS-Protection'] = '1; mode=block'
    return response
```

## 🌍 域名和SSL配置

### 1. 自定义域名
```bash
# Heroku添加域名
heroku domains:add www.leddisplaysolutions.com --app your-app-name

# 配置DNS记录
# CNAME: www -> your-app-name.herokuapp.com
```

### 2. SSL证书
```bash
# Heroku自动SSL
heroku certs:auto:enable --app your-app-name
```

## 📊 监控和日志

### 1. 应用监控
```bash
# 查看日志
heroku logs --tail --app your-app-name

# 查看应用状态
heroku ps --app your-app-name
```

### 2. 性能监控
- 使用New Relic或Datadog
- 设置错误追踪
- 配置性能警报

## 🔄 CI/CD自动部署

### GitHub Actions配置
```yaml
name: Deploy to Heroku

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    - uses: akhileshns/heroku-deploy@v3.12.12
      with:
        heroku_api_key: ${{secrets.HEROKU_API_KEY}}
        heroku_app_name: "your-app-name"
        heroku_email: "your-email@example.com"
```

## 🎯 部署检查清单

- [ ] 环境变量配置完成
- [ ] 数据库连接测试通过
- [ ] 静态文件路径正确
- [ ] 邮件服务配置完成
- [ ] SSL证书安装完成
- [ ] 域名解析配置完成
- [ ] 监控和日志配置完成
- [ ] 备份策略制定完成
- [ ] 性能测试通过
- [ ] 安全扫描通过

## 🆘 常见问题解决

### 1. 数据库连接问题
```python
# 检查数据库连接
try:
    db = get_db()
    print("✅ 数据库连接成功")
except Exception as e:
    print(f"❌ 数据库连接失败: {e}")
```

### 2. 静态文件404
```python
# 确保静态文件路径正确
app = Flask(__name__, static_folder='static', static_url_path='/static')
```

### 3. 内存不足
```bash
# Heroku增加内存
heroku ps:scale web=1:standard-1x --app your-app-name
```

## 📞 技术支持

如果在部署过程中遇到问题，可以：

1. 查看部署日志
2. 检查环境变量配置
3. 验证数据库连接
4. 测试API端点
5. 联系技术支持

---

**部署成功后，你的LED Display Solutions网站将在线运行！** 🎉