import Link from "next/link";
import type { ReactNode } from "react";

export default function EmptyState({
  title,
  text,
  link,
}: {
  title: string;
  text?: ReactNode;
  link?: { href: string; label: string };
}) {
  return (
    <div className="border-b border-line py-14 md:py-16">
      <p className="display text-[clamp(1.4rem,2.6vw,2rem)] text-ink">{title}</p>
      {text && <p className="mt-4 max-w-xl leading-relaxed text-mute">{text}</p>}
      {link && (
        <Link href={link.href} className="link-underline mt-6 inline-block text-sm font-bold text-ink">
          {link.label} →
        </Link>
      )}
    </div>
  );
}
