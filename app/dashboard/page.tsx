import { Container } from "@/components/Container";
import { RecRotator } from "@/components/RecRotator";
import { MyMemory } from "@/components/MyMemory";
import { OceanAccount } from "@/components/OceanAccount";
import { TgIdentityCard } from "@/components/TgIdentityCard";
import { CATALOG } from "@/lib/content";
import { auth, signOut } from "@/auth";

export const metadata = { title: "Личный кабинет — TerenLabs", robots: { index: false, follow: false } };

// Кабинет работает и анониму (локальная память устройства).
// Вход через Telegram добавляет профиль; прогресс общий с Mini App.
export default async function Dashboard() {
  const session = await auth();
  // Рекомендации кабинета — бесплатный контур (Адиль 17.07: «не вести на ФМ»):
  // три живые плашки — Академия, кейс, обзор (edtech первым), внутри каждой
  // карточки сменяются. Только контент с постером — демо-тренажёры и заглушки
  // сюда не попадают (Адиль 18.07). Финпродукты живут на своей витрине.
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
    <div className="py-14">
      <Container>
        {/* Шапка кабинета */}
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div>
            <p className="eyebrow">Личный кабинет</p>
            <h1 className="mt-2 text-4xl text-heading">
              {session?.user?.name ? `Привет, ${session.user.name.split(" ")[0]}` : "Привет, основатель"}
            </h1>
            <p className="mt-2 text-muted">
              {session
                ? "Память подключена к аккаунту. Что делаем сегодня?"
                : "Память хранится на этом устройстве. Войди — и она поедет с тобой."}
            </p>
          </div>

          {session?.user ? (
            <div className="flex items-center gap-4 rounded-[var(--radius-tl)] border border-line bg-card p-4">
              {session.user.image ? (
                <img
                  src={session.user.image}
                  alt=""
                  width={56}
                  height={56}
                  className="h-14 w-14 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-b from-teal to-teal-600 text-lg font-bold text-white">
                  {(session.user.name ?? "?").slice(0, 1)}
                </div>
              )}
              <div>
                <div className="text-heading">{session.user.name}</div>
                <div className="text-xs text-muted">{session.user.email}</div>
                <form
                  action={async () => {
                    "use server";
                    await signOut({ redirectTo: "/" });
                  }}
                >
                  <button className="mt-1 text-xs text-teal-600 hover:text-teal">Выйти</button>
                </form>
              </div>
            </div>
          ) : (
            // Telegram-вход живёт в океан-слое (не NextAuth) — карточка клиентская
            <TgIdentityCard />
          )}
        </div>

        {/* Океан: живая статистика с бэкенда — ранг, очки, стрик, привязка TG */}
        <OceanAccount nextAuthActive={!!session} />

        {/* мост в Mini App (Адиль 18.07): тот же аккаунт, прогресс общий */}
        <a
          href="https://t.me/terenlabs_bot"
          target="_blank"
          rel="noopener"
          className="group mt-6 flex items-center gap-4 rounded-[var(--radius-tl)] border border-line bg-card px-5 py-4 transition-all hover:-translate-y-0.5 hover:border-teal/40"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-b from-[#2AABEE] to-[#229ED9]">
            <svg viewBox="0 0 240 240" className="h-6 w-6 text-white" aria-hidden="true">
              <path
                fill="currentColor"
                d="M44.7 121.5 194.9 63.6c7-2.6 13.1 1.6 10.8 12.2l-25.6 120.6c-1.9 8.5-7 10.6-14.1 6.6l-39-28.8-18.8 18.2c-2.1 2.1-3.8 3.8-7.8 3.8l2.8-39.8 72.3-65.3c3.1-2.8-.7-4.3-4.9-1.7l-89.4 56.3-38.5-12c-8.4-2.7-8.6-8.4 2-12.2Z"
              />
            </svg>
          </span>
          <span className="flex-1 text-[15px] leading-snug text-body">
            Удобнее с телефона — продолжай в{" "}
            <span className="font-semibold text-heading">Mini App в Telegram</span>: тот же
            аккаунт, прогресс общий.
          </span>
          <span className="shrink-0 text-sm font-semibold text-teal-600 transition-transform group-hover:translate-x-1">
            Открыть бота →
          </span>
        </a>

        {/* Память: метрики, продолжить обучение, попытки — реальные данные устройства */}
        <MyMemory />

        {/* Рекомендации */}
        <section className="mt-14">
          <h2 className="text-2xl text-heading">Рекомендуем дальше</h2>
          <div className="wave-divider my-5" />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {lanes.map((l) => (
              <RecRotator key={l.items[0].type} items={l.items} periodMs={l.periodMs} />
            ))}
          </div>
        </section>
      </Container>
    </div>
  );
}
