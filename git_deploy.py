#!/usr/bin/env python3
"""
LED Display Solutions - Git & Vercel 自动化部署脚本
一键推送到GitHub并部署到Vercel
"""

import os
import sys
import subprocess
import json
import secrets
from pathlib import Path
from datetime import datetime

class GitVercelDeployer:
    def __init__(self):
        self.project_dir = Path(__file__).parent
        self.project_name = "led-display-solutions"
        
    def check_git_status(self):
        """检查Git状态"""
        try:
            # 检查是否在Git仓库中
            result = subprocess.run(['git', 'status'], 
                                  cwd=self.project_dir, 
                                  capture_output=True, 
                                  text=True)
            return result.returncode == 0
        except FileNotFoundError:
            print("❌ Git未安装，请先安装Git")
            return False
    
    def init_git_repo(self):
        """初始化Git仓库"""
        try:
            print("📦 初始化Git仓库...")
            
            # 初始化Git仓库
            subprocess.run(['git', 'init'], cwd=self.project_dir, check=True)
            
            # 设置默认分支为main
            subprocess.run(['git', 'branch', '-M', 'main'], cwd=self.project_dir, check=True)
            
            # 添加所有文件
            subprocess.run(['git', 'add', '.'], cwd=self.project_dir, check=True)
            
            # 初始提交
            commit_message = f"🎉 Initial commit - LED Display Solutions v1.0"
            subprocess.run(['git', 'commit', '-m', commit_message], 
                         cwd=self.project_dir, check=True)
            
            print("✅ Git仓库初始化完成")
            return True
            
        except subprocess.CalledProcessError as e:
            print(f"❌ Git初始化失败: {e}")
            return False
    
    def setup_github_remote(self):
        """设置GitHub远程仓库"""
        print("\n🔗 设置GitHub远程仓库")
        print("请按照以下步骤操作:")
        print("1. 访问 https://github.com/new")
        print("2. 创建新仓库，名称建议: led-display-solutions")
        print("3. 不要初始化README、.gitignore或LICENSE")
        print("4. 创建后复制仓库URL")
        
        repo_url = input("\n请输入GitHub仓库URL (https://github.com/username/repo.git): ").strip()
        
        if not repo_url:
            print("❌ 未提供仓库URL")
            return False
        
        try:
            # 添加远程仓库
            subprocess.run(['git', 'remote', 'add', 'origin', repo_url], 
                         cwd=self.project_dir, check=True)
            
            print("✅ GitHub远程仓库设置完成")
            return True
            
        except subprocess.CalledProcessError as e:
            print(f"❌ 远程仓库设置失败: {e}")
            return False
    
    def push_to_github(self):
        """推送到GitHub"""
        try:
            print("🚀 推送到GitHub...")
            
            # 推送到GitHub
            subprocess.run(['git', 'push', '-u', 'origin', 'main'], 
                         cwd=self.project_dir, check=True)
            
            print("✅ 成功推送到GitHub")
            return True
            
        except subprocess.CalledProcessError as e:
            print(f"❌ 推送失败: {e}")
            print("💡 提示: 请确保已配置GitHub认证 (SSH密钥或Personal Access Token)")
            return False
    
    def create_vercel_config(self):
        """创建Vercel配置"""
        print("⚙️ 优化Vercel配置...")
        
        # 更新vercel.json以支持Python Flask应用
        vercel_config = {
            "version": 2,
            "name": self.project_name,
            "builds": [
                {
                    "src": "integrated_server.py",
                    "use": "@vercel/python"
                }
            ],
            "routes": [
                {
                    "src": "/api/(.*)",
                    "dest": "integrated_server.py"
                },
                {
                    "src": "/admin/(.*)",
                    "dest": "integrated_server.py"
                },
                {
                    "src": "/(.*\\.(js|css|html|png|jpg|jpeg|gif|svg|ico|pdf|txt|json))",
                    "dest": "/$1"
                },
                {
                    "src": "/(.*)",
                    "dest": "integrated_server.py"
                }
            ],
            "env": {
                "FLASK_ENV": "production",
                "SECRET_KEY": "@secret_key",
                "PYTHONPATH": "/var/task"
            },
            "functions": {
                "integrated_server.py": {
                    "maxDuration": 30
                }
            }
        }
        
        with open(self.project_dir / "vercel.json", "w") as f:
            json.dump(vercel_config, f, indent=2)
        
        print("✅ Vercel配置已优化")
    
    def setup_vercel_deployment(self):
        """设置Vercel部署"""
        print("\n🌐 Vercel部署设置")
        print("请按照以下步骤操作:")
        print("1. 访问 https://vercel.com")
        print("2. 使用GitHub账户登录")
        print("3. 点击 'New Project'")
        print("4. 导入刚才创建的GitHub仓库")
        print("5. Vercel会自动检测到Python项目")
        print("6. 在环境变量中添加:")
        print(f"   - SECRET_KEY: {secrets.token_hex(32)}")
        print("   - FLASK_ENV: production")
        print("7. 点击 'Deploy'")
        
        input("\n按Enter键继续...")
        
        vercel_url = input("部署完成后，请输入Vercel提供的URL: ").strip()
        
        if vercel_url:
            print(f"🎉 部署成功! 访问地址: {vercel_url}")
            print(f"🔧 管理后台: {vercel_url}/admin/templates/dashboard.html")
            return True
        
        return False
    
    def create_deployment_info(self):
        """创建部署信息文件"""
        deployment_info = {
            "project_name": self.project_name,
            "deployment_date": datetime.now().isoformat(),
            "version": "1.0.0",
            "platform": "Vercel",
            "repository": "GitHub",
            "features": [
                "产品展示系统",
                "高级搜索功能",
                "产品比较系统",
                "移动端优化",
                "后台管理系统",
                "安全防护体系",
                "SEO优化",
                "性能优化",
                "多语言支持",
                "自动化测试"
            ],
            "tech_stack": {
                "backend": "Python Flask",
                "frontend": "HTML5/CSS3/JavaScript",
                "database": "SQLite",
                "deployment": "Vercel",
                "version_control": "Git/GitHub"
            },
            "urls": {
                "production": "https://your-app.vercel.app",
                "admin": "https://your-app.vercel.app/admin/templates/dashboard.html",
                "test_dashboard": "https://your-app.vercel.app/test-deployment-dashboard.html"
            },
            "credentials": {
                "admin_username": "admin",
                "admin_password": "admin123"
            }
        }
        
        with open(self.project_dir / "DEPLOYMENT_INFO.json", "w") as f:
            json.dump(deployment_info, f, indent=2, ensure_ascii=False)
        
        print("📄 部署信息已保存到 DEPLOYMENT_INFO.json")
    
    def show_success_message(self):
        """显示成功消息"""
        print("\n" + "="*60)
        print("🎉 LED Display Solutions 部署完成!")
        print("="*60)
        print("📦 项目已成功推送到GitHub")
        print("🌐 项目已部署到Vercel")
        print("\n📋 重要信息:")
        print("• GitHub仓库: 已创建并推送")
        print("• Vercel部署: 已配置自动部署")
        print("• 管理员账户: admin / admin123")
        print("\n🔗 访问链接:")
        print("• 生产环境: https://your-app.vercel.app")
        print("• 管理后台: https://your-app.vercel.app/admin/templates/dashboard.html")
        print("• 测试仪表板: https://your-app.vercel.app/test-deployment-dashboard.html")
        print("\n💡 提示:")
        print("• 每次推送到GitHub main分支都会自动部署到Vercel")
        print("• 可以在Vercel控制台查看部署状态和日志")
        print("• 建议在生产环境中更改默认管理员密码")
        print("="*60)
    
    def run(self):
        """运行部署流程"""
        print("🚀 LED Display Solutions - Git & Vercel 自动化部署")
        print("="*60)
        
        # 切换到项目目录
        os.chdir(self.project_dir)
        
        # 检查Git状态
        if not self.check_git_status():
            # 初始化Git仓库
            if not self.init_git_repo():
                return False
        else:
            print("📦 Git仓库已存在")
        
        # 创建Vercel配置
        self.create_vercel_config()
        
        # 检查是否有远程仓库
        try:
            result = subprocess.run(['git', 'remote', 'get-url', 'origin'], 
                                  capture_output=True, text=True)
            if result.returncode != 0:
                # 设置GitHub远程仓库
                if not self.setup_github_remote():
                    return False
            else:
                print("🔗 GitHub远程仓库已配置")
        except:
            if not self.setup_github_remote():
                return False
        
        # 添加新文件并提交
        try:
            subprocess.run(['git', 'add', '.'], cwd=self.project_dir, check=True)
            commit_message = f"🚀 Deploy to Vercel - {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}"
            subprocess.run(['git', 'commit', '-m', commit_message], 
                         cwd=self.project_dir, check=True)
        except subprocess.CalledProcessError:
            print("📝 没有新的更改需要提交")
        
        # 推送到GitHub
        if not self.push_to_github():
            return False
        
        # 设置Vercel部署
        self.setup_vercel_deployment()
        
        # 创建部署信息
        self.create_deployment_info()
        
        # 显示成功消息
        self.show_success_message()
        
        return True

if __name__ == "__main__":
    deployer = GitVercelDeployer()
    success = deployer.run()
    
    if success:
        print("\n🎯 部署流程完成!")
    else:
        print("\n❌ 部署过程中出现错误，请检查上述信息")
        sys.exit(1)