#!/usr/bin/env python3
"""Optimize homepage assets and carousel JSON while preserving alpha transparency.

Run by GitHub Actions whenever the homepage or carousel data changes.
Original uploaded files are kept; optimized WebP copies become website sources.
"""
import json
import re
from pathlib import Path
from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parents[1]
INDEX = ROOT / "index.html"
CAROUSEL = ROOT / "homepage-carousel.json"
MENU_ICONS = {
    "9852be53-da25-4875-a0cf-0fe238ca41e5.png",
    "5b78c4e1-b313-45d4-a9e6-c012653e131d.png",
    "71e25ff0-a09f-4bfb-bd34-09ae839b4dfd.png",
    "8e84bdc6-e27b-4aa3-b83c-5a8913375623.png",
    "33d7d4dd-9acd-4167-8954-c994d42cee23.png",
    "8f44ccfc-2637-481c-af9d-7109faea41d6.png",
    "946cbabf-17b4-46f8-a807-fa3d430e77b1.png",
    "b078e026-3469-4893-989f-214dea794e21.png",
}
count = 0

def optimized_url(url, maximum=(1500, 1500), quality=82):
    global count
    if not isinstance(url, str) or not url.startswith("/") or not url.lower().endswith((".png", ".jpg", ".jpeg")):
        return url
    src = ROOT / url.lstrip("/")
    if not src.is_file():
        return url
    target = src.with_suffix(".webp")
    # Reuse already-built assets, avoiding unnecessary encoding or changed output.
    if not target.exists() or target.stat().st_mtime < src.stat().st_mtime:
        with Image.open(src) as raw:
            raw = ImageOps.exif_transpose(raw)
            raw.thumbnail(maximum, Image.Resampling.LANCZOS)
            # Convert palettes with transparency correctly, don't flatten transparent slides.
            if raw.mode not in ("RGB", "RGBA"):
                raw = raw.convert("RGBA" if "A" in raw.getbands() or "transparency" in raw.info else "RGB")
            raw.save(target, "WEBP", quality=quality, method=6)
        count += 1
    if target.stat().st_size >= src.stat().st_size:
        return url
    return "/" + target.relative_to(ROOT).as_posix()

# Convert any remaining HTML-referenced local PNG images.
html = INDEX.read_text(encoding="utf-8")
def convert_html(match):
    url = match.group(2)
    maximum = (160, 160) if Path(url).name in MENU_ICONS else (1500, 1500)
    return match.group(1) + optimized_url(url, maximum) + match.group(3)
html = re.sub(r'(src=")(/[^"<>]+?\.(?:png|jpg|jpeg))(")', convert_html, html, flags=re.IGNORECASE)

if CAROUSEL.exists():
    config = json.loads(CAROUSEL.read_text(encoding="utf-8"))
    for slide in config.get("slides", []):
        for field in ("desktop", "mobile"):
            if slide.get(field):
                slide[field] = optimized_url(slide[field], (1320, 760), 79)
    new_json = json.dumps(config, ensure_ascii=False, indent=2) + "\n"
    if new_json != CAROUSEL.read_text(encoding="utf-8"):
        CAROUSEL.write_text(new_json, encoding="utf-8")

    # Preload the actual first carousel image, not an unrelated old-domain banner.
    html = re.sub(r'\s*<link rel="preload" as="image" media="\(max-width:700px\)" href="https://xinyao-ai.github.io/xinyao-ai/assets/carousel/[^"]+" fetchpriority="high">', "", html)
    html = re.sub(r'\s*<link rel="preload" as="image" media="\(min-width:701px\)" href="https://xinyao-ai.github.io/xinyao-ai/assets/carousel/[^"]+" fetchpriority="high">', "", html)
    slides = [slide for slide in config.get("slides", []) if slide.get("enabled", True) and slide.get("desktop")]
    if slides:
        first = slides[0]
        preload = '\n  <link rel="preload" as="image" href="' + first["desktop"] + '" fetchpriority="high">'
        # Replace a prior generated preload on repeat runs.
        html = re.sub(r'\s*<link rel="preload" as="image" href="/media/guides/[^"]+" fetchpriority="high">', "", html)
        html = html.replace('  <link rel="preconnect" href="https://xinyao-ai.github.io" crossorigin>', '  <link rel="preconnect" href="https://xinyao-ai.github.io" crossorigin>' + preload)
INDEX.write_text(html, encoding="utf-8")
print(f"Created {count} WebP assets and synchronized carousel references and preload.")
