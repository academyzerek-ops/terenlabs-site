"use client";

import { useEffect, useRef, useState } from "react";

// Обзор ниши лежит отдельным документом и показывается через iframe.
//
// На широком экране это плеер: слева список обзоров, справа статья в своей
// прокрутке. На телефоне так было хуже, чем обычной страницей: экран заперт
// в высоту окна, шапка со списком висит всегда, а текст листается внутри рамки,
// из-за чего адресная строка браузера никогда не убирается. Поэтому на телефоне
// рамка растёт по высоте содержимого, а прокручивается сама страница. Высоту
// сообщает сам документ через postMessage (review-enhance.js).
export function ReviewFrame({ src, title }: { src: string; title: string }) {
  const ref = useRef<HTMLIFrameElement>(null);
  const [h, setH] = useState<number | null>(null);

  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      if (e.origin !== window.location.origin) return;
      const d = e.data as { type?: string; h?: number } | null;
      if (!d || d.type !== "tl-review-h" || typeof d.h !== "number") return;
      if (e.source !== ref.current?.contentWindow) return;
      setH(Math.min(Math.max(d.h, 400), 60000));
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  return (
    <iframe
      ref={ref}
      src={src}
      title={title}
      // до ответа документа держим экран: пустая страница не мигает
      style={h ? ({ ["--tl-h" as string]: `${h}px` } as React.CSSProperties) : undefined}
      className="h-[var(--tl-h,100dvh)] min-h-0 w-full border-0 lg:h-full"
    />
  );
}
