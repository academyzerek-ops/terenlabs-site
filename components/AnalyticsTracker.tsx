"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Script from "next/script";

/**
 * Мост аналитики для App Router: public/tracker.js считает page_view только на
 * полной загрузке, а Next навигирует клиентски — без этого компонента переходы
 * по <Link> невидимы. На смене pathname зовём tlPageChange: трекер закрывает
 * старую страницу (page_unload + duration) и открывает новую (page_view).
 */
declare global {
  interface Window {
    tlPageChange?: (path: string) => void;
    tlTrack?: (type: string, payload?: Record<string, unknown>) => void;
  }
}

export function AnalyticsTracker() {
  const pathname = usePathname();

  useEffect(() => {
    window.tlPageChange?.(pathname);
  }, [pathname]);

  return <Script src="/tracker.js" strategy="afterInteractive" />;
}
