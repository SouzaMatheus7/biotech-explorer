export type Kind = "problema" | "colega";
export interface Challenge {
  id: string;
  kind: Kind;
  title: string;
  prompt: string;
  options: string[];
  answer: number;
  explain: string;
  pos: [number, number];
}
export interface Phase {
  name: string;
  theme: string;
  story: string;
  minPoints: number;
  ground: string;
  accent: string;
  sky: string;
  microbe: string;
  challenges: Challenge[];
}

export const POINTS: Record<Kind, number> = { problema: 100, colega: 60 };

export const PHASES: Phase[] = [
  {
    name: "Fase 1 · Usina Verde",
    theme: "Biotecnologia na produção de combustíveis e energia",
    story: "Roube a levedura Saccharomyces super-fermentadora da Usina Verde!",
    minPoints: 260,
    ground: "#7cc46a",
    accent: "#f5b82e",
    sky: "#bfe8ff",
    microbe: "#ffd23f",
    challenges: [
      { id: "e1", kind: "problema", title: "Tanque de fermentação", pos: [-7, -4],
        prompt: "Uma usina quer produzir etanol a partir do caldo de cana. Qual microrganismo e processo são usados?",
        options: ["Bactérias por fotossíntese", "Leveduras por fermentação alcoólica", "Fungos por respiração aeróbica", "Algas por quimiossíntese"],
        answer: 1, explain: "Leveduras (Saccharomyces cerevisiae) convertem açúcares em etanol e CO₂ na fermentação alcoólica." },
      { id: "e2", kind: "problema", title: "Biodigestor", pos: [7, -5],
        prompt: "Uma fazenda tem muito esterco. Como gerar energia com ele?",
        options: ["Queimar a céu aberto", "Biodigestão anaeróbica para gerar biogás (metano)", "Enterrar no solo", "Misturar com gasolina"],
        answer: 1, explain: "Arqueias metanogênicas decompõem matéria orgânica sem oxigênio e produzem biogás rico em metano." },
      { id: "e3", kind: "problema", title: "Etanol de 2ª geração", pos: [0, -9],
        prompt: "O que caracteriza o etanol de segunda geração (2G)?",
        options: ["É feito do petróleo", "Usa bagaço e palha (celulose) quebrados por enzimas", "Usa apenas milho", "Não usa microrganismos"],
        answer: 1, explain: "Enzimas (celulases) quebram a celulose de resíduos em açúcares que depois são fermentados." },
      { id: "e4", kind: "colega", title: "Colega Bia", pos: [-6, 5],
        prompt: "Bia: \"Não entendi... por que microalgas são estudadas para biodiesel?\" Como você explica?",
        options: ["Porque brilham no escuro", "Porque acumulam muitos óleos (lipídios) e crescem rápido", "Porque comem plástico", "Porque são feitas de metal"],
        answer: 1, explain: "Microalgas acumulam lipídios que podem virar biodiesel, sem disputar terra com alimentos." },
      { id: "e5", kind: "colega", title: "Colega Léo", pos: [6, 5],
        prompt: "Léo: \"Biocombustível é renovável por quê?\"",
        options: ["Porque nunca acaba de queimar", "Porque vem de biomassa que pode ser replantada e absorve CO₂", "Porque é importado", "Porque é mais caro"],
        answer: 1, explain: "A biomassa cresce de novo e captura CO₂ da atmosfera, fechando parcialmente o ciclo do carbono." },
    ],
  },
  {
    name: "Fase 2 · Rio Limpo",
    theme: "Biotecnologia aplicada ao meio ambiente",
    story: "Roube a bactéria Pseudomonas devoradora de petróleo do laboratório do Rio Limpo!",
    minPoints: 280,
    ground: "#5fb7a8",
    accent: "#3a86ff",
    sky: "#d4f1ec",
    microbe: "#9b5de5",
    challenges: [
      { id: "m1", kind: "problema", title: "Derramamento de óleo", pos: [-8, -3],
        prompt: "Um navio derramou petróleo no mar. Qual técnica biotecnológica ajuda a limpar?",
        options: ["Biorremediação com bactérias que degradam hidrocarbonetos", "Jogar sal", "Esperar congelar", "Adicionar mais óleo"],
        answer: 0, explain: "Biorremediação usa microrganismos que 'comem' poluentes, transformando-os em substâncias menos tóxicas." },
      { id: "m2", kind: "problema", title: "Estação de esgoto", pos: [8, -3],
        prompt: "Na estação de tratamento, o que faz o 'lodo ativado'?",
        options: ["Colore a água", "Microrganismos decompõem a matéria orgânica do esgoto", "Aquece a água", "Filtra só areia"],
        answer: 1, explain: "Bactérias aeróbicas no lodo ativado consomem a matéria orgânica, limpando o esgoto." },
      { id: "m3", kind: "problema", title: "Solo contaminado", pos: [0, -9],
        prompt: "Plantas que absorvem metais pesados do solo são usadas em qual técnica?",
        options: ["Fitorremediação", "Clonagem", "Pasteurização", "Destilação"],
        answer: 0, explain: "Na fitorremediação, plantas retiram, acumulam ou degradam contaminantes do solo e da água." },
      { id: "m4", kind: "colega", title: "Colega Davi", pos: [-6, 6],
        prompt: "Davi: \"O que é um plástico biodegradável?\"",
        options: ["Um plástico que nunca se decompõe", "Um plástico que microrganismos conseguem decompor, como o PHA", "Um plástico invisível", "Um plástico de metal"],
        answer: 1, explain: "Bioplásticos como o PHA são produzidos por bactérias e podem ser degradados por microrganismos." },
      { id: "m5", kind: "colega", title: "Colega Nina", pos: [6, 6],
        prompt: "Nina: \"Compostagem tem a ver com biotecnologia?\"",
        options: ["Não, é só lixo", "Sim, microrganismos transformam resíduos orgânicos em adubo", "Só se usar plástico", "Só em fábricas"],
        answer: 1, explain: "Na compostagem, fungos e bactérias decompõem restos orgânicos e produzem húmus." },
    ],
  },
  {
    name: "Fase 3 · BioFábrica (Final)",
    theme: "Biotecnologia na indústria",
    story: "Fase final! Roube a E. coli recombinante produtora de insulina da BioFábrica!",
    minPoints: 300,
    ground: "#b8a3e0",
    accent: "#ff6b6b",
    sky: "#ffe5d9",
    microbe: "#06d6a0",
    challenges: [
      { id: "i1", kind: "problema", title: "Fábrica de insulina", pos: [-8, -3],
        prompt: "Como a insulina humana é produzida industrialmente hoje?",
        options: ["Extraída só de porcos", "Por bactérias geneticamente modificadas com o gene humano", "Sintetizada com petróleo", "Colhida de plantas"],
        answer: 1, explain: "Com DNA recombinante, o gene da insulina humana é inserido em bactérias ou leveduras que a produzem." },
      { id: "i2", kind: "problema", title: "Lavanderia industrial", pos: [8, -3],
        prompt: "Por que sabões em pó modernos têm enzimas?",
        options: ["Para dar cheiro", "Enzimas (proteases, lipases) quebram manchas mesmo em água fria", "Para dar cor", "Para fazer espuma"],
        answer: 1, explain: "Enzimas produzidas por microrganismos degradam proteínas e gorduras, economizando energia." },
      { id: "i3", kind: "problema", title: "Laticínio", pos: [0, -9],
        prompt: "Qual processo transforma leite em iogurte?",
        options: ["Fermentação lática por bactérias", "Fervura por horas", "Congelamento", "Adição de álcool"],
        answer: 0, explain: "Lactobacilos convertem lactose em ácido lático, coagulando o leite." },
      { id: "i4", kind: "colega", title: "Colega Caio", pos: [-6, 6],
        prompt: "Caio: \"O que é um biorreator?\"",
        options: ["Um reator nuclear", "Um tanque com condições controladas para cultivar células ou microrganismos", "Uma geladeira", "Um tipo de vírus"],
        answer: 1, explain: "Biorreatores controlam temperatura, pH e oxigênio para microrganismos produzirem em grande escala." },
      { id: "i5", kind: "colega", title: "Colega Lara", pos: [6, 6],
        prompt: "Lara: \"Antibióticos como a penicilina vêm de onde?\"",
        options: ["De rochas", "De fungos (Penicillium) cultivados industrialmente", "Do petróleo", "Da água do mar"],
        answer: 1, explain: "A penicilina é produzida pelo fungo Penicillium em grandes fermentadores." },
    ],
  },
];

export const COLORS = ["#c51111", "#132ed2", "#11802d", "#ee54bb", "#f07d0d", "#f6f657", "#3f474e", "#d6e0f0", "#6b2fbc", "#71491e", "#38fedb", "#50ef39"];
export const HATS = ["nenhum", "folha", "coroa", "capacete", "frasco"] as const;
export type Hat = (typeof HATS)[number];
export interface Look { color: string; hat: Hat; name: string }
