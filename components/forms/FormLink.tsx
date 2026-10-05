"use client";

import type { ReactNode } from "react";
import type { FormKind } from "@/lib/forms";
import { openForm } from "./FormDialog";

/** Кнопка, що відкриває форму в попапі. Без JS — веде на контакти. */
export default function FormLink({ kind, className, children }: { kind: FormKind; className?: string; children: ReactNode }) {
  return (
    <a
      href={`/kontakty#${kind}`}
      className={className}
      onClick={(e) => {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
        e.preventDefault();
        openForm(kind);
      }}
    >
      {children}
    </a>
  );
}
