interface SparklineChartProps {
  data: number[];
  width?: number;
  height?: number;
  color?: "emerald" | "rose" | "sky" | "auto";
}

const colorMap = {
  emerald: { stroke: "#10b981", fill: "rgba(16,185,129,0.08)" },
  rose:    { stroke: "#f43f5e", fill: "rgba(244,63,94,0.08)" },
  sky:     { stroke: "#38bdf8", fill: "rgba(56,189,248,0.08)" },
};

function buildSmoothPath(points: [number, number][]): string {
  if (points.length < 2) return "";
  let d = `M ${points[0][0]},${points[0][1]}`;
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    const cpX = (prev[0] + curr[0]) / 2;
    d += ` C ${cpX},${prev[1]} ${cpX},${curr[1]} ${curr[0]},${curr[1]}`;
  }
  return d;
}

export default function SparklineChart({
  data,
  width = 80,
  height = 32,
  color = "auto",
}: SparklineChartProps) {
  if (!data || data.length < 2) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const padding = 2;

  const points: [number, number][] = data.map((v, i) => [
    (i / (data.length - 1)) * width,
    height - padding - ((v - min) / range) * (height - padding * 2),
  ]);

  const resolvedColor =
    color === "auto"
      ? data[data.length - 1] >= data[0]
        ? "emerald"
        : "rose"
      : color;

  const { stroke, fill } = colorMap[resolvedColor];
  const linePath = buildSmoothPath(points);
  const areaPath = `${linePath} L ${width},${height} L 0,${height} Z`;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path d={areaPath} fill={fill} />
      <path d={linePath} fill="none" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
