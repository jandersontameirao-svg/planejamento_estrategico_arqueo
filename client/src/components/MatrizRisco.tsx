import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface ItemRisco {
  id: number;
  nome: string;
  tipo: "objetivo" | "projeto";
  impacto: "baixo" | "medio" | "alto";
  probabilidade: "baixa" | "media" | "alta";
}

interface MatrizRiscoProps {
  objetivos: any[];
  projetos: any[];
}

export function MatrizRisco({ objetivos, projetos }: MatrizRiscoProps) {
  // Converter valores textuais para numéricos
  const impactoMap = { baixo: 1, medio: 2, alto: 3 };
  const probabilidadeMap = { baixa: 1, media: 2, alta: 3 };

  // Preparar dados
  const items: ItemRisco[] = [
    ...(objetivos || []).map((obj: any) => ({
      id: obj.id,
      nome: obj.titulo,
      tipo: "objetivo" as const,
      impacto: obj.impacto || "medio",
      probabilidade: obj.probabilidade || "media",
    })),
    ...(projetos || []).map((proj: any) => ({
      id: proj.id,
      nome: proj.nome,
      tipo: "projeto" as const,
      impacto: proj.impacto || "medio",
      probabilidade: proj.probabilidade || "media",
    })),
  ];

  // Calcular nível de risco (1-9)
  const calcularNivelRisco = (impacto: string, probabilidade: string) => {
    const imp = impactoMap[impacto as keyof typeof impactoMap] || 2;
    const prob = probabilidadeMap[probabilidade as keyof typeof probabilidadeMap] || 2;
    return imp * prob;
  };

  // Determinar cor baseada no nível de risco
  const getCorRisco = (nivelRisco: number) => {
    if (nivelRisco <= 2) return "#22c55e"; // Verde (baixo)
    if (nivelRisco <= 4) return "#eab308"; // Amarelo (médio)
    if (nivelRisco <= 6) return "#f97316"; // Laranja (alto)
    return "#ef4444"; // Vermelho (crítico)
  };

  // Determinar label do quadrante
  const getLabelQuadrante = (nivelRisco: number) => {
    if (nivelRisco <= 2) return "Risco Baixo";
    if (nivelRisco <= 4) return "Risco Médio";
    if (nivelRisco <= 6) return "Risco Alto";
    return "Risco Crítico";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Matriz de Risco</CardTitle>
        <CardDescription>
          Análise de Impacto vs Probabilidade dos Objetivos e Projetos Estratégicos
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="relative w-full" style={{ height: "500px" }}>
          {/* SVG da Matriz */}
          <svg width="100%" height="100%" viewBox="0 0 400 400" className="border rounded-lg bg-muted/10">
            {/* Grid de fundo */}
            <defs>
              <pattern id="grid" width="133.33" height="133.33" patternUnits="userSpaceOnUse">
                <path d="M 133.33 0 L 0 0 0 133.33" fill="none" stroke="gray" strokeWidth="0.5" opacity="0.2" />
              </pattern>
            </defs>
            <rect width="400" height="400" fill="url(#grid)" />

            {/* Quadrantes coloridos */}
            {/* Baixo-Baixa (verde) */}
            <rect x="0" y="266.67" width="133.33" height="133.33" fill="#22c55e" opacity="0.1" />
            {/* Baixo-Média, Médio-Baixa (amarelo) */}
            <rect x="0" y="133.33" width="133.33" height="133.33" fill="#eab308" opacity="0.1" />
            <rect x="133.33" y="266.67" width="133.33" height="133.33" fill="#eab308" opacity="0.1" />
            {/* Baixo-Alta, Médio-Média, Alto-Baixa (laranja) */}
            <rect x="0" y="0" width="133.33" height="133.33" fill="#f97316" opacity="0.1" />
            <rect x="133.33" y="133.33" width="133.33" height="133.33" fill="#f97316" opacity="0.1" />
            <rect x="266.67" y="266.67" width="133.33" height="133.33" fill="#f97316" opacity="0.1" />
            {/* Médio-Alta, Alto-Média, Alto-Alta (vermelho) */}
            <rect x="133.33" y="0" width="133.33" height="133.33" fill="#ef4444" opacity="0.15" />
            <rect x="266.67" y="133.33" width="133.33" height="133.33" fill="#ef4444" opacity="0.15" />
            <rect x="266.67" y="0" width="133.33" height="133.33" fill="#ef4444" opacity="0.2" />

            {/* Eixos */}
            <line x1="0" y1="400" x2="400" y2="400" stroke="black" strokeWidth="2" />
            <line x1="0" y1="0" x2="0" y2="400" stroke="black" strokeWidth="2" />

            {/* Labels dos eixos */}
            <text x="200" y="395" textAnchor="middle" fontSize="12" fontWeight="bold">
              Impacto →
            </text>
            <text x="5" y="200" textAnchor="start" fontSize="12" fontWeight="bold" transform="rotate(-90 5 200)">
              Probabilidade →
            </text>

            {/* Marcações do eixo X (Impacto) */}
            <text x="66.67" y="395" textAnchor="middle" fontSize="10" fill="gray">
              Baixo
            </text>
            <text x="200" y="395" textAnchor="middle" fontSize="10" fill="gray">
              Médio
            </text>
            <text x="333.33" y="395" textAnchor="middle" fontSize="10" fill="gray">
              Alto
            </text>

            {/* Marcações do eixo Y (Probabilidade) */}
            <text x="5" y="333.33" textAnchor="start" fontSize="10" fill="gray" transform="rotate(-90 5 333.33)">
              Baixa
            </text>
            <text x="5" y="200" textAnchor="start" fontSize="10" fill="gray" transform="rotate(-90 5 200)">
              Média
            </text>
            <text x="5" y="66.67" textAnchor="start" fontSize="10" fill="gray" transform="rotate(-90 5 66.67)">
              Alta
            </text>

            {/* Plotar pontos */}
            {items.map((item) => {
              const impactoNum = impactoMap[item.impacto];
              const probabilidadeNum = probabilidadeMap[item.probabilidade];
              
              // Converter para coordenadas (com pequeno offset aleatório para evitar sobreposição)
              const x = (impactoNum - 0.5) * 133.33 + (Math.random() - 0.5) * 30;
              const y = 400 - ((probabilidadeNum - 0.5) * 133.33) + (Math.random() - 0.5) * 30;
              
              const nivelRisco = calcularNivelRisco(item.impacto, item.probabilidade);
              const cor = getCorRisco(nivelRisco);

              return (
                <g key={`${item.tipo}-${item.id}`}>
                  <circle
                    cx={x}
                    cy={y}
                    r="8"
                    fill={cor}
                    stroke="white"
                    strokeWidth="2"
                    opacity="0.9"
                    className="cursor-pointer hover:opacity-100 transition-opacity"
                  >
                    <title>{`${item.tipo === "objetivo" ? "Objetivo" : "Projeto"}: ${item.nome}\nImpacto: ${item.impacto}\nProbabilidade: ${item.probabilidade}\n${getLabelQuadrante(nivelRisco)}`}</title>
                  </circle>
                  {/* Ícone indicando tipo */}
                  <text
                    x={x}
                    y={y + 3}
                    textAnchor="middle"
                    fontSize="10"
                    fill="white"
                    fontWeight="bold"
                    pointerEvents="none"
                  >
                    {item.tipo === "objetivo" ? "O" : "P"}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Legenda */}
          <div className="mt-4 flex flex-wrap gap-4 justify-center">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full" style={{ backgroundColor: "#22c55e" }}></div>
              <span className="text-sm">Risco Baixo (1-2)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full" style={{ backgroundColor: "#eab308" }}></div>
              <span className="text-sm">Risco Médio (3-4)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full" style={{ backgroundColor: "#f97316" }}></div>
              <span className="text-sm">Risco Alto (5-6)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full" style={{ backgroundColor: "#ef4444" }}></div>
              <span className="text-sm">Risco Crítico (7-9)</span>
            </div>
          </div>

          <div className="mt-2 flex gap-4 justify-center text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 rounded-full bg-gray-400 flex items-center justify-center text-white font-bold text-[8px]">O</div>
              <span>Objetivo</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 rounded-full bg-gray-400 flex items-center justify-center text-white font-bold text-[8px]">P</div>
              <span>Projeto</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
