"use client";

import Link from "next/link";
import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";

const base =
  "mt-2 w-full border-0 border-b border-ink/20 bg-transparent px-0 py-2.5 text-[1rem] text-ink placeholder:text-mute/60 focus:border-sky-700 focus:outline-none focus:ring-0";

function Label({ children, required, htmlFor }: { children: ReactNode; required?: boolean; htmlFor: string }) {
  return (
    <label htmlFor={htmlFor} className="text-sm text-ink-soft">
      {children}
      {required && <span className="text-wheat-700"> *</span>}
    </label>
  );
}

export function Field({ label, name, required, ...rest }: { label: string; name: string } & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <Label htmlFor={name} required={required}>
        {label}
      </Label>
      <input id={name} name={name} required={required} className={base} {...rest} />
    </div>
  );
}

export function Area({ label, name, required, ...rest }: { label: string; name: string } & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <div>
      <Label htmlFor={name} required={required}>
        {label}
      </Label>
      <textarea id={name} name={name} required={required} rows={3} className={`${base} resize-y`} {...rest} />
    </div>
  );
}

export function Select({
  label,
  name,
  options,
  required,
  ...rest
}: { label: string; name: string; options: string[] } & SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div>
      <Label htmlFor={name} required={required}>
        {label}
      </Label>
      <select id={name} name={name} required={required} defaultValue="" className={`${base} cursor-pointer`} {...rest}>
        <option value="" disabled>
          Оберіть…
        </option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </div>
  );
}

export function Chips({ label, name, options }: { label: string; name: string; options: string[] }) {
  return (
    <fieldset>
      <legend className="text-sm text-ink-soft">{label}</legend>
      <div className="mt-3 flex flex-wrap gap-2">
        {options.map((o) => (
          <label key={o} className="cursor-pointer">
            <input type="checkbox" name={name} value={o} className="peer sr-only" />
            <span className="inline-block rounded-full border border-line px-3.5 py-1.5 text-sm text-ink-soft transition-colors peer-checked:border-sky-deep peer-checked:bg-sky-deep peer-checked:text-paper peer-focus-visible:ring-2 peer-focus-visible:ring-sky-300 hover:border-sky-700">
              {o}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

/** Згода з посиланням на політику + приховане поле-пастка для ботів. */
export function ConsentAndHoneypot() {
  return (
    <>
      <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label>
          Не заповнюйте це поле
          <input type="text" name="website_hp" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      <label className="flex cursor-pointer items-start gap-3 text-sm leading-relaxed text-ink-soft">
        <input type="checkbox" name="consent" required className="mt-1 h-4 w-4 accent-[#062E5F]" />
        <span>
          Погоджуюсь на обробку моїх даних для розгляду заявки згідно з{" "}
          <Link href="/polityka" target="_blank" className="text-sky-700 underline underline-offset-2">
            політикою конфіденційності
          </Link>
          .
        </span>
      </label>
    </>
  );
}
