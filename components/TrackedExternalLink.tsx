"use client";

import React from "react";
import type { AnalyticsTargetType } from "@/types";

interface TrackedExternalLinkProps {
  href: string;
  targetType: AnalyticsTargetType;
  targetId: string;
  className?: string;
  children: React.ReactNode;
}

export default function TrackedExternalLink({
  href,
  targetType,
  targetId,
  className,
  children,
}: TrackedExternalLinkProps) {
  function handleClick() {
    void fetch("/api/analytics/click", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      keepalive: true,
      body: JSON.stringify({
        targetType,
        targetId,
        href,
      }),
    }).catch((error) => {
      console.error("Click tracking error:", error);
    });
  }

  const isExternal = /^https?:\/\//i.test(href);

  return (
    <a
      href={href}
      onClick={handleClick}
      className={className}
      target={isExternal ? "_blank" : undefined}
      rel={isExternal ? "noopener noreferrer" : undefined}
    >
      {children}
    </a>
  );
}
