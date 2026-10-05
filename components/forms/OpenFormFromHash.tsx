"use client";

import { useEffect } from "react";
import { openForm } from "./FormDialog";
import { openDonate } from "@/components/donate/DonateDialog";

/**
 * Якщо людина прийшла за посиланням /kontakty#volunteer, #organization або #donate
 * (наприклад, відкрила кнопку в новій вкладці) — одразу відкриваємо потрібний попап.
 */
export default function OpenFormFromHash() {
  useEffect(() => {
    const open = () => {
      const h = window.location.hash.slice(1);
      if (h === "volunteer" || h === "organization") openForm(h);
      else if (h === "donate") openDonate();
    };
    open();
    window.addEventListener("hashchange", open);
    return () => window.removeEventListener("hashchange", open);
  }, []);
  return null;
}
