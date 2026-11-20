#!/usr/bin/env python3
"""Generate lighter WebP copies of local homepage PNG files, keeping original files."""
import re
from pathlib import Path
from PIL import Image, ImageOps
ROOT = Path(__file__).resolve().parents[1]
INDEX = ROOT / "index.html"
html = INDEX.read_text(encoding="utf-8")
pattern = re.compile(r'(src="/)([^"<>]+?)(\.png)(")')
converted = set()
def convert(match):
    prefix, basename, suffix, end = match.groups()
    src = ROOT / (basename + suffix)
    if not src.is_file():
        return match.group(0)
    target = src.with_suffix(".webp")
    if src not in converted:
        with Image.open(src) as raw:
            raw = ImageOps.exif_transpose(raw)
            menu_icons = {
                "9852be53-da25-4875-a0cf-0fe238ca41e5.png",
                "5b78c4e1-b313-45d4-a9e6-c012653e131d.png",
                "71e25ff0-a09f-4bfb-bd34-09ae839b4dfd.png",
                "8e84bdc6-e27b-4aa3-b83c-5a8913375623.png",
                "33d7d4dd-9acd-4167-8954-c994d42cee23.png",
                "8f44ccfc-2637-481c-af9d-7109faea41d6.png",
                "946cbabf-17b4-46f8-a807-fa3d430e77b1.png",
                "b078e026-3469-4893-989f-214dea794e21.png",
            }
            raw.thumbnail((160, 160) if src.name in menu_icons else (1500, 1500), Image.Resampling.LANCZOS)
            if raw.mode not in ("RGB", "RGBA"):
                raw = raw.convert("RGBA" if "A" in raw.getbands() or "transparency" in raw.info else "RGB")
            raw.save(target, "WEBP", quality=84, method=6)
        converted.add(src)
        print(f"{src.relative_to(ROOT)}: {src.stat().st_size//1024} KB -> {target.stat().st_size//1024} KB")
    return prefix + basename + ".webp" + end
html = pattern.sub(convert, html)
INDEX.write_text(html, encoding="utf-8")
print(f"Optimized {len(converted)} homepage images")
