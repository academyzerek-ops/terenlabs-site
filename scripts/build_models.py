# -*- coding: utf-8 -*-
"""build_models.py: атлас бизнес-моделей → content/models.json.

Источник — разобранный атлас из рабочего дерева рубрики «Акула бизнеса»:
`~/terenlabs-reels/docs/atlas/atlas_models.json` (выход `parse_atlas.py`).
Если рядом лежит `atlas_models.ru.json` (прогон через `yofikator.py`, буква «ё»
восстановлена по корпусу проекта), берётся он: на сайт идёт нормализованный текст.

Что делает скрипт:
  - раскладывает 32 модели по 8 группам и даёт каждой читаемый слаг;
  - добавляет 4 слоя атласа (m33-m36) как такие же карточки;
  - считает перекрёстные ссылки «модель ↔ написанный разбор бренда» по двум
    источникам: таблице «Бренды в разбор» внутри модели и стекам брендов;
  - привязывает модели к темам курса «Фаундер» (тема 03 «Бизнес-модель»).

Регистр Б: доллар, мировой рынок, без Казахстана и местной валюты. Поэтому
Kaspi из стеков выброшен — он регистр А, так же как в `Разборы/_ОЧЕРЕДЬ.md`.

Запуск: python3 scripts/build_models.py
"""
from __future__ import annotations

import json
import pathlib
import re
import sys

SITE = pathlib.Path(__file__).resolve().parent.parent
ATLAS_DIR = pathlib.Path.home() / "terenlabs-reels/docs/atlas"
OUT = SITE / "content/models.json"

# Слаги заданы вручную, а не транслитерацией: адрес страницы читает человек,
# и он не должен меняться от того, что кто-то поправил заголовок модели.
SLUGS = {
    "m01": "proizvoditel", "m02": "roznica", "m03": "d2c", "m04": "luks",
    "m05": "loukost", "m06": "syrevye-treydery", "m07": "resursnaya-renta",
    "m08": "mlm", "m09": "podpiska", "m10": "freemium", "m11": "rashodniki",
    "m12": "arenda-aktiva", "m13": "marketpleys", "m14": "platezhnye-relsy",
    "m15": "agentskie-komissii", "m16": "lidgen", "m17": "birzhi-i-dannye",
    "m18": "vstroennye-finansy", "m19": "strahovanie", "m20": "reklama",
    "m21": "ekonomika-avtorov", "m22": "franshiza", "m23": "licenzirovanie-ip",
    "m24": "plata-za-prohod", "m25": "sport-prava", "m26": "professionalnye-uslugi",
    "m27": "autsorsing", "m28": "enterprise-soft", "m29": "gos-zakaz",
    "m30": "prodavcy-doveriya", "m31": "hity-i-portfeli", "m32": "ekosistema",
    "m33": "marketing-v-modeli", "m34": "fishki-privlecheniya",
    "m35": "pochemu-rushatsya", "m36": "kto-vyzhivaet",
}

# Регистр А в универсальный раздел не идёт: локальный рынок и местная валюта.
EXCLUDE_BRANDS = {"kaspi"}

# Названия брендов в атласе и в разборах написаны по-разному. Ключ — как в атласе
# (в нижнем регистре), значение — слаг разбора.
BRAND_ALIASES = {
    "amazon": "bm-amazon",
    "бавария": "bm-bayern",
    "bmw": "bm-bmw",
    "bmw group": "bm-bmw",
    "facebook": "bm-facebook",
    "meta": "bm-facebook",
    "louis vuitton": "bm-louis-vuitton",
    "lvmh": "bm-louis-vuitton",
    "netflix": "bm-netflix",
    "nike": "bm-nike",
    "pepsico": "bm-pepsi",
    "pepsi": "bm-pepsi",
    "roland garros": "bm-roland-garros",
    "roland-garros": "bm-roland-garros",
    "telegram": "bm-telegram",
    "tiktok": "bm-tiktok",
    "уефа": "bm-uefa",
    "ufc": "bm-ufc",
    "whatsapp": "bm-whatsapp",
}

# Тема курса «Фаундер», к которой относится каталог моделей.
COURSE_SLUG = "course-founder-model"

# Шесть моделей на витрине хаба /startup — по одной на главу темы «Бизнес-модель».
# Список живёт здесь, чтобы опечатка в слаге ломала сборку, а не тихо убирала
# строку со страницы.
SHOWCASE = ["podpiska", "marketpleys", "freemium", "reklama", "franshiza", "arenda-aktiva"]

# Аудит атласа от 06.09.2026: в карточках 89 числовых утверждений и НИ ОДНОГО с
# источником (56 с годом, 33 без года). Канон раздела и обещание на самом сайте —
# «каждая цифра с источником», поэтому такие фразы на страницу не выводятся:
# они остаются в json с меткой pending и включатся, когда будут сверены по первичке.
AUDIT = ATLAS_DIR / "AUDIT_ATLAS.md"


def key(text: str) -> str:
    """Огрубление для сопоставления цитаты аудита с текстом карточки."""
    t = text.lower().replace("**", "").replace("ё", "е")
    t = re.sub(r"[«»\"'`]", "", t)
    t = re.sub(r"[‐-―]", "-", t)
    return re.sub(r"\s+", " ", t).strip()


def load_pending() -> dict:
    """Цитаты из очереди на сверку: id карточки → список огрублённых фраз."""
    if not AUDIT.exists():
        print(f"! нет {AUDIT.name}: числовые утверждения не будут помечены", file=sys.stderr)
        return {}
    txt = AUDIT.read_text(encoding="utf-8")
    out: dict = {}
    # 5.1 и 5.2: | `карточка` | бренд | цитата | год | вердикт |
    for card, _brand, quote, _year, _v in re.findall(
        r"^\|\s*`([a-z0-9]+)`\s*\|([^|]*)\|(.+?)\|([^|]*)\|([^|]*)\|\s*$", txt, re.M):
        out.setdefault(card, []).append(key(quote))
    # 5.3: недатированные превосходные степени, читаются как проверяемый факт
    sec = txt.split("### 5.3.")[1].split("### 5.4.")[0] if "### 5.3." in txt else ""
    for card, claim in re.findall(r"^\|\s*`([a-z0-9]+)`\s*\|\s*«(.+?)»", sec, re.M):
        out.setdefault(card, []).append(key(claim))
    return out


def norm(name: str) -> str:
    """«Zara / Inditex» и «Реклама: дешевый тариф» → опорное имя для сопоставления."""
    s = name.split(":")[0].split("/")[0]
    return " ".join(s.lower().replace(" ", " ").split()).strip(" .,")


def load_atlas() -> dict:
    normalized = ATLAS_DIR / "atlas_models.ru.json"
    raw = ATLAS_DIR / "atlas_models.json"
    src = normalized if normalized.exists() else raw
    if not src.exists():
        sys.exit(f"нет источника: {raw}. Сперва: python3 {ATLAS_DIR}/parse_atlas.py")
    return json.loads(src.read_text(encoding="utf-8")), src


def written_reviews() -> set:
    """Слаги написанных разборов. Ссылка ставится только на них: страницы брендов
    статические, и ссылка на ненаписанный разбор дала бы 404."""
    f = SITE / "content/brands.json"
    if not f.exists():
        return set()
    return {b["slug"] for b in json.loads(f.read_text(encoding="utf-8"))}


WRITTEN = written_reviews()


def review_slug(brand: str) -> str | None:
    slug = BRAND_ALIASES.get(norm(brand))
    return slug if slug in WRITTEN else None


def build_stacks(atlas: dict) -> list[dict]:
    out = []
    for s in atlas["stacks"]:
        if norm(s["brand"]) in EXCLUDE_BRANDS:
            continue
        out.append({
            "brand": s["brand"],
            "group": s.get("group", ""),
            "note": s.get("note", ""),
            "chips": [{"text": c["text"], "ghost": c.get("ghost", False)} for c in s["chips"]],
            "review": review_slug(s["brand"]),
        })
    return out


def models_of_stack(stack: dict, title_by_slug: dict[str, str]) -> list[str]:
    """Слаги моделей, названных в чипах стека. Чип «Аренда актива: AWS» → «Аренда актива»."""
    found = []
    for c in stack["chips"]:
        chip = norm(c["text"])
        for slug, title in title_by_slug.items():
            if norm(title) == chip and slug not in found:
                found.append(slug)
    return found


def strings(node) -> list:
    """Все строковые значения внутри узла, на любой глубине."""
    if isinstance(node, str):
        return [node]
    if isinstance(node, dict):
        return [s for v in node.values() for s in strings(v)]
    if isinstance(node, list):
        return [s for v in node for s in strings(v)]
    return []


def nodes(obj, out=None) -> list:
    """Все словари внутри структуры, от внешних к внутренним."""
    out = [] if out is None else out
    if isinstance(obj, dict):
        out.append(obj)
        for v in obj.values():
            nodes(v, out)
    elif isinstance(obj, list):
        for v in obj:
            nodes(v, out)
    return out


def unpack_arrows(card: dict) -> None:
    """Подписи к стрелкам схемы — из строк в объекты.

    Числа встречаются и в них («товар с маржой 60-75%»), а пометка ставится на
    словарь. Без разворота гасилась бы вся схема «поток денег» разом.
    """
    flow = card.get("flow")
    if not flow:
        return
    if flow.get("arrows") and isinstance(flow["arrows"][0], str):
        flow["arrows"] = [{"text": a} for a in flow["arrows"]]
    # подпись под схемой — тоже объект: иначе несверенное число в ней гасило бы
    # всю диаграмму вместе с узлами
    if isinstance(flow.get("note"), str):
        flow["note"] = {"text": flow["note"]}


def mark_pending(card: dict, quotes: list) -> tuple:
    """Пометить самый мелкий узел, где стоит несверенное число.

    Метится именно мелкий узел, а не весь блок: иначе одна цифра в абзаце гасила бы
    целую панель «На чём маржа» вместе с механикой, ради которой страница и делается.
    Возвращает (сколько узлов помечено, какие цитаты не нашлись).
    """
    if not quotes:
        return 0, []
    scope = nodes({"b": card.get("blocks", []), "k": card.get("kapkan"),
                   "r": card.get("brands", []), "f": card.get("flow")})
    hits, missed = 0, []
    for q in quotes:
        if not q:
            continue
        matched = [n for n in scope if q in key(" ".join(strings(n)))]
        if not matched:
            # аудитор местами цитирует с пересказом («Поисковая реклама самая дорогая»
            # против «Поисковая реклама - самая дорогая»). Тогда ищем по словам.
            words = [w for w in re.findall(r"[\w$%]+", q) if len(w) >= 4]
            if len(words) >= 3:
                matched = [n for n in scope
                           if sum(w in key(" ".join(strings(n))) for w in words) >= len(words) * 0.8]
        if not matched:
            missed.append(q)
            continue
        # одно и то же утверждение стоит в карточке в нескольких местах: в абзаце,
        # в ячейке таблицы и в строке «Бренды в разбор». Гасим каждое такое место,
        # но только самое глубокое: узел, внутри которого цитаты уже нет.
        for n in matched:
            inner = [x for x in nodes(n) if x is not n and any(x is m for m in matched)]
            if inner or n.get("pending"):
                continue
            n["pending"] = True
            hits += 1
    return hits, missed


def main() -> None:
    atlas, src = load_atlas()
    pending = load_pending()
    group_title = {g["key"]: g["title"] for g in atlas["groups"]}

    cards = list(atlas["models"]) + [atlas["layers"][k] for k in sorted(atlas["layers"])]
    title_by_slug = {SLUGS[c["id"]]: c["title"] for c in cards}

    stacks = build_stacks(atlas)
    # обратный индекс: слаг модели → разборы брендов, у которых она стоит в стеке
    from_stacks: dict[str, list[str]] = {}
    for st in stacks:
        if not st["review"]:
            continue
        for slug in models_of_stack(st, title_by_slug):
            from_stacks.setdefault(slug, []).append(st["review"])

    out = []
    marked, missed = 0, []
    for c in cards:
        slug = SLUGS[c["id"]]
        unpack_arrows(c)
        hits, gone = mark_pending(c, pending.get(c["id"], []))
        marked += hits
        missed += [(c["id"], q) for q in gone]
        is_layer = c["id"] in ("m33", "m34", "m35", "m36")
        brands = [b for b in c.get("brands", []) if norm(b["brand"]) not in EXCLUDE_BRANDS]
        # ссылка на написанный разбор считается здесь, а не в шаблоне страницы:
        # сопоставление имён — работа сборщика
        for b in brands:
            b["review"] = review_slug(b["brand"])

        # разборы из таблицы «Бренды в разбор» плюс из стеков, порядок детерминирован
        reviews: list[str] = []
        for b in brands:
            r = review_slug(b["brand"])
            if r and r not in reviews:
                reviews.append(r)
        for r in from_stacks.get(slug, []):
            if r not in reviews:
                reviews.append(r)

        out.append({
            "id": c["id"],
            "num": c["num"],
            "slug": slug,
            "layer": is_layer,
            "groupKey": c.get("group_key", ""),
            "groupTitle": c.get("group_title", "") or group_title.get(c.get("group_key", ""), ""),
            "title": c["title"],
            "formula": c["formula"],
            "flow": c.get("flow"),
            "blocks": c.get("blocks", []),
            "kapkan": c.get("kapkan"),
            "brands": brands,
            "reviews": reviews,
            "course": COURSE_SLUG,
        })

    data = {
        "meta": {
            "source": src.name,
            "models": sum(1 for x in out if not x["layer"]),
            "layers": sum(1 for x in out if x["layer"]),
            "groups": len(atlas["groups"]),
            "rare": len(atlas["rare"]),
            "stacks": len(stacks),
            "excluded": sorted(EXCLUDE_BRANDS),
            "showcase": SHOWCASE,
            # кейсотека на сайт не идёт: числа историй не сверены по первичке
            "cases": "не публикуется до сверки цифр, см. README_ATLAS.md",
        },
        "groups": [{"key": g["key"], "title": g["title"],
                    "models": [SLUGS[m] for m in g["models"]]} for g in atlas["groups"]],
        "models": out,
        # аудит 06.09: во всей вкладке «Редкие формы» и во всех 37 стеках нет ни
        # одного датированного числа, а утверждения читаются как факты о структуре
        # выручки. Публикуются только после сверки, поэтому помечены целиком.
        "rare": [dict(r, pending=True) for r in atlas["rare"]],
        "stacks": [dict(s, pending=True) for s in stacks],
    }
    known = {m["slug"] for m in out}
    missing = [s for s in SHOWCASE if s not in known]
    if missing:
        sys.exit(f"витрина /startup ссылается на неизвестные модели: {', '.join(missing)}")

    OUT.write_text(json.dumps(data, ensure_ascii=False, indent=1), encoding="utf-8")

    data["meta"]["pendingItems"] = marked
    linked = sum(1 for m in out if m["reviews"])
    print(f"models.json ← {src.name}")
    print(f"  моделей {data['meta']['models']} в {data['meta']['groups']} группах, "
          f"слоёв {data['meta']['layers']}, редких форм {data['meta']['rare']}, "
          f"стеков {data['meta']['stacks']}")
    print(f"  с перекрёстными ссылками на разборы: {linked} из {len(out)}")
    print(f"  придержано до сверки по первичке: {marked} тезисов + редкие формы и стеки целиком")
    if missed:
        print(f"  ! цитат аудита не найдено в тексте: {len(missed)} — проверить вручную:")
        for cid, q in missed:
            print(f"      {cid}: {q[:90]}")
    for m in out:
        if m["reviews"]:
            print(f"    {m['num']} {m['title']}: {', '.join(m['reviews'])}")


if __name__ == "__main__":
    main()
