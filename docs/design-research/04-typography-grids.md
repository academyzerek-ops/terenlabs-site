# Стандарты вёрстки премиум-сайтов: числа и правила

> Исследование 2026-06-07: 15+ источников + прямые замеры живого CSS
> (Stripe, Linear, Anthropic через designmd.cc; pudding.cool напрямую).

## Типографическая шкала (замеры)

| Роль | Anthropic (serif-led) | Stripe | NYT | The Pudding |
|---|---|---|---|---|
| Display | 91px serif 700 lh1.2 | 48px w300 lh1.03 | — | clamp(48px,4vw,80px) |
| H1 | 61px serif 700 lh1.2 | 32px lh1.2 | 31px Cheltenham | clamp(24px,2.5vw,40px) |
| H2 | 24px sans 700 | 26px | — | clamp(16px,1.75vw,24px) |
| Body | 16-18px lh1.5 | 16px lh1.4 | 18px serif | 16-18px |

- Editorial-шкала: ratio 1.333–1.618; прыжок display↔body **3x+, не 1.5x** (анти-AI-slop).
- Мобила: display −1 шаг шкалы; body НЕ ниже 16px (иначе авто-зум iOS-инпутов).
- Всё display — через clamp().

**Рекомендация TerenLabs:** Display 56–72/36–40; H1 40–48/32; H2 28–32/24; H3 20–22;
body 16–18 lh 1.55–1.65 (тёмная тема просит воздуха); caption 13–14. Ratio ~1.333 от 17px.

## Playfair: межстрочные и трекинг

- Display lh **1.1–1.2** (ниже 1.1 нельзя — выносные столкнутся), H2-H3 1.2–1.3.
- Letter-spacing: чем крупнее — тем туже, НО на тёмном фоне светлые буквы оптически жирнеют:
  display **-0.01…-0.015em** (не -0.02), body 0…+0.01em. <20px — не минусовать вовсе.
- Веса: Playfair 700/900 для hero; 400 для крупных заголовков — вяло; в body — никогда.
- Текст тёмной темы: НЕ #fff на #000. Шкала Linear: #f7f8f8 primary / #d0d6e0 secondary /
  #8a8f98 muted. Чисто-белый — только заголовкам.

## Ширины и сетки

- Колонка текста: 65–75 символов = **580–720px** (Pudding: 720; NYT: ~600). CSS: max-width:65ch.
- Контейнер: **1200–1320px**, 12 колонок, gutter 24.
- Канон трёх ширин (Josh Comeau): `grid-template-columns: 1fr min(65ch,100%) 1fr` —
  текст narrow, медиа wide, брейкеры full-bleed.

## Вертикальный ритм (замеры)

- Anthropic: 64px между секциями, 96 hero. Linear: 64–96. Stripe: 64 (мобила 32→24).
- Правило: секции **80–128px desktop / 48–64 mobile**, hero до 128–160.
- Иерархия: 8 связанные / 16 внутри компонента / 24 группы / 32–48 подблоки / 64+ блоки.
- Закон: **internal ≤ external**; заголовок секции ближе к своему контенту минимум 2:1.

## Serif+sans баланс

- Роли жёстко: serif ТОЛЬКО display/H1/H2/цитаты; sans — всё ≤24px, навигация, кнопки.
- Контраст по трём осям сразу: размер 3x+, вес 700vs400, цвет (заголовки белые, body #E0E6ED).
- JetBrains Mono для денег/метрик: tabular-nums + ls -0.02em, 13–14px — «финансовая» деталь.
- Eyebrow: sans 12–13px uppercase ls +0.08–0.12em muted.

## «Дорогие» карточки

- Паддинг: 24 стандарт, 32 премиум. <20 = дёшево.
- Радиусы — СИСТЕМА: контейнер всегда круглее контролов (Stripe 4/16; Anthropic 8/24).
- **Nested formula: inner = outer − padding.**
- Тени на тёмном НЕ работают: глубина = 1px бордер + ступень фона. Hover: translateY(-2px)
  + бордер. Active: scale(0.97).

## Анти-паттерны дешёвого сайта

1. Один радиус на всём + нарушение nested-формулы
2. Body <16px, lh 1.2, строки >75 символов
3. Inter+фиолетовый градиент+3 карточки icon-heading-text («AI slop»)
4. ВСЁ в карточках — премиум чередует full-bleed/колонку/асимметрию/карточки
5. Pure white на pure black (−20% скорости чтения)
6. Прыжки шкалы 1.5x («всё среднее»), bold везде
7. Секции 30–40px впритык — нет дыхания
8. Нет hover/focus/микропереходов (стандарт 0.2s ease-out)
9. Случайные значения вне шкалы (17px, 23px, 35px)
10. Glassmorphism/glow везде вместо точечного

## Готовая база токенов TerenLabs

```
Спейсинг: 4/8/12/16/24/32/48/64/96/128
Секции: 96–128px desktop / 56–64 mobile; hero 128–160
Контейнер 1280; текст 720 (65ch); медиа-wide 1280; брейкеры full-bleed
Display: Playfair 700 clamp(2.5rem,5vw,4.5rem) lh1.1 ls-0.01em
H2: Playfair 700 clamp(1.75rem,3vw,2.25rem) lh1.15
H3+: Source Sans 600 20–22 lh1.3
Body: Source Sans 16–18 lh1.6, цвет класса #E0E6ED (не #fff)
Цифры: JetBrains Mono tabular-nums 13–14 ls-0.02em
Карточки: r16, p24–32, бордер 1px + ступень фона (не тень)
Кнопки: r6–8 (nested formula), p12–16/20–24
```

## Источники
designmd.cc (stripe/linear/anthropic), pudding.cool, designshack.net, cieden.com,
joshwcomeau.com/css/full-bleed, css-tricks.com, subux.pro, ux.redhat.com, hype4.academy,
92learns.com, uxplanet.org, madegooddesigns.com, jukeboxprint.com, sensatype.com,
designsystem.digital.gov, uinica.com, prg.sh, theadpharm.com, hooman.com, learnui.design,
pimpmytype.com
