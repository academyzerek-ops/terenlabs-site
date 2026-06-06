import { CoursePlayer } from "@/components/CoursePlayer";
import { DEMO_COURSE } from "@/lib/learn";

export const metadata = { title: "Обучение — TerenLabs" };

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  await params; // в каркасе любой курс открывает демо-структуру
  return <CoursePlayer course={DEMO_COURSE} />;
}
