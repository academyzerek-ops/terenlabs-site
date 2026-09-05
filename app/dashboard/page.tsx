import { Container } from "@/components/Container";
import { MyMemory } from "@/components/MyMemory";
import { OceanAccount } from "@/components/OceanAccount";
import { CabinetHeader } from "@/components/CabinetHeader";
import { auth, signOut } from "@/auth";

export const metadata = { title: "Личный кабинет — TerenLabs", robots: { index: false, follow: false } };

// Кабинет работает и анониму (локальная память устройства). Вход добавляет профиль Океана.
export default async function Dashboard() {
  const session = await auth();
  const doSignOut = async () => {
    "use server";
    await signOut({ redirectTo: "/" });
  };

  return (
    <Container className="py-12">
      <CabinetHeader
        sessionName={session?.user?.name ?? null}
        sessionImage={session?.user?.image ?? null}
        signOutAction={session ? doSignOut : undefined}
      />

      <OceanAccount nextAuthActive={!!session} />

      {/* мост в Mini App: тот же аккаунт, прогресс общий */}
      <p className="mt-8 text-[13px] text-faint">
        С телефона удобнее в{" "}
        <a href="https://t.me/terenlabs_bot" target="_blank" rel="noopener" className="link">
          Mini App в Telegram
        </a>
        , аккаунт и прогресс общие.
      </p>

      <MyMemory />
    </Container>
  );
}
