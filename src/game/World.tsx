import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Environment, Lightformer, Text, Float, Sparkles } from "@react-three/drei";
import * as THREE from "three";
import { Crewmate } from "./Crewmate";
import { POSITIONS, type Look, type Phase, type MicrobeType } from "./data";

export type Target = { type: "challenge"; id: string } | { type: "microbe" } | null;

interface Props {
  phase: Phase;
  look: Look;
  done: Set<string>;
  unlocked: boolean;
  paused: boolean;
  respawnKey: number;
  onNear: (t: Target) => void;
  onCaught: () => void;
}

const SPEED = 6;
const RADIUS = 13;
type Keys = Partial<Record<string, boolean>>;

export function World({ phase, look, done, unlocked, paused, respawnKey, onNear, onCaught }: Props) {
  const player = useRef<THREE.Group>(null);
  const keys = useRef<Keys>({});
  const nearRef = useRef<string>("");
  const [leg, setLeg] = useState(0);
  const legAcc = useRef(0);
  const guards = useRef<(THREE.Group | null)[]>([]);
  const invuln = useRef(1.5);
  const time = useRef(0);
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
    invuln.current = 1.5;
  }, [phase, respawnKey]);

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
    if (!paused) time.current += dt;
    invuln.current -= dt;
    const dir = new THREE.Vector3(
      (k["KeyD"] || k["ArrowRight"] ? 1 : 0) - (k["KeyA"] || k["ArrowLeft"] ? 1 : 0), 0,
      (k["KeyS"] || k["ArrowDown"] ? 1 : 0) - (k["KeyW"] || k["ArrowUp"] ? 1 : 0),
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
    p.visible = invuln.current > 0 ? Math.floor(invuln.current * 10) % 2 === 0 : true;

    // security drones: orbit + chase when close
    guards.current.forEach((g, i) => {
      if (!g) return;
      const r = i % 2 ? 6.5 : 10;
      const dirSign = i % 2 ? -1 : 1;
      const a = time.current * phase.guardSpeed * dirSign + (i / phase.guards) * Math.PI * 2;
      const home = new THREE.Vector3(Math.cos(a) * r, 0, Math.sin(a) * r);
      const toP = new THREE.Vector3(p.position.x - g.position.x, 0, p.position.z - g.position.z);
      const chasing = toP.length() < 4 && !paused;
      const target = chasing ? new THREE.Vector3(p.position.x, 0, p.position.z) : home;
      g.position.x += (target.x - g.position.x) * (1 - Math.exp(-(chasing ? 1.6 : 4) * dt));
      g.position.z += (target.z - g.position.z) * (1 - Math.exp(-(chasing ? 1.6 : 4) * dt));
      g.position.y = 1.3 + Math.sin(time.current * 4 + i) * 0.15;
      g.rotation.y += dt * 3;
      if (!paused && invuln.current <= 0 && toP.length() < 0.9) {
        invuln.current = 2;
        onCaught();
      }
    });

    const camTarget = new THREE.Vector3(p.position.x, 10, p.position.z + 10);
    camera.position.lerp(camTarget, 1 - Math.exp(-5 * dt));
    camera.lookAt(p.position.x, 1, p.position.z);

    let best: Target = null;
    let bestD = 2.4;
    phase.challenges.forEach((c, i) => {
      if (done.has(c.id)) return;
      const pos = POSITIONS[i]!;
      const d = Math.hypot(p.position.x - pos[0], p.position.z - pos[1]);
      if (d < bestD) { bestD = d; best = { type: "challenge", id: c.id }; }
    });
    if (unlocked && Math.hypot(p.position.x, p.position.z) < 2.2) best = { type: "microbe" };
    const b = best as Target;
    const key = b ? (b.type === "microbe" ? "m" : b.id) : "";
    if (key !== nearRef.current) { nearRef.current = key; onNear(b); }
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

      <mesh receiveShadow position={[0, -0.25, 0]}>
        <cylinderGeometry args={[RADIUS, RADIUS - 0.5, 0.5, 48]} />
        <meshStandardMaterial color={phase.ground} roughness={0.9} />
      </mesh>
      <mesh position={[0, -2.5, 0]}>
        <coneGeometry args={[RADIUS - 0.5, 4, 48]} />
        <meshStandardMaterial color="#8a6a4a" roughness={1} />
      </mesh>
      {[6.5, 10].map((r) => (
        <mesh key={r} rotation-x={-Math.PI / 2} position={[0, 0.01, 0]} receiveShadow>
          <ringGeometry args={[r - 0.15, r + 0.15, 64]} />
          <meshStandardMaterial color="#ff4d4d" transparent opacity={0.25} />
        </mesh>
      ))}

      {trees.map(([x, z, s], i) => (
        <group key={i} position={[x, 0, z]} scale={s}>
          <mesh position={[0, 0.5, 0]} castShadow><cylinderGeometry args={[0.15, 0.2, 1]} /><meshStandardMaterial color="#7a5230" /></mesh>
          <mesh position={[0, 1.4, 0]} castShadow><icosahedronGeometry args={[0.8, 0]} /><meshStandardMaterial color={i % 2 ? "#3e9e4f" : "#58b86a"} flatShading /></mesh>
        </group>
      ))}

      {phase.challenges.map((c, i) => (
        <Station key={c.id} pos={POSITIONS[i]!} kind={c.kind} title={c.title} done={done.has(c.id)} accent={phase.accent} />
      ))}

      {Array.from({ length: phase.guards }).map((_, i) => (
        <group key={i} ref={(el) => { guards.current[i] = el; }} position={[10, 1.3, 0]}>
          <Drone />
        </group>
      ))}

      <MicrobeCage color={phase.microbe} type={phase.microbeType} name={phase.microbeName} unlocked={unlocked} />

      <Crewmate ref={player} look={look} legPhase={leg} />
    </>
  );
}

function Drone() {
  return (
    <group>
      <mesh castShadow><sphereGeometry args={[0.45, 20, 14]} /><meshStandardMaterial color="#2b2d42" metalness={0.7} roughness={0.3} /></mesh>
      <mesh position={[0, 0, 0.38]}><sphereGeometry args={[0.16, 12, 8]} /><meshStandardMaterial color="#ff2e2e" emissive="#ff2e2e" emissiveIntensity={2} /></mesh>
      <mesh rotation-x={Math.PI / 2}><torusGeometry args={[0.65, 0.06, 8, 24]} /><meshStandardMaterial color="#8d99ae" metalness={0.8} /></mesh>
      <pointLight color="#ff2e2e" intensity={3} distance={3} />
    </group>
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

export function MicrobeModel({ type, color }: { type: MicrobeType; color: string }) {
  const mat = <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.35} roughness={0.35} />;
  if (type === "levedura")
    // yeast: oval mother cell with budding daughters
    return (
      <group>
        <mesh scale={[1, 0.85, 0.85]} castShadow><sphereGeometry args={[0.5, 24, 16]} />{mat}</mesh>
        <mesh position={[0.52, 0.25, 0]} castShadow><sphereGeometry args={[0.26, 16, 12]} />{mat}</mesh>
        <mesh position={[-0.35, 0.42, 0.15]} castShadow><sphereGeometry args={[0.15, 12, 8]} />{mat}</mesh>
        <mesh position={[0, 0, 0.2]}><sphereGeometry args={[0.18, 12, 8]} /><meshStandardMaterial color="#c98a00" /></mesh>
      </group>
    );
  if (type === "bacilo")
    // Pseudomonas: rod with long polar flagellum
    return (
      <group rotation-z={Math.PI / 2}>
        <mesh castShadow><capsuleGeometry args={[0.28, 0.8, 8, 16]} />{mat}</mesh>
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <mesh key={i} position={[Math.sin(i * 1.2) * 0.12, -0.75 - i * 0.18, 0]} rotation-z={Math.sin(i) * 0.6}>
            <cylinderGeometry args={[0.03, 0.03, 0.22]} /><meshStandardMaterial color="#5a2a8a" />
          </mesh>
        ))}
        <mesh position={[0, 0.1, 0.2]}><sphereGeometry args={[0.08, 8, 6]} /><meshStandardMaterial color="#2a1250" /></mesh>
        <mesh position={[0, -0.2, 0.18]}><sphereGeometry args={[0.06, 8, 6]} /><meshStandardMaterial color="#2a1250" /></mesh>
      </group>
    );
  // E. coli: rod with pili all over and glowing plasmid ring
  return (
    <group rotation-z={0.4}>
      <mesh castShadow><capsuleGeometry args={[0.32, 0.7, 8, 16]} />{mat}</mesh>
      {Array.from({ length: 14 }).map((_, i) => {
        const a = i * 2.4; const y = ((i % 7) / 6 - 0.5) * 1;
        return (
          <mesh key={i} position={[Math.cos(a) * 0.4, y, Math.sin(a) * 0.4]} rotation={[Math.sin(a) * 1.2, 0, -Math.cos(a) * 1.2]}>
            <cylinderGeometry args={[0.015, 0.015, 0.22]} /><meshStandardMaterial color="#e0fff4" />
          </mesh>
        );
      })}
      <mesh rotation-x={Math.PI / 2}><torusGeometry args={[0.2, 0.04, 8, 24]} /><meshStandardMaterial color="#ff4dd2" emissive="#ff4dd2" emissiveIntensity={1.5} /></mesh>
    </group>
  );
}

function MicrobeCage({ color, type, name, unlocked }: { color: string; type: MicrobeType; name: string; unlocked: boolean }) {
  const m = useRef<THREE.Group>(null);
  useFrame((s) => {
    if (m.current) { m.current.rotation.y = s.clock.elapsedTime; m.current.position.y = 1.5 + Math.sin(s.clock.elapsedTime * 2) * 0.15; }
  });
  return (
    <group>
      <mesh position={[0, 0.15, 0]} receiveShadow><cylinderGeometry args={[1.4, 1.6, 0.3, 24]} /><meshStandardMaterial color="#334" metalness={0.6} roughness={0.3} /></mesh>
      <mesh position={[0, 0.31, 0]} rotation-x={-Math.PI / 2}><ringGeometry args={[1.0, 1.25, 32]} /><meshStandardMaterial color={color} emissive={color} emissiveIntensity={unlocked ? 2 : 0.3} /></mesh>
      <group ref={m} scale={1.2}><MicrobeModel type={type} color={color} /></group>
      <Sparkles count={unlocked ? 40 : 12} scale={[2.5, 2.5, 2.5]} position={[0, 1.5, 0]} color={color} size={4} speed={0.6} />
      {!unlocked && Array.from({ length: 10 }).map((_, i) => {
        const a = (i / 10) * Math.PI * 2;
        return (
          <mesh key={i} position={[Math.cos(a) * 1.1, 1.4, Math.sin(a) * 1.1]}>
            <cylinderGeometry args={[0.05, 0.05, 2.5]} /><meshStandardMaterial color="#c0c8d0" metalness={0.9} roughness={0.2} />
          </mesh>
        );
      })}
      <Text position={[0, 3.6, 0]} fontSize={0.42} color="#1b2a3a" outlineWidth={0.03} outlineColor="#ffffff">
        {unlocked ? "PEGUE O MICRÓBIO!" : name}
      </Text>
      {!unlocked && <Text position={[0, 3.15, 0]} fontSize={0.28} color="#c0392b" outlineWidth={0.02} outlineColor="#ffffff">trancado</Text>}
    </group>
  );
}
