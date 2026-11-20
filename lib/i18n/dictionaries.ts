import type { Locale } from "./config";
import { uk } from "./dict/uk";
import { en } from "./dict/en";
import { el } from "./dict/el";

/** Рядки → string, масиви → масиви рядків: структура однакова для всіх мов, тексти — свої. */
type Widen<T> = T extends string
  ? string
  : T extends (...a: infer A) => infer R
    ? (...a: A) => R
    : T extends readonly (infer U)[]
      ? Widen<U>[]
      : T extends object
        ? { -readonly [K in keyof T]: Widen<T[K]> }
        : T;

export type Dict = Widen<typeof uk>;

export const dictionaries: Record<Locale, Dict> = { uk, en, el };
