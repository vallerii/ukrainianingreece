import Link from "next/link";

export default function Placeholder({
  eyebrow,
  title,
  text,
}: {
  eyebrow: string;
  title: string;
  text: string;
}) {
  return (
    <section className="bg-paper pb-28 pt-44">
      <div className="shell">
        <p className="eyebrow text-sky-700">{eyebrow}</p>
        <h1 className="display mt-5 max-w-4xl text-[clamp(2.2rem,5.6vw,4.4rem)] text-ink">
          {title}
        </h1>
        <div className="rule mt-10" />
        <p className="mt-8 max-w-2xl text-lg leading-relaxed text-ink-soft">{text}</p>
        <p className="mt-10 text-sm text-mute">
          Сторінка в розробці — структура готова, контент наповнюємо.
        </p>
        <Link
          href="/"
          className="link-underline mt-8 inline-block text-sm font-bold text-ink"
        >
          ← На головну
        </Link>
      </div>
    </section>
  );
}
