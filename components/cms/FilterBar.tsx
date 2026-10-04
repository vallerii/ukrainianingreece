import Link from "next/link";

export type FilterOption = { label: string; href: string; active: boolean; count?: number };

/** Фільтр-рядок без «пігулок»: текстові посилання, активне — з лінією знизу. */
export default function FilterBar({ label, options }: { label: string; options: FilterOption[] }) {
  return (
    <nav
      aria-label={label}
      className="sticky top-[4.6rem] z-20 border-b border-line bg-paper/92 backdrop-blur"
    >
      {/* горизонтальний скрол лише на вузьких екранах і без видимої смуги прокрутки;
          overflow-y-hidden — інакше Windows малює вертикальний скролбар через лінію активного пункту */}
      <div className="shell flex items-center gap-8 overflow-x-auto overflow-y-hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <span className="eyebrow hidden shrink-0 text-mute sm:inline">{label}</span>
        <ul className="flex shrink-0 items-center gap-7">
          {options.map((o) => (
            <li key={o.href}>
              <Link
                href={o.href}
                scroll={false}
                aria-current={o.active ? "page" : undefined}
                className={`relative inline-flex items-baseline gap-1.5 whitespace-nowrap py-5 text-sm transition-colors ${
                  o.active ? "font-semibold text-ink" : "text-mute hover:text-ink"
                }`}
              >
                {o.label}
                {typeof o.count === "number" && (
                  <span className="text-[0.7rem] tabular-nums text-mute">{o.count}</span>
                )}
                <span
                  className={`absolute inset-x-0 bottom-0 h-0.5 bg-sky-700 transition-transform duration-300 ${
                    o.active ? "scale-x-100" : "scale-x-0"
                  }`}
                />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
