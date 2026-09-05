import Link from "next/link";
import { redirect } from "next/navigation";
import { Container } from "@/components/Container";
import { Arrow } from "@/components/Button";
import { TelegramLogin } from "@/components/TelegramLogin";
import { SignInMethods } from "@/components/SignInMethods";
import { auth, signIn, providersConfigured } from "@/auth";
import { SITE_URL } from "@/lib/site";

export const metadata = { title: "Вход — TerenLabs", robots: { index: false, follow: false } };

// Вход ПО ЖЕЛАНИЮ: аноним не теряет ничего. Аккаунт добавляет статистику,
// память прогресса и зачёт в рейтинг «Океана».
// Три способа (решение Адиля 05.09.2026: собирать базу пользователей): Telegram
// (главный, тот же аккаунт что в Mini App), Google (мост /api/ocean-bridge, даёт почту),
// номер телефона с кодом по СМС (даёт телефон). Все три сходятся в один аккаунт Океана.
export default async function Page({
  searchParams,
}: {
  searchParams?: Promise<{ return?: string }>;
}) {
  const sp = await searchParams;
  // нативное приложение: redirect-флоу виджета → /auth/tg-callback → Mini App
  const forMiniapp = sp?.return === "miniapp";
  const session = await auth();
  if (session && !forMiniapp) redirect("/dashboard");

  return (
    <Container className="flex min-h-[70vh] items-center justify-center py-16">
      <div className="panel w-full max-w-sm p-6 sm:p-7">
        <p className="eyebrow">Вход · по желанию</p>
        <h1 className="mt-2 text-[22px] sm:text-[24px]">Свой профиль в океане</h1>
        <p className="mt-2 text-[14px] leading-relaxed text-text-2">
          Аккаунт добавляет статистику попыток, память прогресса между устройствами и место в рейтинге.
        </p>

        <div className="mt-7">
          {forMiniapp ? (
            <TelegramLogin authUrl={`${SITE_URL}/auth/tg-callback`} />
          ) : (
            <SignInMethods
              googleReady={providersConfigured.google}
              googleAction={async () => {
                "use server";
                await signIn("google", { redirectTo: "/auth/bridge-finish" });
              }}
            />
          )}
        </div>

        <p className="mt-7 border-t border-line pt-4 text-center text-[13px] text-text-2">
          Или просто{" "}
          <Link href="/catalog" className="link">
            продолжить без входа <Arrow />
          </Link>
        </p>
      </div>
    </Container>
  );
}
