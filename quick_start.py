#!/usr/bin/env python3
"""
LED Display Solutions - 快速启动脚本
一键启动本地开发服务器和打开管理后台
"""

import os
import sys
import time
import webbrowser
import threading
from pathlib import Path

def print_banner():
    """打印启动横幅"""
    banner = """
╔══════════════════════════════════════════════════════════════╗
║                LED Display Solutions                         ║
║                   本地开发服务器                              ║
╚══════════════════════════════════════════════════════════════╝
"""
    print(banner)

def check_and_install_dependencies():
    """检查并安装依赖"""
    required_packages = {
        'flask': 'Flask',
        'flask_cors': 'Flask-CORS', 
        'flask_login': 'Flask-Login'
    }
    
    missing = []
    for module, package in required_packages.items():
        try:
            __import__(module)
        except ImportError:
            missing.append(package)
    
    if missing:
        print(f"📦 正在安装缺少的依赖: {', '.join(missing)}")
        import subprocess
        try:
            subprocess.check_call([sys.executable, '-m', 'pip', 'install'] + missing)
            print("✅ 依赖安装完成")
        except subprocess.CalledProcessError:
            print("❌ 依赖安装失败，请手动安装:")
            print(f"   pip install {' '.join(missing)}")
            return False
    
    return True

def initialize_database():
    """初始化数据库"""
    try:
        # 确保在正确的目录
        os.chdir(Path(__file__).parent)
        
        # 导入并初始化数据库
        from integrated_server import init_db, app
        
        with app.app_context():
            print("🗄️  初始化数据库...")
            init_db(create_admin=True, use_enhanced_schema=True)
            print("✅ 数据库初始化完成")
        
        return True
    except Exception as e:
        print(f"❌ 数据库初始化失败: {e}")
        return False

def open_admin_pages():
    """延迟打开管理页面"""
    time.sleep(3)  # 等待服务器启动
    
    urls = [
        'http://localhost:8000/admin/templates/dashboard.html',
        'http://localhost:8000/test-deployment-dashboard.html'
    ]
    
    for url in urls:
        webbrowser.open_new_tab(url)

def start_server():
    """启动Flask服务器"""
    try:
        from integrated_server import app
        
        print("🚀 启动开发服务器...")
        print("=" * 60)
        print("📍 服务器地址:")
        print("   🏠 主页: http://localhost:8000")
        print("   🔧 管理后台: http://localhost:8000/admin/templates/dashboard.html")
        print("   📊 测试仪表板: http://localhost:8000/test-deployment-dashboard.html")
        print("   🔐 登录页面: http://localhost:8000/admin/templates/login.html")
        print()
        print("🔑 默认管理员账户:")
        print("   用户名: admin")
        print("   密码: admin123")
        print("=" * 60)
        print("💡 提示: 按 Ctrl+C 停止服务器")
        print()
        
        # 在后台线程中打开浏览器
        browser_thread = threading.Thread(target=open_admin_pages)
        browser_thread.daemon = True
        browser_thread.start()
        
        # 启动Flask应用
        app.run(
            host='0.0.0.0',
            port=8000,
            debug=True,
            use_reloader=False  # 避免重复打开浏览器
        )
        
    except KeyboardInterrupt:
        print("\n👋 服务器已停止")
    except Exception as e:
        print(f"❌ 服务器启动失败: {e}")
        print("\n🔧 故障排除:")
        print("1. 检查端口8000是否被占用")
        print("2. 确保所有依赖已正确安装")
        print("3. 检查文件权限")

def main():
    """主函数"""
    print_banner()
    
    # 检查Python版本
    if sys.version_info < (3, 7):
        print("❌ 需要Python 3.7或更高版本")
        sys.exit(1)
    
    # 切换到脚本目录
    script_dir = Path(__file__).parent
    os.chdir(script_dir)
    
    # 检查并安装依赖
    if not check_and_install_dependencies():
        sys.exit(1)
    
    # 初始化数据库
    if not initialize_database():
        sys.exit(1)
    
    # 启动服务器
    start_server()

if __name__ == "__main__":
    main()