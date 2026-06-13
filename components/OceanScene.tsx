"use client";

import { useMemo, useRef, useState, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

// WebGL-океан: иммерсивная глубина фоном (Three.js / R3F).
// Толща воды + морской снег (биолюминесцентные частицы) + лучи света сверху,
// камера медленно дышит и реагирует на курсор. Тяжёлое — поэтому: DPR-кап,
// пауза при скрытой вкладке, меньше частиц на мобиле, статичный фолбэк
// при prefers-reduced-motion.

// мягкий круглый спрайт частицы — рисуем в рантайме, без файла-ассета
function makeSprite(): THREE.Texture {
  const s = 64;
  const c = document.createElement("canvas");
  c.width = c.height = s;
  const ctx = c.getContext("2d")!;
  const g = ctx.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
  g.addColorStop(0, "rgba(200,245,250,1)");
  g.addColorStop(0.35, "rgba(120,225,235,0.55)");
  g.addColorStop(1, "rgba(0,183,194,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, s, s);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function MarineSnow({ count }: { count: number }) {
  const ref = useRef<THREE.Points>(null);
  const sprite = useMemo(makeSprite, []);

  // стартовые позиции в объёме толщи
  const { positions, speeds, drifts } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const speeds = new Float32Array(count);
    const drifts = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 60; // x
      positions[i * 3 + 1] = (Math.random() - 0.5) * 50; // y
      positions[i * 3 + 2] = (Math.random() - 0.5) * 40 - 8; // z (в глубину)
      speeds[i] = 0.15 + Math.random() * 0.5; // всплывают вверх
      drifts[i] = Math.random() * Math.PI * 2; // фаза бокового качания
    }
    return { positions, speeds, drifts };
  }, [count]);

  useFrame((_, dt) => {
    const pts = ref.current;
    if (!pts) return;
    const arr = pts.geometry.attributes.position.array as Float32Array;
    const d = Math.min(dt, 0.05); // защита от скачка после паузы вкладки
    for (let i = 0; i < count; i++) {
      arr[i * 3 + 1] += speeds[i] * d; // подъём
      arr[i * 3] += Math.sin(drifts[i] + arr[i * 3 + 1] * 0.1) * 0.004; // качание
      if (arr[i * 3 + 1] > 25) arr[i * 3 + 1] = -25; // зацикливание
    }
    pts.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        map={sprite}
        size={0.55}
        sizeAttenuation
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        opacity={0.9}
      />
    </points>
  );
}

// Лучи света сверху — крупные аддитивные плоскости с мягким градиентом, качаются
function LightShafts() {
  const group = useRef<THREE.Group>(null);
  const tex = useMemo(() => {
    const w = 8, h = 256;
    const c = document.createElement("canvas");
    c.width = w; c.height = h;
    const ctx = c.getContext("2d")!;
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, "rgba(180,240,250,0.5)");
    g.addColorStop(0.5, "rgba(80,200,215,0.12)");
    g.addColorStop(1, "rgba(0,160,180,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
    return new THREE.CanvasTexture(c);
  }, []);

  useFrame((state) => {
    if (!group.current) return;
    const t = state.clock.elapsedTime;
    group.current.children.forEach((m, i) => {
      m.rotation.z = -0.32 + Math.sin(t * 0.18 + i) * 0.05; // лёгкое качание
    });
  });

  const shafts = [
    { x: -14, w: 7, o: 0.55 },
    { x: -5, w: 5, o: 0.4 },
    { x: 6, w: 9, o: 0.5 },
    { x: 16, w: 6, o: 0.35 },
  ];
  return (
    <group ref={group} position={[0, 6, -10]}>
      {shafts.map((s, i) => (
        <mesh key={i} position={[s.x, 0, 0]} rotation={[0, 0, -0.32]}>
          <planeGeometry args={[s.w, 60]} />
          <meshBasicMaterial
            map={tex}
            transparent
            opacity={s.o}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
    </group>
  );
}

// Медленный дрейф камеры + параллакс за курсором
function Rig() {
  const { camera } = useThree();
  const mouse = useRef({ x: 0, y: 0 });
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
    const tx = Math.sin(t * 0.08) * 1.5 + mouse.current.x * 1.2;
    const ty = Math.cos(t * 0.1) * 0.8 - mouse.current.y * 0.8;
    camera.position.x += (tx - camera.position.x) * 0.02;
    camera.position.y += (ty - camera.position.y) * 0.02;
    camera.lookAt(0, 0, -8);
  });
  return null;
}

export function OceanScene() {
  const [reduced, setReduced] = useState(false);
  const [count, setCount] = useState(1400);

  useEffect(() => {
    setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    if (window.innerWidth < 768) setCount(600); // мобила — легче
  }, []);

  // фолбэк: статичный градиент глубины (CSS-слой ниже всё равно есть)
  if (reduced) return null;

  return (
    <Canvas
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      dpr={[1, 1.75]}
      camera={{ position: [0, 0, 14], fov: 60 }}
      frameloop="always"
      style={{ position: "absolute", inset: 0 }}
    >
      {/* туман глубины: частицы тают в навы-черноту */}
      <fog attach="fog" args={["#061826", 12, 46]} />
      <MarineSnow count={count} />
      <LightShafts />
      <Rig />
    </Canvas>
  );
}
