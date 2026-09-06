# -*- coding: utf-8 -*-
"""build_brands.py: разборы брендов из vault (Разборы/bm-*.md) → content/brands.json.

Разметка тела повторяет ручную вёрстку пилотов (bm-netflix, bm-ufc): блоки .c с ярлыками .lb,
сетка цифр .nb-grid из callout [!numbers], таблица «Откуда цифры» .src, блок «Главное» .tk.
Все разборы собираются из md одинаково.
"""
import json, re, html, pathlib, sys

VAULT = pathlib.Path("/Users/adil/TerenLabs/Разборы")
SITE = pathlib.Path(__file__).resolve().parent.parent
OUT = SITE / "content/brands.json"
# Пилоты больше не заморожены. Их ручную вёрстку берегли, пока разборы писались
# по старому канону; с переходом на новый (07.09.2026) их тексты переписываются
# вместе со всеми, и заморозка просто не пускала бы правки на сайт.
KEEP = set()

SECTOR = [
    (r"стриминг|медиа|мессенджер|соцсет|видео|реклам|платформ", "media"),
    (r"спорт|футбол|теннис|лига|турнир", "sport"),
    (r"авто|мотоцикл", "auto"),
    (r"ретейл|торговл|маркетплейс|напитк|снек|мода|люкс|обув|одежд|электронн", "retail"),
]

def esc(t): return html.escape(t, quote=False)

def inline(t):
    t = esc(t)
    t = re.sub(r"\*\*(.+?)\*\*", r"<strong>\1</strong>", t)
    t = re.sub(r"(?<![\w*])\*(?!\*)(.+?)(?<!\*)\*(?!\w)", r"<em>\1</em>", t)
    return t

def parse(md):
    fm = {}
    body = md
    if md.startswith("---"):
        _, fmtxt, body = md.split("---", 2)
        for line in fmtxt.strip().splitlines():
            if ":" in line:
                k, v = line.split(":", 1); fm[k.strip()] = v.strip().strip('"')
    # секции по ## ; вступление до первого ##
    lines = body.strip().splitlines()
    title = ""
    sections = []  # (name, [lines])
    cur = ("_intro", [])
    for ln in lines:
        if ln.startswith("# ") and not title:
            title = ln[2:].strip(); continue
        if ln.startswith("## "):
            sections.append(cur); cur = (ln[3:].strip(), []); continue
        cur[1].append(ln)
    sections.append(cur)
    return fm, title, dict(sections), [s for s, _ in sections]

def paragraphs(lines):
    """Список блоков: ('p', text) | ('numbers', [(n, cap)]) | ('table', rows) | ('ol', items)."""
    out, buf, table, numbers, ol = [], [], [], None, []
    def flush():
        nonlocal buf
        if buf: out.append(("p", " ".join(x.strip() for x in buf))); buf = []
    for ln in lines + [""]:
        s = ln.rstrip()
        if s.startswith("> [!numbers]"):
            flush(); numbers = []; continue
        if numbers is not None and s.startswith(">"):
            item = s[1:].strip()
            if "|" in item:
                n, cap = [x.strip() for x in item.split("|", 1)]; numbers.append((n, cap))
            continue
        if numbers is not None and not s.startswith(">"):
            out.append(("numbers", numbers)); numbers = None
        if s.startswith("|"):
            flush(); cells = [c.strip() for c in s.strip("|").split("|")]
            if set("".join(cells)) <= set("-: "): continue
            table.append(cells); continue
        elif table:
            out.append(("table", table)); table = []
        if re.match(r"^\d+\.\s", s):
            flush(); ol.append(re.sub(r"^\d+\.\s", "", s)); continue
        elif ol and not s:
            out.append(("ol", ol)); ol = []
        if not s:
            flush(); continue
        buf.append(s)
    if ol: out.append(("ol", ol))
    return out

def render_block(kind, blocks, label=None, label_cls="purple", dropcap=False):
    parts = [f'  <div class="c{(" " + kind) if kind else ""}">']
    if label: parts.append(f'    <div class="lb {label_cls}">{esc(label)}</div>')
    first = True
    for k, v in blocks:
        if k == "p":
            t = inline(v)
            if dropcap and first and t and t[0].isalpha():
                t = f'<span class="dropcap">{t[0]}</span>{t[1:]}'
            parts.append(f"    <p>{t}</p>"); first = False
    parts.append("  </div>")
    return "\n".join(parts)

DIV = '  <div class="div"><span class="ln"></span><span class="dt"></span><span class="ln"></span></div>'

# Оформление раздела по его имени. Неизвестные разделы всё равно рендерятся
# обычным блоком: канон меняется, и молча терять текст нельзя.
ACCENT = {
    "С чего начали": ("", "purple", True),
    "Как это работает": ("", "purple", False),
    "Чем заплатили": ("ao", "orange", False),
    "Сколько это приносит": ("", "purple", False),
    "Мост": ("al", "purple", False),
    # старые имена: файлы, которые ещё не переписаны под канон 07.09.2026
    "Как устроено": ("", "purple", True),
    "Откуда деньги": ("", "purple", False),
    "Развилка": ("ao", "orange", False),
    "Что это убивает": ("", "red", False),
}

# после каких разделов ставится разделительная звёздочка
BREAK_AFTER = {"Как это работает", "Чем заплатили", "Откуда деньги", "Что это убивает"}


def build_body(sections, order):
    """Тело разбора: разделы идут в том же порядке, что и в файле.

    Раньше здесь был зашит список имён из старого канона, и когда канон
    поменялся, новые разделы просто исчезали из html: у UFC так потерялась
    половина текста. Теперь порядок берётся из самого файла.
    """
    out = [render_block("al", paragraphs(sections.get("_intro", [])), "Парадокс")]

    for name in order:
        if name in ("_intro", "Откуда цифры", "Главное"):
            continue
        kind, cls, dropcap = ACCENT.get(name, ("", "purple", False))
        blocks = paragraphs(sections.get(name, []))
        if not blocks:
            continue
        out.append(render_block(kind, blocks, name, cls, dropcap=dropcap))
        if name in BREAK_AFTER:
            out.append(DIV)

    src = paragraphs(sections.get("Откуда цифры", []))
    for k, v in src:
        if k == "table":
            head, rows = v[0], v[1:]
            th = "".join(f"<th>{inline(c)}</th>" for c in head)
            trs = "\n".join("          <tr>" + "".join(f"<td>{inline(c)}</td>" for c in r) + "</tr>" for r in rows)
            out.append(f'  <div class="src-wrap">\n    <table class="src">\n      <thead><tr>{th}</tr></thead>\n      <tbody>\n{trs}\n      </tbody>\n    </table>\n  </div>')
        elif k == "p":
            out.append(f'    <p class="src-note">{inline(v)}</p>')

    main = paragraphs(sections.get("Главное", []))
    items = [i for k, v in main if k == "ol" for i in v]
    if items:
        pts = "\n".join(f'    <div class="tk-pt"><span class="tk-n">{i+1}</span><span class="tk-t">{inline(t)}</span></div>' for i, t in enumerate(items))
        out.append(f'  <div class="tk">\n    <span class="tk-badge">Главное из разбора</span>\n{pts}\n  </div>')
    return "\n\n".join(out)

def first_sentence(text):
    text = re.sub(r"\*\*|\*", "", text)
    m = re.match(r"(.+?[.!?])(\s|$)", text)
    s = m.group(1) if m else text
    return s if len(s) <= 160 else s[:157].rsplit(" ", 1)[0] + "…"

def entry(md_path):
    fm, title, sections, order = parse(md_path.read_text(encoding="utf-8"))
    slug = fm.get("slug") or md_path.stem
    brand = fm.get("brand", title.split(":")[0])
    industry = fm.get("industry", "")
    cur = fm.get("currency", "USD").upper()
    sector = None
    for pat, sec in SECTOR:
        if re.search(pat, industry, re.I): sector = sec; break
    words = title.split(" ")
    title_html = esc(" ".join(words[:-1])) + ' <span class="o">' + esc(words[-1]) + "</span>" if len(words) > 1 else esc(title)
    intro_p = next((b for k, b in paragraphs(sections.get("_intro", [])) if k == "p"), "")
    year = fm.get("created", "2026")[:4]
    sub = f"{'Евро и доллар' if cur == 'EUR' else 'Доллар'} · отчётность за {int(year)-1} и {year} годы"
    model = industry.split(",")[0].strip() if industry else ""
    return {
        "type": "bm", "slug": slug, "title": title, "titleHtml": title_html, "brand": brand,
        "sub": sub, "blurb": first_sentence(intro_p),
        "mod": f"{brand} · {model}" if model else brand, "sector": sector,
        "level": "T1", "topic": "Бизнес", "stage": "Применение", "free": True, "img": None,
        "body": build_body(sections, order),
    }

def sync_products(brands):
    """Карточки разборов в каталоге: те же записи без тела, в content/products.json."""
    pj = SITE / "content/products.json"
    products = json.loads(pj.read_text(encoding="utf-8"))
    products = [x for x in products if x.get("type") != "bm"]
    for e in brands:
        products.append({k: v for k, v in e.items() if k not in ("body",)})
    pj.write_text(json.dumps(products, ensure_ascii=False, indent=1), encoding="utf-8")

def main():
    existing = json.loads(OUT.read_text(encoding="utf-8")) if OUT.exists() else []
    keep = [e for e in existing if e["slug"] in KEEP]
    new = []
    for p in sorted(VAULT.glob("bm-*.md")):
        if p.stem in KEEP: continue
        try:
            new.append(entry(p))
        except Exception as ex:  # noqa
            print("skip", p.name, ex, file=sys.stderr)
    data = keep + new
    OUT.write_text(json.dumps(data, ensure_ascii=False, indent=1), encoding="utf-8")
    sync_products(data)
    print(f"brands.json: {len(keep)} пилотов + {len(new)} новых = {len(data)}")
    for e in new: print(" ", e["slug"], "|", e["title"], "|", e["sector"], "|", len(e["body"]))

if __name__ == "__main__":
    main()
