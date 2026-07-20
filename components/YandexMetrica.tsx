"use client";

import Script from "next/script";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";

// Счётчик Яндекс.Метрики terenlabs.kz (аккаунт paidaagency). Вебвизор + карта кликов/скроллинга включены.
const YM_ID = 110890494;

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ym?: (...args: any[]) => void;
  }
}

/**
 * Яндекс.Метрика. init автоматически считает первую загрузку;
 * на клиентских переходах Next (SPA) вручную шлём "hit", пропуская первый mount,
 * чтобы не задвоить первый просмотр.
 */
export function YandexMetrica() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isFirst = useRef(true);

  useEffect(() => {
    if (isFirst.current) {
      isFirst.current = false;
      return;
    }
    if (typeof window.ym === "function") {
      const qs = searchParams?.toString();
      window.ym(YM_ID, "hit", pathname + (qs ? `?${qs}` : ""));
    }
  }, [pathname, searchParams]);

  return (
    <>
      <Script id="yandex-metrica" strategy="afterInteractive">
        {`(function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};m[i].l=1*new Date();for(var j=0;j<document.scripts.length;j++){if(document.scripts[j].src===r){return;}}k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})(window,document,"script","https://mc.yandex.ru/metrika/tag.js","ym");ym(${YM_ID},"init",{clickmap:true,trackLinks:true,accurateTrackBounce:true,webvisor:true});`}
      </Script>
      <noscript>
        <div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`https://mc.yandex.ru/watch/${YM_ID}`} style={{ position: "absolute", left: "-9999px" }} alt="" />
        </div>
      </noscript>
    </>
  );
}
