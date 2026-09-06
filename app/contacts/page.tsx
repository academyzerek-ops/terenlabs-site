import { Container } from "@/components/Container";
import { ContactForms } from "@/components/ContactForms";

export const metadata = {
  alternates: { canonical: "/contacts" }, title: "Связь с нами — TerenLabs" };

// Тексты — из Mini App (content/ru/info/contact.html), вёрстка — сайтовая.
export default function Page() {
  return (
    <>
      <Container className="py-14 sm:py-20">
        <p className="eyebrow">Контакты</p>
        <h1 className="mt-3 max-w-[20ch] text-[24px] sm:text-[38px]">Связь с нами</h1>
        <p className="mt-5 max-w-[56ch] text-[15px] leading-relaxed text-text-2 sm:text-[16px]">
          Предложения по сотрудничеству и пожелания — напишите, мы прочитаем каждое
        </p>
      </Container>

      <Container className="border-t border-line pb-10 sm:pb-20 pt-6 sm:pt-10">
        <p className="mb-8 max-w-[64ch] text-[15px] leading-relaxed text-text-2">
          Выберите, о чём хотите написать, и опишите коротко. Заявка попадёт напрямую команде — мы
          отвечаем на всё по существу. Быстрее всего — написать боту{" "}
          <a href="https://t.me/terenlabs_bot" className="text-accent hover:underline">
            @terenlabs_bot
          </a>
          : там мы видим ваш Telegram и можем ответить в личку.
        </p>
        <ContactForms />
      </Container>
    </>
  );
}
