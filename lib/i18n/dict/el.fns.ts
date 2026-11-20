// «Οργάνωση» — θηλυκό: μία, δύο, τρεις, τέσσερις…
const NUM_F = ["", "Μία", "Δύο", "Τρεις", "Τέσσερις", "Πέντε", "Έξι", "Επτά", "Οκτώ", "Εννέα", "Δέκα"];
const s = (n: number, one: string, many: string) => (n === 1 ? one : many);

export const fns_el = {
  stats: { founders: (n: number) => s(n, "ιδρυτική οργάνωση", "ιδρυτικές οργανώσεις") },
  aboutPage: {
    foundersTitle: (n: number) => `${NUM_F[n] ?? n} ${s(n, "ιδρυτική οργάνωση", "ιδρυτικές οργανώσεις")} και οι εταίροι του δικτύου`,
  },
  reportsPage: { count: (n: number) => `${n} ${s(n, "εκδήλωση", "εκδηλώσεις")}` },
  usefulPage: { materials: (n: number) => `${n} ${s(n, "άρθρο", "άρθρα")}` },
};
