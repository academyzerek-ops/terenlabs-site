# Реестр приёмов победителей Awwwards/CSSDA/FWA 2025–2026

> Исследование 2026-06-07: 15+ подборок, 80+ сайтов. SOTY 2025: Lando Norris (OFF+BRAND),
> Messenger (abeto); CSSDA WOTY: Dropbox Brand; 2024: Igloo Inc.
> У каждого приёма — Safari-вердикт. Полный текст приёмов 1–46 — см. транскрипт исследования.

## Самое применимое к TerenLabs (с Safari-вердиктами)

### Hero
- **(2) Построчный reveal заголовка** — строки H1 в overflow:hidden въезжают снизу, stagger
  80–120ms. Самый «дорогой» приём при нулевой цене. Safari: надёжно (transform+opacity).
- **(3) Serif+sans в одном заголовке** — ключевое слово Playfair Italic, остальное гротеск.
- **(5) «Тихий» hero** для внутренних страниц: eyebrow-метка, ≤6 слов, 60% воздуха, один CTA
  (так сделан Dropbox Brand — победитель CSSDA).
- **(6) CTA-пара**: pill-кнопка 52–56px + текстовая ссылка со стрелкой.

### Карточные сетки
- **(10) Hover-карточка**: scale картинки 1.05 внутри overflow:hidden, подъезжает описание.
  Обернуть в @media (hover:hover) — на iOS залипает.
- **(11) Список-строки вместо карточек** (Klim Type Foundry): «Кейс · ниша · итог» строками
  с hover-инверсией — дороже сетки одинаковых карточек. Превью у курсора — только desktop.
- **(14) Stacked cards**: position:sticky карточки наезжают стопкой. Создан для «5 наставлений».

### Ритм страницы
- **(15) Смена фона между секциями** transition 0.6–0.8s по IntersectionObserver. Тёмный сайт
  обязан иметь 1–2 светлые передышки (у нас — палубы ✓).
- **(18) Числа-факты огромным кеглем** 8–12vw + tabular-nums.
- **(20) Тонкие линии + нумерация секций** «01/02/03» моно-шрифтом — «консультантский» вид,
  JetBrains Mono уже в бренде.
- **(21) Glow из глубины** — radial-gradient бирюзы 6–10% opacity за контентом.
  НЕ filter:blur() на div — лагает WebKit.

### Навигация
- **(23) Шапка скрывается при скролле вниз, возвращается при скролле вверх** с блюром
  (-webkit-backdrop-filter обязателен).
- **(24) Полноэкранное оверлей-меню** Playfair-пунктами 8–12vh со stagger. Блокировать скролл
  боди с сохранением позиции (iOS-баг).
- **(26) Roll-over ссылок** — текст-дубликат подъезжает снизу. Чистый CSS, надёжно.

### Футер
- **(28) Футер-«вторая страница»**: огромное слово (15vw+), может «уходить под воду»
  (обрезаться нижним краем) — буквальный океанский ход.
- **(29) Reveal-футер**: контент приподнимается занавесом, открывая футер. Метафора «дна».
  100svh, не 100vh.
- **(30) Градиентный шов** секция→футер без линии.

### Микровзаимодействия (все Safari-надёжные)
- **(32) Roll-over текста кнопок** — два слоя текста, 200–300ms. Самый выгодный приём.
- **(33) Scroll-reveal** — только IntersectionObserver (CSS scroll-timeline — лишь Safari 26+).
- **(35) Параллакс в маске** — картинка выше контейнера, translateY 0.1–0.2 скорости.
  НИКОГДА background-attachment: fixed (мёртв на iOS).
- **(40) :active { scale(.97) }** + -webkit-tap-highlight-color: transparent.

### Контент
- **(41) Узкая колонка 45–75 символов + широкие вставки** (картинки/цитаты full-bleed).
- **(42) «Глава-шапка»**: категория капсом → serif 48–72px → мета-строка → hero-изображение.
- **(44) Drop cap через initial-letter** — Safari поддерживает ЛУЧШЕ всех (прогрессив).
- **(45) «Дальше читать»** в конце кейса + мягкий мост к финмодели (Академию в воронку НЕ превращать).
- **(46) Таблицы как дизайн-объект**: 1px линии, mono-цифры, hover строк; sticky th в
  overflow-x капризен в WebKit — тестировать.

## SAFARI — красные зоны (сводка)
1. CSS scroll-driven animations — только Safari 26+; база = IntersectionObserver
2. backdrop-filter — нужен -webkit-, дорог на iOS (только узкая шапка)
3. background-attachment: fixed — мёртв на iOS
4. filter: blur() на больших слоях — лагает; glow = radial-gradient
5. 100vh прыгает — использовать 100svh/100dvh
6. autoplay video — muted playsinline + постер (Low Power Mode не играет)
7. hover на тач залипает — @media (hover:hover)
8. masonry в Grid нет — columns/JS
9. text-stroke/background-clip:text — только с -webkit-
10. звук — только по user gesture

## Формула «тихой роскоши» для TerenLabs
Построчный reveal serif-заголовков (2) + линии и нумерация секций (20) + glow из глубины (21)
+ ритм тёмное/светлое (15) + stacked cards «5 наставлений» (14) + list-hover каталог кейсов (11)
+ футер-«дно» (29) + roll-over кнопки (32). Всё — transform/opacity/sticky/IO, 100% Safari,
без WebGL.

## Источники
awwwards.com (annual, SOTY, igloo case), cssdesignawards.com (woty2025), spinxdigital.com,
wavespace.agency, webdesignawards.io, htmlburger.com, qodeinteractive.com, itsoffbrand.com,
godly.website/websites/dark, dark.design, landdding.com, scrollytelling.ai, caniuse.com,
cydstumpel.nl, mockuuups.studio, vev.design, dtelepathy.com
