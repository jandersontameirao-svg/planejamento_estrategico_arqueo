import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend, Tooltip, ResponsiveContainer } from "recharts";

interface GraficosPestelProps {
  politico: string;
  economico: string;
  social: string;
  tecnologico: string;
  ecologico: string;
  legal: string;
}

export function GraficosPestel({ politico, economico, social, tecnologico, ecologico, legal }: GraficosPestelProps) {
  // Calcular score (0-10) baseado no comprimento do texto
  const calcularScore = (texto: string) => {
    if (!texto) return 0;
    return Math.min(10, Math.ceil((texto.length / 50) * 10));
  };

  const data = [
    { name: "Político", value: calcularScore(politico) },
    { name: "Econômico", value: calcularScore(economico) },
    { name: "Social", value: calcularScore(social) },
    { name: "Tecnológico", value: calcularScore(tecnologico) },
    { name: "Ecológico", value: calcularScore(ecologico) },
    { name: "Legal", value: calcularScore(legal) },
  ];

  return (
    <div className="w-full h-96">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data}>
          <PolarGrid stroke="#e0e0e0" />
          <PolarAngleAxis dataKey="name" />
          <PolarRadiusAxis angle={90} domain={[0, 10]} />
          <Radar name="Intensidade" dataKey="value" stroke="#f97316" fill="#f97316" fillOpacity={0.6} />
          <Tooltip />
          <Legend />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
