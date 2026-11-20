/** Українські форми множини: plural(4, ["організація", "організації", "організацій"]) → «організації» */
export function plural(n: number, [one, few, many]: [string, string, string]) {
  const m10 = n % 10;
  const m100 = n % 100;
  if (m10 === 1 && m100 !== 11) return one;
  if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return few;
  return many;
}

const NUM_F = ["", "Одна", "Дві", "Три", "Чотири", "П’ять", "Шість", "Сім", "Вісім", "Девʼять", "Десять"];

export const fns_uk = {
  stats: {
    founders: (n: number) => plural(n, ["організація-засновник", "організації-засновники", "організацій-засновників"]),
  },
  aboutPage: {
    /** «П’ять організацій-засновників і партнери мережі» */
    foundersTitle: (n: number) =>
      `${NUM_F[n] ?? n} ${plural(n, ["організація-засновник", "організації-засновники", "організацій-засновників"])} і партнери мережі`,
  },
  reportsPage: { count: (n: number) => `${n} ${plural(n, ["подія", "події", "подій"])}` },
  usefulPage: { materials: (n: number) => `${n} ${plural(n, ["матеріал", "матеріали", "матеріалів"])}` },
};
