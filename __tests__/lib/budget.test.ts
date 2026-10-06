import { budgetOptions, currencyFor, INR_LABELS, INR_OPTIONS } from "@/lib/budget";

describe("currencyFor", () => {
  it("maps known countries to their currency", () => {
    expect(currencyFor("IN")).toBe("INR");
    expect(currencyFor("US")).toBe("USD");
    expect(currencyFor("GB")).toBe("GBP");
    expect(currencyFor("JP")).toBe("JPY");
  });

  it("gives euro-area countries EUR", () => {
    expect(currencyFor("DE")).toBe("EUR");
    expect(currencyFor("FR")).toBe("EUR");
  });

  it("is case-insensitive", () => {
    expect(currencyFor("in")).toBe("INR");
  });

  it("falls back to USD for an unknown country and INR for none", () => {
    expect(currencyFor("ZZ")).toBe("USD");
    expect(currencyFor("")).toBe("INR");
    expect(currencyFor(null)).toBe("INR");
    expect(currencyFor(undefined)).toBe("INR");
  });
});

describe("budgetOptions", () => {
  it("returns the INR tiers for INR or a missing rate", () => {
    expect(budgetOptions("INR", 1)).toBe(INR_OPTIONS);
    expect(budgetOptions("USD", 0)).toBe(INR_OPTIONS);
  });

  it("falls back to INR for an invalid currency code", () => {
    expect(budgetOptions("NOT-A-CODE", 0.012)).toBe(INR_OPTIONS);
  });

  it("converts the tiers and keeps each one's INR label", () => {
    const opts = budgetOptions("USD", 0.012);
    expect(opts).toHaveLength(INR_LABELS.length);
    // 50k INR * 0.012 = $600
    expect(opts[0].label).toBe("< $600");
    expect(opts[0].inr).toBe(INR_LABELS[0]);
    expect(opts[4].label).toMatch(/\+$/);
    expect(opts[4].inr).toBe(INR_LABELS[4]);
    expect(opts[5]).toEqual({ label: "let's discuss", inr: "let's discuss" });
  });

  it("rounds converted edges to friendly numbers", () => {
    // 50k * 0.0113 = 565 -> 600; 150k * 0.0113 = 1695 -> 1.5K
    const opts = budgetOptions("EUR", 0.0113);
    expect(opts[1].label).toBe("€600 – €1.5K");
  });
});
