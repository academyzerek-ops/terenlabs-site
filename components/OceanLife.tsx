"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";

// Живые существа океана как billboard-спрайты на разных глубинах. Камера
// летит сквозь z, проплывая мимо рыб, медуз, осьминога, кораллов у дна.
// Каждый мягко покачивается и дрейфует — океан населён, а не «космос».

const BASE = "/brand/ocean-life";
const FILES = [
  "jellyfish-1", "jellyfish-2", "fish-1", "fish-school", "octopus",
  "manta-ray", "turtle", "plankton", "coral-1", "coral-2", "seaweed", "anglerfish",
] as const;

type Placement = {
  tex: string; x: number; y: number; z: number; s: number;
  drift: number; bob: number; phase: number; flip?: boolean;
};

// раскладка по глубине: у поверхности рыбы/медузы, в толще скаты/осьминог,
// у дна (большие -z) кораллы и водоросли
const SCENE: Placement[] = [
  // мелководье / риф (z 0..-50)
  { tex: "fish-school", x: -12, y: 6, z: -14, s: 7, drift: 0.5, bob: 0.6, phase: 0 },
  { tex: "fish-1", x: 14, y: -4, z: -20, s: 3.4, drift: 0.7, bob: 0.5, phase: 1, flip: true },
  { tex: "jellyfish-2", x: 8, y: 10, z: -26, s: 4, drift: 0.18, bob: 1.0, phase: 2 },
  { tex: "turtle", x: -16, y: -8, z: -34, s: 8, drift: 0.4, bob: 0.5, phase: 0.5 },
  { tex: "plankton", x: 2, y: 2, z: -40, s: 14, drift: 0.1, bob: 0.3, phase: 3 },
  // толща / течение (z -50..-120)
  { tex: "jellyfish-1", x: -10, y: 4, z: -60, s: 8, drift: 0.16, bob: 1.2, phase: 1.5 },
  { tex: "manta-ray", x: 16, y: 8, z: -74, s: 12, drift: 0.45, bob: 0.7, phase: 2.5, flip: true },
  { tex: "fish-school", x: -18, y: -6, z: -88, s: 9, drift: 0.55, bob: 0.6, phase: 4 },
  { tex: "fish-1", x: 10, y: 12, z: -100, s: 4, drift: 0.6, bob: 0.5, phase: 0.8 },
  { tex: "jellyfish-2", x: -6, y: -10, z: -112, s: 5, drift: 0.2, bob: 1.0, phase: 3.5 },
  // глубина (z -120..-180)
  { tex: "octopus", x: 12, y: -4, z: -134, s: 11, drift: 0.22, bob: 0.5, phase: 1 },
  { tex: "anglerfish", x: -14, y: 6, z: -150, s: 6, drift: 0.3, bob: 0.6, phase: 2, flip: true },
  { tex: "jellyfish-1", x: 8, y: 10, z: -166, s: 9, drift: 0.14, bob: 1.3, phase: 4.5 },
  { tex: "manta-ray", x: -16, y: -2, z: -178, s: 14, drift: 0.4, bob: 0.6, phase: 0.3 },
  // дно / бездна (z -185..-230): кораллы и водоросли — стоят, чуть колышутся
  { tex: "coral-1", x: -18, y: -18, z: -196, s: 16, drift: 0, bob: 0.25, phase: 0 },
  { tex: "coral-2", x: 14, y: -19, z: -202, s: 15, drift: 0, bob: 0.25, phase: 1 },
  { tex: "seaweed", x: -6, y: -20, z: -208, s: 20, drift: 0, bob: 0.5, phase: 2 },
  { tex: "coral-1", x: 20, y: -18, z: -216, s: 13, drift: 0, bob: 0.2, phase: 3, flip: true },
  { tex: "seaweed", x: 6, y: -21, z: -224, s: 22, drift: 0, bob: 0.5, phase: 1.5 },
];

function Creature({ p, texture }: { p: Placement; texture: THREE.Texture }) {
  const ref = useRef<THREE.Group>(null);
  const img = texture.image as { width: number; height: number } | undefined;
  const aspect = img && img.height ? img.width / img.height : 1;
  useFrame((state) => {
    const g = ref.current;
    if (!g) return;
    const t = state.clock.elapsedTime;
    g.position.y = p.y + Math.sin(t * 0.4 + p.phase) * p.bob; // покачивание
    g.position.x = p.x + Math.sin(t * 0.12 * p.drift + p.phase) * (p.drift * 6); // дрейф вбок
  });
  return (
    <group ref={ref} position={[p.x, p.y, p.z]}>
      <mesh scale={[p.s * aspect * (p.flip ? -1 : 1), p.s, 1]}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial
          map={texture}
          transparent
          alphaTest={0.08}
          depthWrite={false}
          opacity={0.96}
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
