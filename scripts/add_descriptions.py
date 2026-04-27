#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
为缺少 description 的文章添加描述
"""

import sys
import re
from pathlib import Path

if sys.platform == 'win32':
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')

# 文章描述映射
DESCRIPTIONS = {
    '【0】 Requests 库使用.md': 'Python Requests 库基础使用教程，HTTP 请求处理入门',
    '【0】 词云绘制.md': 'Python 词云可视化实战，使用 WordCloud 库生成词云图',
    '【1】 Beautiful Soup 库.md': 'Beautiful Soup 网页解析库使用指南，HTML/XML 数据提取',
    '【1】 页面数据爬取.md': '网页数据爬取实战，静态页面信息提取技术',
    '【2】 动态数据爬取.md': '动态网页数据爬取技术，处理 JavaScript 渲染内容',
    '【2】 信息标记与提取方法.md': '网页信息标记语言与数据提取方法详解',
    '【3】 Re（正则表达式）库入门.md': 'Python 正则表达式库入门，文本模式匹配与提取',
    '【3】 复杂结构数据的获取.md': '复杂网页结构数据提取技术，处理嵌套和动态内容',
    '【4】 Scrapy 框架.md': 'Scrapy 爬虫框架入门教程，构建高效网络爬虫',
    '【4】 利用 pandas 处理国家统计局数据并展示.md': '使用 pandas 处理和可视化国家统计局数据',
    'AI 私厨.md': '基于 LangChain 和多模态 AI 的食谱推荐应用开发实战',
    'ATT&CK实战系列——蓝队防御（一）.md': 'ATT&CK 框架蓝队防御实战系列第一篇，防御策略与技术',
    'ATT&CK实战系列——蓝队防御（二）.md': 'ATT&CK 框架蓝队防御实战系列第二篇，检测与响应',
    'Bandit.md': 'OverTheWire Bandit 靶场通关记录，Linux 命令行安全挑战',
    'DedeCMS-V5.7.118 漏洞复现.md': 'DedeCMS V5.7.118 版本漏洞分析与复现',
    'hongri1.md': '红日安全靶场 1 完整渗透测试记录，内网渗透实战',
    'hongri2.md': '红日安全靶场 2 渗透测试实战，域环境攻防演练',
    'hongri3.md': '红日安全靶场 3 渗透测试记录，横向移动与权限提升',
    'hongri4.md': '红日安全靶场 4 渗透实战，复杂网络环境渗透',
    'JavaEE安全开发.md': 'JavaEE 安全开发实践，Web 应用安全编码规范',
    'JavaSE基础学习.md': 'JavaSE 基础知识学习笔记，Java 核心技术总结',
    'Pikachu.md': 'Pikachu 漏洞练习平台通关记录，Web 安全漏洞实战',
    'web漏洞.md': 'Web 安全漏洞大全，常见漏洞原理与利用方法',
    'ZGSF：Linux-Web-2.md': 'ZGSF Linux 应急响应挑战 Web-2 题解',
    '内网渗透体系建设-靶场001.md': '内网渗透体系建设实战，靶场 001 完整渗透流程',
    '前言-Python数据爬取与可视化.md': 'Python 数据爬取与可视化系列课程前言',
    '前言-Python网络爬虫与信息提取.md': 'Python 网络爬虫与信息提取系列课程前言',
    '梦之光芒的小游戏.md': '梦之光芒小游戏逆向分析与破解',
    '永恒之蓝 复现.md': '永恒之蓝（MS17-010）漏洞复现，SMB 远程代码执行',
    '语雀导出MD图片自动上传工具.md': '语雀 Markdown 导出图片自动上传工具开发',
}

def extract_frontmatter(content):
    match = re.match(r'^---\s*\n(.*?)\n---\s*\n', content, re.DOTALL)
    if match:
        return match.group(1), match.end()
    return None, 0

def parse_frontmatter(fm_text):
    data = {}
    current_key = None
    current_list = []

    for line in fm_text.split('\n'):
        line = line.rstrip()

        if ':' in line and not line.startswith(' '):
            if current_key and current_list:
                data[current_key] = current_list
                current_list = []

            key, value = line.split(':', 1)
            key = key.strip()
            value = value.strip()

            if value:
                data[key] = value
                current_key = None
            else:
                current_key = key

        elif line.strip().startswith('-') and current_key:
            item = line.strip()[1:].strip().strip('"').strip("'")
            current_list.append(item)

    if current_key and current_list:
        data[current_key] = current_list

    return data

def build_frontmatter(data):
    lines = ['---']
    order = ['title', 'date', 'tags', 'categories', 'description', 'showToc', 'draft', 'tocOpen']

    for key in order:
        if key in data:
            value = data[key]
            if isinstance(value, list):
                lines.append(f'{key}:')
                for item in value:
                    lines.append(f'  - {item}')
            else:
                lines.append(f'{key}: {value}')

    lines.append('---')
    return '\n'.join(lines)

def add_description(file_path):
    filename = file_path.name

    if filename not in DESCRIPTIONS:
        return False

    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    fm_text, fm_end = extract_frontmatter(content)
    if not fm_text:
        print(f'[跳过] 无 frontmatter: {filename}')
        return False

    data = parse_frontmatter(fm_text)

    if 'description' in data:
        print(f'[跳过] 已有描述: {filename}')
        return False

    data['description'] = DESCRIPTIONS[filename]

    new_fm = build_frontmatter(data)
    new_content = new_fm + '\n' + content[fm_end:]

    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(new_content)

    print(f'[添加] {filename}')
    print(f'       {DESCRIPTIONS[filename]}')
    return True

def main():
    posts_dir = Path('content/posts')

    if not posts_dir.exists():
        print('[错误] content/posts 目录不存在')
        return

    print('开始为文章添加描述...\n')

    updated = 0
    skipped = 0

    for filename in DESCRIPTIONS.keys():
        file_path = posts_dir / filename
        if not file_path.exists():
            print(f'[警告] 文件不存在: {filename}')
            continue

        try:
            if add_description(file_path):
                updated += 1
            else:
                skipped += 1
        except Exception as e:
            print(f'[错误] {filename} - {e}')

    print(f'\n完成！')
    print(f'  添加描述: {updated} 篇')
    print(f'  跳过: {skipped} 篇')

if __name__ == '__main__':
    main()
