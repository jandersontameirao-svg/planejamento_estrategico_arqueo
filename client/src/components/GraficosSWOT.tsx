import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface GraficosSWOTProps {
  forcas: string;
  fraquezas: string;
  oportunidades: string;
  ameacas: string;
}

export function GraficosSWOT({ forcas, fraquezas, oportunidades, ameacas }: GraficosSWOTProps) {
  // Calcular score (0-10) baseado no comprimento do texto
  const calcularScore = (texto: string) => {
    if (!texto) return 0;
    return Math.min(10, Math.ceil((texto.length / 50) * 10));
  };

  const data = [
    { name: "Forças", score: calcularScore(forcas), fill: "#22c55e" },
    { name: "Fraquezas", score: calcularScore(fraquezas), fill: "#ef4444" },
    { name: "Oportunidades", score: calcularScore(oportunidades), fill: "#3b82f6" },
    { name: "Ameaças", score: calcularScore(ameacas), fill: "#eab308" },
  ];

  return (
    <div className="w-full h-96">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis domain={[0, 10]} />
          <Tooltip />
          <Legend />
          <Bar dataKey="score" fill="#8884d8" name="Completude" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
