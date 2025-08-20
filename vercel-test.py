#!/usr/bin/env python3
"""
Vercel部署测试脚本
用于验证部署配置是否正确
"""

import sys
import os
from pathlib import Path

def test_imports():
    """测试关键模块导入"""
    try:
        # 添加路径
        parent_dir = Path(__file__).parent
        sys.path.insert(0, str(parent_dir))
        
        # 测试Flask导入
        from flask import Flask
        print("✅ Flask导入成功")
        
        # 测试主应用导入
        from integrated_server import app
        print("✅ 主应用导入成功")
        
        # 测试API入口
        from api.index import app as api_app
        print("✅ API入口导入成功")
        
        return True
        
    except ImportError as e:
        print(f"❌ 导入错误: {e}")
        return False
    except Exception as e:
        print(f"❌ 其他错误: {e}")
        return False

def test_file_structure():
    """测试文件结构"""
    required_files = [
        'api/index.py',
        'integrated_server.py',
        'requirements.txt',
        'vercel.json'
    ]
    
    missing_files = []
    for file_path in required_files:
        if not os.path.exists(file_path):
            missing_files.append(file_path)
    
    if missing_files:
        print(f"❌ 缺少文件: {missing_files}")
        return False
    else:
        print("✅ 所有必需文件都存在")
        return True

if __name__ == '__main__':
    print("🔍 开始Vercel部署测试...")
    
    # 测试文件结构
    structure_ok = test_file_structure()
    
    # 测试导入
    imports_ok = test_imports()
    
    if structure_ok and imports_ok:
        print("🎉 所有测试通过！部署应该可以成功")
    else:
        print("⚠️  存在问题，需要修复后再部署")