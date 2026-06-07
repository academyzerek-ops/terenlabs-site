import { TestRunner } from "@/components/TestRunner";
import { ProductMissing } from "@/components/ProductMissing";
import { OceanTestRunner } from "@/components/OceanTestRunner";
import { getTestBySlug } from "@/lib/content";
import { OCEAN_TESTS } from "@/lib/ocean-tests";
import { DEMO_TEST } from "@/lib/learn";

export const metadata = { title: "Прохождение теста — TerenLabs" };

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  // океанские тесты Краба/Барракуды — раннер по канону Mini App
  const ocean = OCEAN_TESTS[slug];
  if (ocean) return <OceanTestRunner meta={ocean} />;

  const t = getTestBySlug(slug);
  if (t && t.questions && t.questions.length > 0) {
    return <TestRunner title={t.title} questions={t.questions} backHref="/levels/rakushka" />;
  }

  if (slug === "test-unit-economics") {
    return <TestRunner title={DEMO_TEST.title} questions={DEMO_TEST.questions} backHref="/levels/rakushka" />;
  }

  return <ProductMissing />;
}
