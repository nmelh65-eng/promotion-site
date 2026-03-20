import { socialLinks } from "@/data/social-links";

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 pb-16">
      <section className="glass rounded-[32px] border border-white/10 p-8 sm:p-12">
        <p className="mb-3 text-sm uppercase tracking-[0.24em] text-purple-200/70">
          Contact
        </p>
        <h1 className="mb-5 text-4xl font-bold text-white sm:text-6xl">
          Контакты
        </h1>
        <p className="mb-8 max-w-2xl text-base leading-8 text-gray-300 sm:text-lg">
          Здесь можно разместить e-mail, Telegram, социальные платформы и любые
          каналы связи для продвижения и контакта с аудиторией.
        </p>

        <div className="grid gap-3">
          {socialLinks
            .filter((item) => item.isActive)
            .sort((a, b) => a.sortOrder - b.sortOrder)
            .map((item) => (
              <a
                key={item.id}
                href={item.href}
                className="rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-4 text-gray-200 hover:text-white"
                target={item.href.startsWith("http") ? "_blank" : undefined}
                rel={
                  item.href.startsWith("http")
                    ? "noopener noreferrer"
                    : undefined
                }
              >
                {item.icon ? `${item.icon} ` : ""}
                {item.label}
              </a>
            ))}
        </div>
      </section>
    </div>
  );
}
