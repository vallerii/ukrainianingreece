import Image from "next/image";
import Link from "next/link";
import type { ProjectCard } from "@/lib/organizations";
import SectionHead from "@/components/ui/SectionHead";
import Reveal from "@/components/ui/Reveal";

/**
 * Постійні проєкти на головній: нумерований список, у кожному рядку видно фото або логотип
 * (раніше картинка з’являлася лише при наведенні — на телефоні її не було видно взагалі).
 */
export default function Projects({ projects }: { projects: ProjectCard[] }) {
  return (
    <section id="proyekty" className="relative bg-paper py-12 md:py-16">
      <div className="shell">
        <SectionHead eyebrow="Постійні проєкти" title="Що працює щотижня" link="/proyekty" />

        <div>
          {projects.map((p, idx) => (
            <Reveal key={p.href} delay={Math.min(idx, 4) * 0.04}>
              <Link
                href={p.href}
                className="group grid grid-cols-[5.5rem_1fr] items-center gap-4 border-b border-line py-4 sm:grid-cols-[2.5rem_8rem_1fr_auto] sm:gap-6 md:py-5"
              >
                <span className="hidden font-display text-sm text-mute sm:block">{p.n}</span>

                <Thumb p={p} />

                <div className="min-w-0">
                  <p className="text-[0.72rem] uppercase tracking-[0.12em] text-mute sm:hidden">{p.city}</p>
                  <h3 className="display text-[clamp(1.2rem,2.4vw,1.9rem)] text-ink transition-colors group-hover:text-sky-700">
                    {p.title}
                  </h3>
                  <p className="mt-1 hidden max-w-2xl text-[0.95rem] leading-relaxed text-ink-soft sm:block">{p.text}</p>
                </div>

                <span className="hidden items-center gap-5 text-[0.78rem] uppercase tracking-[0.14em] text-mute sm:flex">
                  {p.city}
                  <span className="text-lg text-sky-700 transition-transform duration-500 group-hover:translate-x-1.5">→</span>
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function Thumb({ p }: { p: ProjectCard }) {
  const box = "relative aspect-[4/3] w-full overflow-hidden";
  if (p.photo)
    return (
      <div className={`${box} bg-paper-dim`}>
        <Image
          src={p.photo.src}
          alt=""
          fill
          sizes="8rem"
          className="object-cover transition-transform duration-700 group-hover:scale-105"
        />
      </div>
    );
  if (p.logo)
    return (
      <div className={`${box} ${p.logo.dark ? "bg-[#0B5394]" : "bg-white ring-1 ring-line"}`}>
        <Image src={p.logo.src} alt="" fill sizes="8rem" className="object-contain p-2.5" />
      </div>
    );
  return (
    <div className={`${box} flex items-center justify-center bg-[linear-gradient(160deg,#EAF2FB,#D6E8FA)]`}>
      <Image src="/logo-mark.png" alt="" width={48} height={48} className="w-[40%] opacity-30 grayscale" />
    </div>
  );
}
