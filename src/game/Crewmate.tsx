import { forwardRef } from "react";
import * as THREE from "three";
import type { Look } from "./data";

function darker(c: string) {
  return "#" + new THREE.Color(c).multiplyScalar(0.65).getHexString();
}

export const Crewmate = forwardRef<THREE.Group, { look: Look; legPhase?: number }>(
  ({ look, legPhase = 0 }, ref) => {
    const shade = darker(look.color);
    const s = Math.sin(legPhase) * 0.35;
    return (
      <group ref={ref}>
        <mesh position={[0, 0.95, 0]} castShadow>
          <capsuleGeometry args={[0.5, 0.6, 8, 16]} />
          <meshStandardMaterial color={look.color} roughness={0.5} />
        </mesh>
        <mesh position={[0, 1.15, 0.38]} scale={[1, 0.62, 0.6]} castShadow>
          <sphereGeometry args={[0.36, 24, 16]} />
          <meshStandardMaterial color="#9fd8ec" metalness={0.3} roughness={0.1} />
        </mesh>
        <mesh position={[0.1, 1.24, 0.55]} scale={[1, 0.4, 0.3]}>
          <sphereGeometry args={[0.12, 12, 8]} />
          <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.4} />
        </mesh>
        <mesh position={[0, 0.95, -0.5]} castShadow>
          <boxGeometry args={[0.6, 0.65, 0.3]} />
          <meshStandardMaterial color={shade} roughness={0.6} />
        </mesh>
        {[-0.22, 0.22].map((x, i) => (
          <mesh key={x} position={[x, 0.3, (i ? -s : s) * 0.5]} castShadow>
            <capsuleGeometry args={[0.18, 0.25, 4, 10]} />
            <meshStandardMaterial color={shade} />
          </mesh>
        ))}
        <HatMesh hat={look.hat} />
      </group>
    );
  },
);

function HatMesh({ hat }: { hat: Look["hat"] }) {
  if (hat === "folha")
    return (
      <group position={[0, 1.78, 0]}>
        <mesh position={[0, -0.05, 0]}><cylinderGeometry args={[0.03, 0.03, 0.2]} /><meshStandardMaterial color="#5b3a1a" /></mesh>
        <mesh position={[0.15, 0.08, 0]} rotation={[0, 0, -0.6]} scale={[1, 0.3, 0.6]}><sphereGeometry args={[0.22, 12, 8]} /><meshStandardMaterial color="#3fbf3f" /></mesh>
      </group>
    );
  if (hat === "coroa")
    return (
      <group position={[0, 1.72, 0]}>
        <mesh><cylinderGeometry args={[0.3, 0.3, 0.16, 16, 1, true]} /><meshStandardMaterial color="#ffcc00" metalness={0.8} roughness={0.25} side={THREE.DoubleSide} /></mesh>
        {[0, 1, 2, 3, 4].map((i) => (
          <mesh key={i} position={[Math.cos((i / 5) * Math.PI * 2) * 0.3, 0.14, Math.sin((i / 5) * Math.PI * 2) * 0.3]}>
            <coneGeometry args={[0.06, 0.15, 6]} /><meshStandardMaterial color="#ffcc00" metalness={0.8} roughness={0.25} />
          </mesh>
        ))}
      </group>
    );
  if (hat === "capacete")
    return (
      <group position={[0, 1.62, 0]}>
        <mesh><sphereGeometry args={[0.44, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2]} /><meshStandardMaterial color="#ffd23f" /></mesh>
        <mesh position={[0, 0, 0.1]}><cylinderGeometry args={[0.55, 0.55, 0.04, 20]} /><meshStandardMaterial color="#ffd23f" /></mesh>
      </group>
    );
  if (hat === "frasco")
    return (
      <group position={[0, 1.85, 0]}>
        <mesh><coneGeometry args={[0.22, 0.35, 16]} /><meshStandardMaterial color="#aef" transparent opacity={0.6} /></mesh>
        <mesh position={[0, -0.08, 0]}><coneGeometry args={[0.16, 0.15, 16]} /><meshStandardMaterial color="#06d6a0" emissive="#06d6a0" emissiveIntensity={0.4} /></mesh>
        <mesh position={[0, 0.25, 0]}><cylinderGeometry args={[0.06, 0.06, 0.18]} /><meshStandardMaterial color="#aef" transparent opacity={0.6} /></mesh>
      </group>
    );
  return null;
}
