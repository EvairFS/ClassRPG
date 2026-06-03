import {
  Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";

export function EngagementChart({ data }: { data: { week: string; ativos: number; entregas: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ top: 10, right: 8, left: -12, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="oklch(1 0 0 / 0.06)" />
        <XAxis dataKey="week" stroke="oklch(0.7 0.025 250)" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis stroke="oklch(0.7 0.025 250)" fontSize={12} tickLine={false} axisLine={false} />
        <Tooltip contentStyle={{ background: "oklch(0.25 0.04 260)", border: "1px solid oklch(1 0 0 / 0.1)", borderRadius: 12, color: "white", fontSize: 12 }} />
        <Legend wrapperStyle={{ fontSize: 12, color: "oklch(0.8 0.02 250)" }} />
        <Bar dataKey="ativos" name="Alunos ativos" fill="oklch(0.62 0.22 296)" radius={[6, 6, 0, 0]} />
        <Bar dataKey="entregas" name="Entregas" fill="oklch(0.73 0.13 215)" radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}