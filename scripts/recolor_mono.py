# -*- coding: utf-8 -*-
"""Перекраска существующих иллюстраций под палитру сайта: монохром, чёрная точка
поднята до фона страницы (#191919), света белые. Композиция не меняется.

  python3 scripts/recolor_mono.py <in> <out.webp> [--tint blue|orange|none]
"""
import sys
from PIL import Image, ImageOps, ImageEnhance

BG = 0x19  # #191919

def recolor(src: str, dst: str, tint: str = "none") -> None:
    im = Image.open(src).convert("RGB")
    g = ImageOps.grayscale(im)
    g = ImageOps.autocontrast(g, cutoff=0.5)
    g = ImageEnhance.Contrast(g).enhance(1.08)
    # чёрная точка → фон сайта, белая остаётся белой
    lut = [int(BG + v * (255 - BG) / 255) for v in range(256)]
    g = g.point(lut)
    if tint == "none":
        out = g.convert("RGB")
    else:
        # лёгкая тонировка светов в цвет акцента: тени серые, света чуть цветные
        acc = (0x52, 0x9C, 0xCA) if tint == "blue" else (0xF0, 0x87, 0x3A)
        r = g.point([int(v + (acc[0] - 255) * (v / 255) * 0.35) for v in range(256)])
        gg = g.point([int(v + (acc[1] - 255) * (v / 255) * 0.35) for v in range(256)])
        b = g.point([int(v + (acc[2] - 255) * (v / 255) * 0.35) for v in range(256)])
        out = Image.merge("RGB", (r, gg, b))
    out.save(dst, "WEBP", quality=86, method=6)

if __name__ == "__main__":
    tint = "none"
    if "--tint" in sys.argv:
        tint = sys.argv[sys.argv.index("--tint") + 1]
    recolor(sys.argv[1], sys.argv[2], tint)
    print(dst := sys.argv[2])
