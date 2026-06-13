"use client";

import dynamic from "next/dynamic";

// WebGL-сцена грузится только в браузере (Three.js не рендерится на сервере).
// До загрузки и при reduced-motion остаётся градиент глубины — фон всегда «океан».
const OceanScene = dynamic(() => import("./OceanScene").then((m) => m.OceanScene), {
  ssr: false,
});

export function OceanBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {/* базовый слой глубины — виден до/без WebGL */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 80% at 50% -10%, #13415c 0%, #0b2a40 35%, #061826 70%, #03101c 100%)",
        }}
      />
      <OceanScene />
    </div>
  );
}
