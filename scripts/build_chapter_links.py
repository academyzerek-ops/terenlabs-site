# -*- coding: utf-8 -*-
"""build_chapter_links.py: матрица «глава курса → разбор бренда» → content/chapter-links.json.

Источник — `Модули/Startup/_СВЯЗИ.md`: разбор всех 24 глав трека «Фаундер» против
13 написанных разборов брендов, с указанием, какой блок разбора отвечает на вопрос
главы. Файл ведётся руками и агентами, поэтому здесь он только читается.

Логика курса: сперва теория главой, потом та же механика на живой компании. Ссылка
идёт из главы в разбор, обратная — из разбора в модели каталога (см. build_models.py).

Главы трека и файлы сайта совпадают один в один: L0N_.../0K_glavaK.md → mN-ch0K.

Запуск: python3 scripts/build_chapter_links.py
"""
from __future__ import annotations

import json
import pathlib
import re
import sys

SITE = pathlib.Path(__file__).resolve().parent.parent
SRC = pathlib.Path.home() / "TerenLabs/Модули/Startup/_СВЯЗИ.md"
OUT = SITE / "content/chapter-links.json"

# номер урока в треке → слаг курса на сайте
TRACKS = {
    "1": "course-founder-team",
    "2": "course-founder-market",
    "3": "course-founder-model",
    "4": "course-founder-unit",
    "5": "course-founder-pitch",
    "6": "course-founder-invest",
}

# заголовок главы: **01.2 Название** · `L01_komanda/02_glava2.md` · **разбор частично**
HEAD = re.compile(r"^\*\*(\d\d)\.(\d) ([^*]+)\*\*\s*·\s*`([^`]+)`\s*·\s*\*\*([^*]+)\*\*")
# пункт со ссылкой: - Бренд, `bm-slug`, блок «…»: текст
BULLET = re.compile(r"^-\s+([^,]+),\s*`(bm-[a-z0-9-]+)`[,:]\s*(.+)$")


def main() -> None:
    if not SRC.exists():
        sys.exit(f"нет матрицы связей: {SRC}")
    text = SRC.read_text(encoding="utf-8")
    # раздел 1: матрица «глава → примеры»
    body = text.split("## 1.")[1].split("## 2.")[0]

    out: dict = {}
    cur: dict | None = None
    for line in body.splitlines():
        head = HEAD.match(line.strip())
        if head:
            lesson, chapter, title, path, status = head.groups()
            track = TRACKS.get(lesson.lstrip("0") or "0")
            if not track:
                cur = None
                continue
            key = f"m{lesson.lstrip('0')}-ch{chapter.zfill(2)}"
            cur = {"track": track, "title": title.strip(), "status": status.strip(),
                   "source": path, "links": []}
            out[key] = cur
            continue
        if cur is None:
            continue
        b = BULLET.match(line.strip())
        if b:
            brand, review, note = b.groups()
            # в карточку идёт первое предложение: одна строка «что показывает»
            note = re.split(r"(?<=[.;])\s", note.strip())[0].strip()
            if not any(x["review"] == review for x in cur["links"]):
                cur["links"].append({"brand": brand.strip(), "review": review, "note": note})

    OUT.write_text(json.dumps(out, ensure_ascii=False, indent=1), encoding="utf-8")

    with_links = sum(1 for v in out.values() if v["links"])
    total_links = sum(len(v["links"]) for v in out.values())
    print(f"chapter-links.json: глав {len(out)}, из них со ссылкой на разбор {with_links}")
    print(f"  всего связок: {total_links}")
    for k, v in out.items():
        mark = ", ".join(x["review"] for x in v["links"]) or "нет разбора"
        print(f"  {k} {v['title'][:44]:46} {mark}")


if __name__ == "__main__":
    main()
