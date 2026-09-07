# Вход на сайте

Три способа, все сходятся в один аккаунт Океана (таблица `identities`,
провайдеры telegram / google / email).

1. **Telegram deep-link** (главный): `components/TgDeepLinkLogin.tsx` → бэкенд `/api/ocean/auth/tg/*`,
   tg_id общий с Mini App. Для нативного приложения остаётся redirect-виджет
   (`/auth/sign-in?return=miniapp` → `/auth/tg-callback`).
2. **Почта + код**: `components/CodeLogin.tsx` → бэкенд `/api/ocean/auth/email/start`
   и `/email/verify`. Код 6 цифр на 10 минут, одноразовый. Работает с 07.09.2026.
3. **Google**: NextAuth v5 (`auth.ts`) → возврат на `/auth/bridge-finish` → `/api/ocean-bridge`
   меняет сессию на веб-токен Океана и передаёт почту (`users.email`). Работает с 08.09.2026.

Способы показаны одним рядом круглых кнопок (`components/SignInMethods.tsx`) на
`/auth/sign-in` и в кабинете анониму. Кнопка почты включается сама по ответу
`/api/ocean/auth/methods`, кнопка Google — по наличию ключей в env.

Авторизация по желанию: без входа сайт работает полностью.

**Вход по СМС удалён 07.09.2026**: платно за каждое сообщение и требует договора
с оператором. Восстанавливать не планируем.

---

## Анкета после входа

`/auth/onboarding` — имя, год рождения, пол, область РК. Имя вводится руками,
остальное выпадающими списками. Бэкенд считает анкету пройденной только когда
заполнены все четыре поля (`needs_onboarding`), иначе пользователь из Telegram
не увидел бы её никогда: имя оттуда подставляется само. Пустое поле не затирает
уже сохранённый ответ, анкету можно дозаполнить вторым заходом.

Данные лежат в `users`: `display_name`, `birth_year`, `gender` (m / f / na),
`region_code` (ISO 3166-2:KZ). Год рождения и пол в рейтинге не показываются.

---

## Почта: как устроена отправка

Письма с кодом уходят через **Resend по HTTP API**, не по SMTP: контейнер Railway
не пускает исходящие соединения ни на 465, ни на 587. Домен отправителя
`mail.terenlabs.kz` подтверждён в Resend, DKIM и SPF стоят на поддомене — почта
`info@terenlabs.kz` в Zoho не затронута.

Env бэкенда: `RESEND_API_KEY`, `SMTP_FROM` (адрес отправителя, имя переменной
осталось от прежней схемы). Без ключа бэкенд отдаёт `debug_code` в ответе, и
форма его показывает — так удобно щупать вход локально.

---

## Google: что уже сделано

Проект Google Cloud `gen-lang-client-0423344092`, экран согласия опубликован
(«In production»), клиент **TerenLabs сайт**, тип Web application.

Разрешённые адреса возврата:

```
https://terenlabs.kz/api/auth/callback/google
https://terenlabs-site-production.up.railway.app/api/auth/callback/google
http://localhost:3001/api/auth/callback/google
```

Env сайта на Railway: `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`, `AUTH_SECRET`,
`AUTH_URL=https://terenlabs.kz`. Локально те же переменные кладутся
в `.env.local` (в git не попадает), после чего кнопка появляется сама.

Новый адрес возврата (например, ещё один домен) добавляется в том же клиенте:
Google Cloud → Google Auth Platform → Clients → TerenLabs сайт.

---

## Apple (не подключён)

Требует Apple Developer Program, 99 долларов в год, и https-домен.

1. developer.apple.com → Certificates, Identifiers & Profiles
2. Identifiers → App ID (если нет) → затем **Services ID** (это и есть client_id),
   включить «Sign in with Apple», привязать домен и адрес возврата:
   `https://terenlabs.kz/api/auth/callback/apple`
3. Keys → создать ключ с «Sign in with Apple» → скачать .p8
4. Из .p8 плюс Team ID и Key ID собирается client_secret (JWT). NextAuth принимает
   готовый секрет, сгенерировать можно скриптом из доков Auth.js
   (https://authjs.dev/getting-started/providers/apple)

```
AUTH_APPLE_ID=cc.terenlabs.site   (Services ID)
AUTH_APPLE_SECRET=eyJ...          (сгенерированный JWT, живёт до 6 месяцев)
```
