import type { ReactNode } from "react";

interface SectionHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}

export default function SectionHeader({
  eyebrow = "Section",
  title,
  description,
  action,
}: SectionHeaderProps) {
  return (
    <div className="mb-5 flex items-end justify-between gap-4">
      <div className="min-w-0">
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

      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
