import { Container } from "@/components/Container";
import { AdminUsers } from "@/components/AdminUsers";

// Раздел закрыт на сервере: /admin/* Океана пускает только админов (почта входа в
// ADMIN_EMAILS или id в ADMIN_USER_IDS).
// Поэтому страница открыта, а данных без прав просто не будет — так честнее, чем
// прятать адрес и делать вид, что это защита.
export const metadata = {
  title: "Ученики — TerenLabs",
  robots: { index: false, follow: false },
  alternates: { canonical: "/admin" },
};

export default function AdminPage() {
  return (
    <Container className="py-14 sm:py-20">
      <p className="eyebrow">Администратор</p>
      <h1 className="mt-3 text-[24px] sm:text-[38px]">Ученики</h1>
      <p className="mt-4 max-w-[62ch] text-[15px] leading-relaxed text-text-2">
        Кто на каком уровне, сколько тестов сдал и когда заходил в последний раз.
        Нажми на строку, чтобы увидеть весь путь человека.
      </p>
      <div className="mt-8">
        <AdminUsers />
      </div>
    </Container>
  );
}
