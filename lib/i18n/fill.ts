/** «Фото {i} з {n}» + { i: 1, n: 5 } → «Фото 1 з 5» */
export const fill = (template: string, vars: Record<string, string | number>) =>
  template.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? `{${k}}`));
