# Подключение входа Google / Apple

Авторизация на сайте — ПО ЖЕЛАНИЮ (NextAuth v5, `auth.ts`). Без ключей кнопки
не показываются, сайт полностью работает анонимно. Ключи кладутся в `.env.local`
(уже создан, в git не попадает) — и провайдер появляется на `/auth/sign-in` сам.

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
