"use client";

import type { AnchorHTMLAttributes, MouseEvent } from "react";

type LinkTargetType = "social" | "platform" | "referral";

interface TrackedLinkCardProps
  extends AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  targetType: LinkTargetType;
  targetId: string;
}

function isExternalLink(href: string): boolean {
  return /^https?:\/\//i.test(href);
}

export default function TrackedLinkCard({
  href,
  targetType,
  targetId,
  onClick,
  target,
  rel,
  children,
  ...rest
}: TrackedLinkCardProps) {
  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    onClick?.(event);

    const payload = JSON.stringify({
      targetType,
      targetId,
    });

    try {
      if (typeof navigator !== "undefined" && "sendBeacon" in navigator) {
        const blob = new Blob([payload], {
          type: "application/json",
        });

        navigator.sendBeacon("/api/analytics/click", blob);
      } else {
        void fetch("/api/analytics/click", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: payload,
          keepalive: true,
        });
      }
    } catch (error) {
      console.error("Analytics click track error:", error);
    }
  }

  const external = isExternalLink(href);

  return (
    <a
      {...rest}
      href={href}
      onClick={handleClick}
      target={target ?? (external ? "_blank" : undefined)}
      rel={rel ?? (external ? "noopener noreferrer" : undefined)}
    >
      {children}
    </a>
  );
}
