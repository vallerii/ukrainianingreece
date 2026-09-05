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
    <section className="relative overflow-hidden bg-paper-dim pb-28 pt-44">
      <div className="absolute inset-0 bg-[radial-gradient(72%_90%_at_88%_0%,rgba(255,201,60,0.30),transparent_66%),radial-gradient(58%_80%_at_2%_8%,rgba(42,123,209,0.12),transparent_62%)]" />
      <div className="grain" />
      <div className="shell relative">
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
