import type { Metadata } from "next";
import Link from "next/link";
import PageHead from "@/components/cms/PageHead";
import SearchForm from "@/components/search/SearchForm";

export const metadata: Metadata = { title: "Сторінку не знайдено", robots: { index: false } };

const LINKS = [
  { href: "/novyny", label: "Новини", note: "Що відбувається в громаді" },
  { href: "/podiyi", label: "Події", note: "Календар зустрічей і свят" },
  { href: "/proyekty", label: "Проєкти", note: "Школи, клуби та спільноти" },
  { href: "/korysno", label: "Корисна інформація", note: "Документи, освіта, медицина, робота" },
  { href: "/kontakty", label: "Контакти", note: "Як з нами звʼязатися" },
];

export default function NotFound() {
  return (
    <>
      <PageHead
        eyebrow="Помилка 404"
        title={
          <>
            Такої сторінки <span className="text-sky-700">немає</span>
          </>
        }
        lead="Можливо, посилання застаріло або в адресі є помилка. Спробуйте пошук або оберіть розділ нижче."
      >
        <SearchForm />
      </PageHead>

      <section className="bg-paper pb-24 pt-14">
        <div className="shell">
          <ul className="grid gap-px overflow-hidden rounded-sm bg-line sm:grid-cols-2 lg:grid-cols-3">
            <li className="bg-paper">
              <Link href="/" className="group block h-full p-7 transition-colors hover:bg-paper-dim">
                <span className="font-display text-xl text-ink group-hover:text-sky-700">← На головну</span>
                <span className="mt-2 block text-sm text-mute">Об’єднана українська діаспора в Греції</span>
              </Link>
            </li>
            {LINKS.map((l) => (
              <li key={l.href} className="bg-paper">
                <Link href={l.href} className="group block h-full p-7 transition-colors hover:bg-paper-dim">
                  <span className="font-display text-xl text-ink group-hover:text-sky-700">{l.label}</span>
                  <span className="mt-2 block text-sm text-mute">{l.note}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
