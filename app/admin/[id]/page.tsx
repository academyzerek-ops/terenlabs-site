import { notFound } from "next/navigation";
import { Container } from "@/components/Container";
import { AdminTimelineView } from "@/components/AdminTimeline";

export const metadata = { title: "Ученик — TerenLabs", robots: { index: false, follow: false } };

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const userId = Number(id);
  if (!Number.isInteger(userId) || userId <= 0) notFound();

  return (
    <Container className="py-14 sm:py-20">
      <AdminTimelineView userId={userId} />
    </Container>
  );
}
