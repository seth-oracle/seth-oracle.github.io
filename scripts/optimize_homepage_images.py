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
            raw.thumbnail((1500, 1500), Image.Resampling.LANCZOS)
            if raw.mode not in ("RGB", "RGBA"):
                raw = raw.convert("RGBA" if "A" in raw.getbands() or "transparency" in raw.info else "RGB")
            raw.save(target, "WEBP", quality=84, method=6)
        converted.add(src)
        print(f"{src.relative_to(ROOT)}: {src.stat().st_size//1024} KB -> {target.stat().st_size//1024} KB")
    return prefix + basename + ".webp" + end
html = pattern.sub(convert, html)
INDEX.write_text(html, encoding="utf-8")
print(f"Optimized {len(converted)} homepage images")
