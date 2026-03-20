import Link from "next/link";
import { socialLinks } from "@/data/social-links";

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-[#0a0b12]">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <h3 className="mb-3 text-xl font-semibold text-white">
              Natalia Melkher
            </h3>
            <p className="text-sm leading-7 text-gray-400">
              Авторский сайт продвижения публикаций, ссылок, платформ и
              литературного контента.
            </p>
          </div>

          <div>
            <h4 className="mb-3 text-sm uppercase tracking-[0.2em] text-gray-500">
              Навигация
            </h4>
            <div className="grid gap-2 text-sm">
              <Link href="/poetry" className="text-gray-300 hover:text-white">
                Поэзия
              </Link>
              <Link href="/prose" className="text-gray-300 hover:text-white">
                Проза
              </Link>
              <Link href="/links" className="text-gray-300 hover:text-white">
                Ссылки
              </Link>
              <Link href="/about" className="text-gray-300 hover:text-white">
                Обо мне
              </Link>
            </div>
          </div>

          <div>
            <h4 className="mb-3 text-sm uppercase tracking-[0.2em] text-gray-500">
              Контакты
            </h4>
            <div className="grid gap-2 text-sm">
              {socialLinks
                .filter((item) => item.isActive)
                .sort((a, b) => a.sortOrder - b.sortOrder)
                .map((item) => (
                  <a
                    key={item.id}
                    href={item.href}
                    className="text-gray-300 hover:text-white"
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
          </div>
        </div>

        <div className="mt-8 border-t border-white/10 pt-4 text-xs text-gray-500">
          © 2026 Natalia Melkher. Все права защищены.
        </div>
      </div>
    </footer>
  );
}
