import { Suspense, useCallback, useEffect, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Lightformer, OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { useRef } from "react";
import { COLORS, HATS, PHASES, POINTS, type Look, type Challenge } from "./data";
import { Crewmate } from "./Crewmate";
import { World, MicrobeModel, type Target } from "./World";
import type { MicrobeType } from "./data";

type Screen = "menu" | "custom" | "about" | "intro" | "play" | "win";
const TEAM = ["Arthur Gonçalves", "Cristiano Ricardo", "Henrique", "João Gabriel", "Matheus Souza"];

function Spinner({ look }: { look: Look }) {
  const g = useRef<THREE.Group>(null);
  useFrame((_, d) => { if (g.current) g.current.rotation.y += d * 0.8; });
  return <group ref={g}><Crewmate look={look} /></group>;
}

function MicrobeSpin({ type, color }: { type: MicrobeType; color: string }) {
  const g = useRef<THREE.Group>(null);
  useFrame((_, d) => { if (g.current) { g.current.rotation.y += d; g.current.rotation.x += d * 0.3; } });
  return <group ref={g} scale={1.6}><MicrobeModel type={type} color={color} /></group>;
}

function MicrobePreview({ type, color }: { type: MicrobeType; color: string }) {
  return (
    <Canvas camera={{ position: [0, 0, 4], fov: 40 }} dpr={[1, 2]}>
      <ambientLight intensity={0.7} />
      <directionalLight position={[3, 4, 5]} intensity={1.5} />
      <MicrobeSpin type={type} color={color} />
    </Canvas>
  );
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
  const [look, setLook] = useState<Look>({ color: COLORS[0]!, hat: "folha", name: "Cientista" });
  const [phaseIdx, setPhaseIdx] = useState(0);
  const [points, setPoints] = useState(0);
  const [total, setTotal] = useState(0);
  const [done, setDone] = useState<Set<string>>(new Set());
  const [near, setNear] = useState<Target>(null);
  const [active, setActive] = useState<Challenge | null>(null);
  const [order, setOrder] = useState<number[]>([0, 1, 2, 3]);
  const [picked, setPicked] = useState<number | null>(null);
  const [toast, setToast] = useState("");
  const [lives, setLives] = useState(3);
  const [timeLeft, setTimeLeft] = useState(0);
  const [streak, setStreak] = useState(0);
  const [gained, setGained] = useState(0);
  const [respawnKey, setRespawnKey] = useState(0);

  const phase = PHASES[phaseIdx]!;
  const unlocked = points >= phase.minPoints;
  const remaining = phase.challenges.filter((c) => !done.has(c.id));
  const maxPossible = points + remaining.reduce((s, c) => s + POINTS[c.kind] + 30, 0);

  const startPhase = (i: number) => {
    setPhaseIdx(i); setPoints(0); setDone(new Set()); setNear(null); setStreak(0);
    setLives(PHASES[i]!.lives); setScreen("intro");
  };

  const interact = useCallback(() => {
    if (screen !== "play" || active) return;
    if (near?.type === "challenge") {
      const c = phase.challenges.find((x) => x.id === near.id)!;
      setOrder([0, 1, 2, 3].sort(() => Math.random() - 0.5));
      setActive(c); setPicked(null); setTimeLeft(phase.time);
    } else if (near?.type === "microbe") {
      if (phaseIdx === PHASES.length - 1) setScreen("win");
      else startPhase(phaseIdx + 1);
    }
  }, [screen, active, near, phase, phaseIdx]);

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.code === "KeyE" || e.code === "Enter") interact(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [interact]);

  const loseLife = (msg: string) => {
    setLives((l) => l - 1); setStreak(0); setToast(msg);
  };

  const answer = (i: number) => {
    if (!active || picked !== null) return;
    setPicked(i);
    if (i === active.answer) {
      const bonus = Math.round((timeLeft / phase.time) * 20) + (streak >= 1 ? 10 : 0);
      const g = POINTS[active.kind] + bonus;
      setGained(g); setPoints((p) => p + g); setTotal((t) => t + g); setStreak((s) => s + 1);
    } else {
      setGained(0); loseLife("Resposta errada! −1 vida");
    }
  };

  // question timer
  useEffect(() => {
    if (!active || picked !== null) return undefined;
    if (timeLeft <= 0) { setPicked(-1); setGained(0); loseLife("Tempo esgotado! −1 vida"); return undefined; }
    const t = setTimeout(() => setTimeLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [active, picked, timeLeft]);

  const closeQuiz = () => {
    if (!active) return;
    setDone((d) => new Set(d).add(active.id));
    if (picked === active.answer && points >= phase.minPoints) setToast("Jaula aberta! Vá até o centro e roube o micróbio!");
    setActive(null);
  };
  const onCaught = useCallback(() => {
    loseLife("Pego por um drone! −1 vida");
    setRespawnKey((k) => k + 1);
  }, []);
  useEffect(() => { if (toast) { const t = setTimeout(() => setToast(""), 3000); return () => clearTimeout(t); } return undefined; }, [toast]);

  if (screen === "play" || screen === "intro") {
    const nearC = near?.type === "challenge" ? phase.challenges.find((c) => c.id === near.id) : null;
    const dead = lives <= 0;
    const failed = dead || (!unlocked && maxPossible < phase.minPoints);
    return (
      <div className="fixed inset-0">
        <Canvas shadows camera={{ position: [0, 9, 14], fov: 55 }} dpr={[1, 2]}>
          <Suspense fallback={null}>
            <World phase={phase} look={look} done={done} unlocked={unlocked} respawnKey={respawnKey}
              paused={!!active || screen !== "play" || failed} onNear={setNear} onCaught={onCaught} />
          </Suspense>
        </Canvas>

        <div className="pointer-events-none fixed inset-x-0 top-0 z-10 flex flex-wrap items-start justify-between gap-3 p-4">
          <div className="game-panel px-4 py-3">
            <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{phase.name}</div>
            <div className="text-sm font-semibold">{phase.theme}</div>
            <div className="mt-1 text-lg" aria-label="vidas">
              {Array.from({ length: phase.lives }).map((_, i) => <span key={i} className={i < lives ? "text-destructive" : "opacity-25"}>♥ </span>)}
              {streak >= 2 && <span className="ml-2 text-sm font-bold text-primary">Combo x{streak}</span>}
            </div>
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
          {screen === "play" && <div className="game-panel px-3 py-1 text-xs">WASD / setas · E interagir · fuja dos drones vermelhos · errar ou demorar custa 1 vida</div>}
          <MobilePad />
        </div>

        {screen === "intro" && (
          <Overlay>
            <div className="text-xs font-bold uppercase tracking-widest text-primary">{phase.name}</div>
            <h2 className="mt-1 font-display text-3xl">{phase.theme}</h2>
            <div className="mx-auto my-2 h-40 w-40"><MicrobePreview type={phase.microbeType} color={phase.microbe} /></div>
            <p className="text-center text-sm font-bold italic">{phase.microbeName}</p>
            <p className="mt-3">{phase.story}</p>
            <ul className="mt-3 grid gap-1 text-sm text-muted-foreground">
              <li>• Meta: <b>{phase.minPoints} pontos</b> para abrir a jaula</li>
              <li>• <b>{phase.lives} vidas</b> · <b>{phase.time}s</b> por pergunta · <b>{phase.guards} drones</b></li>
              <li>• Responda rápido e em sequência para ganhar bônus</li>
            </ul>
            <button className="game-btn mt-6 w-full" onClick={() => setScreen("play")}>Começar fase</button>
          </Overlay>
        )}

        {active && (
          <Overlay>
            <div className="flex items-center justify-between">
              <div className="text-xs font-bold uppercase tracking-widest text-primary">{active.kind === "colega" ? "Ajude um colega" : "Situação-problema"} · +{POINTS[active.kind]}</div>
              <div className={`font-display text-2xl ${timeLeft <= 5 ? "text-destructive" : ""}`}>{timeLeft}s</div>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
              <div className="h-full bg-primary transition-all duration-1000 ease-linear" style={{ width: `${(timeLeft / phase.time) * 100}%` }} />
            </div>
            <h2 className="mt-3 font-display text-2xl">{active.title}</h2>
            <p className="mt-2">{active.prompt}</p>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {order.map((oi, pos) => {
                const state = picked === null ? "" : oi === active.answer ? "correct" : oi === picked ? "wrong" : "dim";
                return <button key={oi} className={`game-option ${state}`} onClick={() => answer(oi)}>{String.fromCharCode(65 + pos)}) {active.options[oi]}</button>;
              })}
            </div>
            {picked !== null && (
              <>
                <p className="mt-4 rounded-xl bg-muted p-3 text-sm"><b>{picked === active.answer ? `Correto! +${gained} ` : picked === -1 ? "Tempo esgotado! " : "Errado! "}</b>{active.explain}</p>
                <button className="game-btn mt-4 w-full" onClick={closeQuiz}>Continuar</button>
              </>
            )}
          </Overlay>
        )}

        {failed && !active && screen === "play" && (
          <Overlay>
            <h2 className="font-display text-3xl">{dead ? "Sem vidas!" : "Pontos insuficientes"}</h2>
            <p className="mt-2">{dead ? "A segurança te pegou. O micróbio continua trancado." : `Não dá mais para alcançar ${phase.minPoints} pontos nesta fase.`}</p>
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
