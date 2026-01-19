---
title: "语雀导出MD图片自动上传工具"
date: 2026-01-19T10:00:00+08:00
categories:
  - "环境搭建&小工具"
---

## 前言
事情的起因是语雀导出的 md 文件的图片自带防盗链，所以想把文章发往博客还得需要人工手动复制图片再上传一次。当文章的图片很多时，就会十分吃力。

所以本人借助 AI 做了这样的一个脚本。



## 🔑 **第一步：生成GitHub Token**
1. 访问 [https://github.com/settings/tokens](https://github.com/settings/tokens)
2. 点击 "Generate new token" → "Generate new token (classic)"
3. 在 "Select scopes" 中勾选：`repo`（完全仓库访问）
4. 点击 "Generate token"，复制这个token（只显示一次！）

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202601191033131.png)

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202601191032618.png)

## 📝 **第二步：创建脚本**
**脚本中的相关配置会在最后一小节中给出，大家可以直接用最后一小节的模板即可**

```python
#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
语雀MD图片自动化上传脚本
功能：
1. 从MD文件中提取语雀CDN的图片链接
2. 下载图片到本地临时目录
3. 上传到GitHub图床
4. 替换MD中的链接为jsdelivr CDN格式
"""

import os
import re
import sys
import time
import requests
import base64
import random
from datetime import datetime
from pathlib import Path
from urllib.parse import urlparse
from typing import List, Tuple, Dict

# ==================== 配置 ====================
GITHUB_TOKEN = ""  # 你的GitHub Token，后面会提示输入
GITHUB_REPO = "XVSHIFU/Picture-bed"  
GITHUB_BRANCH = "img"
GITHUB_FOLDER = "img"
CDN_URL_TEMPLATE = "https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/{filename}"

# 语雀CDN URL匹配正则
YUQUE_URL_PATTERN = r'https://cdn\.nlark\.com/yuque/[^\s\)\]]*'

# ==================== 工具函数 ====================

def get_filename_with_timestamp():
    """生成时间戳+随机数的文件名"""
    timestamp = datetime.now().strftime("%Y%m%d%H%M")
    random_num = random.randint(100, 999)
    return f"{timestamp}{random_num}"

def download_image(url: str) -> bytes:
    """从URL下载图片"""
    try:
        print(f"⬇️  下载图片:  {url[: 80]}...")
        response = requests. get(url, timeout=10)
        response.raise_for_status()
        return response.content
    except Exception as e: 
        print(f"❌ 下载失败: {e}")
        return None

def upload_to_github(filename: str, file_content: bytes) -> str:
    """上传文件到GitHub"""
    if not GITHUB_TOKEN:
        print("❌ 错误：未设置GITHUB_TOKEN")
        return None

    # 构建API URL
    api_url = f"https://api.github.com/repos/{GITHUB_REPO}/contents/{GITHUB_FOLDER}/{filename}"

    # 编码文件内容
    encoded_content = base64.b64encode(file_content).decode()

    # 请求头
    headers = {
        "Authorization": f"token {GITHUB_TOKEN}",
        "Accept": "application/vnd.github.v3+json"
    }

    # 请求体
    data = {
        "message": f"Upload image: {filename}",
        "content": encoded_content,
        "branch": GITHUB_BRANCH
    }

    try: 
        print(f"⬆️  上传到GitHub: {filename}...")
        response = requests.put(api_url, json=data, headers=headers, timeout=30)

        if response.status_code in [201, 200]:
            print(f"✅ 上传成功:  {filename}")
            return CDN_URL_TEMPLATE.format(filename=filename)
        else:
            print(f"❌ 上传失败 (HTTP {response.status_code}): {response.text}")
            return None
    except Exception as e:
        print(f"❌ 上传异常: {e}")
        return None

def extract_image_urls(md_content: str) -> List[str]:
    """从MD内容中提取语雀图片URL"""
    urls = re.findall(YUQUE_URL_PATTERN, md_content)
    return list(set(urls))  # 去重

def get_image_extension(url: str) -> str:
    """从URL获取图片扩展名"""
    try:
        parsed = urlparse(url)
        path = parsed.path
        if '.' in path:
            ext = path.split('.')[-1].split('?')[0].lower()
            if ext in ['png', 'jpg', 'jpeg', 'gif', 'webp', 'bmp']: 
                return ext
    except:
        pass
    return 'png'  # 默认为png

def process_markdown_file(input_file: str, output_file: str = None) -> bool:
    """处理Markdown文件"""
    
    if not os.path.exists(input_file):
        print(f"❌ 错误：文件不存在 {input_file}")
        return False
    
    # 如果未指定输出文件，自动生成
    if output_file is None:
        base_name = os.path.splitext(input_file)[0]
        output_file = f"{base_name}_converted.md"
    
    # 读取原始MD文件
    print(f"\n📖 读取文件: {input_file}")
    with open(input_file, 'r', encoding='utf-8') as f:
        md_content = f.read()
    
    # 提取所有语雀图片URL
    yuque_urls = extract_image_urls(md_content)
    
    if not yuque_urls:
        print("⚠️  未找到语雀CDN的图片链接")
        return False
    
    print(f"\n🔍 找到 {len(yuque_urls)} 个图片链接")
    
    # URL映射表：原URL -> 新URL
    url_mapping:  Dict[str, str] = {}
    
    # 逐个下载并上传图片
    for idx, old_url in enumerate(yuque_urls, 1):
        print(f"\n[{idx}/{len(yuque_urls)}] 处理图片...")
        
        # 下载图片
        image_content = download_image(old_url)
        if image_content is None:
            print(f"⚠️  跳过此图片")
            continue
        
        # 生成新文件名
        ext = get_image_extension(old_url)
        new_filename = f"{get_filename_with_timestamp()}.{ext}"
        
        # 上传到GitHub
        new_url = upload_to_github(new_filename, image_content)
        if new_url:
            url_mapping[old_url] = new_url
        
        # 简单的速率限制，避免GitHub API限流
        time.sleep(0.5)
    
    if not url_mapping:
        print("\n❌ 错误：未能上传任何图片")
        return False
    
    # 替换MD中的链接
    print(f"\n🔄 替换 {len(url_mapping)} 个链接...")
    new_md_content = md_content
    for old_url, new_url in url_mapping.items():
        new_md_content = new_md_content.replace(old_url, new_url)
    
    # 保存转换后的MD文件
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(new_md_content)
    
    print(f"\n✅ 完成！")
    print(f"📁 输出文件: {output_file}")
    print(f"🔗 已替换 {len(url_mapping)} 个图片链接")
    
    return True

# ==================== 主程序 ====================

def main():
    global GITHUB_TOKEN
    
    print("=" * 60)
    print("     语雀导出MD图片自动上传工具")
    print("=" * 60)
    
    # 获取GitHub Token
    print("\n🔑 请输入你的GitHub Personal Token:")
    print("   获取方式:  https://github.com/settings/tokens")
    print("   (输入后不会显示)")
    GITHUB_TOKEN = input("GitHub Token: ").strip()
    
    if not GITHUB_TOKEN:
        print("❌ 错误：Token不能为空")
        return
    
    # 获取输入文件
    print("\n📝 请输入要转换的Markdown文件路径:")
    input_file = input("文件路径: ").strip()
    
    # 移除引号（如果用户拖拽文件）
    input_file = input_file.strip('\'"')
    
    if not os.path.exists(input_file):
        print(f"❌ 错误：文件不存在 {input_file}")
        return
    
    # 获取输出文件（可选）
    print("\n💾 输出文件路径 (默认为:  原文件名_converted.md):")
    output_file = input("输出路径 (留空使用默认): ").strip()
    
    if output_file:
        output_file = output_file.strip('\'"')
    else:
        output_file = None
    
    # 开始处理
    print("\n" + "=" * 60)
    success = process_markdown_file(input_file, output_file)
    print("=" * 60)
    
    if success: 
        print("\n🎉 所有图片已成功上传并替换！")
    else:
        print("\n⚠️  处理过程中出现问题")

if __name__ == "__main__":
    main()
```

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202601191033178.png)











## 📦 **第三步：安装依赖**
在命令行运行：

```bash
pip install requests
```



<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202601191032879.png)



## 🚀 **第四步：使用脚本**
```bash
python yuque_md_converter.py
```

然后按照提示：

1. 输入你的GitHub Token（从第一步复制）

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202601191032798.png)



2. 输入要转换的MD文件路径

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202601191032636.png)

3. 脚本会自动下载、上传、替换！（省去了手动操作还是很不错的(^^) ）

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202601191032664.png)

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202601191032309.png)



### 一个小问题：
最后只有一张没有上传成功：不过这已经不是什么大问题了

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202601191032289.png)



<font style="color:rgb(31, 35, 40);">GitHub API在</font>**<font style="color:rgb(31, 35, 40);">更新现有文件</font>**<font style="color:rgb(31, 35, 40);">时需要提供当前文件的 </font>`<font style="color:rgb(31, 35, 40);background-color:rgba(129, 139, 152, 0.12);">sha</font>`<font style="color:rgb(31, 35, 40);"> 值。这是因为同一时间内可能会生成相同的时间戳文件名。</font>



更新脚本：

```python
#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
语雀MD图片自动化上传脚本
功能：
1. 从MD文件中提取语雀CDN的图片链接
2. 下载图片到本地临时目录
3. 上传到GitHub图床
4. 替换MD中的链接为jsdelivr CDN格式
"""

import os
import re
import sys
import time
import requests
import base64
import random
from datetime import datetime
from pathlib import Path
from urllib.parse import urlparse
from typing import List, Tuple, Dict

# ==================== 配置 ====================
GITHUB_TOKEN = ""  # 你的GitHub Token，后面会提示输入
GITHUB_REPO = "XVSHIFU/Picture-bed"
GITHUB_BRANCH = "img"
GITHUB_FOLDER = "img"
CDN_URL_TEMPLATE = "https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/{filename}"

# 语雀CDN URL匹配正则
YUQUE_URL_PATTERN = r'https://cdn\.nlark\.com/yuque/[^\s\)\]]*'

# ==================== 工具函数 ====================

def get_filename_with_timestamp():
    """生成时间戳+随机数的文件名"""
    timestamp = datetime.now().strftime("%Y%m%d%H%M")
    random_num = random.randint(100, 999)
    return f"{timestamp}{random_num}"

def get_file_sha(filename: str) -> str:
    """获取GitHub上文件的SHA值"""
    if not GITHUB_TOKEN:
        return None

    api_url = f"https://api.github.com/repos/{GITHUB_REPO}/contents/{GITHUB_FOLDER}/{filename}"

    headers = {
        "Authorization": f"token {GITHUB_TOKEN}",
        "Accept": "application/vnd.github.v3+json",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
    }

    proxies = {
        'http': None,
        'https': None,
    }

    try:
        response = requests.get(
            api_url,
            headers=headers,
            timeout=10,
            proxies=proxies,
            verify=True
        )

        if response.status_code == 200:
            return response.json().get('sha')
        elif response.status_code == 404:
            # 文件不存在
            return None
        else:
            print(f"⚠️  获取文件SHA失败: HTTP {response.status_code}")
            return None
    except Exception as e:
        print(f"⚠️  获取文件SHA异常: {e}")
        return None

def download_image(url: str) -> bytes:
    """从URL下载图片 - 绕过代理"""
    try:
        print(f"⬇️  下载图片:    {url[:  80]}...")

        # 关键修复：禁用代理
        proxies = {
            'http': None,
            'https': None,
        }

        # 添加请求头，模拟浏览器
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }

        response = requests.get(
            url, 
            timeout=15,
            proxies=proxies,  # 禁用代理
            headers=headers,
            verify=True  # 验证SSL
        )
        response.raise_for_status()
        return response.content
    except Exception as e:  
        print(f"❌ 下载失败:   {e}")
        return None

def upload_to_github(filename: str, file_content: bytes) -> str:
    """上传文件到GitHub - 绕过代理"""
    if not GITHUB_TOKEN:
        print("❌ 错误：未设置GITHUB_TOKEN")
        return None

    # 构建API URL
    api_url = f"https://api.github.com/repos/{GITHUB_REPO}/contents/{GITHUB_FOLDER}/{filename}"
    
    # 编码文件内容
    encoded_content = base64.b64encode(file_content).decode()
    
    # 请求头
    headers = {
        "Authorization": f"token {GITHUB_TOKEN}",
        "Accept": "application/vnd.github.v3+json",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
    }
    
    # 获取文件的SHA（如果文件已存在）
    file_sha = get_file_sha(filename)
    
    # 请求体
    data = {
        "message": f"Upload image: {filename}",
        "content": encoded_content,
        "branch": GITHUB_BRANCH
    }
    
    # 如果文件已存在，需要提供SHA
    if file_sha:
        data["sha"] = file_sha
        print(f"   (文件已存在，更新中...)")
    
    try:  
        print(f"⬆️  上传到GitHub:   {filename}...")
        
        # 禁用代理
        proxies = {
            'http': None,
            'https': None,
        }
        
        response = requests.put(
            api_url, 
            json=data, 
            headers=headers, 
            timeout=30,
            proxies=proxies,  # 禁用代理
            verify=True
        )
        
        if response.status_code in [201, 200]:
            print(f"✅ 上传成功:    {filename}")
            return CDN_URL_TEMPLATE.format(filename=filename)
        else:
            print(f"❌ 上传失败 (HTTP {response.status_code}): {response.text}")
            return None
    except Exception as e:
        print(f"❌ 上传异常:  {e}")
        return None

def extract_image_urls(md_content: str) -> List[str]:
    """从MD内容中提取语雀图片URL"""
    urls = re.findall(YUQUE_URL_PATTERN, md_content)
    return list(set(urls))  # 去重

def get_image_extension(url: str) -> str:
    """从URL获取图片扩展名"""
    try:
        parsed = urlparse(url)
        path = parsed.path
        if '.' in path:
            ext = path.split('.')[-1].split('?')[0].lower()
            if ext in ['png', 'jpg', 'jpeg', 'gif', 'webp', 'bmp']: 
                return ext
    except:
        pass
    return 'png'  # 默认为png

def process_markdown_file(input_file: str, output_file: str = None) -> bool:
    """处理Markdown文件"""
    
    if not os.path.exists(input_file):
        print(f"❌ 错误：文件不存在 {input_file}")
        return False
    
    # 如果未指定输出文件，自动生成
    if output_file is None:  
        base_name = os.path.splitext(input_file)[0]
        output_file = f"{base_name}_converted.md"
    else:
        # 如果输出路径是文件夹，生成文件名
        if os.path.isdir(output_file):
            base_name = os.path. splitext(os.path.basename(input_file))[0]
            output_file = os.path.join(output_file, f"{base_name}_converted.md")
    
    # 读取原始MD文件
    print(f"\n📖 读取文件: {input_file}")
    with open(input_file, 'r', encoding='utf-8') as f:
        md_content = f.read()
    
    # 提取所有语雀图片URL
    yuque_urls = extract_image_urls(md_content)
    
    if not yuque_urls:
        print("⚠️  未找到语雀CDN的图片链接")
        return False
    
    print(f"\n🔍 找到 {len(yuque_urls)} 个图片链接")
    
    # URL映射表：原URL -> 新URL
    url_mapping:   Dict[str, str] = {}
    
    # 逐个下载并上传图片
    for idx, old_url in enumerate(yuque_urls, 1):
        print(f"\n[{idx}/{len(yuque_urls)}] 处理图片...")
        
        # 下载图片
        image_content = download_image(old_url)
        if image_content is None:
            print(f"⚠️  跳过此图片")
            continue
        
        # 生成新文件名
        ext = get_image_extension(old_url)
        new_filename = f"{get_filename_with_timestamp()}.{ext}"
        
        # 上传到GitHub
        new_url = upload_to_github(new_filename, image_content)
        if new_url:
            url_mapping[old_url] = new_url
        
        # 简单的速率限制，避免GitHub API限流
        time.sleep(0.5)
    
    if not url_mapping:
        print("\n❌ 错误：未能上传任何图片")
        return False
    
    # 替换MD中的链接
    print(f"\n🔄 替换 {len(url_mapping)} 个链接...")
    new_md_content = md_content
    for old_url, new_url in url_mapping.items():
        new_md_content = new_md_content.replace(old_url, new_url)
    
    # 保存转换后的MD文件
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(new_md_content)
    
    print(f"\n✅ 完成！")
    print(f"📁 输出文件:  {output_file}")
    print(f"🔗 已替换 {len(url_mapping)} 个图片链接")
    
    return True

# ==================== 主程序 ====================

def main():
    global GITHUB_TOKEN
    
    print("=" * 60)
    print("     语雀导出MD图片���动上传工具")
    print("=" * 60)
    
    # 获取GitHub Token
    print("\n🔑 请输入你的GitHub Personal Token:")
    print("   获取方式:    https://github.com/settings/tokens")
    print("   (输入后不会显示)")
    GITHUB_TOKEN = input("GitHub Token: ").strip()
    
    if not GITHUB_TOKEN:
        print("❌ 错误：Token不能为空")
        return
    
    # 获取输入文件
    print("\n📝 请输入要转换的Markdown文件路径:")
    input_file = input("文件路径: ").strip()
    
    # 移除引号（如果用户拖拽文件）
    input_file = input_file.strip('\'"')
    
    if not os.path.exists(input_file):
        print(f"❌ 错误：文件不存在 {input_file}")
        return
    
    # 获取输出文件（可选）
    print("\n💾 输出文件路径 (默认为:    原文件名_converted.md):")
    output_file = input("输出路径 (留空使用默认): ").strip()
    
    if output_file:
        output_file = output_file.strip('\'"')
    else:
        output_file = None
    
    # 开始处理
    print("\n" + "=" * 60)
    success = process_markdown_file(input_file, output_file)
    print("=" * 60)
    
    if success:  
        print("\n🎉 所有图片已成功上传并替换！")
    else:
        print("\n⚠️  处理过程中出现问题")

if __name__ == "__main__":
    main()
```







## 最终版本：
### <font style="color:rgb(31, 35, 40);">1、创建配置文件模板（不用自己创建！）</font>
```json
{
  "github":  {
    "token": "ghp_your_token_here",
    "repo": "YOUR_USERNAME/Picture-bed",
    "branch": "img",
    "folder": "img"
  },
  "cdn": {
    "url_template": "https://cdn.jsdelivr.net/gh/YOUR_USERNAME/Picture-bed@img/img/{filename}"
  },
  "settings": {
    "timeout": 15,
    "upload_delay": 0. 5,
    "verify_ssl": true
  }
}
```

#### <font style="color:rgb(31, 35, 40);">📋</font><font style="color:rgb(31, 35, 40);"> 配置说明</font>
<font style="color:rgb(31, 35, 40);">首次运行后会生成 </font>`<font style="color:rgb(31, 35, 40);background-color:rgba(129, 139, 152, 0.12);">config.json</font>`<font style="color:rgb(31, 35, 40);">，内容如下：</font>

```json
{
  "github": {
    "token": "ghp_xxxx.. .",
    "repo": "YOUR_USERNAME/Picture-bed",
    "branch": "img",
    "folder": "img"
  },
  "cdn": {
    "url_template": "https://cdn.jsdelivr.net/gh/YOUR_USERNAME/Picture-bed@img/img/{filename}"
  },
  "settings": {
    "timeout": 15,
    "upload_delay": 0.5,
    "verify_ssl": true
  }
}
```

#### <font style="color:rgb(31, 35, 40);">配置项说明</font>
| **<font style="color:rgb(31, 35, 40);">配置项</font>** | **<font style="color:rgb(31, 35, 40);">说明</font>** | **<font style="color:rgb(31, 35, 40);">示例</font>** |
| --- | --- | --- |
| `<font style="color:rgb(31, 35, 40);background-color:rgba(129, 139, 152, 0.12);">github. token</font>` | <font style="color:rgb(31, 35, 40);">GitHub Personal Token</font> | `<font style="color:rgb(31, 35, 40);background-color:rgba(129, 139, 152, 0.12);">ghp_xxxxx</font>` |
| `<font style="color:rgb(31, 35, 40);background-color:rgba(129, 139, 152, 0.12);">github.repo</font>` | <font style="color:rgb(31, 35, 40);">图床仓库</font> | `<font style="color:rgb(31, 35, 40);background-color:rgba(129, 139, 152, 0.12);">XVSHIFU/Picture-bed</font>` |
| `<font style="color:rgb(31, 35, 40);background-color:rgba(129, 139, 152, 0.12);">github.branch</font>` | <font style="color:rgb(31, 35, 40);">存储图片的分支</font> | `<font style="color:rgb(31, 35, 40);background-color:rgba(129, 139, 152, 0.12);">img</font>` |
| `<font style="color:rgb(31, 35, 40);background-color:rgba(129, 139, 152, 0.12);">github.folder</font>` | <font style="color:rgb(31, 35, 40);">存储图片的文件夹</font> | `<font style="color:rgb(31, 35, 40);background-color:rgba(129, 139, 152, 0.12);">img</font>` |
| `<font style="color:rgb(31, 35, 40);background-color:rgba(129, 139, 152, 0.12);">cdn.url_template</font>` | <font style="color:rgb(31, 35, 40);">CDN链接模板</font> | `<font style="color:rgb(31, 35, 40);background-color:rgba(129, 139, 152, 0.12);">https://cdn.jsdelivr.net/... </font>` |
| `<font style="color:rgb(31, 35, 40);background-color:rgba(129, 139, 152, 0.12);">settings.timeout</font>` | <font style="color:rgb(31, 35, 40);">下载超时时间（秒）</font> | `<font style="color:rgb(31, 35, 40);background-color:rgba(129, 139, 152, 0.12);">15</font>` |
| `<font style="color:rgb(31, 35, 40);background-color:rgba(129, 139, 152, 0.12);">settings.upload_delay</font>` | <font style="color:rgb(31, 35, 40);">上传间隔（秒）</font> | `<font style="color:rgb(31, 35, 40);background-color:rgba(129, 139, 152, 0.12);">0.5</font>` |
| `<font style="color:rgb(31, 35, 40);background-color:rgba(129, 139, 152, 0.12);">settings.verify_ssl</font>` | <font style="color:rgb(31, 35, 40);">验证SSL证书</font> | `<font style="color:rgb(31, 35, 40);background-color:rgba(129, 139, 152, 0.12);">true</font>` |


### 2、**<font style="color:rgb(31, 35, 40);">主脚本（带配置文件支持）</font>**
```python
#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
语雀MD图片自动化上传工具
功能：
1. 从MD文件中提取语雀CDN的图片链接
2. 下载图片到本地临时目录
3. 上传到GitHub图床
4. 替换MD中的链接为jsdelivr CDN格式

使用方式：
1. 复制 config.example.json 为 config.json
2. 填写你的GitHub信息
3. 运行:  python yuque_md_converter. py
"""

import os
import re
import sys
import time
import json
import requests
import base64
import random
from datetime import datetime
from pathlib import Path
from urllib.parse import urlparse
from typing import List, Dict, Optional

# ==================== 配置管理 ====================

CONFIG_FILE = "config.json"
CONFIG_EXAMPLE_FILE = "config.example.json"

class ConfigManager:
    """配置文件管理器"""

    def __init__(self):
        self.config = None
        self.load_or_create_config()

    def load_or_create_config(self):
        """加载或创建配置文件"""
        if os.path. exists(CONFIG_FILE):
            print(f"📖 读取配置文件: {CONFIG_FILE}")
            with open(CONFIG_FILE, 'r', encoding='utf-8') as f:
                self.config = json.load(f)
            self._validate_config()
        else:
            print(f"\n⚠️  配置文件不存在: {CONFIG_FILE}")
            self._create_config_interactively()

    def _validate_config(self):
        """验证配置是否完整"""
        required_keys = {
            'github':  ['token', 'repo', 'branch', 'folder'],
            'cdn': ['url_template'],
            'settings': ['timeout', 'upload_delay']
        }

        for section, keys in required_keys.items():
            if section not in self.config:
                raise ValueError(f"配置缺少 [{section}] 部分")
            for key in keys:
                if key not in self.config[section]: 
                    raise ValueError(f"配置缺少 [{section}].[{key}]")

        # 检查token
        if self.config['github']['token'] == "ghp_your_token_here":
            raise ValueError("❌ 请在 config.json 中设置你的GitHub Token")

    def _create_config_interactively(self):
        """交互式创建配置文件"""
        print("\n" + "=" * 60)
        print("🚀 首次使用，需要配置GitHub信息")
        print("=" * 60)

        config = {
            "github": {
                "token":  "",
                "repo": "",
                "branch": "img",
                "folder": "img"
            },
            "cdn": {
                "url_template": ""
            },
            "settings":  {
                "timeout": 15,
                "upload_delay":  0.5,
                "verify_ssl": True
            }
        }

        # 获取GitHub Token
        print("\n🔑 GitHub Personal Token")
        print("   获取方式:  https://github.com/settings/tokens")
        print("   需要权限: repo (完全仓库访问)")
        token = input("请输入Token: ").strip()
        if not token:
            print("❌ Token不能为空")
            sys.exit(1)
        config['github']['token'] = token

        # 获取仓库信息
        print("\n📦 仓库信息")
        repo = input("仓库 (格式: USERNAME/repo-name): ").strip()
        if not repo or '/' not in repo:
            print("❌ 仓库格式错误，应为:  USERNAME/repo-name")
            sys.exit(1)
        config['github']['repo'] = repo
        
        # 获取分支
        branch = input("分支 (默认: img): ").strip()
        if branch: 
            config['github']['branch'] = branch
        
        # 获取文件夹
        folder = input("图片文件夹 (默认: img): ").strip()
        if folder:
            config['github']['folder'] = folder
        
        # 生成CDN模板
        username = repo.split('/')[0]
        repo_name = repo. split('/')[1]
        config['cdn']['url_template'] = f"https://cdn.jsdelivr.net/gh/{username}/{repo_name}@{config['github']['branch']}/{config['github']['folder']}/{{filename}}"
        
        print(f"\n📝 CDN URL模板: {config['cdn']['url_template']}")
        
        # 保存配置
        with open(CONFIG_FILE, 'w', encoding='utf-8') as f:
            json.dump(config, f, indent=2, ensure_ascii=False)
        
        print(f"\n✅ 配置已保存:  {CONFIG_FILE}")
        self.config = config
    
    def get(self, section:  str, key: str, default=None):
        """获取配置值"""
        return self.config.get(section, {}).get(key, default)
    
    def update_token(self, new_token:  str):
        """更新Token"""
        self.config['github']['token'] = new_token
        with open(CONFIG_FILE, 'w', encoding='utf-8') as f:
            json.dump(self.config, f, indent=2, ensure_ascii=False)
        print("✅ Token已更新")


# ==================== 全局配置 ====================
config_manager = None

# ==================== 工具函数 ====================

def get_filename_with_timestamp():
    """生成时间戳+随机数的文件名"""
    timestamp = datetime.now().strftime("%Y%m%d%H%M")
    random_num = random.randint(100, 999)
    return f"{timestamp}{random_num}"

def get_file_sha(filename: str) -> Optional[str]:
    """获取GitHub上文件的SHA值"""
    token = config_manager.get('github', 'token')
    repo = config_manager.get('github', 'repo')
    folder = config_manager.get('github', 'folder')
    
    if not token:
        return None
    
    api_url = f"https://api.github.com/repos/{repo}/contents/{folder}/{filename}"
    
    headers = {
        "Authorization": f"token {token}",
        "Accept": "application/vnd.github.v3+json",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
    }
    
    proxies = {
        'http': None,
        'https': None,
    }
    
    try: 
        response = requests.get(
            api_url,
            headers=headers,
            timeout=10,
            proxies=proxies,
            verify=config_manager. get('settings', 'verify_ssl', True)
        )
        
        if response.status_code == 200:
            return response. json().get('sha')
        elif response.status_code == 404:
            return None
        else:
            print(f"⚠️  获取文件SHA失败: HTTP {response.status_code}")
            return None
    except Exception as e:
        print(f"⚠️  获取文件SHA异常: {e}")
        return None

def download_image(url: str) -> Optional[bytes]:
    """从URL下载图片"""
    try:
        print(f"⬇️  下载图片: {url[: 80]}...")
        
        proxies = {
            'http': None,
            'https': None,
        }
        
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
        
        response = requests.get(
            url, 
            timeout=config_manager.get('settings', 'timeout', 15),
            proxies=proxies,
            headers=headers,
            verify=config_manager.get('settings', 'verify_ssl', True)
        )
        response.raise_for_status()
        return response.content
    except Exception as e:  
        print(f"❌ 下载失败: {e}")
        return None

def upload_to_github(filename: str, file_content: bytes) -> Optional[str]:
    """上传文件到GitHub"""
    token = config_manager. get('github', 'token')
    repo = config_manager. get('github', 'repo')
    branch = config_manager.get('github', 'branch')
    folder = config_manager.get('github', 'folder')
    cdn_template = config_manager.get('cdn', 'url_template')
    
    if not token: 
        print("❌ 错误：未设置GITHUB_TOKEN")
        return None
    
    api_url = f"https://api.github.com/repos/{repo}/contents/{folder}/{filename}"
    
    encoded_content = base64.b64encode(file_content).decode()
    
    headers = {
        "Authorization": f"token {token}",
        "Accept":  "application/vnd.github. v3+json",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
    }
    
    file_sha = get_file_sha(filename)
    
    data = {
        "message": f"Upload image: {filename}",
        "content": encoded_content,
        "branch": branch
    }
    
    if file_sha:
        data["sha"] = file_sha
        print(f"   (文件已存在，更新中...)")
    
    try:  
        print(f"⬆️  上传到GitHub: {filename}...")
        
        proxies = {
            'http': None,
            'https': None,
        }
        
        response = requests.put(
            api_url, 
            json=data, 
            headers=headers, 
            timeout=30,
            proxies=proxies,
            verify=config_manager.get('settings', 'verify_ssl', True)
        )
        
        if response.status_code in [201, 200]:
            print(f"✅ 上传成功: {filename}")
            return cdn_template.format(filename=filename)
        else:
            print(f"❌ 上传失败 (HTTP {response.status_code}): {response.text}")
            return None
    except Exception as e:
        print(f"❌ 上传异常: {e}")
        return None

def extract_image_urls(md_content: str) -> List[str]:
    """从MD内容中提取语雀图片URL"""
    pattern = r'https://cdn\.nlark\.com/yuque/[^\s\)\]]*'
    urls = re.findall(pattern, md_content)
    return list(set(urls))

def get_image_extension(url: str) -> str:
    """从URL获取图片扩展名"""
    try:
        parsed = urlparse(url)
        path = parsed.path
        if '.' in path:
            ext = path.split('.')[-1].split('?')[0].lower()
            if ext in ['png', 'jpg', 'jpeg', 'gif', 'webp', 'bmp']: 
                return ext
    except:
        pass
    return 'png'

def process_markdown_file(input_file: str, output_file: Optional[str] = None) -> bool:
    """处理Markdown文件"""
    
    if not os.path.exists(input_file):
        print(f"❌ 错误：文件不存在 {input_file}")
        return False
    
    if output_file is None:
        base_name = os.path.splitext(input_file)[0]
        output_file = f"{base_name}_converted.md"
    else:
        if os.path.isdir(output_file):
            base_name = os.path.splitext(os.path.basename(input_file))[0]
            output_file = os.path.join(output_file, f"{base_name}_converted.md")
    
    print(f"\n📖 读取文件: {input_file}")
    with open(input_file, 'r', encoding='utf-8') as f:
        md_content = f.read()
    
    yuque_urls = extract_image_urls(md_content)
    
    if not yuque_urls:
        print("⚠️  未找到语雀CDN的图片链接")
        return False
    
    print(f"\n🔍 找到 {len(yuque_urls)} 个图片链接")
    
    url_mapping:  Dict[str, str] = {}
    
    for idx, old_url in enumerate(yuque_urls, 1):
        print(f"\n[{idx}/{len(yuque_urls)}] 处理图片...")
        
        image_content = download_image(old_url)
        if image_content is None:
            print(f"⚠️  跳过此图片")
            continue
        
        ext = get_image_extension(old_url)
        new_filename = f"{get_filename_with_timestamp()}.{ext}"
        
        new_url = upload_to_github(new_filename, image_content)
        if new_url:
            url_mapping[old_url] = new_url
        
        time.sleep(config_manager.get('settings', 'upload_delay', 0.5))
    
    if not url_mapping:
        print("\n❌ 错误：未能上传任何图片")
        return False
    
    print(f"\n🔄 替换 {len(url_mapping)} 个链接...")
    new_md_content = md_content
    for old_url, new_url in url_mapping.items():
        new_md_content = new_md_content.replace(old_url, new_url)
    
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(new_md_content)
    
    print(f"\n✅ 完成！")
    print(f"📁 输出文件: {output_file}")
    print(f"🔗 已替换 {len(url_mapping)} 个图片链接")
    
    return True

# ==================== 主程序 ====================

def main():
    global config_manager
    
    print("=" * 60)
    print("     语雀导出MD图片自动上传工具")
    print("=" * 60)
    
    # 初始化配置
    try:
        config_manager = ConfigManager()
    except Exception as e:
        print(f"❌ 配置错误: {e}")
        sys.exit(1)
    
    # 验证Token
    token = config_manager.get('github', 'token')
    if not token or token == "ghp_your_token_here":
        print("\n❌ 错误：GitHub Token未配置或无效")
        print(f"请编辑 {CONFIG_FILE} 文件，填入正确的Token")
        sys.exit(1)
    
    # 显示当前配置
    print(f"\n📌 当前配置:")
    print(f"   仓库: {config_manager. get('github', 'repo')}")
    print(f"   分支: {config_manager. get('github', 'branch')}")
    print(f"   文件夹: {config_manager.get('github', 'folder')}")
    
    # 获取输入文件
    print("\n📝 请输入要转换的Markdown文件路径:")
    input_file = input("文件路径: ").strip().strip('\'"')
    
    if not os.path.exists(input_file):
        print(f"❌ 错误：文件不存在 {input_file}")
        return
    
    # 获取输出文件
    print("\n💾 输出文件路径 (默认为:  原文件名_converted.md):")
    output_file = input("输出路径 (留空使用默认): ").strip().strip('\'"')
    
    if not output_file:
        output_file = None
    
    # 开始处理
    print("\n" + "=" * 60)
    success = process_markdown_file(input_file, output_file)
    print("=" * 60)
    
    if success:  
        print("\n🎉 所有图片已成功上传并替换！")
    else:
        print("\n⚠️  处理过程中出现问题")

if __name__ == "__main__":
    main()
```



### 3、使用说明
#### 语雀MD图片自动上传工具
自动将语雀导出的Markdown文件中的图片上传到GitHub图床，并替换链接。

✨ 功能特性

- ✅ 自动下载语雀CDN上的图片

- ✅ 上传到GitHub个人图床

- ✅ 自动替换MD中的图片链接为jsdelivr CDN链接

- ✅ Token本地保存，无需每次输入

- ✅ 配置文件管理，方便多人使用

- ✅ 支持断点续传（同名文件自动更新）



#### 🚀 快速开始
##### 1️⃣ 环境要求
```bash
Python 3.6+
pip install requests
```

##### <font style="color:rgb(31, 35, 40);">2️⃣</font><font style="color:rgb(31, 35, 40);"> 第一次使用</font>
```bash
python yuque_md_converter.py
```

1. <font style="color:rgb(31, 35, 40);">输入GitHub Token（从</font><font style="color:rgb(31, 35, 40);"> </font>[<font style="color:rgb(9, 105, 218);">https://github.com/settings/tokens</font>](https://github.com/settings/tokens)<font style="color:rgb(31, 35, 40);"> </font><font style="color:rgb(31, 35, 40);">获取）</font>
2. <font style="color:rgb(31, 35, 40);">输入GitHub仓库信息（格式:</font><font style="color:rgb(31, 35, 40);"> </font>`<font style="color:rgb(31, 35, 40);background-color:rgba(129, 139, 152, 0.12);">USERNAME/repo-name</font>`<font style="color:rgb(31, 35, 40);">）</font>
3. <font style="color:rgb(31, 35, 40);">自动生成配置文件 </font>`<font style="color:rgb(31, 35, 40);background-color:rgba(129, 139, 152, 0.12);">config.json</font>`

##### <font style="color:rgb(31, 35, 40);">3️⃣</font><font style="color:rgb(31, 35, 40);"> 后续使用</font>
<font style="color:rgb(31, 35, 40);">直接运行脚本，输入MD文件路径：</font>

```plain
python yuque_md_converter.py
```

<font style="color:rgb(31, 35, 40);">Token会自动从 </font>`<font style="color:rgb(31, 35, 40);background-color:rgba(129, 139, 152, 0.12);">config.json</font>`<font style="color:rgb(31, 35, 40);"> 读取，无需每次输入！</font>





### 4、使用演示
准备 token：

`ghp_sl2HW72K*************35l2qr`



创建脚本：

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202601191033208.png)





准备语雀导出的文档：其中图片都是语雀链接的

文档地址：`E:\MyBlog2.0\yuque_converter\test\0. Agent 型内存马.md`

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202601191032205.png)





配置环境：

python 安装就不演示了

`pip install requests`

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202601191032808.png)





运行脚本：

`python yuque_md_converter.py`



输入 token

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202601191032685.png)



输入仓库信息：

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202601191032379.png)<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202601191032294.png)











输入分支和图片文件夹信息：

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202601191032450.png)<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202601191032295.png)





输入要转换的文档的路径：



<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202601191033372.png)





接下来就会开始自动上传图片了：

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202601191033699.png)



已经全部上传成功：

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202601191032557.png)

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202601191032465.png)







后续使用就不需要再次输入 token 了：

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202601191032389.png)

会按照 config.json 文件中的配置运行

<!-- 这是一张图片，ocr 内容为： -->
![](https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/202601191032962.png)









































