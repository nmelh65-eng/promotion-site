interface ProfileFeatureItem {
  title: string;
  description: string;
}

interface ProfileFeatureGridProps {
  eyebrow: string;
  title: string;
  description?: string;
  items: readonly ProfileFeatureItem[];
  accent?: "purple" | "amber" | "emerald";
}

function accentClass(accent: "purple" | "amber" | "emerald"): string {
  if (accent === "amber") {
    return "border-amber-400/20 bg-amber-500/10 text-amber-200";
  }

  if (accent === "emerald") {
    return "border-emerald-400/20 bg-emerald-500/10 text-emerald-200";
  }

  return "border-purple-400/20 bg-purple-500/10 text-purple-200";
}

export default function ProfileFeatureGrid({
  eyebrow,
  title,
  description,
  items,
  accent = "purple",
}: ProfileFeatureGridProps) {
  return (
    <section className="rounded-[32px] border border-white/10 bg-white/[0.03] p-6 sm:p-8">
      <div className="mb-5">
        <p className="mb-2 text-sm uppercase tracking-[0.24em] text-purple-200/70">
          {eyebrow}
        </p>
        <h2 className="text-3xl font-semibold text-white">{title}</h2>
        {description ? (
          <p className="mt-3 max-w-3xl text-sm leading-7 text-gray-400">
            {description}
          </p>
        ) : null}
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        {items.map((item) => (
          <div
            key={item.title}
            className="rounded-[24px] border border-white/10 bg-white/[0.03] p-5"
          >
            <div
              className={
                "inline-flex rounded-full border px-3 py-1 text-[10px] uppercase tracking-[0.18em] " +
                accentClass(accent)
              }
            >
              {item.title}
            </div>

            <p className="mt-4 text-sm leading-7 text-gray-300">
              {item.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
