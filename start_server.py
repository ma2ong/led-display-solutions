#!/usr/bin/env python3
"""
LED Display Solutions - 本地服务器启动脚本
快速启动开发服务器的便捷脚本
"""

import os
import sys
import subprocess
import webbrowser
import time
from pathlib import Path

def check_dependencies():
    """检查必要的依赖"""
    required_packages = ['flask', 'flask-cors', 'flask-login']
    missing_packages = []
    
    for package in required_packages:
        try:
            __import__(package.replace('-', '_'))
        except ImportError:
            missing_packages.append(package)
    
    if missing_packages:
        print("❌ 缺少必要的依赖包:")
        for package in missing_packages:
            print(f"   - {package}")
        print("\n📦 请运行以下命令安装依赖:")
        print(f"   pip install {' '.join(missing_packages)}")
        return False
    
    return True

def initialize_database():
    """初始化数据库"""
    try:
        from integrated_server import init_db
        print("🗄️  正在初始化数据库...")
        init_db(create_admin=True, use_enhanced_schema=True)
        print("✅ 数据库初始化完成")
        return True
    except Exception as e:
        print(f"❌ 数据库初始化失败: {e}")
        return False

def start_server():
    """启动服务器"""
    print("🚀 启动LED Display Solutions开发服务器...")
    print("=" * 50)
    
    # 检查依赖
    if not check_dependencies():
        return False
    
    # 初始化数据库
    if not initialize_database():
        return False
    
    # 启动服务器
    try:
        from integrated_server import app
        
        print("🌐 服务器启动信息:")
        print("   - 主页: http://localhost:8000")
        print("   - 后台管理: http://localhost:8000/admin/templates/dashboard.html")
        print("   - 登录页面: http://localhost:8000/admin/templates/login.html")
        print("   - 测试仪表板: http://localhost:8000/test-deployment-dashboard.html")
        print("   - 默认管理员: admin / admin123")
        print("=" * 50)
        
        # 自动打开浏览器
        time.sleep(1)
        webbrowser.open('http://localhost:8000/admin/templates/dashboard.html')
        
        # 启动Flask应用
        app.run(host='0.0.0.0', port=8000, debug=True)
        
    except Exception as e:
        print(f"❌ 服务器启动失败: {e}")
        return False

if __name__ == "__main__":
    print("🎯 LED Display Solutions - 开发服务器")
    print("=" * 50)
    
    # 确保在正确的目录
    script_dir = Path(__file__).parent
    os.chdir(script_dir)
    
    start_server()