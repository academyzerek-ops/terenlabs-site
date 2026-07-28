import { Container } from "@/components/Container";
import { ContactForms } from "@/components/ContactForms";

export const metadata = {
  alternates: { canonical: "/contacts" }, title: "Связь с нами — TerenLabs" };

// Тексты — из Mini App (content/ru/info/contact.html), вёрстка — сайтовая.
export default function Page() {
  return (
    <>
      <section className="hero-ocean">
        <Container className="relative z-10 py-16">
          <p className="eyebrow">Контакты</p>
          <h1 className="mt-3 max-w-2xl text-4xl !text-foam sm:text-5xl">Связь с нами</h1>
          <p className="mt-4 max-w-xl text-lg text-foam/70">
            Предложения по сотрудничеству и пожелания — напишите, мы прочитаем каждое
          </p>
        </Container>
      </section>

      <Container className="max-w-4xl py-16">
        <p className="mb-8 max-w-2xl leading-relaxed text-muted">
          Выберите, о чём хотите написать, и опишите коротко. Заявка попадёт напрямую команде — мы
          отвечаем на всё по существу. Быстрее всего — написать боту{" "}
          <a href="https://t.me/terenlabs_bot" className="text-teal-600 hover:text-teal">
            @terenlabs_bot
          </a>
          : там мы видим ваш Telegram и можем ответить в личку.
        </p>
        <ContactForms />
      </Container>
    </>
  );
}
