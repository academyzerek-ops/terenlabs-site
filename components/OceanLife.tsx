"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";

// Живые существа океана как billboard-спрайты на разных глубинах. Косяки и
// хищники реально плывут (с зацикливанием по ширине), медузы/кораллы качаются,
// пузыри всплывают. Камера летит сквозь z — проплываешь мимо стай, ската,
// осьминога, а в бездне встречаешь кита.

const BASE = "/brand/ocean-life";
const FILES = [
  "jellyfish-1", "jellyfish-2", "fish-1", "fish-school", "octopus", "manta-ray",
  "turtle", "plankton", "coral-1", "coral-2", "seaweed", "anglerfish",
  "whale", "shark", "dolphin", "jelly-bloom", "lantern-school", "bubbles", "anemone", "ray-big",
] as const;

type Kind = "swim" | "bob" | "rise" | "still";
type P = {
  tex: string; x: number; y: number; z: number; s: number;
  kind: Kind; speed?: number; bob?: number; phase: number; flip?: boolean; dim?: number;
};

const SPAN = 55; // ширина зацикливания по x

// раскладка по глубине: поверхность → толща → бездна (кит) → дно (кораллы)
// существа живут ДАЛЬШЕ и по краям — не лезут на текст, читаются как глубина.
// Рыбьих стай минимум (Адиль: «куча рыбок отстойно») — упор на крупных
// одиночных героев: дельфин, скат, акула, осьминог, кит.
const SCENE: P[] = [
  // ── поверхность (z -30..-60), по краям ──
  { tex: "dolphin", x: -34, y: 14, z: -40, s: 7, kind: "swim", speed: 2.8, phase: 0 },
  { tex: "jellyfish-2", x: 26, y: 11, z: -48, s: 4, kind: "bob", bob: 1.1, phase: 2 },
  { tex: "turtle", x: -30, y: -10, z: -56, s: 8, kind: "swim", speed: 1.2, phase: 0.5 },
  { tex: "bubbles", x: 32, y: -10, z: -52, s: 9, kind: "rise", speed: 2.3, phase: 0, dim: 0.5 },
  // ── толща (z -70..-140) ──
  { tex: "jelly-bloom", x: -24, y: 6, z: -84, s: 15, kind: "bob", bob: 1.3, phase: 1.5, dim: 0.8 },
  { tex: "ray-big", x: 30, y: 10, z: -98, s: 17, kind: "swim", speed: 1.6, phase: 2.5, flip: true },
  { tex: "shark", x: 24, y: 7, z: -118, s: 12, kind: "swim", speed: 2.0, phase: 0.8, flip: true },
  { tex: "fish-school", x: -30, y: -8, z: -132, s: 7, kind: "swim", speed: 1.9, phase: 4, dim: 0.7 },
  { tex: "jellyfish-1", x: 18, y: 13, z: -140, s: 8, kind: "bob", bob: 1.2, phase: 2 },
  // ── глубина (z -150..-185) ──
  { tex: "octopus", x: 22, y: -6, z: -160, s: 11, kind: "bob", bob: 0.5, phase: 1 },
  { tex: "anglerfish", x: -24, y: 8, z: -174, s: 6, kind: "swim", speed: 1.1, phase: 2, flip: true },
  { tex: "lantern-school", x: 18, y: -9, z: -184, s: 8, kind: "swim", speed: 1.3, phase: 4.5, dim: 0.8 },
  // ── бездна: КИТ — геройский момент ──
  { tex: "whale", x: -34, y: 4, z: -198, s: 44, kind: "swim", speed: 0.9, phase: 0, dim: 0.95 },
  // ── дно / риф (z -206..-236): кораллы, анемоны, водоросли стоят на песке ──
  { tex: "coral-1", x: -20, y: -20, z: -208, s: 16, kind: "still", phase: 0 },
  { tex: "anemone", x: -2, y: -21, z: -212, s: 14, kind: "bob", bob: 0.3, phase: 1 },
  { tex: "coral-2", x: 18, y: -21, z: -216, s: 15, kind: "still", phase: 1 },
  { tex: "seaweed", x: -10, y: -22, z: -222, s: 22, kind: "bob", bob: 0.6, phase: 2 },
  { tex: "coral-1", x: 24, y: -20, z: -230, s: 13, kind: "still", phase: 3, flip: true },
  { tex: "anemone", x: 10, y: -21, z: -234, s: 12, kind: "bob", bob: 0.3, phase: 2.5 },
];

function Creature({ p, texture }: { p: P; texture: THREE.Texture }) {
  const ref = useRef<THREE.Group>(null);
  const dir = useRef(p.flip ? -1 : 1);
  const img = texture.image as { width: number; height: number } | undefined;
  const aspect = img && img.height ? img.width / img.height : 1;
  const mesh = useRef<THREE.Mesh>(null);
  const baseOpacity = p.dim ?? 0.98;

  useFrame((state, dt) => {
    const g = ref.current;
    if (!g) return;
    const t = state.clock.elapsedTime;
    const d = Math.min(dt, 0.05);
    // «Глубина резкости»: вплотную к камере существо растворяется в толще —
    // и близко текстура (512px) никогда не растягивается до мыла. Полная
    // видимость дальше FADE_FAR, ноль — ближе FADE_NEAR.
    const FADE_FAR = 26, FADE_NEAR = 9;
    const dz = state.camera.position.z - p.z; // камера летит к -z, существо впереди при dz>0
    const k = Math.min(1, Math.max(0, (dz - FADE_NEAR) / (FADE_FAR - FADE_NEAR)));
    if (mesh.current) (mesh.current.material as THREE.MeshBasicMaterial).opacity = baseOpacity * k;
    if (p.kind === "swim") {
      g.position.x += dir.current * (p.speed ?? 1) * d;
      if (g.position.x > SPAN) g.position.x = -SPAN;
      if (g.position.x < -SPAN) g.position.x = SPAN;
      g.position.y = p.y + Math.sin(t * 0.5 + p.phase) * 0.6; // мягкая волна плавания
      if (mesh.current) mesh.current.scale.x = p.s * aspect * dir.current;
    } else if (p.kind === "rise") {
      g.position.y += (p.speed ?? 1.5) * d;
      if (g.position.y > 26) g.position.y = -26;
      g.position.x = p.x + Math.sin(t * 0.6 + p.phase) * 0.8;
    } else if (p.kind === "bob") {
      g.position.y = p.y + Math.sin(t * 0.4 + p.phase) * (p.bob ?? 0.8);
      g.position.x = p.x + Math.sin(t * 0.15 + p.phase) * 1.2;
    } else {
      g.position.y = p.y + Math.sin(t * 0.5 + p.phase) * 0.15; // still: едва колышется
    }
  });

  return (
    <group ref={ref} position={[p.x, p.y, p.z]}>
      <mesh ref={mesh} scale={[p.s * aspect * (p.flip ? -1 : 1), p.s, 1]}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial
          map={texture}
          transparent
          alphaTest={0.06}
          depthWrite={false}
          opacity={p.dim ?? 0.98}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}

export function OceanLife() {
  const urls = FILES.map((f) => `${BASE}/${f}.png`);
  const textures = useTexture(urls) as THREE.Texture[];
  const byName: Record<string, THREE.Texture> = {};
  FILES.forEach((f, i) => {
    textures[i].colorSpace = THREE.SRGBColorSpace;
    byName[f] = textures[i];
  });
  return (
    <group>
      {SCENE.map((p, i) => (
        <Creature key={i} p={p} texture={byName[p.tex]} />
      ))}
    </group>
  );
}
