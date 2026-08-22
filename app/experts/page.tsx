import { Placeholder } from "@/components/Placeholder";
export const metadata = {
  // заглушка «раздел в работе» — в индекс не пускаем, пока не наполнится
  alternates: { canonical: "/experts" }, title: "Эксперты — TerenLabs", robots: { index: false, follow: false } };
export default function Page() {
  return <Placeholder title="Эксперты" desc="Практики, которые говорят числами. Раздел готовится." />;
}
