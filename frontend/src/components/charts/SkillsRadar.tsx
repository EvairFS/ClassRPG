import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
} from "recharts";

export function SkillsRadar({ data }: { data: { skill: string; value: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <RadarChart data={data} cx="50%" cy="50%" outerRadius="75%">
        <PolarGrid stroke="oklch(1 0 0 / 0.08)" />
        <PolarAngleAxis dataKey="skill" tick={{ fill: "oklch(0.8 0.02 250)", fontSize: 11 }} />
        <PolarRadiusAxis tick={false} axisLine={false} />
        <Radar
          dataKey="value"
          stroke="oklch(0.72 0.22 296)"
          fill="oklch(0.62 0.22 296)"
          fillOpacity={0.35}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}
