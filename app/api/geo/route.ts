import { NextResponse } from "next/server";
import { currencyFor } from "@/lib/budget";

/*
 * GET /api/geo -> { country, currency, rate } where rate converts INR to the
 * visitor's currency. Country comes from Vercel's edge geolocation header;
 * rates are cached for 12 hours.
 */

export const runtime = "nodejs";

async function inrRates(): Promise<Record<string, number> | null> {
  try {
    const res = await fetch("https://open.er-api.com/v6/latest/INR", { next: { revalidate: 43200 } });
    if (!res.ok) return null;
    const data = (await res.json()) as { result?: string; rates?: Record<string, number> };
    return data.result === "success" && data.rates ? data.rates : null;
  } catch {
    return null;
  }
}

export async function GET(req: Request) {
  const h = req.headers;
  // Vercel sets this at the edge; locally fall back to the browser's language region
  let country = h.get("x-vercel-ip-country") || "";
  if (!country) {
    const m = (h.get("accept-language") || "").match(/[a-z]{2}-([A-Z]{2})/);
    country = m ? m[1] : "IN";
  }
  const currency = currencyFor(country);
  if (currency === "INR") return NextResponse.json({ country, currency, rate: 1 });
  const rates = await inrRates();
  const rate = rates?.[currency];
  if (!rate) return NextResponse.json({ country, currency: "INR", rate: 1 });
  return NextResponse.json(
    { country, currency, rate },
    // per visitor (depends on their location), but fine to cache briefly in the browser
    { headers: { "Cache-Control": "private, max-age=3600" } },
  );
}
