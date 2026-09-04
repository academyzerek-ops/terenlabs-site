import Link from "next/link";
import type { AcademyTrack } from "@/lib/learn";
import { plural } from "@/lib/content";

// Лента треков Академии, как «Learn» в Notion: карточки в горизонтальной прокрутке,
// сверху светлое превью-«документ» с названием и первыми уроками, снизу подпись.
export function TrackCards({ tracks }: { tracks: AcademyTrack[] }) {
  return (
    <div className="no-scrollbar -mx-5 flex snap-x gap-4 overflow-x-auto px-5 pb-2 sm:-mx-8 sm:px-8">
      {tracks.map((t) => {
        const lessons = t.modules.slice(0, 4);
        return (
          <Link
            key={t.slug}
            href={`/courses/${t.slug}`}
            className="card-premium group flex w-[280px] shrink-0 snap-start flex-col overflow-hidden sm:w-[300px]"
          >
            {/* светлое превью: мини-документ */}
            <div className="h-[168px] border-b border-line bg-[#f1f1ef] p-5 text-[#37352f]">
              <div className="text-[10px] uppercase tracking-[0.08em] text-[#8d8b86]">{t.subtitle}</div>
              <div className="mt-1.5 text-[17px] font-semibold leading-tight text-[#191919]">{t.title}</div>
              <div className="mt-3 flex flex-col gap-1.5">
                {lessons.map((m) => (
                  <div key={m.id} className="flex items-center gap-2 text-[11px] leading-none text-[#5f5e5a]">
                    <span className="h-1 w-1 shrink-0 rounded-full bg-[#b9b7b1]" />
                    <span className="truncate">{m.title.replace(/^Урок \d+ · /, "")}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex flex-1 flex-col gap-2 p-4">
              <div className="text-[16px] font-medium leading-snug text-ink">{t.title}</div>
              <div className="num mt-auto text-[13px] text-faint">
                {t.modules.length} {plural(t.modules.length, "урок", "урока", "уроков")} · {t.chapterTotal}{" "}
                {plural(t.chapterTotal, "глава", "главы", "глав")}
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
