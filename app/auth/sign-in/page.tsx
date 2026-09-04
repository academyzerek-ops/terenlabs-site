import Link from "next/link";
import { redirect } from "next/navigation";
import { Container } from "@/components/Container";
import { Arrow } from "@/components/Button";
import { TelegramLogin } from "@/components/TelegramLogin";
import { TgDeepLinkLogin } from "@/components/TgDeepLinkLogin";
import { auth } from "@/auth";
import { SITE_URL } from "@/lib/site";

export const metadata = { title: "Вход — TerenLabs", robots: { index: false, follow: false } };

// Вход ПО ЖЕЛАНИЮ: аноним не теряет ничего. Аккаунт добавляет статистику,
// память прогресса и зачёт в рейтинг «Океана».
// Пока вход только через Telegram (решение Адиля 15.07): аудитория телеграмная,
// tg_id совпадает с Mini App — прогресс сходится в один аккаунт автоматически.
// Google/Apple-мост (auth.ts, /api/ocean-bridge) сохранён в коде, но с витрины убран.
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
      <div className="w-full max-w-md rounded-[8px] border border-line bg-subtle p-6 sm:p-8">
        <p className="eyebrow">Вход · по желанию</p>
        <h1 className="mt-3 text-[24px] sm:text-[32px]">Свой профиль в океане</h1>
        <p className="mt-3 text-[15px] leading-relaxed text-text-2">
          Весь TerenLabs открыт и без входа. Аккаунт добавляет: статистику
          твоих попыток, память прогресса между устройствами и место
          в рейтинге «Океана».
        </p>

        <div className="mt-8">
          {/* нативное приложение: WKWebView не откроет t.me — там остаётся
              redirect-виджет; браузеру — deep-link без ввода номера */}
          {forMiniapp ? (
            <TelegramLogin authUrl={`${SITE_URL}/auth/tg-callback`} />
          ) : (
            <TgDeepLinkLogin />
          )}
          <p className="mt-2 text-center text-[13px] text-faint">
            тот же аккаунт, что в Mini App — прогресс общий
          </p>
        </div>

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
