#!/usr/bin/env python3
"""
LED Display Solutions - 简化Git & Vercel部署脚本
"""

import os
import subprocess
import sys
from pathlib import Path
from datetime import datetime

def run_command(command, cwd=None):
    """运行命令并返回结果"""
    try:
        result = subprocess.run(command, shell=True, cwd=cwd, 
                              capture_output=True, text=True, check=True)
        return True, result.stdout
    except subprocess.CalledProcessError as e:
        return False, e.stderr

def main():
    print("🚀 LED Display Solutions - Git & Vercel 快速部署")
    print("="*50)
    
    project_dir = Path(__file__).parent
    os.chdir(project_dir)
    
    # 1. 检查Git状态
    print("📦 检查Git状态...")
    success, output = run_command("git status")
    if not success:
        print("🔧 初始化Git仓库...")
        run_command("git init")
        run_command("git branch -M main")
    
    # 2. 添加所有文件
    print("📁 添加文件到Git...")
    run_command("git add .")
    
    # 3. 提交更改
    commit_msg = f"🚀 Deploy: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}"
    print(f"💾 提交更改: {commit_msg}")
    success, output = run_command(f'git commit -m "{commit_msg}"')
    if not success and "nothing to commit" not in output:
        print(f"⚠️ 提交警告: {output}")
    
    # 4. 检查远程仓库
    success, output = run_command("git remote get-url origin")
    if not success:
        print("\n🔗 需要设置GitHub仓库:")
        print("1. 访问 https://github.com/new")
        print("2. 创建仓库: led-display-solutions")
        print("3. 复制仓库URL")
        
        repo_url = input("\n请输入GitHub仓库URL: ").strip()
        if repo_url:
            run_command(f"git remote add origin {repo_url}")
        else:
            print("❌ 未提供仓库URL，退出部署")
            return
    
    # 5. 推送到GitHub
    print("🚀 推送到GitHub...")
    success, output = run_command("git push -u origin main")
    if success:
        print("✅ 成功推送到GitHub")
    else:
        print(f"❌ 推送失败: {output}")
        print("💡 请检查GitHub认证配置")
        return
    
    # 6. Vercel部署说明
    print("\n🌐 Vercel部署步骤:")
    print("1. 访问 https://vercel.com")
    print("2. 使用GitHub登录")
    print("3. 点击 'New Project'")
    print("4. 选择刚才的GitHub仓库")
    print("5. 配置环境变量:")
    print("   - FLASK_ENV: production")
    print("   - SECRET_KEY: (生成一个随机密钥)")
    print("6. 点击 'Deploy'")
    
    print("\n✅ Git部署完成!")
    print("🔗 GitHub仓库已更新")
    print("🌐 请按照上述步骤完成Vercel部署")

if __name__ == "__main__":
    main()