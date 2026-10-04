import { highlight } from "@/lib/search";

/** Текст із підсвіченими збігами зі словами запиту. */
export default function Highlight({ text, terms }: { text: string; terms: string[] }) {
  return (
    <>
      {highlight(text, terms).map((s, i) =>
        s.hit ? (
          <mark key={i} className="rounded-[2px] bg-wheat-200 text-ink">
            {s.text}
          </mark>
        ) : (
          <span key={i}>{s.text}</span>
        ),
      )}
    </>
  );
}
