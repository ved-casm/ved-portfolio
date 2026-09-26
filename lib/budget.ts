/*
 * Budget tiers live in INR; visitors see them in their own currency, converted
 * with the day's rate and rounded to friendly numbers.
 */

/** tier edges in INR: <50k, 50k–1.5L, 1.5L–3L, 3L–6L, 6L+ */
const EDGES_INR = [50_000, 150_000, 300_000, 600_000];

export const INR_LABELS = ["< ₹50k", "₹50k – 1.5L", "₹1.5L – 3L", "₹3L – 6L", "₹6L +", "let's discuss"];

export type BudgetOption = { label: string; inr: string };

export const INR_OPTIONS: BudgetOption[] = INR_LABELS.map((l) => ({ label: l, inr: l }));

// 1, 1.5, 2, 2.5, 3, 4, 5, 6, 7.5, 8 x 10^n
function nice(x: number) {
  const steps = [1, 1.5, 2, 2.5, 3, 4, 5, 6, 7.5, 8, 10];
  const p = Math.pow(10, Math.floor(Math.log10(x)));
  const f = x / p;
  const s = steps.reduce((best, v) => (Math.abs(v - f) < Math.abs(best - f) ? v : best), steps[0]);
  return s * p;
}

export function budgetOptions(currency: string, ratePerInr: number): BudgetOption[] {
  if (currency === "INR" || !ratePerInr) return INR_OPTIONS;
  let fmt: Intl.NumberFormat;
  try {
    fmt = new Intl.NumberFormat("en", { style: "currency", currency, notation: "compact", maximumFractionDigits: 1 });
  } catch {
    return INR_OPTIONS;
  }
  const v = EDGES_INR.map((e) => fmt.format(nice(e * ratePerInr)));
  const labels = [`< ${v[0]}`, `${v[0]} – ${v[1]}`, `${v[1]} – ${v[2]}`, `${v[2]} – ${v[3]}`, `${v[3]} +`];
  return [...labels.map((label, i) => ({ label, inr: INR_LABELS[i] })), { label: "let's discuss", inr: "let's discuss" }];
}

/** ISO country -> currency (euro area and the common ones; others fall back to USD) */
const EUR = ["AT", "BE", "HR", "CY", "EE", "FI", "FR", "DE", "GR", "IE", "IT", "LV", "LT", "LU", "MT", "NL", "PT", "SK", "SI", "ES", "AD", "MC", "SM", "VA", "ME", "XK"];
const MAP: Record<string, string> = {
  IN: "INR", US: "USD", GB: "GBP", CA: "CAD", AU: "AUD", NZ: "NZD", SG: "SGD", AE: "AED", SA: "SAR", QA: "QAR",
  KW: "KWD", BH: "BHD", OM: "OMR", JP: "JPY", CN: "CNY", HK: "HKD", KR: "KRW", TW: "TWD", TH: "THB", MY: "MYR",
  ID: "IDR", PH: "PHP", VN: "VND", PK: "PKR", BD: "BDT", LK: "LKR", NP: "NPR", CH: "CHF", SE: "SEK", NO: "NOK",
  DK: "DKK", PL: "PLN", CZ: "CZK", HU: "HUF", RO: "RON", BG: "BGN", TR: "TRY", IL: "ILS", ZA: "ZAR", NG: "NGN",
  KE: "KES", EG: "EGP", BR: "BRL", MX: "MXN", AR: "ARS", CL: "CLP", CO: "COP", PE: "PEN", RU: "RUB", UA: "UAH",
};

export function currencyFor(country: string | null | undefined): string {
  const c = (country || "").toUpperCase();
  if (EUR.includes(c)) return "EUR";
  return MAP[c] || (c ? "USD" : "INR");
}
