import {
  CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";

export function GrowthChart({ data }: { data: { month: string; schools: number; students: number; teachers: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={data} margin={{ top: 10, right: 12, left: -10, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="oklch(1 0 0 / 0.06)" />
        <XAxis dataKey="month" stroke="oklch(0.7 0.025 250)" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis stroke="oklch(0.7 0.025 250)" fontSize={12} tickLine={false} axisLine={false} />
        <Tooltip contentStyle={{ background: "oklch(0.25 0.04 260)", border: "1px solid oklch(1 0 0 / 0.1)", borderRadius: 12, color: "white", fontSize: 12 }} />
        <Legend wrapperStyle={{ fontSize: 12, color: "oklch(0.8 0.02 250)" }} />
        <Line type="monotone" dataKey="students" name="Alunos" stroke="oklch(0.62 0.22 296)" strokeWidth={2.5} dot={false} />
        <Line type="monotone" dataKey="teachers" name="Professores" stroke="oklch(0.73 0.13 215)" strokeWidth={2.5} dot={false} />
        <Line type="monotone" dataKey="schools" name="Escolas" stroke="oklch(0.85 0.165 88)" strokeWidth={2.5} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}