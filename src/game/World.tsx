import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Environment, Lightformer, Text, Float } from "@react-three/drei";
import * as THREE from "three";
import { Crewmate } from "./Crewmate";
import type { Look, Phase } from "./data";

export type Target = { type: "challenge"; id: string } | { type: "microbe" } | null;

interface Props {
  phase: Phase;
  look: Look;
  done: Set<string>;
  unlocked: boolean;
  paused: boolean;
  onNear: (t: Target) => void;
}

const SPEED = 6;
const RADIUS = 13;

export function World({ phase, look, done, unlocked, paused, onNear }: Props) {
  const player = useRef<THREE.Group>(null);
  const keys = useRef<Record<string, boolean>>({});
  const nearRef = useRef<string>("");
  const [leg, setLeg] = useState(0);
  const legAcc = useRef(0);
  const { camera } = useThree();

  useEffect(() => {
    const d = (e: KeyboardEvent) => (keys.current[e.code] = true);
    const u = (e: KeyboardEvent) => (keys.current[e.code] = false);
    window.addEventListener("keydown", d);
    window.addEventListener("keyup", u);
    return () => { window.removeEventListener("keydown", d); window.removeEventListener("keyup", u); };
  }, []);

  useEffect(() => {
    player.current?.position.set(0, 0, 4);
  }, [phase]);

  const trees = useMemo(() => {
    const arr: [number, number, number][] = [];
    for (let i = 0; i < 22; i++) {
      const a = (i / 22) * Math.PI * 2 + (i % 3) * 0.1;
      const r = RADIUS - 0.8 + (i % 2) * 0.5;
      arr.push([Math.cos(a) * r, Math.sin(a) * r, 0.7 + (i % 4) * 0.2]);
    }
    return arr;
  }, []);

  useFrame((_, raw) => {
    const dt = Math.min(raw, 0.05);
    const p = player.current;
    if (!p) return;
    const k = keys.current;
    const dir = new THREE.Vector3(
      (k.KeyD || k.ArrowRight ? 1 : 0) - (k.KeyA || k.ArrowLeft ? 1 : 0), 0,
      (k.KeyS || k.ArrowDown ? 1 : 0) - (k.KeyW || k.ArrowUp ? 1 : 0),
    );
    if (!paused && dir.lengthSq() > 0) {
      dir.normalize();
      p.position.addScaledVector(dir, SPEED * dt);
      const len = Math.hypot(p.position.x, p.position.z);
      if (len > RADIUS - 1.5) p.position.multiplyScalar((RADIUS - 1.5) / len);
      const targetRot = Math.atan2(dir.x, dir.z);
      let diff = targetRot - p.rotation.y;
      diff = Math.atan2(Math.sin(diff), Math.cos(diff));
      p.rotation.y += diff * (1 - Math.exp(-12 * dt));
      legAcc.current += dt * 14;
      setLeg(legAcc.current);
    }
    const camTarget = new THREE.Vector3(p.position.x, 9, p.position.z + 10);
    camera.position.lerp(camTarget, 1 - Math.exp(-5 * dt));
    camera.lookAt(p.position.x, 1, p.position.z);

    let best: Target = null;
    let bestD = 2.4;
    for (const c of phase.challenges) {
      if (done.has(c.id)) continue;
      const d = Math.hypot(p.position.x - c.pos[0], p.position.z - c.pos[1]);
      if (d < bestD) { bestD = d; best = { type: "challenge", id: c.id }; }
    }
    if (unlocked && Math.hypot(p.position.x, p.position.z) < 2.2) best = { type: "microbe" };
    const key = best ? (best.type === "microbe" ? "m" : best.id) : "";
    if (key !== nearRef.current) { nearRef.current = key; onNear(best); }
  });

  return (
    <>
      <color attach="background" args={[phase.sky]} />
      <fog attach="fog" args={[phase.sky, 25, 60]} />
      <hemisphereLight args={["#ffffff", phase.ground, 0.7]} />
      <directionalLight position={[8, 15, 6]} intensity={1.6} castShadow shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-16} shadow-camera-right={16} shadow-camera-top={16} shadow-camera-bottom={-16} />
      <Environment resolution={64}>
        <Lightformer intensity={2} position={[0, 5, 0]} scale={[10, 10, 1]} />
        <Lightformer intensity={1} color={phase.accent} position={[-5, 1, -1]} rotation-y={Math.PI / 2} scale={[20, 1, 1]} />
      </Environment>

      {/* floating island */}
      <mesh receiveShadow position={[0, -0.25, 0]}>
        <cylinderGeometry args={[RADIUS, RADIUS - 0.5, 0.5, 48]} />
        <meshStandardMaterial color={phase.ground} roughness={0.9} />
      </mesh>
      <mesh position={[0, -2.5, 0]}>
        <coneGeometry args={[RADIUS - 0.5, 4, 48]} />
        <meshStandardMaterial color="#8a6a4a" roughness={1} />
      </mesh>
      {[4, 8].map((r) => (
        <mesh key={r} rotation-x={-Math.PI / 2} position={[0, 0.01, 0]} receiveShadow>
          <ringGeometry args={[r, r + 0.25, 64]} />
          <meshStandardMaterial color="#ffffff" transparent opacity={0.35} />
        </mesh>
      ))}

      {trees.map(([x, z, s], i) => (
        <group key={i} position={[x, 0, z]} scale={s}>
          <mesh position={[0, 0.5, 0]} castShadow><cylinderGeometry args={[0.15, 0.2, 1]} /><meshStandardMaterial color="#7a5230" /></mesh>
          <mesh position={[0, 1.4, 0]} castShadow><icosahedronGeometry args={[0.8, 0]} /><meshStandardMaterial color={i % 2 ? "#3e9e4f" : "#58b86a"} flatShading /></mesh>
        </group>
      ))}

      {phase.challenges.map((c) => (
        <Station key={c.id} pos={c.pos} kind={c.kind} title={c.title} done={done.has(c.id)} accent={phase.accent} />
      ))}

      <MicrobeCage color={phase.microbe} unlocked={unlocked} />

      <Crewmate ref={player} look={look} legPhase={leg} />
    </>
  );
}

function Station({ pos, kind, title, done, accent }: { pos: [number, number]; kind: string; title: string; done: boolean; accent: string }) {
  const color = done ? "#9aa5a0" : kind === "colega" ? "#ff8fab" : accent;
  return (
    <group position={[pos[0], 0, pos[1]]}>
      {kind === "colega" ? (
        <group rotation-y={Math.atan2(-pos[0], -pos[1])}>
          <Crewmate look={{ color: done ? "#9aa5a0" : "#ff8fab", hat: "nenhum", name: "" }} />
        </group>
      ) : (
        <>
          <mesh position={[0, 0.6, 0]} castShadow><cylinderGeometry args={[0.9, 1, 1.2, 8]} /><meshStandardMaterial color="#e8eef2" /></mesh>
          <mesh position={[0, 1.5, 0]} castShadow><cylinderGeometry args={[0.6, 0.6, 0.8, 16]} /><meshStandardMaterial color={color} transparent opacity={0.8} roughness={0.1} /></mesh>
        </>
      )}
      {!done && (
        <Float speed={3} floatIntensity={0.6}>
          <mesh position={[0, 2.8, 0]}>
            <octahedronGeometry args={[0.3]} />
            <meshStandardMaterial color={kind === "colega" ? "#ff4d6d" : "#ffd23f"} emissive={kind === "colega" ? "#ff4d6d" : "#ffd23f"} emissiveIntensity={0.6} />
          </mesh>
        </Float>
      )}
      <Text position={[0, 3.5, 0]} fontSize={0.38} color="#1b2a3a" outlineWidth={0.03} outlineColor="#ffffff" anchorY="bottom">
        {done ? "✓ " + title : title}
      </Text>
    </group>
  );
}

function MicrobeCage({ color, unlocked }: { color: string; unlocked: boolean }) {
  const m = useRef<THREE.Group>(null);
  useFrame((s) => {
    if (m.current) { m.current.rotation.y = s.clock.elapsedTime; m.current.position.y = 1.4 + Math.sin(s.clock.elapsedTime * 2) * 0.15; }
  });
  return (
    <group>
      <mesh position={[0, 0.15, 0]} receiveShadow><cylinderGeometry args={[1.4, 1.6, 0.3, 24]} /><meshStandardMaterial color="#334" metalness={0.6} roughness={0.3} /></mesh>
      <group ref={m}>
        <mesh scale={[1, 0.6, 0.6]} castShadow><sphereGeometry args={[0.5, 20, 14]} /><meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} roughness={0.3} /></mesh>
        {Array.from({ length: 8 }).map((_, i) => (
          <mesh key={i} position={[Math.cos(i) * 0.4, Math.sin(i * 2) * 0.25, Math.sin(i) * 0.25]} scale={0.25}>
            <sphereGeometry args={[0.3, 8, 6]} /><meshStandardMaterial color="#ffffff" />
          </mesh>
        ))}
      </group>
      {!unlocked && Array.from({ length: 10 }).map((_, i) => {
        const a = (i / 10) * Math.PI * 2;
        return (
          <mesh key={i} position={[Math.cos(a) * 1.1, 1.4, Math.sin(a) * 1.1]}>
            <cylinderGeometry args={[0.05, 0.05, 2.5]} /><meshStandardMaterial color="#c0c8d0" metalness={0.9} roughness={0.2} />
          </mesh>
        );
      })}
      <Text position={[0, 3.3, 0]} fontSize={0.42} color="#1b2a3a" outlineWidth={0.03} outlineColor="#ffffff">
        {unlocked ? "PEGUE O MICRÓBIO!" : "🔒 Micróbio trancado"}
      </Text>
    </group>
  );
}
