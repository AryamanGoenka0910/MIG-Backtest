"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

interface DataPoint {
  day: number;
  value: number;
}

interface PerformanceChartProps {
  data: DataPoint[];
  teamName?: string;
  height?: number;
  startingCash?: number;
}

function CustomTooltip({ active, payload, label }: {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: number;
}) {
  if (!active || !payload || !payload.length) return null;
  const value = payload[0].value;
  const color = value >= 25000 ? "#10b981" : "#f43f5e";
  return (
    <div className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs shadow-xl">
      <p className="text-slate-400 mb-1">Day {label}</p>
      <p style={{ color }} className="font-mono font-semibold">
        ${value >= 1000 ? `${(value / 1000).toFixed(2)}k` : value.toFixed(0)}
      </p>
      <p className={`font-mono text-[10px] ${value >= 25000 ? "text-emerald-500" : "text-rose-500"}`}>
        {value >= 25000 ? "+" : ""}${((value - 25000) / 1000).toFixed(2)}k
      </p>
    </div>
  );
}

export default function PerformanceChart({
  data,
  teamName,
  height = 300,
  startingCash = 25000,
}: PerformanceChartProps) {
  const lastValue = data[data.length - 1]?.value ?? startingCash;
  const isPositive = lastValue >= startingCash;
  const lineColor = isPositive ? "#10b981" : "#f43f5e";

  return (
    <div>
      {teamName && (
        <div className="flex items-center justify-between mb-4">
          <p className="text-slate-400 text-sm">{teamName} · Portfolio Value</p>
          <span className={`mono-nums font-semibold text-sm ${isPositive ? "text-emerald-400" : "text-rose-400"}`}>
            ${(lastValue / 1000).toFixed(2)}k
          </span>
        </div>
      )}
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
          <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="day"
            tick={{ fill: "#475569", fontSize: 11, fontFamily: "var(--font-geist-mono, monospace)" }}
            tickLine={false}
            axisLine={false}
            label={{ value: "Trading Day", position: "insideBottom", offset: -2, fill: "#334155", fontSize: 11 }}
          />
          <YAxis
            tick={{ fill: "#475569", fontSize: 11, fontFamily: "var(--font-geist-mono, monospace)" }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
            width={52}
          />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine
            y={startingCash}
            stroke="#334155"
            strokeDasharray="4 4"
            label={{ value: "Start", fill: "#475569", fontSize: 10, position: "insideTopRight" }}
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke={lineColor}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: lineColor, stroke: "#0f172a", strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
