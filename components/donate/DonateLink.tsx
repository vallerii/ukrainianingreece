"use client";

import type { ReactNode } from "react";
import { openDonate } from "./DonateDialog";

/**
 * Кнопка/посилання «Донат»: відкриває попап.
 * Залишається звичайним посиланням на /pidtrymaty — для відкриття в новій вкладці та без JS.
 */
export default function DonateLink({
  className,
  children,
  onClick,
}: {
  className?: string;
  children: ReactNode;
  onClick?: () => void;
}) {
  return (
    <a
      href="/pidtrymaty"
      className={className}
      onClick={(e) => {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
        e.preventDefault();
        onClick?.();
        openDonate();
      }}
    >
      {children}
    </a>
  );
}
