import { Placeholder } from "@/components/Placeholder";
// заглушка без витрины — не индексировать
export const metadata = { title: "Оформление — TerenLabs", robots: { index: false, follow: false } };
export default function Page() {
  return <Placeholder title="Оформление" desc="Финмодель и бизнес-планы под грант — бесплатно, в Mini App @terenlabs_bot (вход через Telegram). Индивидуальная финмодель — по заявке там же, от 100 $." />;
}
