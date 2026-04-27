#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
批量更新文章 frontmatter 分类
根据 FRONTMATTER_TEMPLATE.md 中的分类体系更新所有文章
"""

import os
import re
import sys
from pathlib import Path

# 设置 Windows 控制台编码
if sys.platform == 'win32':
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')

# 分类映射规则
CATEGORY_RULES = {
    'Java安全': {
        'keywords': ['CC', 'FastJson', 'Shiro', '内存马', '表达式注入', 'JNDI', 'RMI', 'Java序列化', 'SpEL', 'EL'],
        'tags': ['反序列化', '内存马', '表达式注入', 'JNDI注入', 'Java基础']
    },
    '代码审计': {
        'keywords': ['Smartbi', 'JshERP', 'wuzhicms', 'yccms', 'DedeCMS', '若依', '代码审计'],
        'tags': ['企业系统', 'CMS审计', '漏洞复现', '代码分析']
    },
    '渗透测试': {
        'keywords': ['红日', 'hongri', 'Pikachu', 'Bandit', '内网渗透', '永恒之蓝', '靶场'],
        'tags': ['红日靶场', 'CTF', '内网渗透', '漏洞利用', '靶场实战']
    },
    '应急响应': {
        'keywords': ['ATT&CK', '蓝队', '应急', 'ZGSF'],
        'tags': ['ATT&CK', '蓝队防御', '应急处置', 'Linux安全']
    },
    'Python爬虫': {
        'keywords': ['Requests', 'BeautifulSoup', 'Scrapy', '爬虫', '词云', 'pandas'],
        'tags': ['爬虫基础', '爬虫框架', '数据可视化', '动态爬取']
    },
    '开发工具': {
        'keywords': ['PHPStorm', 'XDebug', 'JDK', 'sqlmap', '环境搭建', 'Switch JDK'],
        'tags': ['环境配置', '调试工具', '自动化工具', '渗透工具']
    },
    'AI开发': {
        'keywords': ['AI', 'LangChain', 'Agent', '私厨', '大模型'],
        'tags': ['LangChain', 'Agent开发', '大模型应用', '项目实战']
    }
}

def extract_frontmatter(content):
    """提取 frontmatter"""
    match = re.match(r'^---\s*\n(.*?)\n---\s*\n', content, re.DOTALL)
    if match:
        return match.group(1), match.end()
    return None, 0

def determine_category(title, content):
    """根据标题和内容判断分类"""
    text = title + ' ' + content[:500]  # 只检查前500字符

    for category, rules in CATEGORY_RULES.items():
        for keyword in rules['keywords']:
            if keyword.lower() in text.lower():
                return category

    return None

def parse_frontmatter(fm_text):
    """解析 frontmatter 为字典"""
    data = {}
    current_key = None
    current_list = []

    for line in fm_text.split('\n'):
        line = line.rstrip()

        # 匹配键值对
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

        # 匹配列表项
        elif line.strip().startswith('-') and current_key:
            item = line.strip()[1:].strip().strip('"').strip("'")
            current_list.append(item)

    if current_key and current_list:
        data[current_key] = current_list

    return data

def build_frontmatter(data):
    """构建 frontmatter 文本"""
    lines = ['---']

    # 固定顺序的字段
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

def update_article(file_path):
    """更新单篇文章"""
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    fm_text, fm_end = extract_frontmatter(content)
    if not fm_text:
        print(f'[跳过] 无 frontmatter: {file_path.name}')
        return False

    # 解析 frontmatter
    data = parse_frontmatter(fm_text)
    title = data.get('title', file_path.stem)

    # 判断分类
    new_category = determine_category(title, content)
    if not new_category:
        print(f'[警告] 无法判断分类: {file_path.name}')
        return False

    # 获取当前分类
    current_categories = data.get('categories', [])
    if isinstance(current_categories, str):
        current_categories = [current_categories]

    current_category = current_categories[0] if current_categories else None

    # 如果分类已正确，跳过
    if current_category == new_category:
        print(f'[OK] 分类正确: {file_path.name} -> {new_category}')
        return False

    # 更新分类
    data['categories'] = [new_category]

    # 构建新的 frontmatter
    new_fm = build_frontmatter(data)
    new_content = new_fm + '\n' + content[fm_end:]

    # 写回文件
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(new_content)

    print(f'[更新] {file_path.name}')
    print(f'       {current_category} -> {new_category}')
    return True

def main():
    """主函数"""
    posts_dir = Path('content/posts')

    if not posts_dir.exists():
        print('[错误] content/posts 目录不存在')
        return

    print('开始批量更新文章分类...\n')

    updated = 0
    skipped = 0
    errors = 0

    for md_file in sorted(posts_dir.glob('*.md')):
        try:
            if update_article(md_file):
                updated += 1
            else:
                skipped += 1
        except Exception as e:
            print(f'[错误] {md_file.name} - {e}')
            errors += 1

    print(f'\n完成！')
    print(f'  更新: {updated} 篇')
    print(f'  跳过: {skipped} 篇')
    print(f'  错误: {errors} 篇')

if __name__ == '__main__':
    main()
