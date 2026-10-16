export type Kind = "problema" | "colega";
export type MicrobeType = "levedura" | "bacilo" | "ecoli";
export interface Challenge {
  id: string;
  kind: Kind;
  title: string;
  prompt: string;
  options: string[];
  answer: number;
  explain: string;
}
export interface Phase {
  name: string;
  theme: string;
  story: string;
  minPoints: number;
  lives: number;
  time: number;
  guards: number;
  guardSpeed: number;
  ground: string;
  accent: string;
  sky: string;
  microbe: string;
  microbeType: MicrobeType;
  microbeName: string;
  challenges: Challenge[];
}

export const POINTS: Record<Kind, number> = { problema: 100, colega: 70 };
export const POSITIONS: [number, number][] = [[-9, -2], [9, -2], [-4.5, -10], [4.5, -10], [-8, 6], [8, 6]];

export const PHASES: Phase[] = [
  {
    name: "Fase 1 · Usina Verde",
    theme: "Biotecnologia na produção de combustíveis e energia",
    story: "Roube a levedura Saccharomyces super-fermentadora. Cuidado com os drones de segurança!",
    minPoints: 400, lives: 3, time: 25, guards: 2, guardSpeed: 0.45,
    ground: "#7cc46a", accent: "#f5b82e", sky: "#bfe8ff",
    microbe: "#ffd23f", microbeType: "levedura", microbeName: "Saccharomyces cerevisiae",
    challenges: [
      { id: "e1", kind: "problema", title: "Dorna de fermentação",
        prompt: "A fermentação na usina parou com muito açúcar sobrando no mosto. Qual causa é mais provável?",
        options: ["Teor alcoólico alto inibiu as leveduras", "Falta de luz solar nas dornas", "Excesso de oxigênio dissolvido", "Baixa concentração de sacarose"],
        answer: 0, explain: "O etanol em alta concentração é tóxico e inibe a própria levedura, travando a fermentação." },
      { id: "e2", kind: "problema", title: "Biodigestor",
        prompt: "Um biodigestor produz pouco metano e o pH caiu para 5. O que está acontecendo?",
        options: ["Excesso de arqueias metanogênicas", "Acúmulo de ácidos inibindo as metanogênicas", "Entrada de luz no reator", "Temperatura baixa demais para fungos"],
        answer: 1, explain: "Bactérias acidogênicas produzem ácidos mais rápido que as metanogênicas consomem; o pH cai e o metano diminui." },
      { id: "e3", kind: "problema", title: "Etanol 2G",
        prompt: "Qual etapa é essencial no etanol 2G e não existe no etanol 1G de caldo de cana?",
        options: ["Fermentação por leveduras", "Destilação do vinho", "Hidrólise da celulose em açúcares", "Moagem da cana"],
        answer: 2, explain: "No 2G a celulose do bagaço precisa ser hidrolisada (pré-tratamento + celulases) antes de fermentar." },
      { id: "e4", kind: "problema", title: "Célula a combustível",
        prompt: "Numa célula a combustível microbiana, de onde vem a corrente elétrica?",
        options: ["Da fotossíntese das bactérias", "Do calor da decomposição", "Do metano queimado no ânodo", "De elétrons liberados no metabolismo bacteriano"],
        answer: 3, explain: "Bactérias exoeletrogênicas oxidam matéria orgânica e transferem elétrons para o ânodo." },
      { id: "e5", kind: "colega", title: "Colega Bia",
        prompt: "Bia: \"Por que microalgas são promissoras para biodiesel?\"",
        options: ["Acumulam lipídios e não exigem terra fértil", "Produzem etanol direto na água", "Fixam metano da atmosfera", "Dispensam luz e nutrientes"],
        answer: 0, explain: "Microalgas acumulam muitos lipídios e crescem em tanques, sem competir com áreas agrícolas." },
      { id: "e6", kind: "colega", title: "Colega Léo",
        prompt: "Léo: \"O biogás é renovável, mas qual gás principal ele tem?\"",
        options: ["Hidrogênio", "Metano", "Etanol gasoso", "Monóxido de carbono"],
        answer: 1, explain: "O biogás tem cerca de 50–70% de metano (CH₄), além de CO₂." },
    ],
  },
  {
    name: "Fase 2 · Rio Limpo",
    theme: "Biotecnologia aplicada ao meio ambiente",
    story: "Roube a bactéria Pseudomonas devoradora de petróleo. Mais drones, menos tempo!",
    minPoints: 440, lives: 3, time: 20, guards: 3, guardSpeed: 0.6,
    ground: "#5fb7a8", accent: "#3a86ff", sky: "#d4f1ec",
    microbe: "#9b5de5", microbeType: "bacilo", microbeName: "Pseudomonas putida",
    challenges: [
      { id: "m1", kind: "problema", title: "Mancha de óleo",
        prompt: "Para acelerar a biorremediação de óleo no mar, o que se adiciona com frequência?",
        options: ["Antibióticos", "Nitrogênio e fósforo", "Cloro", "Açúcar refinado"],
        answer: 1, explain: "A bioestimulação adiciona nutrientes (N e P) que limitam o crescimento das bactérias degradadoras." },
      { id: "m2", kind: "problema", title: "Lodo ativado",
        prompt: "No tanque de lodo ativado, por que se injeta ar continuamente?",
        options: ["Para resfriar o esgoto", "Para matar os microrganismos", "Para manter as bactérias aeróbicas ativas", "Para produzir metano"],
        answer: 2, explain: "O ar fornece O₂ para as bactérias aeróbicas oxidarem a matéria orgânica." },
      { id: "m3", kind: "problema", title: "Solo com chumbo",
        prompt: "Metais pesados não são degradados. O que a fitorremediação faz com eles?",
        options: ["Transforma em outro elemento", "Destrói por fermentação", "Evapora pelas folhas", "Acumula na biomassa da planta"],
        answer: 3, explain: "Plantas hiperacumuladoras retiram o metal do solo e o armazenam; depois a biomassa é removida." },
      { id: "m4", kind: "problema", title: "Rio eutrofizado",
        prompt: "Um rio com excesso de esgoto fica sem peixes. Qual a causa principal?",
        options: ["Decomposição bacteriana consome o oxigênio", "As algas liberam veneno sempre", "A água esquenta demais", "Os peixes migram por causa da cor"],
        answer: 0, explain: "A alta DBO faz bactérias decompositoras consumirem o O₂ dissolvido, asfixiando os peixes." },
      { id: "m5", kind: "colega", title: "Colega Davi",
        prompt: "Davi: \"O PHA é um bioplástico. Quem produz ele?\"",
        options: ["Plantas de soja", "Bactérias como reserva", "Fungos do solo", "Leveduras de pão"],
        answer: 1, explain: "Bactérias acumulam PHA como reserva de energia; ele é extraído e vira plástico biodegradável." },
      { id: "m6", kind: "colega", title: "Colega Nina",
        prompt: "Nina: \"Bioaumentação e bioestimulação são iguais?\"",
        options: ["Sim, são sinônimos", "Não, bioaumentação usa plantas", "Não, bioaumentação adiciona microrganismos", "Não, bioestimulação usa vírus"],
        answer: 2, explain: "Bioaumentação adiciona microrganismos; bioestimulação estimula os que já existem no local." },
    ],
  },
  {
    name: "Fase 3 · BioFábrica (Final)",
    theme: "Biotecnologia na indústria",
    story: "Fase final! Roube a E. coli recombinante com plasmídeo de insulina. Segurança máxima!",
    minPoints: 480, lives: 2, time: 16, guards: 4, guardSpeed: 0.75,
    ground: "#b8a3e0", accent: "#ff6b6b", sky: "#ffe5d9",
    microbe: "#06d6a0", microbeType: "ecoli", microbeName: "E. coli recombinante",
    challenges: [
      { id: "i1", kind: "problema", title: "Insulina recombinante",
        prompt: "Para a bactéria produzir insulina humana, onde o gene é inserido?",
        options: ["No ribossomo", "Num plasmídeo", "Na parede celular", "No flagelo"],
        answer: 1, explain: "O gene é colocado num plasmídeo com enzimas de restrição e ligase, e o plasmídeo entra na bactéria." },
      { id: "i2", kind: "problema", title: "Biorreator travado",
        prompt: "A produção num biorreator aeróbico caiu e a espuma subiu. Qual ajuste faz sentido primeiro?",
        options: ["Desligar a agitação", "Retirar todo o oxigênio", "Adicionar mais açúcar sem parar", "Usar antiespumante e checar a aeração"],
        answer: 3, explain: "Espuma prejudica a troca de O₂; antiespumante e controle da aeração restauram o processo." },
      { id: "i3", kind: "problema", title: "Enzima no detergente",
        prompt: "Uma protease de detergente parou de funcionar em água quente. Por quê?",
        options: ["Ela foi desnaturada", "Ela se multiplicou", "Ela virou lipase", "Ela precisa de luz"],
        answer: 0, explain: "Calor excessivo altera a forma da enzima (desnaturação) e ela perde a atividade." },
      { id: "i4", kind: "problema", title: "Penicilina",
        prompt: "Na produção de penicilina, quando o fungo mais produz o antibiótico?",
        options: ["Só antes de germinar", "Na fase de crescimento rápido", "Na fase estacionária", "Somente após morrer"],
        answer: 2, explain: "A penicilina é um metabólito secundário, produzido principalmente na fase estacionária." },
      { id: "i5", kind: "colega", title: "Colega Caio",
        prompt: "Caio: \"Para que serve a enzima de restrição?\"",
        options: ["Cortar o DNA em pontos específicos", "Colar fragmentos de DNA", "Copiar RNA em DNA", "Quebrar proteínas"],
        answer: 0, explain: "Enzimas de restrição são 'tesouras' que cortam sequências específicas; a ligase é que cola." },
      { id: "i6", kind: "colega", title: "Colega Lara",
        prompt: "Lara: \"O que é fermentação em batelada alimentada?\"",
        options: ["Sem nenhum nutriente", "Com nutrientes adicionados aos poucos", "Com o produto retirado sem parar", "Com reatores abertos ao ar"],
        answer: 1, explain: "Na batelada alimentada o substrato é adicionado gradualmente, evitando inibição e aumentando o rendimento." },
    ],
  },
];

export const COLORS = ["#c51111", "#132ed2", "#11802d", "#ee54bb", "#f07d0d", "#f6f657", "#3f474e", "#d6e0f0", "#6b2fbc", "#71491e", "#38fedb", "#50ef39"];
export const HATS = ["nenhum", "folha", "coroa", "capacete", "frasco"] as const;
export type Hat = (typeof HATS)[number];
export interface Look { color: string; hat: Hat; name: string }
