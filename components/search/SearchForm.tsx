/** Поле пошуку. Звичайна GET-форма → /poshuk?q=… (працює і без JavaScript). */
export default function SearchForm({ defaultValue = "", autoFocus = false }: { defaultValue?: string; autoFocus?: boolean }) {
  return (
    <form action="/poshuk" method="get" role="search" className="group relative mt-10 max-w-3xl">
      <label htmlFor="q" className="sr-only">
        Пошук по сайту
      </label>
      <svg
        aria-hidden
        viewBox="0 0 24 24"
        className="pointer-events-none absolute left-0 top-1/2 h-6 w-6 -translate-y-1/2 text-mute transition-colors group-focus-within:text-sky-700"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
      >
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-3.5-3.5" strokeLinecap="round" />
      </svg>
      <input
        id="q"
        name="q"
        type="search"
        defaultValue={defaultValue}
        autoFocus={autoFocus}
        autoComplete="off"
        placeholder="Школа, документи, Крит, волонтерство…"
        className="w-full border-0 border-b-2 border-ink/20 bg-transparent py-4 pl-10 pr-28 font-display text-[clamp(1.3rem,2.6vw,2rem)] text-ink placeholder:text-mute/60 focus:border-sky-700 focus:outline-none"
      />
      <button
        type="submit"
        className="absolute right-0 top-1/2 -translate-y-1/2 rounded-full bg-ink px-5 py-2.5 text-[0.75rem] font-medium uppercase tracking-[0.14em] text-paper transition-colors hover:bg-sky-700"
      >
        Шукати
      </button>
    </form>
  );
}
