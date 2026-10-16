import { Suspense, useCallback, useEffect, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Lightformer, OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { useRef } from "react";
import { COLORS, HATS, PHASES, POINTS, type Look, type Challenge } from "./data";
import { Crewmate } from "./Crewmate";
import { World, type Target } from "./World";

type Screen = "menu" | "custom" | "about" | "intro" | "play" | "win";
const TEAM = ["Arthur Gonçalves", "Cristiano Ricardo", "Henrique", "João Gabriel", "Matheus Souza"];

function Spinner({ look }: { look: Look }) {
  const g = useRef<THREE.Group>(null);
  useFrame((_, d) => { if (g.current) g.current.rotation.y += d * 0.8; });
  return <group ref={g}><Crewmate look={look} /></group>;
}

function Preview({ look }: { look: Look }) {
  return (
    <Canvas shadows camera={{ position: [0, 1.6, 4], fov: 40 }} dpr={[1, 2]}>
      <ambientLight intensity={0.6} />
      <directionalLight position={[3, 5, 4]} intensity={1.5} castShadow />
      <Environment resolution={64}><Lightformer intensity={2} position={[0, 5, 2]} scale={[10, 10, 1]} /></Environment>
      <Spinner look={look} />
      <mesh rotation-x={-Math.PI / 2} receiveShadow><circleGeometry args={[1.4, 32]} /><meshStandardMaterial color="#ffffff" transparent opacity={0.25} /></mesh>
      <OrbitControls enablePan={false} enableZoom={false} target={[0, 1, 0]} />
    </Canvas>
  );
}

export function GameApp() {
  const [screen, setScreen] = useState<Screen>("menu");
  const [look, setLook] = useState<Look>({ color: COLORS[0], hat: "folha", name: "Cientista" });
  const [phaseIdx, setPhaseIdx] = useState(0);
  const [points, setPoints] = useState(0);
  const [total, setTotal] = useState(0);
  const [done, setDone] = useState<Set<string>>(new Set());
  const [near, setNear] = useState<Target>(null);
  const [active, setActive] = useState<Challenge | null>(null);
  const [picked, setPicked] = useState<number | null>(null);
  const [toast, setToast] = useState("");

  const phase = PHASES[phaseIdx];
  const unlocked = points >= phase.minPoints;
  const remaining = phase.challenges.filter((c) => !done.has(c.id));
  const maxPossible = points + remaining.reduce((s, c) => s + POINTS[c.kind], 0);

  const startPhase = (i: number) => { setPhaseIdx(i); setPoints(0); setDone(new Set()); setNear(null); setScreen("intro"); };

  const interact = useCallback(() => {
    if (screen !== "play" || active) return;
    if (near?.type === "challenge") { setActive(phase.challenges.find((c) => c.id === near.id)!); setPicked(null); }
    else if (near?.type === "microbe") {
      if (phaseIdx === PHASES.length - 1) setScreen("win");
      else startPhase(phaseIdx + 1);
    }
  }, [screen, active, near, phase, phaseIdx]);

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.code === "KeyE" || e.code === "Space" || e.code === "Enter") interact(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [interact]);

  const answer = (i: number) => {
    if (!active || picked !== null) return;
    setPicked(i);
    if (i === active.answer) { setPoints((p) => p + POINTS[active.kind]); setTotal((t) => t + POINTS[active.kind]); }
  };
  const closeQuiz = () => {
    if (!active) return;
    setDone((d) => new Set(d).add(active.id));
    if (picked === active.answer && points >= phase.minPoints) setToast("Jaula aberta! Vá até o centro e roube o micróbio!");
    setActive(null);
  };
  useEffect(() => { if (toast) { const t = setTimeout(() => setToast(""), 3500); return () => clearTimeout(t); } }, [toast]);

  if (screen === "play" || screen === "intro") {
    const nearC = near?.type === "challenge" ? phase.challenges.find((c) => c.id === near.id) : null;
    const failed = !unlocked && maxPossible < phase.minPoints;
    return (
      <div className="fixed inset-0">
        <Canvas shadows camera={{ position: [0, 9, 14], fov: 55 }} dpr={[1, 2]}>
          <Suspense fallback={null}>
            <World phase={phase} look={look} done={done} unlocked={unlocked} paused={!!active || screen !== "play"} onNear={setNear} />
          </Suspense>
        </Canvas>

        <div className="pointer-events-none fixed inset-x-0 top-0 z-10 flex flex-wrap items-start justify-between gap-3 p-4">
          <div className="game-panel px-4 py-3">
            <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{phase.name}</div>
            <div className="text-sm font-semibold">{phase.theme}</div>
          </div>
          <div className="game-panel min-w-56 px-4 py-3">
            <div className="flex justify-between text-sm font-bold"><span>Pontos</span><span>{points} / {phase.minPoints}</span></div>
            <div className="mt-2 h-3 overflow-hidden rounded-full bg-muted">
              <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${Math.min(100, (points / phase.minPoints) * 100)}%` }} />
            </div>
            <div className="mt-1 text-xs text-muted-foreground">Total: {total} · {look.name}</div>
          </div>
        </div>

        <div className="pointer-events-none fixed inset-x-0 bottom-4 z-10 flex flex-col items-center gap-2 px-4">
          {toast && <div className="game-panel px-4 py-2 font-bold text-primary">{toast}</div>}
          {screen === "play" && !active && (nearC || near?.type === "microbe") && (
            <button className="game-btn pointer-events-auto" onClick={interact}>
              {near?.type === "microbe" ? "Roubar micróbio! [E]" : nearC!.kind === "colega" ? `Ajudar ${nearC!.title.replace("Colega ", "")} [E]` : `Resolver: ${nearC!.title} [E]`}
            </button>
          )}
          {screen === "play" && <div className="game-panel px-3 py-1 text-xs">WASD / setas para andar · E para interagir · ⭐ problema = {POINTS.problema} · 💗 colega = {POINTS.colega}</div>}
          <MobilePad />
        </div>

        {screen === "intro" && (
          <Overlay>
            <div className="text-xs font-bold uppercase tracking-widest text-primary">{phase.name}</div>
            <h2 className="mt-1 font-display text-3xl">{phase.theme}</h2>
            <p className="mt-3">{phase.story}</p>
            <p className="mt-2 text-sm text-muted-foreground">Resolva situações-problema e ajude colegas. Faça pelo menos <b>{phase.minPoints} pontos</b> para abrir a jaula do micróbio.</p>
            <button className="game-btn mt-6 w-full" onClick={() => setScreen("play")}>Começar fase</button>
          </Overlay>
        )}

        {active && (
          <Overlay>
            <div className="text-xs font-bold uppercase tracking-widest text-primary">{active.kind === "colega" ? "💗 Ajude um colega" : "⭐ Situação-problema"} · +{POINTS[active.kind]}</div>
            <h2 className="mt-1 font-display text-2xl">{active.title}</h2>
            <p className="mt-3">{active.prompt}</p>
            <div className="mt-4 grid gap-2">
              {active.options.map((o, i) => {
                const state = picked === null ? "" : i === active.answer ? "correct" : i === picked ? "wrong" : "dim";
                return <button key={i} className={`game-option ${state}`} onClick={() => answer(i)}>{String.fromCharCode(65 + i)}) {o}</button>;
              })}
            </div>
            {picked !== null && (
              <>
                <p className="mt-4 rounded-xl bg-muted p-3 text-sm"><b>{picked === active.answer ? "Correto! " : "Ops! "}</b>{active.explain}</p>
                <button className="game-btn mt-4 w-full" onClick={closeQuiz}>Continuar</button>
              </>
            )}
          </Overlay>
        )}

        {failed && !active && screen === "play" && (
          <Overlay>
            <h2 className="font-display text-3xl">Pontos insuficientes</h2>
            <p className="mt-2">Você não alcançou {phase.minPoints} pontos nesta fase. Tente de novo!</p>
            <button className="game-btn mt-6 w-full" onClick={() => { setTotal((t) => t - points); startPhase(phaseIdx); }}>Reiniciar fase</button>
            <button className="game-btn-ghost mt-2 w-full" onClick={() => setScreen("menu")}>Menu</button>
          </Overlay>
        )}
      </div>
    );
  }

  return (
    <div className="game-bg flex min-h-screen items-center justify-center p-4">
      {screen === "menu" && (
        <div className="flex w-full max-w-md flex-col items-center text-center">
          <div className="h-64 w-64"><Preview look={look} /></div>
          <h1 className="font-display text-5xl leading-none text-primary-foreground drop-shadow">Roube um<br />Micróbio</h1>
          <p className="mt-3 text-primary-foreground/90">Uma aventura 3D de biotecnologia</p>
          <div className="mt-8 grid w-full gap-3">
            <button className="game-btn" onClick={() => { setTotal(0); startPhase(0); }}>▶ Iniciar jogo</button>
            <button className="game-btn-ghost" onClick={() => setScreen("custom")}>🎨 Personalizar</button>
            <button className="game-btn-ghost" onClick={() => setScreen("about")}>ℹ Sobre</button>
          </div>
        </div>
      )}

      {screen === "custom" && (
        <div className="game-panel grid w-full max-w-3xl gap-6 p-6 md:grid-cols-2">
          <div className="h-80 rounded-2xl bg-muted"><Preview look={look} /></div>
          <div>
            <h2 className="font-display text-3xl">Personalizar</h2>
            <label className="mt-4 block text-sm font-bold">Nome</label>
            <input className="mt-1 w-full rounded-xl border-2 border-border bg-background px-3 py-2" maxLength={14} value={look.name} onChange={(e) => setLook({ ...look, name: e.target.value })} />
            <div className="mt-4 text-sm font-bold">Cor</div>
            <div className="mt-2 grid grid-cols-6 gap-2">
              {COLORS.map((c) => (
                <button key={c} aria-label={c} onClick={() => setLook({ ...look, color: c })}
                  className={`h-10 rounded-full border-4 ${look.color === c ? "border-foreground" : "border-transparent"}`} style={{ background: c }} />
              ))}
            </div>
            <div className="mt-4 text-sm font-bold">Chapéu</div>
            <div className="mt-2 flex flex-wrap gap-2">
              {HATS.map((h) => (
                <button key={h} onClick={() => setLook({ ...look, hat: h })} className={`game-chip ${look.hat === h ? "active" : ""}`}>{h}</button>
              ))}
            </div>
            <button className="game-btn mt-6 w-full" onClick={() => setScreen("menu")}>Salvar</button>
          </div>
        </div>
      )}

      {screen === "about" && (
        <div className="game-panel w-full max-w-md p-6 text-center">
          <h2 className="font-display text-3xl">Sobre</h2>
          <p className="mt-2 text-sm text-muted-foreground">Jogo educativo sobre biotecnologia em energia, meio ambiente e indústria.</p>
          <h3 className="mt-5 font-bold">Integrantes do grupo</h3>
          <ul className="mt-2 grid gap-2">
            {TEAM.map((n) => <li key={n} className="rounded-xl bg-muted px-3 py-2 font-semibold">{n}</li>)}
          </ul>
          <button className="game-btn mt-6 w-full" onClick={() => setScreen("menu")}>Voltar</button>
        </div>
      )}

      {screen === "win" && (
        <div className="game-panel w-full max-w-md p-6 text-center">
          <div className="mx-auto h-56 w-56"><Preview look={look} /></div>
          <h2 className="font-display text-4xl text-primary">Você venceu!</h2>
          <p className="mt-2">{look.name} roubou todos os micróbios e dominou a biotecnologia!</p>
          <p className="mt-2 text-2xl font-bold">{total} pontos</p>
          <button className="game-btn mt-6 w-full" onClick={() => setScreen("menu")}>Menu principal</button>
        </div>
      )}
    </div>
  );
}

function Overlay({ children }: { children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-20 flex items-center justify-center bg-foreground/40 p-4">
      <div className="game-panel max-h-[90vh] w-full max-w-lg overflow-auto p-6">{children}</div>
    </div>
  );
}

function MobilePad() {
  const press = (code: string, down: boolean) => window.dispatchEvent(new KeyboardEvent(down ? "keydown" : "keyup", { code }));
  const B = ({ code, label }: { code: string; label: string }) => (
    <button className="game-chip pointer-events-auto h-12 w-12 select-none text-lg"
      onPointerDown={() => press(code, true)} onPointerUp={() => press(code, false)} onPointerLeave={() => press(code, false)}>{label}</button>
  );
  return (
    <div className="grid grid-cols-3 gap-1 md:hidden">
      <span /><B code="KeyW" label="▲" /><span />
      <B code="KeyA" label="◀" /><B code="KeyS" label="▼" /><B code="KeyD" label="▶" />
    </div>
  );
}
