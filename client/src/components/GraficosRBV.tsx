import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface GraficosRBVProps {
  valioso: string;
  raro: string;
  inimitavel: string;
  organizado: string;
}

export function GraficosRBV({ valioso, raro, inimitavel, organizado }: GraficosRBVProps) {
  const calcularScore = (texto: string) => {
    if (!texto) return 0;
    return Math.min(10, Math.ceil((texto.length / 50) * 10));
  };

  const data = [
    { name: "Valioso", score: calcularScore(valioso) },
    { name: "Raro", score: calcularScore(raro) },
    { name: "Inimitável", score: calcularScore(inimitavel) },
    { name: "Organizado", score: calcularScore(organizado) },
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
          <Bar dataKey="score" fill="#8b5cf6" name="Desenvolvimento" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
