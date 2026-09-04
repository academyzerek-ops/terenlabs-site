import { Container } from "@/components/Container";
import { RecRotator } from "@/components/RecRotator";
import { MyMemory } from "@/components/MyMemory";
import { OceanAccount } from "@/components/OceanAccount";
import { TgIdentityCard } from "@/components/TgIdentityCard";
import { Arrow } from "@/components/Button";
import { CATALOG } from "@/lib/content";
import { auth, signOut } from "@/auth";

export const metadata = { title: "Личный кабинет — TerenLabs", robots: { index: false, follow: false } };

// Кабинет работает и анониму (локальная память устройства).
// Вход через Telegram добавляет профиль; прогресс общий с Mini App.
export default async function Dashboard() {
  const session = await auth();
  // Рекомендации: бесплатный контур, edtech первым; финпродукты живут на своей витрине
  const pick = (type: string, n: number) =>
    CATALOG.filter((p) => !p.stub && p.img && p.type === type)
      .map((p) => ({ p, r: Math.random() }))
      .sort((a, b) => a.r - b.r)
      .slice(0, n)
      .map((x) => x.p);
  const lanes = [
    { items: pick("course", 5), periodMs: 9000 },
    { items: pick("case", 6), periodMs: 11000 },
    { items: pick("review", 6), periodMs: 13000 },
  ].filter((l) => l.items.length > 0);

  return (
    <Container className="py-14">
      {/* шапка кабинета */}
      <div className="flex flex-wrap items-start justify-between gap-6 border-b border-line pb-10">
        <div>
          <p className="eyebrow">Личный кабинет</p>
          <h1 className="mt-2 text-[32px] sm:text-[40px]">
            {session?.user?.name ? `Привет, ${session.user.name.split(" ")[0]}` : "Привет, основатель"}
          </h1>
          <p className="mt-2 text-[15px] text-text-2">
            {session
              ? "Память подключена к аккаунту. Что делаем сегодня?"
              : "Память хранится на этом устройстве. Войди, и она поедет с тобой."}
          </p>
        </div>

        {session?.user ? (
          <div className="flex items-center gap-4 rounded-[8px] border border-line bg-subtle p-4">
            {session.user.image ? (
              <img src={session.user.image} alt="" width={48} height={48} className="h-12 w-12 rounded-full object-cover" />
            ) : (
              <div className="flex h-12 w-12 items-center justify-center rounded-full border border-line-2 bg-card text-[16px] font-medium text-ink">
                {(session.user.name ?? "?").slice(0, 1)}
              </div>
            )}
            <div>
              <div className="text-[15px] font-medium text-ink">{session.user.name}</div>
              <div className="text-[12px] text-faint">{session.user.email}</div>
              <form
                action={async () => {
                  "use server";
                  await signOut({ redirectTo: "/" });
                }}
              >
                <button className="mt-1 text-[12px] text-text-2 hover:text-ink">Выйти</button>
              </form>
            </div>
          </div>
        ) : (
          <TgIdentityCard />
        )}
      </div>

      {/* Океан: живая статистика с бэкенда */}
      <OceanAccount nextAuthActive={!!session} />

      {/* мост в Mini App: тот же аккаунт, прогресс общий */}
      <a
        href="https://t.me/terenlabs_bot"
        target="_blank"
        rel="noopener"
        className="group mt-6 flex items-center gap-4 rounded-[8px] border border-line px-5 py-4 transition-colors hover:bg-subtle"
      >
        <svg viewBox="0 0 240 240" className="h-5 w-5 shrink-0 text-accent" aria-hidden="true">
          <path
            fill="currentColor"
            d="M44.7 121.5 194.9 63.6c7-2.6 13.1 1.6 10.8 12.2l-25.6 120.6c-1.9 8.5-7 10.6-14.1 6.6l-39-28.8-18.8 18.2c-2.1 2.1-3.8 3.8-7.8 3.8l2.8-39.8 72.3-65.3c3.1-2.8-.7-4.3-4.9-1.7l-89.4 56.3-38.5-12c-8.4-2.7-8.6-8.4 2-12.2Z"
          />
        </svg>
        <span className="flex-1 text-[15px] leading-snug text-body">
          Удобнее с телефона: продолжай в <span className="font-medium text-ink">Mini App в Telegram</span>, тот же
          аккаунт, прогресс общий.
        </span>
        <span className="link shrink-0 text-[14px]">
          Открыть бота <Arrow />
        </span>
      </a>

      {/* память устройства: продолжить обучение, попытки */}
      <MyMemory />

      {/* рекомендации */}
      <section className="mt-14">
        <h2 className="text-[22px]">Рекомендуем дальше</h2>
        <div className="mt-4 grid gap-4 border-t border-line pt-6 sm:grid-cols-2 lg:grid-cols-3">
          {lanes.map((l) => (
            <RecRotator key={l.items[0].type} items={l.items} periodMs={l.periodMs} />
          ))}
        </div>
      </section>
    </Container>
  );
}
