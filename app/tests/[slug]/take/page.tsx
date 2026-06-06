import { TestRunner } from "@/components/TestRunner";
import { ProductMissing } from "@/components/ProductMissing";
import { getTestBySlug } from "@/lib/content";
import { DEMO_TEST } from "@/lib/learn";

export const metadata = { title: "Прохождение теста — TerenLabs" };

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const t = getTestBySlug(slug);
  if (t && t.questions && t.questions.length > 0) {
    return <TestRunner title={t.title} questions={t.questions} backHref="/levels/rakushka" />;
  }

  if (slug === "test-unit-economics") {
    return <TestRunner title={DEMO_TEST.title} questions={DEMO_TEST.questions} backHref="/levels/rakushka" />;
  }

  return <ProductMissing />;
}
