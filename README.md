# terenlabs-site

Публичный сайт TerenLabs — https://terenlabs.kz. Next.js 16 (App Router), React 19,
Tailwind 4. Витрина для аудитории: Академия, тесты «Океан», кейсы, обзоры ниш,
финмодели. Вся линейка бесплатна (пивот 20.07.2026); платная только индивидуальная
финмодель по заявке. Вход — по желанию, только через Telegram (см. `docs/AUTH_SETUP.md`).

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

- `app/` — маршруты (каталог, тесты, кейсы, обзоры, финмодели, уровни, кабинет, legal).
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
