import Image from "next/image";
import type { Satellite } from "@/lib/projects";

/** Логотип організації на підкладці (світлій або фірмовій темній). */
export default function ProjectLogo({
  logo,
  title,
  className = "",
}: {
  logo: NonNullable<Satellite["logo"]>;
  title: string;
  className?: string;
}) {
  const small = logo.width < 300; // напр. 117×117 — не розтягуємо, щоб не «мило»
  return (
    <div
      className={`flex items-center justify-center p-6 ${logo.dark ? "bg-[#0B5394]" : "bg-white ring-1 ring-line"} ${className}`}
    >
      <Image
        src={logo.src}
        alt={`Логотип: ${title}`}
        width={logo.width}
        height={logo.height}
        sizes="20rem"
        className={small ? "h-auto w-[117px]" : "h-auto max-h-full w-full object-contain"}
      />
    </div>
  );
}
