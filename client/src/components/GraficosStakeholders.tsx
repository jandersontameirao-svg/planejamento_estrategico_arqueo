import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface GraficosStakeholdersProps {
  altoPoder: string;
  altoInteresse: string;
  baixoPoder: string;
  baixoInteresse: string;
}

export function GraficosStakeholders({ altoPoder, altoInteresse, baixoPoder, baixoInteresse }: GraficosStakeholdersProps) {
  const data = [
    { x: 8, y: 8, name: "Alto Poder / Alto Interesse", quadrante: "Gerenciar Ativamente", fill: "#ef4444" },
    { x: 8, y: 3, name: "Alto Poder / Baixo Interesse", quadrante: "Manter Satisfeito", fill: "#eab308" },
    { x: 3, y: 8, name: "Baixo Poder / Alto Interesse", quadrante: "Manter Informado", fill: "#eab308" },
    { x: 3, y: 3, name: "Baixo Poder / Baixo Interesse", quadrante: "Monitorar", fill: "#22c55e" },
  ];

  return (
    <div className="w-full h-96">
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="x" name="Poder" domain={[0, 10]} label={{ value: "Poder", position: "insideBottomRight", offset: -5 }} />
          <YAxis dataKey="y" name="Interesse" domain={[0, 10]} label={{ value: "Interesse", angle: -90, position: "insideLeft" }} />
          <Tooltip cursor={{ strokeDasharray: "3 3" }} />
          <Scatter name="Stakeholders" data={data} fill="#8884d8" />
          <Legend />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
}
