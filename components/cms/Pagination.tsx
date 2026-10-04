import Link from "next/link";

/**
 * Пагінація в редакційному стилі: «← Попередня · 1 2 … 7 · Наступна →».
 * Посилання зберігають поточні фільтри (params), сторінка 1 — без ?page.
 */
export default function Pagination({
  page,
  pages,
  basePath,
  params = {},
}: {
  page: number;
  pages: number;
  basePath: string;
  params?: Record<string, string | null | undefined>;
}) {
  if (pages <= 1) return null;

  const href = (p: number) => {
    const q = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) if (v) q.set(k, v);
    if (p > 1) q.set("page", String(p));
    const s = q.toString();
    return s ? `${basePath}?${s}` : basePath;
  };

  // 1 … 4 5 6 … 12
  const nums: (number | "gap")[] = [];
  for (let p = 1; p <= pages; p++) {
    if (p === 1 || p === pages || Math.abs(p - page) <= 1) nums.push(p);
    else if (nums[nums.length - 1] !== "gap") nums.push("gap");
  }

  const edge = "inline-flex items-center gap-2 text-sm font-semibold text-ink";

  return (
    <nav aria-label="Сторінки" className="flex flex-wrap items-center justify-between gap-6 pt-12">
      {page > 1 ? (
        <Link href={href(page - 1)} className={`${edge} link-underline group`}>
          <span className="transition-transform group-hover:-translate-x-1">←</span> Попередня
        </Link>
      ) : (
        <span className={`${edge} opacity-30`}>← Попередня</span>
      )}

      <ul className="flex items-center gap-1">
        {nums.map((n, i) =>
          n === "gap" ? (
            <li key={`g${i}`} className="px-2 text-mute">
              …
            </li>
          ) : (
            <li key={n}>
              <Link
                href={href(n)}
                aria-current={n === page ? "page" : undefined}
                className={`display inline-flex h-10 min-w-10 items-center justify-center px-2 text-[1.15rem] tabular-nums transition-colors ${
                  n === page ? "bg-sky-deep text-paper" : "text-ink-soft hover:bg-paper-dim hover:text-ink"
                }`}
              >
                {n}
              </Link>
            </li>
          ),
        )}
      </ul>

      {page < pages ? (
        <Link href={href(page + 1)} className={`${edge} link-underline group`}>
          Наступна <span className="transition-transform group-hover:translate-x-1">→</span>
        </Link>
      ) : (
        <span className={`${edge} opacity-30`}>Наступна →</span>
      )}
    </nav>
  );
}
