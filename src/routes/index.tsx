import { createFileRoute } from "@tanstack/react-router";
import { GameApp } from "../game/GameApp";

export const Route = createFileRoute("/")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Roube um Micróbio — Jogo 3D de Biotecnologia" },
      { name: "description", content: "Jogo 3D educativo: personalize seu tripulante e roube micróbios respondendo desafios de biotecnologia." },
      { property: "og:title", content: "Roube um Micróbio — Jogo 3D de Biotecnologia" },
      { property: "og:description", content: "Personalize seu tripulante e vença as fases de biotecnologia." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: GameApp,
});
