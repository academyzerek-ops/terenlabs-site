import Link from "next/link";
import { redirect } from "next/navigation";
import { Container } from "@/components/Container";
import { Arrow } from "@/components/Button";
import { TelegramLogin } from "@/components/TelegramLogin";
import { TgDeepLinkLogin } from "@/components/TgDeepLinkLogin";
import { PhoneLogin } from "@/components/PhoneLogin";
import { GoogleLoginButton } from "@/components/GoogleLoginButton";
import { auth } from "@/auth";
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
      <div className="panel w-full max-w-md p-6 sm:p-8">
        <p className="eyebrow">Вход · по желанию</p>
        <h1 className="mt-3 text-[24px] sm:text-[30px]">Свой профиль в океане</h1>
        <p className="mt-3 text-[15px] leading-relaxed text-text-2">
          Весь TerenLabs открыт и без входа. Аккаунт добавляет статистику
          попыток, память прогресса между устройствами и место в рейтинге «Океана».
        </p>

        <div className="mt-8 flex flex-col gap-3">
          {forMiniapp ? (
            <TelegramLogin authUrl={`${SITE_URL}/auth/tg-callback`} />
          ) : (
            <TgDeepLinkLogin />
          )}
        </div>
        <p className="mt-2 text-center text-[13px] text-faint">
          Telegram даёт тот же аккаунт, что в Mini App: прогресс общий
        </p>
        {!forMiniapp && (
          <div className="mt-5">
            <GoogleLoginButton />
          </div>
        )}

        {!forMiniapp && (
          <>
            <div className="my-6 flex items-center gap-3 text-[12px] text-faint">
              <span className="h-px flex-1 bg-line" />
              или по номеру телефона
              <span className="h-px flex-1 bg-line" />
            </div>
            <PhoneLogin />
          </>
        )}

        <p className="mt-8 border-t border-line pt-5 text-center text-[14px] text-text-2">
          Или просто{" "}
          <Link href="/catalog" className="link">
            продолжить без входа <Arrow />
          </Link>
        </p>
      </div>
    </Container>
  );
}
