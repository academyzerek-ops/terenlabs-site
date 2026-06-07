import Link from "next/link";
import { Container } from "@/components/Container";
import { ProductCard } from "@/components/ProductCard";
import { MyMemory } from "@/components/MyMemory";
import { CATALOG } from "@/lib/content";
import { auth, signOut } from "@/auth";

export const metadata = { title: "Личный кабинет — TerenLabs" };

// Кабинет работает и анониму (локальная память устройства).
// Вход (Google/Apple) добавляет профиль; этап B — синк памяти и рейтинг «Океана».
export default async function Dashboard() {
  const session = await auth();
  const recommendations = CATALOG.filter((p) => !p.stub && p.type !== "case").slice(0, 3);

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
            <Link
              href="/auth/sign-in"
              className="group rounded-[var(--radius-tl)] border border-teal/40 bg-card p-5 transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-glow)]"
            >
              <div className="text-heading">Войти — Google или Apple</div>
              <div className="mt-1 max-w-[240px] text-xs text-muted">
                Статистика, память между устройствами и место в рейтинге «Океана»
              </div>
              <span className="mt-2 inline-block text-sm font-semibold text-teal-600 transition-transform group-hover:translate-x-1">
                Вход →
              </span>
            </Link>
          )}
        </div>

        {/* Память: метрики, продолжить обучение, попытки — реальные данные устройства */}
        <MyMemory />

        {/* Рейтинг */}
        <section className="mt-14">
          <h2 className="text-2xl text-heading">Океан</h2>
          <div className="wave-divider my-5" />
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-[var(--radius-tl)] border border-line bg-card p-6">
            <p className="max-w-xl text-sm text-muted">
              Живая таблица мест и механика рейтинга — точность × скорость.
              Зачёт попыток в рейтинг идёт через Mini App.
            </p>
            <Link href="/ocean" className="text-sm font-semibold text-teal-600 hover:text-teal">
              Открыть рейтинг →
            </Link>
          </div>
        </section>

        {/* Рекомендации */}
        <section className="mt-14">
          <h2 className="text-2xl text-heading">Рекомендуем дальше</h2>
          <div className="wave-divider my-5" />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {recommendations.map((p) => (
              <ProductCard key={`${p.type}-${p.slug}`} p={p} />
            ))}
          </div>
        </section>
      </Container>
    </div>
  );
}
