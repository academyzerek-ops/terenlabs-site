import { Placeholder } from "@/components/Placeholder";
export const metadata = {
  // заглушка «раздел в работе» — в индекс не пускаем, пока не наполнится
  alternates: { canonical: "/blog" }, title: "Медиа — TerenLabs", robots: { index: false, follow: false } };
export default function Page() {
  return <Placeholder title="Медиа" desc="Обзоры, разборы и материалы TerenLabs. Наполняется." />;
}
