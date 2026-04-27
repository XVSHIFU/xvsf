#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
修复文章分类 - 使用更精确的规则
"""

import sys
import re
from pathlib import Path

# 设置 Windows 控制台编码
if sys.platform == 'win32':
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')

# 精确的文章分类映射（基于文件名）
EXACT_MAPPING = {
    # Java安全
    'CC1.md': 'Java安全',
    'CC3.md': 'Java安全',
    'CC4_CC2_CC5_CC7.md': 'Java安全',
    'CC6.md': 'Java安全',
    'FastJson反序列化.md': 'Java安全',
    'Shiro反序列化.md': 'Java安全',
    'Java序列化与反序列化.md': 'Java安全',
    'Java 内存马第一篇 - 基础.md': 'Java安全',
    'Java 内存马第二篇 - Tomcat 内存马.md': 'Java安全',
    'Java 内存马第三篇 - Spring 内存马.md': 'Java安全',
    'Java 内存马第四篇 - Agent 内存马.md': 'Java安全',
    'Java内存马—Tomcat Valve型的三种注入.md': 'Java安全',
    'EL 表达式注入.md': 'Java安全',
    'SpEL 表达式注入.md': 'Java安全',
    'CVE-2022-22947——Spring Cloud Gateway 学习 & SpEL 的多种注入.md': 'Java安全',
    'JNDI.md': 'Java安全',
    'RMI.md': 'Java安全',
    'Spring.md': 'Java安全',
    'SpringBoot.md': 'Java安全',
    '注解和反射.md': 'Java安全',

    # 代码审计
    'Smartbi v8.5 代码审计.md': '代码审计',
    'Smartbi 远程代码执行漏洞复现(QVD-2025-31926).md': '代码审计',
    'JshERP-2.3 代码审计.md': '代码审计',
    'wuzhicms.md': '代码审计',
    'yccms v3.4 代码审计.md': '代码审计',
    'DedeCMS-V5.7.118 漏洞复现.md': '代码审计',
    '若依4.8.1漏洞 SSTI绕过获取ShiroKey至RCE.md': '代码审计',

    # 渗透测试
    'hongri1.md': '渗透测试',
    'hongri2.md': '渗透测试',
    'hongri3.md': '渗透测试',
    'hongri4.md': '渗透测试',
    'hongri5.md': '渗透测试',
    'Pikachu.md': '渗透测试',
    'Bandit.md': '渗透测试',
    'java-sec-code-master 靶场.md': '渗透测试',
    'web漏洞.md': '渗透测试',
    'xss_lab.md': '渗透测试',
    '永恒之蓝 复现.md': '渗透测试',
    '内网渗透体系建设-靶场001.md': '渗透测试',
    '梦之光芒的小游戏.md': '渗透测试',

    # 应急响应
    'ATT&CK实战系列——蓝队防御（一）.md': '应急响应',
    'ATT&CK实战系列——蓝队防御（二）.md': '应急响应',
    'ZGSF：Linux-Web-2.md': '应急响应',

    # Python爬虫
    '【0】 Requests 库使用.md': 'Python爬虫',
    '【1】 Beautiful Soup 库.md': 'Python爬虫',
    '【2】 信息标记与提取方法.md': 'Python爬虫',
    '【3】 Re（正则表达式）库入门.md': 'Python爬虫',
    '【4】 Scrapy 框架.md': 'Python爬虫',
    '【0】 词云绘制.md': 'Python爬虫',
    '【1】 页面数据爬取.md': 'Python爬虫',
    '【2】 动态数据爬取.md': 'Python爬虫',
    '【3】 复杂结构数据的获取.md': 'Python爬虫',
    '【4】 利用 pandas 处理国家统计局数据并展示.md': 'Python爬虫',
    '前言-Python网络爬虫与信息提取.md': 'Python爬虫',
    '前言-Python数据爬取与可视化.md': 'Python爬虫',

    # 开发工具
    'PHP storm 配置 XDebug.md': '开发工具',
    'Smartbi v8.5 环境搭建.md': '开发工具',
    'Switch JDK versions in Windows.md': '开发工具',
    '语雀导出MD图片自动上传工具.md': '开发工具',
    'sqlmap命令详解.md': '开发工具',
    'JavaSE基础学习.md': '开发工具',
    'JavaEE安全开发.md': '开发工具',

    # AI开发
    'AI 私厨.md': 'AI开发',
}

def extract_frontmatter(content):
    """提取 frontmatter"""
    match = re.match(r'^---\s*\n(.*?)\n---\s*\n', content, re.DOTALL)
    if match:
        return match.group(1), match.end()
    return None, 0

def parse_frontmatter(fm_text):
    """解析 frontmatter 为字典"""
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
    """构建 frontmatter 文本"""
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

def update_article(file_path):
    """更新单篇文章"""
    filename = file_path.name

    # 检查是否在映射表中
    if filename not in EXACT_MAPPING:
        print(f'[跳过] 未在映射表中: {filename}')
        return False

    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    fm_text, fm_end = extract_frontmatter(content)

    # 如果没有 frontmatter，创建一个
    if not fm_text:
        # 提取标题（第一个 # 标题）
        title_match = re.search(r'^#\s+(.+)$', content, re.MULTILINE)
        title = title_match.group(1) if title_match else file_path.stem

        data = {
            'title': title,
            'date': '2025-08-12T10:00:00+08:00',
            'categories': [EXACT_MAPPING[filename]],
            'tags': [],
        }

        new_fm = build_frontmatter(data)
        new_content = new_fm + '\n' + content

        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(new_content)

        print(f'[新增] {filename}')
        print(f'       添加 frontmatter -> {EXACT_MAPPING[filename]}')
        return True

    # 解析现有 frontmatter
    data = parse_frontmatter(fm_text)

    # 获取当前分类
    current_categories = data.get('categories', [])
    if isinstance(current_categories, str):
        current_categories = [current_categories]

    current_category = current_categories[0] if current_categories else None
    new_category = EXACT_MAPPING[filename]

    # 如果分类已正确，跳过
    if current_category == new_category:
        print(f'[OK] {filename} -> {new_category}')
        return False

    # 更新分类
    data['categories'] = [new_category]

    # 构建新的 frontmatter
    new_fm = build_frontmatter(data)
    new_content = new_fm + '\n' + content[fm_end:]

    # 写回文件
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(new_content)

    print(f'[更新] {filename}')
    print(f'       {current_category} -> {new_category}')
    return True

def main():
    """主函数"""
    posts_dir = Path('content/posts')

    if not posts_dir.exists():
        print('[错误] content/posts 目录不存在')
        return

    print('开始修复文章分类...\n')

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

    # 统计各分类数量
    print(f'\n分类统计：')
    category_count = {}
    for filename, category in EXACT_MAPPING.items():
        category_count[category] = category_count.get(category, 0) + 1

    for category, count in sorted(category_count.items()):
        print(f'  {category}: {count} 篇')

if __name__ == '__main__':
    main()
