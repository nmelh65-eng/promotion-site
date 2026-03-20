import { getWorksByCategory } from "@/lib/works-store";
import ProseCard from "@/components/ProseCard";

export default function ProsePage() {
  const prose = getWorksByCategory("prose");

  return (
    <div className="mx-auto max-w-6xl px-4 pb-16">
      <section className="mb-8">
        <p className="mb-3 text-sm uppercase tracking-[0.24em] text-amber-200/70">
          Prose
        </p>
        <h1 className="text-4xl font-bold text-white sm:text-6xl">Проза</h1>
      </section>

      <div className="grid gap-5">
        {prose.map((work) => (
          <ProseCard key={work.id} work={work} />
        ))}
      </div>
    </div>
  );
}
