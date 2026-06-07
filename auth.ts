import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Apple from "next-auth/providers/apple";

// Авторизация ПО ЖЕЛАНИЮ: весь сайт доступен анониму; вход добавляет
// статистику, память и (этап B) зачёт в рейтинг «Океана».
// Ключи — в .env.local (см. docs/AUTH_SETUP.md). Без ключей провайдер
// просто не показывается на /auth/sign-in.
export const providersConfigured = {
  google: Boolean(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET),
  apple: Boolean(process.env.AUTH_APPLE_ID && process.env.AUTH_APPLE_SECRET),
};

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    ...(providersConfigured.google ? [Google] : []),
    ...(providersConfigured.apple ? [Apple] : []),
  ],
  session: { strategy: "jwt" },
  pages: { signIn: "/auth/sign-in" },
  trustHost: true,
});
