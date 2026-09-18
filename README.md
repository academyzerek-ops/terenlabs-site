> # Репозиторий выведен из оборота 19.09.2026
>
> **Не деплоится и не является источником.** Домен `terenlabs.kz` с 13.09.2026 обслуживает `academyzerek-ops/teren-core` (`apps/web`). Проверка: на живом сайте `/literature` открывается заголовком «Книги по теме», здешняя версия страницы называется иначе.
>
> **Контент здесь читать нельзя.** В `public/academy` 290 глав, последняя правка 09.09.2026: это снимок до редакционной переработки 13–14.09. Трека «Инвестор» нет вовсе, нумерация файлов разошлась с действующей, часть текстов исправлена уже после снимка. Единственный источник контента — `teren-core/packages/content` (344 главы, 9 треков).
>
> **Код сюда тоже больше не пишем.** Разделы «Литература» и «Бренды» после 13.09 сделаны здесь и в teren-core параллельно, и живёт только версия из teren-core.
>
> Последнее незакоммиченное состояние сохранено в ветке `archive/2026-09-site`.

# terenlabs-site

Публичный сайт TerenLabs — https://terenlabs.kz. Next.js 16 (App Router), React 19,
Tailwind 4. Витрина для аудитории: Академия, тесты «Океан», кейсы, обзоры ниш.
Вся линейка бесплатна, платных продуктов нет (финмодели сняты с прода 09.09.2026,
фокус на Академии и тестах). Вход — по желанию: код на почту или Google (см. `docs/AUTH_SETUP.md`).

## Запуск

```bash
npm ci
cp .env.example .env.local   # секреты — см. комментарии в файле
npm run dev                  # http://localhost:3001
```

Проверки перед коммитом:

```bash
npx tsc --noEmit
npm run lint
npm run build
node scripts/check-content.mjs   # целостность content/*.json
```

## Структура

- `app/` — маршруты (каталог, тесты, кейсы, обзоры, уровни, кабинет, legal).
- `components/` — UI; `lib/` — контент, SEO, Океан-API, `lib/site.ts` — канонический домен.
- `content/*.json` — продукты, уровни, кейсы, обзоры, Академия (см. `content/README.md`).
- `public/academy`, `public/reviews-html` — встроенные главы и обзоры из основного репо.

## Импорт контента

Курсы, кейсы и обзоры не редактируются здесь руками — они импортируются из `frontend/`
основного репо TerenLabs (ветка main, worktree `/Users/adil/TerenLabs-zerek`):

```bash
node scripts/import_content.mjs
# другой источник:
TL_SRC=/path/to/TerenLabs/frontend node scripts/import_content.mjs
```

## Деплой

Railway, регион `europe-west4` (`railway.json`). Сборка — `Dockerfile`: multi-stage на
`output: "standalone"`, рантайм под non-root пользователем, порт 3000, healthcheck по `/`.
Деплой идёт из ветки `main` GitHub-репо. Переменные окружения задаются в Railway;
`NEXT_PUBLIC_SITE_URL`/`AUTH_URL` необязательны — `lib/site.ts` в проде фолбэчит
на `https://terenlabs.kz`.

Бэкенд (ИИ-чат, Океан, заявки) — отдельный сервис на Railway, адрес в `NEXT_PUBLIC_AI_API`.
