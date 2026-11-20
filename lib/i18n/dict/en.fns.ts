const NUM = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten"];
const s = (n: number, one: string, many: string) => (n === 1 ? one : many);

export const fns_en = {
  stats: { founders: (n: number) => s(n, "founding organisation", "founding organisations") },
  aboutPage: {
    foundersTitle: (n: number) => `${NUM[n] ?? n} ${s(n, "founding organisation", "founding organisations")} and network partners`,
  },
  reportsPage: { count: (n: number) => `${n} ${s(n, "event", "events")}` },
  usefulPage: { materials: (n: number) => `${n} ${s(n, "article", "articles")}` },
};
