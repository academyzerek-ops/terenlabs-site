# Вход на сайте

**Актуально (решение Адиля 15.07):** вход только через Telegram deep-link
(`components/TgDeepLinkLogin.tsx` → бэкенд `/api/ocean/auth/tg/*`), tg_id общий
с Mini App — прогресс сходится в один аккаунт. Для нативного приложения остаётся
redirect-виджет Telegram (`/auth/sign-in?return=miniapp` → `/auth/tg-callback`).

Google/Apple через NextAuth v5 (`auth.ts`, `/api/ocean-bridge`) **законсервированы**:
код сохранён, с витрины `/auth/sign-in` кнопки убраны. Инструкция ниже — на случай,
если их решат вернуть. Авторизация — ПО ЖЕЛАНИЮ: без ключей сайт полностью
работает анонимно.

---

## Подключение входа Google / Apple (законсервировано)

Ключи кладутся в `.env.local` (в git не попадает) — и провайдер появляется
на `/auth/sign-in` сам, если вернуть кнопки на витрину.

## Google (5 минут)

1. https://console.cloud.google.com → выбери проект (или создай новый)
2. APIs & Services → OAuth consent screen → External → заполни имя «TerenLabs» + почта
3. APIs & Services → Credentials → Create Credentials → **OAuth client ID**
   - Application type: **Web application**
   - Authorized redirect URIs — добавить ОБА:
     - `http://localhost:3001/api/auth/callback/google` (разработка)
     - `https://ДОМЕН/api/auth/callback/google` (прод — добавить, когда будет домен)
4. Скопировать Client ID и Client Secret → в `.env.local`:

```
AUTH_GOOGLE_ID=xxxxx.apps.googleusercontent.com
AUTH_GOOGLE_SECRET=GOCSPX-xxxxx
```

5. Перезапустить дев-сервер. Кнопка «Войти через Google» появится сама.

## Apple (требует Apple Developer Program, $99/год)

1. developer.apple.com → Certificates, Identifiers & Profiles
2. Identifiers → App ID (если нет) → затем **Services ID** (это и есть client_id),
   включить «Sign in with Apple», привязать домен + return URL:
   `https://ДОМЕН/api/auth/callback/apple`
3. Keys → создать ключ с «Sign in with Apple» → скачать .p8
4. Из .p8 + Team ID + Key ID собирается client_secret (JWT). NextAuth принимает
   готовый секрет: сгенерировать можно скриптом из доков Auth.js
   (https://authjs.dev/getting-started/providers/apple)

```
AUTH_APPLE_ID=cc.terenlabs.site   (Services ID)
AUTH_APPLE_SECRET=eyJ...          (сгенерированный JWT, живёт до 6 мес)
```

⚠️ Apple не работает с localhost и требует https-домен — подключать после
появления постоянного домена.

## Прод

На хостинге (Railway/Vercel) добавить те же переменные + `AUTH_SECRET`
(значение из `.env.local`) и `AUTH_URL=https://ДОМЕН`.

## Что дальше (этап B — бэкенд)

Сейчас «память» (прогресс курсов, попытки тестов) живёт в localStorage устройства
и работает даже анониму. После входа — этап B: таблица site-юзеров на бэкенде
(email ↔ tg_id), синк памяти между устройствами и зачёт попыток сайта
в рейтинг «Океана».
