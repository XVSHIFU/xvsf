#!/usr/bin/env python3
"""Remove <font> tags from markdown files.

Handles two cases:
1. Backtick-wrapped: `<font ...>`text`</font>` → text  (remove tags + wrapping backticks)
2. Bare: <font ...>text</font> → text                  (remove tags only)
"""

import re, glob

for fp in sorted(glob.glob("content/posts/*.md")):
    with open(fp, encoding="utf-8") as f:
        content = f.read()

    original = content

    # 1. Backtick-wrapped font opening: `<font ...>` as a unit
    content = re.sub(r'`<font\s[^>]*>`', '', content)
    # 2. Backtick-wrapped font closing: `</font>` as a unit
    content = content.replace('`</font>`', '')

    # 3. Remaining bare font tags (without backticks)
    content = re.sub(r'<font\s[^>]*>', '', content)
    content = content.replace('</font>', '')

    if content != original:
        with open(fp, "w", encoding="utf-8") as f:
            f.write(content)
        print(f"  Cleaned: {fp}")

print("Done.")
