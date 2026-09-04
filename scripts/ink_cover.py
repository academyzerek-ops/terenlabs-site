# -*- coding: utf-8 -*-
"""Обложки в стиле «тушь»: из сетки Midjourney 2x2 вырезает нужный кадр,
приводит к 3:2 и кладёт webp в public/academy-assets/tracks/<name>.webp.

  python3 scripts/ink_cover.py <grid.png> <кадр 1-4> <name>
  python3 scripts/ink_cover.py <single.png> 0 <name>      # уже одиночная картинка
"""
import sys
from pathlib import Path
from PIL import Image

OUT = Path(__file__).resolve().parents[1] / "public" / "academy-assets" / "tracks"
W, H = 1200, 800

def pick(img: Image.Image, n: int) -> Image.Image:
    if n == 0:
        return img
    w, h = img.size
    cw, ch = w // 2, h // 2
    boxes = {1: (0, 0, cw, ch), 2: (cw, 0, w, ch), 3: (0, ch, cw, h), 4: (cw, ch, w, h)}
    return img.crop(boxes[n])

def fit_3_2(img: Image.Image) -> Image.Image:
    w, h = img.size
    target = W / H
    if w / h > target:
        nw = int(h * target); x = (w - nw) // 2
        img = img.crop((x, 0, x + nw, h))
    else:
        nh = int(w / target); y = (h - nh) // 2
        img = img.crop((0, y, w, y + nh))
    return img.resize((W, H), Image.LANCZOS)

def main():
    src, n, name = Path(sys.argv[1]), int(sys.argv[2]), sys.argv[3]
    img = Image.open(src).convert("RGB")
    out = fit_3_2(pick(img, n))
    OUT.mkdir(parents=True, exist_ok=True)
    dst = OUT / f"{name}.webp"
    out.save(dst, "WEBP", quality=88, method=6)
    print(dst, out.size, f"{dst.stat().st_size // 1024} KB")

if __name__ == "__main__":
    main()
