#!/usr/bin/env python3
"""
LED Display Solutions - 自动化部署脚本
支持多种云平台的一键部署
"""

import os
import sys
import subprocess
import json
import secrets
from pathlib import Path

class WebDeployer:
    def __init__(self):
        self.project_name = "led-display-solutions"
        self.project_dir = Path(__file__).parent
        
    def create_deployment_files(self):
        """创建部署所需的文件"""
        print("📁 创建部署文件...")
        
        # 创建requirements.txt
        requirements = """Flask==2.3.3
Flask-CORS==4.0.0
Flask-Login==0.6.3
Werkzeug==2.3.7
python-dotenv==1.0.0
gunicorn==21.2.0"""
        
        with open(self.project_dir / "requirements.txt", "w") as f:
            f.write(requirements)
        
        # 创建Procfile (Heroku)
        procfile = "web: gunicorn integrated_server:app"
        with open(self.project_dir / "Procfile", "w") as f:
            f.write(procfile)
        
        # 创建runtime.txt (Heroku)
        runtime = "python-3.11.5"
        with open(self.project_dir / "runtime.txt", "w") as f:
            f.write(runtime)
        
        # 创建.env模板
        env_template = f"""# 生产环境配置
FLASK_ENV=production
SECRET_KEY={secrets.token_hex(32)}
DATABASE_URL=sqlite:///production.db

# 邮件配置
MAIL_SERVER=smtp.gmail.com
MAIL_PORT=587
MAIL_USE_TLS=True
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password

# 安全配置
CSRF_ENABLED=True
RATE_LIMIT_ENABLED=True
XSS_PROTECTION_ENABLED=True"""
        
        with open(self.project_dir / ".env.example", "w") as f:
            f.write(env_template)
        
        print("✅ 部署文件创建完成")
    
    def deploy_to_heroku(self):
        """部署到Heroku"""
        print("🚀 开始部署到Heroku...")
        
        # 检查Heroku CLI
        try:
            subprocess.run(["heroku", "--version"], check=True, capture_output=True)
        except (subprocess.CalledProcessError, FileNotFoundError):
            print("❌ 请先安装Heroku CLI: https://devcenter.heroku.com/articles/heroku-cli")
            return False
        
        # 检查登录状态
        try:
            result = subprocess.run(["heroku", "auth:whoami"], check=True, capture_output=True, text=True)
            print(f"👤 已登录用户: {result.stdout.strip()}")
        except subprocess.CalledProcessError:
            print("🔐 请先登录Heroku...")
            subprocess.run(["heroku", "login"])
        
        # 获取应用名称
        app_name = input(f"输入Heroku应用名称 (默认: {self.project_name}): ").strip()
        if not app_name:
            app_name = self.project_name
        
        try:
            # 创建Heroku应用
            print(f"📱 创建Heroku应用: {app_name}")
            subprocess.run(["heroku", "create", app_name], check=True)
            
            # 设置环境变量
            print("⚙️ 设置环境变量...")
            env_vars = {
                "FLASK_ENV": "production",
                "SECRET_KEY": secrets.token_hex(32),
                "PYTHONPATH": "/app"
            }
            
            for key, value in env_vars.items():
                subprocess.run(["heroku", "config:set", f"{key}={value}", "--app", app_name], check=True)
            
            # 初始化Git仓库
            if not (self.project_dir / ".git").exists():
                print("📦 初始化Git仓库...")
                subprocess.run(["git", "init"], cwd=self.project_dir, check=True)
                subprocess.run(["git", "add", "."], cwd=self.project_dir, check=True)
                subprocess.run(["git", "commit", "-m", "Initial commit"], cwd=self.project_dir, check=True)
            
            # 添加Heroku远程仓库
            subprocess.run(["heroku", "git:remote", "-a", app_name], cwd=self.project_dir, check=True)
            
            # 部署到Heroku
            print("🚀 部署到Heroku...")
            subprocess.run(["git", "push", "heroku", "main"], cwd=self.project_dir, check=True)
            
            # 打开应用
            print("✅ 部署成功!")
            print(f"🌐 应用地址: https://{app_name}.herokuapp.com")
            print(f"🔧 管理后台: https://{app_name}.herokuapp.com/admin/templates/dashboard.html")
            
            # 询问是否打开浏览器
            if input("是否打开浏览器查看应用? (y/N): ").lower() == 'y':
                subprocess.run(["heroku", "open", "--app", app_name])
            
            return True
            
        except subprocess.CalledProcessError as e:
            print(f"❌ 部署失败: {e}")
            return False
    
    def deploy_to_railway(self):
        """部署到Railway"""
        print("🚂 开始部署到Railway...")
        
        # 检查Railway CLI
        try:
            subprocess.run(["railway", "--version"], check=True, capture_output=True)
        except (subprocess.CalledProcessError, FileNotFoundError):
            print("❌ 请先安装Railway CLI: npm install -g @railway/cli")
            return False
        
        try:
            # 登录Railway
            subprocess.run(["railway", "login"], check=True)
            
            # 初始化项目
            subprocess.run(["railway", "init"], cwd=self.project_dir, check=True)
            
            # 设置环境变量
            print("⚙️ 设置环境变量...")
            subprocess.run(["railway", "variables", "set", f"FLASK_ENV=production"], cwd=self.project_dir, check=True)
            subprocess.run(["railway", "variables", "set", f"SECRET_KEY={secrets.token_hex(32)}"], cwd=self.project_dir, check=True)
            
            # 部署
            print("🚀 部署到Railway...")
            subprocess.run(["railway", "up"], cwd=self.project_dir, check=True)
            
            print("✅ 部署成功!")
            return True
            
        except subprocess.CalledProcessError as e:
            print(f"❌ 部署失败: {e}")
            return False
    
    def deploy_to_render(self):
        """部署到Render (需要手动配置)"""
        print("🎨 Render部署指南:")
        print("1. 访问 https://render.com")
        print("2. 连接你的GitHub仓库")
        print("3. 选择 'Web Service'")
        print("4. 配置以下设置:")
        print("   - Build Command: pip install -r requirements.txt")
        print("   - Start Command: python integrated_server.py")
        print("   - Environment: Python 3")
        print("5. 添加环境变量:")
        print(f"   - FLASK_ENV=production")
        print(f"   - SECRET_KEY={secrets.token_hex(32)}")
        print("6. 点击 'Create Web Service'")
        
        # 创建render.yaml配置文件
        render_config = {
            "services": [
                {
                    "type": "web",
                    "name": self.project_name,
                    "env": "python",
                    "buildCommand": "pip install -r requirements.txt",
                    "startCommand": "python integrated_server.py",
                    "envVars": [
                        {"key": "FLASK_ENV", "value": "production"},
                        {"key": "SECRET_KEY", "generateValue": True}
                    ]
                }
            ]
        }
        
        with open(self.project_dir / "render.yaml", "w") as f:
            json.dump(render_config, f, indent=2)
        
        print("📁 已创建 render.yaml 配置文件")
    
    def create_docker_files(self):
        """创建Docker部署文件"""
        print("🐳 创建Docker配置文件...")
        
        # Dockerfile
        dockerfile = """FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["python", "integrated_server.py"]"""
        
        with open(self.project_dir / "Dockerfile", "w") as f:
            f.write(dockerfile)
        
        # docker-compose.yml
        docker_compose = """version: '3.8'

services:
  web:
    build: .
    ports:
      - "8000:8000"
    environment:
      - FLASK_ENV=production
      - SECRET_KEY=your-secret-key-here
    volumes:
      - ./data:/app/data
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - web
    restart: unless-stopped"""
        
        with open(self.project_dir / "docker-compose.yml", "w") as f:
            f.write(docker_compose)
        
        # .dockerignore
        dockerignore = """__pycache__
*.pyc
*.pyo
*.pyd
.Python
env
pip-log.txt
pip-delete-this-directory.txt
.tox
.coverage
.coverage.*
.cache
nosetests.xml
coverage.xml
*.cover
*.log
.git
.mypy_cache
.pytest_cache
.hypothesis
.DS_Store
.env
.venv
venv/
.venv/"""
        
        with open(self.project_dir / ".dockerignore", "w") as f:
            f.write(dockerignore)
        
        print("✅ Docker配置文件创建完成")
        print("🚀 使用以下命令启动:")
        print("   docker-compose up -d")
    
    def show_deployment_options(self):
        """显示部署选项"""
        print("🌐 LED Display Solutions - 部署选项")
        print("=" * 50)
        print("1. 🆓 Heroku (免费/付费)")
        print("2. 🚂 Railway (免费/付费)")
        print("3. 🎨 Render (免费/付费)")
        print("4. 🐳 Docker (自托管)")
        print("5. 📋 查看完整部署指南")
        print("6. 🔧 仅创建部署文件")
        print("0. ❌ 退出")
        print("=" * 50)
    
    def run(self):
        """运行部署器"""
        print("🚀 LED Display Solutions - 自动化部署工具")
        print("=" * 50)
        
        # 创建基础部署文件
        self.create_deployment_files()
        
        while True:
            self.show_deployment_options()
            choice = input("请选择部署选项 (0-6): ").strip()
            
            if choice == "1":
                self.deploy_to_heroku()
                break
            elif choice == "2":
                self.deploy_to_railway()
                break
            elif choice == "3":
                self.deploy_to_render()
                break
            elif choice == "4":
                self.create_docker_files()
                break
            elif choice == "5":
                print("📖 请查看 DEPLOYMENT_GUIDE.md 文件获取完整部署指南")
                break
            elif choice == "6":
                print("✅ 部署文件已创建完成")
                break
            elif choice == "0":
                print("👋 再见!")
                break
            else:
                print("❌ 无效选项，请重新选择")

if __name__ == "__main__":
    deployer = WebDeployer()
    deployer.run()