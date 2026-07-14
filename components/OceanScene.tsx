"use client";

import { Suspense, useMemo, useRef, useState, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import * as THREE from "three";
import { OceanLife } from "./OceanLife";

// каустика у поверхности: рябь света на воде, как смотришь снизу вверх
function makeCaustic(): THREE.Texture {
  const s = 256;
  const c = document.createElement("canvas");
  c.width = c.height = s;
  const ctx = c.getContext("2d")!;
  const img = ctx.createImageData(s, s);
  for (let y = 0; y < s; y++) {
    for (let x = 0; x < s; x++) {
      const u = (x / s) * Math.PI * 2 * 3;
      const v = (y / s) * Math.PI * 2 * 3;
      let n =
        Math.sin(u) * Math.cos(v) +
        Math.sin(u * 1.7 + 1.3) * Math.cos(v * 1.3) +
        Math.sin(u * 0.6 - 0.7) * Math.cos(v * 2.1);
      n = Math.pow(Math.max(0, n / 3 + 0.4), 3.2); // острые яркие жилки
      const i = (y * s + x) * 4;
      img.data[i] = 150 * n;
      img.data[i + 1] = 240 * n;
      img.data[i + 2] = 255 * n;
      img.data[i + 3] = 255 * Math.min(1, n * 1.4);
    }
  }
  ctx.putImageData(img, 0, 0);
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(2, 2);
  return tex;
}

// морское дно: песчано-рифовая поверхность в бездне, видна в конце погружения
function makeSeabed(): THREE.Texture {
  const s = 512;
  const c = document.createElement("canvas");
  c.width = c.height = s;
  const ctx = c.getContext("2d")!;
  // базовый тёмный сине-зелёный песок с градиентом глубины
  const g = ctx.createLinearGradient(0, 0, 0, s);
  g.addColorStop(0, "#0a3045");
  g.addColorStop(0.5, "#0c283a");
  g.addColorStop(1, "#06151f");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, s, s);
  // песчаные дюны-полосы + биолюминесцентные крапинки
  for (let i = 0; i < 2600; i++) {
    const x = Math.random() * s, y = Math.random() * s;
    const glow = Math.random() < 0.04;
    ctx.fillStyle = glow
      ? `rgba(120,235,245,${0.3 + Math.random() * 0.5})`
      : `rgba(${20 + Math.random() * 30},${50 + Math.random() * 40},${60 + Math.random() * 40},${Math.random() * 0.4})`;
    const r = glow ? 1 + Math.random() * 2 : 0.6 + Math.random() * 1.8;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(4, 4);
  return tex;
}

function Seabed() {
  const tex = useMemo(makeSeabed, []);
  useEffect(() => () => tex.dispose(), [tex]); // освобождаем GPU-текстуру при анмаунте
  return (
    <mesh position={[0, -24, -210]} rotation={[-Math.PI / 2.15, 0, 0]}>
      <planeGeometry args={[260, 160]} />
      <meshBasicMaterial map={tex} transparent opacity={0.95} depthWrite={false} fog />
    </mesh>
  );
}

function Caustics() {
  const tex = useMemo(makeCaustic, []);
  useEffect(() => () => tex.dispose(), [tex]); // освобождаем GPU-текстуру при анмаунте
  const mat = useRef<THREE.MeshBasicMaterial>(null);
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    tex.offset.x = Math.sin(t * 0.05) * 0.3 + t * 0.012;
    tex.offset.y = t * 0.02;
    if (mat.current) mat.current.opacity = 0.32 + Math.sin(t * 0.4) * 0.05;
  });
  return (
    <mesh position={[0, 22, -10]} rotation={[-0.55, 0, 0]}>
      <planeGeometry args={[150, 90]} />
      <meshBasicMaterial
        ref={mat}
        map={tex}
        transparent
        opacity={0.32}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        side={THREE.DoubleSide}
        toneMapped={false}
      />
    </mesh>
  );
}

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
  useEffect(() => () => sprite.dispose(), [sprite]); // освобождаем GPU-текстуру при анмаунте
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
  useEffect(() => () => tex.dispose(), [tex]); // освобождаем GPU-текстуру при анмаунте

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
    const sc = scroll.current ?? 0;
    target.current = 6 - sc * 220;
    camera.position.z += (target.current - camera.position.z) * 0.05;
    const tx = Math.sin(t * 0.08) * 2 + mouse.current.x * 2.5;
    const ty = Math.cos(t * 0.1) * 1.2 - mouse.current.y * 1.6;
    camera.position.x += (tx - camera.position.x) * 0.03;
    camera.position.y += (ty - camera.position.y) * 0.03;
    // ближе ко дну камера опускает взгляд — становится видно риф и песок
    const lookY = camera.position.y * 0.3 - Math.max(0, sc - 0.7) * 60;
    camera.lookAt(0, lookY, camera.position.z - 20);
  });
  return null;
}

export function OceanScene() {
  const scroll = useScrollProgress();
  const [reduced, setReduced] = useState(false);
  const [count, setCount] = useState(1100);
  // Пауза рендера при скрытой вкладке: WebGL-цикл (Bloom + ~1100 частиц + меши)
  // не должен жечь GPU/батарею в фоне. frameloop="never" останавливает RAF.
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    if (window.innerWidth < 768) setCount(500);
  }, []);

  useEffect(() => {
    const onVis = () => setVisible(!document.hidden);
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  if (reduced) return null;

  return (
    <Canvas
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      dpr={[1, 1.75]}
      camera={{ position: [0, 0, 6], fov: 62 }}
      frameloop={visible ? "always" : "never"}
      style={{ position: "fixed", inset: 0 }}
    >
      <fog attach="fog" args={["#04101d", 16, 64]} />
      {/* каустика — рябь света у поверхности */}
      <Caustics />
      {/* морское дно с рифом — видно в конце погружения */}
      <Seabed />
      {/* мелкий планктон-пыль (приглушённо, фоном) */}
      <DepthField count={count} scroll={scroll} />
      <LightShafts scroll={scroll} />
      {/* живые существа: рыбы, медузы, скат, осьминог, кит, кораллы по глубине */}
      <Suspense fallback={null}>
        <OceanLife />
      </Suspense>
      <DiveRig scroll={scroll} />
      {/* свечение биолюминесценции + виньетка — кинематографичность */}
      <EffectComposer>
        {/* мягкое свечение, не выпячивает (Адиль) */}
        <Bloom
          intensity={0.4}
          luminanceThreshold={0.55}
          luminanceSmoothing={0.6}
          mipmapBlur
          radius={0.6}
        />
        <Vignette eskil={false} offset={0.28} darkness={0.7} />
      </EffectComposer>
    </Canvas>
  );
}
