# -*- coding: utf-8 -*-
"""Перекраска иллюстраций под палитру сайта с сохранением цветных деталей:
тёмная синева фона и поверхностей уходит в нейтральный тёмно-серый, яркие
акценты (бирюза, тёплый свет, предметы) остаются как были.

  python3 scripts/recolor_neutral.py <in> <out>
"""
import sys
import numpy as np
from PIL import Image

BG = 0x19 / 255.0  # #191919

def smoothstep(x, a, b):
    t = np.clip((x - a) / (b - a), 0.0, 1.0)
    return t * t * (3 - 2 * t)

def recolor(src: str, dst: str) -> None:
    im = Image.open(src).convert("RGB")
    hsv = np.asarray(im.convert("HSV")).astype(np.float32) / 255.0
    h, s, v = hsv[..., 0], hsv[..., 1], hsv[..., 2]
    # синяя зона оттенков (PIL: H 0..1 → 0..360): 195°..260°
    hue = h * 360.0
    blue = smoothstep(hue, 185, 200) * (1 - smoothstep(hue, 250, 265))
    # тёмное и среднее по яркости: фон, тени, навы-поверхности
    dark = 1 - smoothstep(v, 0.38, 0.72)
    # синее и не слишком насыщенное: навы-поверхности среднего тона
    dull_blue = blue * (1 - smoothstep(s, 0.62, 0.92))
    d = np.clip(np.maximum(dark, dull_blue), 0, 1)
    # яркие насыщенные акценты защищаем: бирюза, тёплый свет
    protect = smoothstep(s, 0.45, 0.8) * smoothstep(v, 0.55, 0.85)
    d = d * (1 - protect)
    s2 = s * (1 - d)
    # чёрная точка → фон сайта (только у нейтрализованных пикселей)
    v2 = v + d * (BG * (1 - v))
    out = np.stack([h, s2, v2], axis=-1)
    out = (np.clip(out, 0, 1) * 255).astype(np.uint8)
    Image.fromarray(out, "HSV").convert("RGB").save(dst, "WEBP" if dst.endswith(".webp") else None, quality=86)

if __name__ == "__main__":
    recolor(sys.argv[1], sys.argv[2])
    print(sys.argv[2])
