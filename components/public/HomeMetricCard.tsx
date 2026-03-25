interface HomeMetricCardProps {
  label: string;
  value: string | number;
  description?: string;
  accent?: "purple" | "amber" | "emerald";
}

function accentClass(accent: "purple" | "amber" | "emerald") {
  if (accent === "amber") {
    return "border-amber-400/20 bg-amber-500/10 text-amber-200";
  }

  if (accent === "emerald") {
    return "border-emerald-400/20 bg-emerald-500/10 text-emerald-200";
  }

  return "border-purple-400/20 bg-purple-500/10 text-purple-200";
}

export default function HomeMetricCard({
  label,
  value,
  description,
  accent = "purple",
}: HomeMetricCardProps) {
  return (
    <div className="rounded-[28px] border border-white/10 bg-white/[0.03] p-5">
      <div
        className={
          "inline-flex rounded-full border px-3 py-1 text-[10px] uppercase tracking-[0.18em] " +
          accentClass(accent)
        }
      >
        {label}
      </div>

      <div className="mt-4 text-3xl font-bold text-white">{value}</div>

      {description ? (
        <div className="mt-2 text-sm text-gray-400">{description}</div>
      ) : null}
    </div>
  );
}
