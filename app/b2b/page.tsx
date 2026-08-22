import { Placeholder } from "@/components/Placeholder";
export const metadata = {
  // заглушка «раздел в работе» — в индекс не пускаем, пока не наполнится
  alternates: { canonical: "/b2b" }, title: "Для бизнеса — TerenLabs", robots: { index: false, follow: false } };
export default function Page() {
  return <Placeholder title="Для бизнеса" desc="Корпоративное обучение под задачи компании. Раздел в работе." />;
}
