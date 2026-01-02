import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface Graficos5ForcasProps {
  rivalidade: string;
  fornecedores: string;
  clientes: string;
  novosEntrantes: string;
  substitutos: string;
}

export function Graficos5Forcas({ rivalidade, fornecedores, clientes, novosEntrantes, substitutos }: Graficos5ForcasProps) {
  // Calcular intensidade (0-10) baseado no comprimento do texto
  const calcularIntensidade = (texto: string) => {
    if (!texto) return 0;
    return Math.min(10, Math.ceil((texto.length / 50) * 10));
  };

  const data = [
    { name: "Rivalidade", intensidade: calcularIntensidade(rivalidade) },
    { name: "Fornecedores", intensidade: calcularIntensidade(fornecedores) },
    { name: "Clientes", intensidade: calcularIntensidade(clientes) },
    { name: "Novos Entrantes", intensidade: calcularIntensidade(novosEntrantes) },
    { name: "Substitutos", intensidade: calcularIntensidade(substitutos) },
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
          <Bar dataKey="intensidade" fill="#3b82f6" name="Intensidade da Força" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
