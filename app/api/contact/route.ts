import nodemailer from "nodemailer";
import { NextResponse } from "next/server";
import { ownerEmail, thankYouEmail, type Brief } from "@/lib/contactEmails";

/*
 * POST /api/contact — sends the brief to me and a thank-you to the sender.
 * SMTP settings come from the environment (see .env.example).
 */

export const runtime = "nodejs";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const clip = (v: unknown, n: number) => String(v ?? "").trim().slice(0, n);

// light per-IP throttle (per server instance)
const hits = new Map<string, number[]>();
const limited = (ip: string) => {
  const now = Date.now();
  const list = (hits.get(ip) ?? []).filter((t) => now - t < 10 * 60_000);
  list.push(now);
  hits.set(ip, list);
  return list.length > 5;
};

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Bad request" }, { status: 400 });
  }

  // honeypot: real people never fill this
  if (clip(body.company, 200)) return NextResponse.json({ ok: true });

  const brief: Brief = {
    building: clip(body.building, 120),
    budget: clip(body.budget, 60),
    budgetInr: clip(body.budgetInr, 60),
    name: clip(body.name, 120),
    email: clip(body.email, 200),
    picture: clip(body.picture, 4000),
    sources: Array.isArray(body.sources) ? body.sources.slice(0, 10).map((s) => clip(s, 40)).filter(Boolean) : [],
  };
  const missing = (["building", "budget", "name", "email"] as const).filter((k) => !brief[k]);
  if (missing.length || !EMAIL_RE.test(brief.email)) {
    return NextResponse.json({ ok: false, error: "Please fill in the required fields.", fields: missing }, { status: 422 });
  }

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "local";
  if (limited(ip)) {
    return NextResponse.json({ ok: false, error: "Too many messages — please try again later." }, { status: 429 });
  }

  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, CONTACT_TO } = process.env;
  // server-only; the old NEXT_PUBLIC_ name still works as a fallback
  const siteUrl = process.env.SITE_URL || process.env.NEXT_PUBLIC_SITE_URL;
  if (!SMTP_USER || !SMTP_PASS) {
    console.error("[contact] SMTP_USER / SMTP_PASS are not set");
    return NextResponse.json({ ok: false, error: "Email isn't set up yet." }, { status: 500 });
  }
  const port = Number(SMTP_PORT || 465);
  const transport = nodemailer.createTransport({
    host: SMTP_HOST || "smtp.gmail.com",
    port,
    secure: port === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });
  const to = CONTACT_TO || SMTP_USER;
  const from = `"Vedank Gaur" <${SMTP_USER}>`;

  try {
    const mine = ownerEmail(brief);
    await transport.sendMail({
      from,
      to,
      replyTo: `"${brief.name.replace(/"/g, "")}" <${brief.email}>`,
      subject: mine.subject,
      text: mine.text,
      html: mine.html,
    });
    const thanks = thankYouEmail(brief, { siteUrl, ownerEmail: to });
    // the thank-you is a courtesy: a bounce here shouldn't fail the request
    await transport
      .sendMail({ from, to: brief.email, replyTo: to, subject: thanks.subject, text: thanks.text, html: thanks.html })
      .catch((e) => console.error("[contact] thank-you failed:", e?.message));
  } catch (e) {
    console.error("[contact] send failed:", (e as Error)?.message);
    return NextResponse.json({ ok: false, error: "Couldn't send right now." }, { status: 502 });
  }
  return NextResponse.json({ ok: true });
}
