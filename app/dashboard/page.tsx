import { Container } from "@/components/Container";
import { MyMemory } from "@/components/MyMemory";
import { OceanAccount } from "@/components/OceanAccount";
import { CabinetHeader } from "@/components/CabinetHeader";
import { AdminLink } from "@/components/AdminLink";
import { auth, signIn, signOut, providersConfigured } from "@/auth";

export const metadata = { title: "Личный кабинет — TerenLabs", robots: { index: false, follow: false } };

// Кабинет работает и анониму (локальная память устройства). Вход добавляет профиль Океана.
export default async function Dashboard() {
  const session = await auth();
  const doSignOut = async () => {
    "use server";
    await signOut({ redirectTo: "/" });
  };
  const doGoogle = async () => {
    "use server";
    await signIn("google", { redirectTo: "/auth/bridge-finish" });
  };

  return (
    <Container className="py-7 sm:py-12">
      <CabinetHeader
        sessionName={session?.user?.name ?? null}
        sessionImage={session?.user?.image ?? null}
        signOutAction={session ? doSignOut : undefined}
      />

      <AdminLink />

      <OceanAccount nextAuthActive={!!session} googleReady={providersConfigured.google} googleAction={doGoogle} />


      <MyMemory />
    </Container>
  );
}
