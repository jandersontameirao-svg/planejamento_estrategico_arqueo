import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface GraficosOKRProps {
  objetivo1: string;
  kr1_1: string;
  kr1_2: string;
  kr1_3: string;
  objetivo2: string;
  kr2_1: string;
  kr2_2: string;
  kr2_3: string;
  objetivo3: string;
  kr3_1: string;
  kr3_2: string;
  kr3_3: string;
}

export function GraficosOKR(props: GraficosOKRProps) {
  const calcularCompletude = (objetivo: string, kr1: string, kr2: string, kr3: string) => {
    const total = (objetivo.length + kr1.length + kr2.length + kr3.length) / 4;
    return Math.min(100, Math.ceil((total / 50) * 100));
  };

  const data = [
    { name: "Objetivo 1", completude: calcularCompletude(props.objetivo1, props.kr1_1, props.kr1_2, props.kr1_3) },
    { name: "Objetivo 2", completude: calcularCompletude(props.objetivo2, props.kr2_1, props.kr2_2, props.kr2_3) },
    { name: "Objetivo 3", completude: calcularCompletude(props.objetivo3, props.kr3_1, props.kr3_2, props.kr3_3) },
  ];

  return (
    <div className="w-full h-96">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis domain={[0, 100]} />
          <Tooltip />
          <Legend />
          <Bar dataKey="completude" fill="#06b6d4" name="Completude (%)" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
