import { fileSize, hasMedia, type Media as MediaData } from "@/lib/media";

/**
 * Відео (YouTube) і файли для завантаження під текстом.
 * Дані — поля «Videos» і «Files» у DatoCMS (див. lib/media.ts).
 */
export default function Media({
  media,
  className = "",
  tone = "light",
}: {
  media: MediaData;
  className?: string;
  /** "dim" — на сірому тлі (звіт події) */
  tone?: "light" | "dim";
}) {
  if (!hasMedia(media)) return null;
  const card = tone === "dim" ? "bg-paper" : "bg-paper-dim";

  return (
    <div className={`max-w-[44rem] space-y-12 ${className}`}>
      {media.videos.length > 0 && (
        <div>
          <p className="eyebrow text-mute">Відео</p>
          <div className="rule mt-3" />
          <div className="mt-6 space-y-6">
            {media.videos.map((v) => (
              <div key={v.id} className="video-embed">
                <iframe
                  src={v.embed}
                  title="Відео YouTube"
                  loading="lazy"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {media.files.length > 0 && (
        <div>
          <p className="eyebrow text-mute">Матеріали для завантаження</p>
          <div className="rule mt-3" />
          <ul className="mt-4 space-y-3">
            {media.files.map((f) => (
              <li key={f.url}>
                <a
                  href={f.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  download={f.filename}
                  className={`group flex items-center gap-5 ${card} px-5 py-4 transition-colors hover:bg-sky-deep`}
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center border border-ink/15 font-display text-[0.62rem] font-semibold tracking-[0.08em] text-sky-700 group-hover:border-wheat-400/60 group-hover:text-wheat-400">
                    {f.ext.slice(0, 4) || "FILE"}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[0.98rem] font-semibold text-ink group-hover:text-paper">
                      {f.name}
                    </span>
                    <span className="mt-0.5 block text-xs text-mute group-hover:text-sky-100">
                      {f.ext ? `${f.ext} · ` : ""}
                      {fileSize(f.size)}
                    </span>
                  </span>
                  <svg
                    aria-hidden
                    viewBox="0 0 24 24"
                    className="h-5 w-5 shrink-0 text-ink group-hover:text-wheat-400"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  >
                    <path d="M12 3v12m0 0-4-4m4 4 4-4M5 21h14" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
