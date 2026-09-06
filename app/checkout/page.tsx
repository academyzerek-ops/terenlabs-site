import { Placeholder } from "@/components/Placeholder";
// заглушка без витрины — не индексировать
export const metadata = { title: "Оформление — TerenLabs", robots: { index: false, follow: false } };
export default function Page() {
  return <Placeholder title="Оформление" desc="Финмодель и бизнес-планы под грант — бесплатно. Индивидуальная финмодель — по заявке, от 100 $." />;
}
