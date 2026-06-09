import { notFound } from "next/navigation";
import { CoursePlayer } from "@/components/CoursePlayer";
import { getCourse } from "@/lib/learn";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const course = getCourse(slug);
  return { title: course ? `${course.title} · обучение — TerenLabs` : "Обучение — TerenLabs" };
}

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
  if (!course) notFound();
  // ?ch=m1-ch02 — открыть конкретную главу (id шага = `${moduleId}-${file}-s`)
  const initialStepId = ch ? `${ch.split("-")[0]}-${ch}-s` : undefined;
  return <CoursePlayer course={course} initialStepId={initialStepId} />;
}
