/**
 * Тексти з DatoCMS (поле Multiple-paragraph text, WYSIWYG) приходять готовим HTML.
 * Якщо редактор вставив простий текст без тегів — розбиваємо на абзаци самі.
 */
export default function RichText({ html, className = "" }: { html: string; className?: string }) {
  if (!html.trim()) return null;

  if (/<[a-z][\s\S]*>/i.test(html)) {
    return <div className={`rich ${className}`} dangerouslySetInnerHTML={{ __html: html }} />;
  }

  return (
    <div className={`rich ${className}`}>
      {html
        .split(/\n{2,}|\r\n\r\n/)
        .map((p) => p.trim())
        .filter(Boolean)
        .map((p, i) => (
          <p key={i}>{p}</p>
        ))}
    </div>
  );
}
