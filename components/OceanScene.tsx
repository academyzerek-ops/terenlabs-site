"use client";

import { Suspense, useMemo, useRef, useState, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { OceanLife } from "./OceanLife";

// Сквозной WebGL-океан: ОДИН фон на всю страницу. Камера летит вглубь по
// мере скролла — частицы, лучи и биолюминесценция сменяются по глубине.
// Контент сайта плывёт поверх. Тяжёлое → DPR-кап, меньше частиц на мобиле,
// пауза при скрытой вкладке, статичный фон при prefers-reduced-motion.

// прогресс скролла страницы 0..1 — ref, без ре-рендеров React
function useScrollProgress() {
  const p = useRef(0);
  useEffect(() => {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      p.current = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);
  return p;
}

function makeSprite(): THREE.Texture {
  const s = 64;
  const c = document.createElement("canvas");
  c.width = c.height = s;
  const ctx = c.getContext("2d")!;
  const g = ctx.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
  g.addColorStop(0, "rgba(210,248,252,1)");
  g.addColorStop(0.35, "rgba(120,225,235,0.55)");
  g.addColorStop(1, "rgba(0,183,194,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, s, s);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

// Длинный тоннель частиц на всю глубину — камера летит сквозь
function DepthField({ count, scroll }: { count: number; scroll: React.RefObject<number> }) {
  const ref = useRef<THREE.Points>(null);
  const sprite = useMemo(makeSprite, []);
  const DEPTH = 260; // длина толщи по z

  const { positions, colors } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const cTop = new THREE.Color("#bfeef5"); // у поверхности — светлая бирюза
    const cMid = new THREE.Color("#1aa6b8");
    const cDeep = new THREE.Color("#0a4a66"); // в бездне — тёмный циан
    for (let i = 0; i < count; i++) {
      const z = -Math.random() * DEPTH; // 0..-260
      positions[i * 3] = (Math.random() - 0.5) * 90;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 70;
      positions[i * 3 + 2] = z;
      const t = -z / DEPTH; // 0 у поверхности → 1 в глубине
      const col = t < 0.5 ? cTop.clone().lerp(cMid, t * 2) : cMid.clone().lerp(cDeep, (t - 0.5) * 2);
      colors[i * 3] = col.r; colors[i * 3 + 1] = col.g; colors[i * 3 + 2] = col.b;
    }
    return { positions, colors };
  }, [count]);

  useFrame((_, dt) => {
    const pts = ref.current;
    if (!pts) return;
    const d = Math.min(dt, 0.05);
    const arr = pts.geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < count; i++) {
      arr[i * 3 + 1] += 0.12 * d; // лёгкий всплыв
      arr[i * 3] += Math.sin(arr[i * 3 + 1] * 0.08 + i) * 0.003;
      if (arr[i * 3 + 1] > 35) arr[i * 3 + 1] = -35;
    }
    pts.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        map={sprite}
        size={0.45}
        sizeAttenuation
        vertexColors
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        opacity={0.95}
      />
    </points>
  );
}

// Лучи света — ярче у поверхности, гаснут с глубиной
function LightShafts({ scroll }: { scroll: React.RefObject<number> }) {
  const group = useRef<THREE.Group>(null);
  const tex = useMemo(() => {
    const w = 8, h = 256;
    const c = document.createElement("canvas");
    c.width = w; c.height = h;
    const ctx = c.getContext("2d")!;
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, "rgba(190,245,252,0.55)");
    g.addColorStop(0.5, "rgba(80,200,215,0.12)");
    g.addColorStop(1, "rgba(0,160,180,0)");
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    return new THREE.CanvasTexture(c);
  }, []);

  useFrame((state) => {
    if (!group.current) return;
    const t = state.clock.elapsedTime;
    const fade = 1 - Math.min(1, (scroll.current ?? 0) * 1.6); // тонут с глубиной
    group.current.children.forEach((m, i) => {
      m.rotation.z = -0.3 + Math.sin(t * 0.18 + i) * 0.05;
      const mat = (m as THREE.Mesh).material as THREE.MeshBasicMaterial;
      mat.opacity = (0.3 + 0.25 * (i % 2)) * fade;
    });
  });

  const shafts = [-16, -6, 6, 18];
  return (
    <group ref={group} position={[0, 10, -6]}>
      {shafts.map((x, i) => (
        <mesh key={i} position={[x, 0, 0]} rotation={[0, 0, -0.3]}>
          <planeGeometry args={[6 + (i % 3) * 2, 70]} />
          <meshBasicMaterial map={tex} transparent depthWrite={false} blending={THREE.AdditiveBlending} side={THREE.DoubleSide} />
        </mesh>
      ))}
    </group>
  );
}

// Камера летит вглубь по скроллу + дрейф и параллакс
function DiveRig({ scroll }: { scroll: React.RefObject<number> }) {
  const { camera } = useThree();
  const mouse = useRef({ x: 0, y: 0 });
  const target = useRef(0);
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      mouse.current.x = (e.clientX / window.innerWidth - 0.5) * 2;
      mouse.current.y = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    // целевой z: от +6 (поверхность) до -210 (бездна) по скроллу
    target.current = 6 - (scroll.current ?? 0) * 216;
    camera.position.z += (target.current - camera.position.z) * 0.05;
    const tx = Math.sin(t * 0.08) * 2 + mouse.current.x * 2.5;
    const ty = Math.cos(t * 0.1) * 1.2 - mouse.current.y * 1.6;
    camera.position.x += (tx - camera.position.x) * 0.03;
    camera.position.y += (ty - camera.position.y) * 0.03;
    camera.lookAt(0, camera.position.y * 0.3, camera.position.z - 20);
  });
  return null;
}

export function OceanScene() {
  const scroll = useScrollProgress();
  const [reduced, setReduced] = useState(false);
  const [count, setCount] = useState(1100);

  useEffect(() => {
    setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    if (window.innerWidth < 768) setCount(500);
  }, []);

  if (reduced) return null;

  return (
    <Canvas
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      dpr={[1, 1.75]}
      camera={{ position: [0, 0, 6], fov: 62 }}
      frameloop="always"
      style={{ position: "fixed", inset: 0 }}
    >
      <fog attach="fog" args={["#04101d", 16, 64]} />
      {/* мелкий планктон-пыль (приглушённо, фоном) */}
      <DepthField count={count} scroll={scroll} />
      <LightShafts scroll={scroll} />
      {/* живые существа: рыбы, медузы, осьминог, кораллы по глубине */}
      <Suspense fallback={null}>
        <OceanLife />
      </Suspense>
      <DiveRig scroll={scroll} />
    </Canvas>
  );
}
