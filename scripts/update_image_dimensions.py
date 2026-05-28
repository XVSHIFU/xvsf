#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import json
import re
import struct
import sys
import urllib.request
from pathlib import Path
from urllib.parse import urldefrag, urlparse

ROOT = Path(__file__).resolve().parents[1]
CONTENT_DIR = ROOT / "content"
OUTPUT_FILE = ROOT / "data" / "image_dimensions.json"
IMAGE_RE = re.compile(r"!\[[^\]]*\]\(([^)\s]+)(?:\s+\"[^\"]*\")?\)")
TARGET_PREFIX = "https://cdn.jsdelivr.net/gh/XVSHIFU/Picture-bed@img/img/"
USER_AGENT = "Mozilla/5.0 (compatible; xvsf-image-dimensions/1.0)"

if sys.platform == "win32":
    import io

    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding="utf-8")


def normalize_url(url):
    url, _ = urldefrag(url.strip())
    parsed = urlparse(url)
    return parsed._replace(query="").geturl()


def extract_urls():
    urls = set()
    for path in CONTENT_DIR.rglob("*.md"):
        text = path.read_text(encoding="utf-8", errors="ignore")
        for match in IMAGE_RE.finditer(text):
            url = normalize_url(match.group(1))
            if url.startswith(TARGET_PREFIX):
                urls.add(url)
    return sorted(urls)


def read_existing():
    if not OUTPUT_FILE.exists():
        return {}
    return json.loads(OUTPUT_FILE.read_text(encoding="utf-8"))


def fetch_image(url):
    request = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    with urllib.request.urlopen(request, timeout=20) as response:
        return response.read()


def jpeg_dimensions(data):
    index = 2
    length = len(data)
    while index + 9 < length:
        if data[index] != 0xFF:
            index += 1
            continue
        marker = data[index + 1]
        index += 2
        if marker in (0xD8, 0xD9):
            continue
        if index + 2 > length:
            break
        segment_length = struct.unpack(">H", data[index:index + 2])[0]
        if marker in range(0xC0, 0xC4) and marker not in (0xC4, 0xC8, 0xCC):
            if index + 7 > length:
                break
            height = struct.unpack(">H", data[index + 3:index + 5])[0]
            width = struct.unpack(">H", data[index + 5:index + 7])[0]
            return width, height
        index += segment_length
    raise ValueError("unsupported JPEG")


def webp_dimensions(data):
    if data[:4] != b"RIFF" or data[8:12] != b"WEBP":
        raise ValueError("not WebP")
    chunk = data[12:16]
    if chunk == b"VP8X":
        width = 1 + int.from_bytes(data[24:27], "little")
        height = 1 + int.from_bytes(data[27:30], "little")
        return width, height
    if chunk == b"VP8 ":
        width = struct.unpack("<H", data[26:28])[0] & 0x3FFF
        height = struct.unpack("<H", data[28:30])[0] & 0x3FFF
        return width, height
    if chunk == b"VP8L":
        bits = int.from_bytes(data[21:25], "little")
        width = (bits & 0x3FFF) + 1
        height = ((bits >> 14) & 0x3FFF) + 1
        return width, height
    raise ValueError("unsupported WebP")


def image_dimensions(data):
    if data.startswith(b"\x89PNG\r\n\x1a\n"):
        return struct.unpack(">II", data[16:24])
    if data.startswith((b"\xff\xd8\xff", b"\xff\xd8")):
        return jpeg_dimensions(data)
    if data.startswith(b"GIF87a") or data.startswith(b"GIF89a"):
        return struct.unpack("<HH", data[6:10])
    if data[:4] == b"RIFF" and data[8:12] == b"WEBP":
        return webp_dimensions(data)
    raise ValueError("unsupported image format")


def main():
    dimensions = read_existing()
    urls = extract_urls()
    missing = [url for url in urls if url not in dimensions]

    print(f"Found {len(urls)} image URLs, {len(missing)} missing dimensions.")
    for index, url in enumerate(missing, 1):
        try:
            width, height = image_dimensions(fetch_image(url))
        except Exception as exc:
            print(f"[{index}/{len(missing)}] failed: {url} ({exc})", file=sys.stderr)
            continue
        dimensions[url] = {"width": width, "height": height}
        print(f"[{index}/{len(missing)}] {width}x{height} {url}")

    OUTPUT_FILE.parent.mkdir(exist_ok=True)
    ordered = {url: dimensions[url] for url in sorted(dimensions)}
    OUTPUT_FILE.write_text(json.dumps(ordered, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Wrote {len(ordered)} entries to {OUTPUT_FILE}")


if __name__ == "__main__":
    main()
