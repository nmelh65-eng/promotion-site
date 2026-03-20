export default function AboutPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 pb-16">
      <section className="glass rounded-[32px] border border-white/10 p-8 sm:p-12">
        <p className="mb-3 text-sm uppercase tracking-[0.24em] text-purple-200/70">
          About
        </p>
        <h1 className="mb-5 text-4xl font-bold text-white sm:text-6xl">
          Об авторе
        </h1>
        <p className="max-w-3xl text-base leading-8 text-gray-300 sm:text-lg">
          Это стартовая страница «Обо мне» для сайта продвижения. Здесь будет
          размещаться портрет, позиционирование автора, философия, важные факты,
          ссылки на платформы и материалы.
        </p>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { value: "50+", label: "Публикаций" },
            { value: "20+", label: "Материалов" },
            { value: "6", label: "Языков" },
            { value: "∞", label: "Идей" },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-center"
            >
              <div className="text-3xl font-bold gradient-text">
                {item.value}
              </div>
              <div className="mt-2 text-sm text-gray-400">{item.label}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
