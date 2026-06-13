"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  BarChart,
  Bar,
} from "recharts";

interface EquityPoint {
  date: string;
  equity: number | null;
  benchmark: number | null;
}

function fmtMoney(v: number) {
  return `¥${Math.round(v).toLocaleString("en-US")}`;
}

export function EquityChart({ data }: { data: EquityPoint[] }) {
  return (
    <ResponsiveContainer>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
        <XAxis dataKey="date" stroke="#8b96a8" minTickGap={40} />
        <YAxis stroke="#8b96a8" domain={["auto", "auto"]} tickFormatter={(v) => `${(v / 1e4).toFixed(0)}万`} />
        <Tooltip
          contentStyle={{ background: "#131a26", border: "1px solid #1f2937" }}
          formatter={(v: number) => (v ? fmtMoney(v) : "—")}
        />
        <Line type="monotone" dataKey="equity" stroke="#7cf0a0" dot={false} strokeWidth={2} name="策略" />
        <Line type="monotone" dataKey="benchmark" stroke="#f2b84b" dot={false} strokeWidth={2} name="沪深300" />
      </LineChart>
    </ResponsiveContainer>
  );
}

interface ThemePoint {
  theme: string;
  returnPct: number;
  realizedPct: number;
  unrealizedPct: number;
  avgWeightPct: number;
}

export function ThemeChart({ data }: { data: ThemePoint[] }) {
  return (
    <ResponsiveContainer>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
        <XAxis dataKey="theme" stroke="#8b96a8" angle={-25} textAnchor="end" height={80} />
        <YAxis stroke="#8b96a8" />
        <Tooltip contentStyle={{ background: "#131a26", border: "1px solid #1f2937" }} />
        <Bar dataKey="realizedPct" stackId="a" fill="#7cf0a0" name="已实现收益贡献 (%)" radius={[4, 4, 0, 0]} />
        <Bar dataKey="unrealizedPct" stackId="a" fill="#63a1ff" name="浮盈/浮亏贡献 (%)" radius={[4, 4, 0, 0]} />
        <Bar dataKey="avgWeightPct" fill="#f2b84b" name="平均仓位权重 (%)" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
