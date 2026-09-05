# -*- coding: utf-8 -*-
"""Перекраска иллюстраций под палитру сайта: тёмный монохром плюс один акцент.

Что делает: снимает цвет, тянет контраст, сажает тени на фон страницы, а бирюзу
исходника возвращает синим акцентом сайта. Композиция не меняется.

  python3 scripts/recolor_site.py <in> <out.webp> [--accent blue|orange|none]
"""
import sys
import numpy as np
from PIL import Image

BLACK = 0x14          # куда садятся тени
WHITE = 0xEF          # куда уходят света
ACCENTS = {"blue": (0x2F, 0x8B, 0xE0), "orange": (0xF0, 0x87, 0x3A)}


def recolor(src: str, dst: str, accent: str = "blue") -> None:
    im = Image.open(src).convert("RGB")
    a = np.asarray(im).astype(np.float32) / 255.0
    r, g, b = a[..., 0], a[..., 1], a[..., 2]

    lum = 0.2126 * r + 0.7152 * g + 0.0722 * b
    lo, hi = np.percentile(lum, 6.0), np.percentile(lum, 99.2)
    lum = np.clip((lum - lo) / max(hi - lo, 1e-4), 0, 1)
    lum = np.clip(lum ** 1.22, 0, 1)                    # тени глубже, света на месте

    base = (BLACK + lum * (WHITE - BLACK)) / 255.0      # монохром в палитре сайта
    out = np.stack([base, base, base], axis=-1)

    if accent in ACCENTS:
        mx, mn = a.max(-1), a.min(-1)
        sat = np.where(mx > 0, (mx - mn) / np.maximum(mx, 1e-4), 0)
        # бирюза и голубизна исходника: g и b заметно выше r
        cyan = np.clip((np.minimum(g, b) - r) * 2.6, 0, 1)
        mask = np.clip(cyan * np.clip(sat * 1.8, 0, 1), 0, 1)[..., None]
        acc = np.array(ACCENTS[accent], dtype=np.float32) / 255.0
        tint = np.clip(base[..., None] * 0.55 + acc * (0.45 + 0.55 * base[..., None]), 0, 1)
        out = out * (1 - mask) + tint * mask

    Image.fromarray((np.clip(out, 0, 1) * 255).astype(np.uint8)).save(dst, "WEBP", quality=88, method=6)


if __name__ == "__main__":
    acc = "blue"
    if "--accent" in sys.argv:
        acc = sys.argv[sys.argv.index("--accent") + 1]
    recolor(sys.argv[1], sys.argv[2], acc)
    print(sys.argv[2])
