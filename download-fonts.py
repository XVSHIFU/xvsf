#!/usr/bin/env python3
"""
下载 Google Fonts 到本地目录
使用方法: python3 download-fonts.py
"""

import os
import re
import requests
from pathlib import Path
from urllib.parse import urlparse

# 配置
GOOGLE_FONTS_URL = "https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap"
STATIC_DIR = Path("static")
FONTS_DIR = STATIC_DIR / "fonts"  # 字体文件放在 static 目录，Hugo 会自动复制
CSS_DIR = Path("assets") / "css" / "extended"  # CSS 放在 assets 目录
OUTPUT_CSS = CSS_DIR / "fonts.css"

# 创建必要的目录
FONTS_DIR.mkdir(parents=True, exist_ok=True)
CSS_DIR.mkdir(parents=True, exist_ok=True)

def download_file(url, dest_path):
    """下载文件到指定路径"""
    print(f"下载: {url}")
    response = requests.get(url, timeout=30)
    response.raise_for_status()
    
    with open(dest_path, 'wb') as f:
        f.write(response.content)
    print(f"保存到: {dest_path}")
    return dest_path

def get_google_fonts_css():
    """获取 Google Fonts CSS"""
    print(f"获取 Google Fonts CSS: {GOOGLE_FONTS_URL}")
    
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
    
    response = requests.get(GOOGLE_FONTS_URL, headers=headers, timeout=30)
    response.raise_for_status()
    
    return response.text

def extract_font_urls(css_content):
    """从 CSS 中提取字体文件 URL"""
    pattern = r'url\((https://[^)]+)\)'
    urls = re.findall(pattern, css_content)
    return urls

def download_fonts(css_content):
    """下载所有字体文件并替换 CSS 中的 URL"""
    font_urls = extract_font_urls(css_content)
    
    if not font_urls:
        print("❌ 未找到字体文件 URL")
        return css_content
    
    print(f"找到 {len(font_urls)} 个字体文件")
    
    for idx, url in enumerate(font_urls, 1):
        parsed = urlparse(url)
        url_path = parsed.path
        ext = os.path.splitext(url_path)[1] or '.woff2'
        
        filename = f"inter-{idx}{ext}"
        local_path = FONTS_DIR / filename
        
        try:
            download_file(url, local_path)
            relative_url = f"/fonts/{filename}"
            css_content = css_content.replace(url, relative_url)
        except Exception as e:
            print(f"❌ 下载失败: {url}")
            print(f"   错误: {e}")
    
    return css_content

def generate_local_css():
    """生成本地字体 CSS 文件"""
    print("\n" + "="*50)
    print("开始下载 Google Fonts")
    print("="*50 + "\n")
    
    try:
        css_content = get_google_fonts_css()
        print(f"✅ 成功获取 CSS (长度: {len(css_content)} 字节)\n")
        
        local_css = download_fonts(css_content)
        
        header = """/* 
 * Google Fonts - Inter
 * 本地托管版本，自动生成于 download-fonts.py
 */

"""
        local_css = header + local_css
        
        with open(OUTPUT_CSS, 'w', encoding='utf-8') as f:
            f.write(local_css)
        
        print(f"\n✅ CSS 文件已保存到: {OUTPUT_CSS}")
        print(f"✅ 字体文件已保存到: {FONTS_DIR}/")
        print("\n重新构建网站: hugo --gc --minify\n")
        
    except Exception as e:
        print(f"\n❌ 错误: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    try:
        import requests
    except ImportError:
        print("❌ 请先安装 requests 库: pip install requests")
        exit(1)
    
    generate_local_css()
