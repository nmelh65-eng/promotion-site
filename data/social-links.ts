import type { SocialLink } from "@/types";

export const socialLinks: SocialLink[] = [
  {
    id: "telegram",
    label: "Telegram",
    href: "https://t.me/nataliamelkher",
    icon: "✈️",
    isActive: true,
    sortOrder: 1,
  },
  {
    id: "email",
    label: "Email",
    href: "mailto:natalia@melkher.com",
    icon: "📧",
    isActive: true,
    sortOrder: 2,
  },
  {
    id: "youtube",
    label: "YouTube",
    href: "#",
    icon: "▶️",
    isActive: true,
    sortOrder: 3,
  },
];
