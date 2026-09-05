import { Placeholder } from "@/components/Placeholder";
export const metadata = {
  alternates: { canonical: "/about" }, title: "О компании — TerenLabs",
  // заглушка на две строки: в выдаче ей делать нечего, пока нет текста
  robots: { index: false } };
export default function Page() {
  return <Placeholder title="О компании" desc="TerenLabs — EdTech и FinTools для предпринимателей." />;
}
