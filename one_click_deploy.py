#!/usr/bin/env python3
"""
LED Display Solutions - 一键部署到Git和Vercel
超级简化版本，适合快速部署
"""

import os
import subprocess
import secrets
from datetime import datetime

def run_cmd(cmd):
    """运行命令"""
    try:
        result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
        return result.returncode == 0, result.stdout, result.stderr
    except Exception as e:
        return False, "", str(e)

def main():
    print("🚀 LED Display Solutions - 一键部署")
    print("="*50)
    
    # 1. Git初始化
    print("📦 初始化Git...")
    run_cmd("git init")
    run_cmd("git branch -M main")
    run_cmd("git add .")
    
    commit_msg = f"🎉 LED Display Solutions - {datetime.now().strftime('%Y-%m-%d')}"
    run_cmd(f'git commit -m "{commit_msg}"')
    
    # 2. 获取GitHub仓库
    print("\n🔗 GitHub仓库设置")
    print("请先在GitHub创建仓库: https://github.com/new")
    print("仓库名建议: led-display-solutions")
    
    repo_url = input("请输入GitHub仓库URL: ").strip()
    if not repo_url:
        print("❌ 需要GitHub仓库URL才能继续")
        return
    
    # 3. 推送到GitHub
    print("🚀 推送到GitHub...")
    success, _, error = run_cmd(f"git remote add origin {repo_url}")
    success, _, error = run_cmd("git push -u origin main")
    
    if success:
        print("✅ 成功推送到GitHub")
    else:
        print(f"❌ 推送失败: {error}")
        print("💡 请检查GitHub认证设置")
        return
    
    # 4. Vercel部署指南
    secret_key = secrets.token_hex(32)
    
    print("\n🌐 Vercel部署步骤:")
    print("1. 访问: https://vercel.com")
    print("2. 用GitHub登录")
    print("3. 点击 'New Project'")
    print("4. 选择刚才的仓库")
    print("5. 添加环境变量:")
    print(f"   FLASK_ENV=production")
    print(f"   SECRET_KEY={secret_key}")
    print("6. 点击 'Deploy'")
    
    print("\n🎉 部署准备完成!")
    print("📋 重要信息:")
    print(f"• GitHub: {repo_url}")
    print("• 管理员: admin / admin123")
    print("• 记得保存上面的SECRET_KEY!")
    
    # 保存部署信息
    with open("DEPLOYMENT_INFO.txt", "w") as f:
        f.write(f"LED Display Solutions 部署信息\n")
        f.write(f"部署时间: {datetime.now()}\n")
        f.write(f"GitHub: {repo_url}\n")
        f.write(f"SECRET_KEY: {secret_key}\n")
        f.write(f"管理员: admin / admin123\n")
    
    print("💾 部署信息已保存到 DEPLOYMENT_INFO.txt")

if __name__ == "__main__":
    main()