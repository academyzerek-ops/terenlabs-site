import { CoursePlayer } from "@/components/CoursePlayer";
import { ProductMissing } from "@/components/ProductMissing";
import { getCourse } from "@/lib/learn";

export const metadata = { title: "Обучение — TerenLabs" };

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ ch?: string }>;
}) {
  const { slug } = await params;
  const { ch } = await searchParams;
  const course = getCourse(slug);
  if (!course) return <ProductMissing />;
  // ?ch=m1-ch02 — открыть конкретную главу (id шага = `${moduleId}-${file}-s`)
  const initialStepId = ch ? `${ch.split("-")[0]}-${ch}-s` : undefined;
  return <CoursePlayer course={course} initialStepId={initialStepId} />;
}
