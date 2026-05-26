import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export function ProgressChart({ data }: { data: { day: string; xp: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={data} margin={{ top: 10, right: 8, left: -16, bottom: 0 }}>
        <defs>
          <linearGradient id="xpGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="oklch(0.62 0.22 296)" stopOpacity={0.55} />
            <stop offset="100%" stopColor="oklch(0.62 0.22 296)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="oklch(1 0 0 / 0.06)" />
        <XAxis
          dataKey="day"
          stroke="oklch(0.7 0.025 250)"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis stroke="oklch(0.7 0.025 250)" fontSize={12} tickLine={false} axisLine={false} />
        <Tooltip
          contentStyle={{
            background: "oklch(0.25 0.04 260)",
            border: "1px solid oklch(1 0 0 / 0.1)",
            borderRadius: 12,
            color: "white",
            fontSize: 12,
          }}
        />
        <Area
          type="monotone"
          dataKey="xp"
          stroke="oklch(0.72 0.22 296)"
          strokeWidth={2}
          fill="url(#xpGrad)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
