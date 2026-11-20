/** Поле пошуку. Звичайна GET-форма → /poshuk?q=… (працює і без JavaScript). */
import { getT } from "@/lib/i18n/server";
import { localizeHref } from "@/lib/i18n/config";
import { getLocale } from "@/lib/i18n/server";

export default function SearchForm({
  defaultValue = "",
  autoFocus = false,
  action = "/poshuk",
  placeholder = getT().search.placeholder,
  label = getT().search.label,
}: {
  defaultValue?: string;
  autoFocus?: boolean;
  action?: string;
  placeholder?: string;
  label?: string;
}) {
  return (
    <form action={localizeHref(action, getLocale())} method="get" role="search" className="group relative mt-10 max-w-3xl">
      <label htmlFor="q" className="sr-only">
        {label}
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
        placeholder={placeholder}
        className="w-full border-0 border-b-2 border-ink/20 bg-transparent py-4 pl-10 pr-28 font-display text-[clamp(1.04rem,2.08vw,1.6rem)] text-ink placeholder:text-mute/60 focus:border-sky-700 focus:outline-none"
      />
      <button
        type="submit"
        className="absolute right-0 top-1/2 -translate-y-1/2 rounded-full bg-ink px-5 py-2.5 text-[0.75rem] font-medium uppercase tracking-[0.14em] text-paper transition-colors hover:bg-sky-700"
      >
        {getT().search.submit}
      </button>
    </form>
  );
}
