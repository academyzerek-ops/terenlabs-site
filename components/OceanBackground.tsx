"use client";

import dynamic from "next/dynamic";
import { OceanAmbient } from "./OceanAmbient";

// ОДИН WebGL-океан фиксирован за всей страницей. Контент скроллится поверх,
// камера летит вглубь. До загрузки и при reduced-motion — градиент глубины.
const OceanScene = dynamic(() => import("./OceanScene").then((m) => m.OceanScene), {
  ssr: false,
});

export function OceanBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
      {/* базовый слой глубины — виден до/без WebGL */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 70% at 50% 0%, #14445f 0%, #0a2a40 32%, #05182a 62%, #03101c 100%)",
        }}
      />
      <OceanScene />
      <OceanAmbient />
    </div>
  );
}
