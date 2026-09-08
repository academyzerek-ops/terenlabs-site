import Link from "next/link";
import { redirect } from "next/navigation";
import { Container } from "@/components/Container";
import { Arrow } from "@/components/Button";
import { SignInMethods } from "@/components/SignInMethods";
import { auth, signIn, providersConfigured } from "@/auth";

export const metadata = { title: "Вход — TerenLabs", robots: { index: false, follow: false } };

// Вход ПО ЖЕЛАНИЮ: аноним не теряет ничего. Аккаунт добавляет статистику,
// память прогресса и зачёт в рейтинг «Океана».
// Три способа: Telegram (Login Widget, бот только для входа), код на почту и Google
// (мост /api/ocean-bridge, даёт почту). Все сходятся в один аккаунт Океана.
export default async function Page() {
  const session = await auth();
  if (session) redirect("/dashboard");

  return (
    <Container className="flex min-h-[70vh] items-center justify-center py-9 sm:py-16">
      <div className="panel w-full max-w-sm p-6 sm:p-7">
        <p className="eyebrow">Вход · по желанию</p>
        <h1 className="mt-2 text-[22px] sm:text-[24px]">Свой профиль в океане</h1>
        <p className="mt-2 text-[14px] leading-relaxed text-text-2">
          Аккаунт добавляет статистику попыток, память прогресса между устройствами и место в рейтинге.
        </p>

        <div className="mt-7">
          <SignInMethods
            googleReady={providersConfigured.google}
            googleAction={async () => {
              "use server";
              await signIn("google", { redirectTo: "/auth/bridge-finish" });
            }}
          />
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
