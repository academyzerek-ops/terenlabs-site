import { CoursePlayer } from "@/components/CoursePlayer";
import { ProductMissing } from "@/components/ProductMissing";
import { getCourse } from "@/lib/learn";

export const metadata = { title: "Обучение — TerenLabs" };

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const course = getCourse(slug);
  if (!course) return <ProductMissing />;
  return <CoursePlayer course={course} />;
}
