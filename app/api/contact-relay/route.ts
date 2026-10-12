import nodemailer from "nodemailer";
import { NextResponse } from "next/server";
import { ownerEmail, thankYouEmail, SITES, type RelayMessage, type RelaySite } from "@/lib/relayEmails";

/*
 * POST /api/contact-relay - contact forms on the product design and
 * generative AI portfolios post here. Sends the message to me and a themed
 * thank-you (with the sender's details) back to them, using the same SMTP
 * settings as /api/contact.
 */

export const runtime = "nodejs";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const clip = (v: unknown, n: number) => String(v ?? "").trim().slice(0, n);
const OWNER = process.env.RELAY_TO || "vedank0522@gmail.com";

const ORIGINS = Object.values(SITES).map((s) => s.url);
const cors = (req: Request) => {
  const origin = req.headers.get("origin") || "";
  const ok = ORIGINS.includes(origin) || /^http:\/\/localhost:\d+$/.test(origin);
  return {
    "Access-Control-Allow-Origin": ok ? origin : ORIGINS[0],
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    Vary: "Origin",
  };
};

const hits = new Map<string, number[]>();
const limited = (ip: string) => {
  const now = Date.now();
  const list = (hits.get(ip) ?? []).filter((t) => now - t < 10 * 60_000);
  list.push(now);
  hits.set(ip, list);
  return list.length > 5;
};

export async function OPTIONS(req: Request) {
  return new NextResponse(null, { status: 204, headers: cors(req) });
}

export async function POST(req: Request) {
  const headers = cors(req);
  const json = (body: object, status = 200) => NextResponse.json(body, { status, headers });

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return json({ ok: false, error: "Bad request" }, 400);
  }
  if (clip(body.company, 200)) return json({ ok: true }); // honeypot

  const site = clip(body.site, 20) as RelaySite;
  if (!(site in SITES)) return json({ ok: false, error: "Bad request" }, 400);

  const m: RelayMessage = {
    site,
    name: clip(body.name, 120),
    email: clip(body.email, 200),
    message: clip(body.message, 4000),
  };
  if (!m.name || !m.message || !EMAIL_RE.test(m.email)) {
    return json({ ok: false, error: "Please fill in all fields." }, 422);
  }

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "local";
  if (limited(ip)) return json({ ok: false, error: "Too many messages - please try again later." }, 429);

  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
  if (!SMTP_USER || !SMTP_PASS) {
    console.error("[contact-relay] SMTP_USER / SMTP_PASS are not set");
    return json({ ok: false, error: "Email isn't set up yet." }, 500);
  }
  const port = Number(SMTP_PORT || 465);
  const transport = nodemailer.createTransport({
    host: SMTP_HOST || "smtp.gmail.com",
    port,
    secure: port === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });
  const from = `"Vedank Gaur" <${SMTP_USER}>`;

  try {
    const mine = ownerEmail(m);
    await transport.sendMail({
      from,
      to: OWNER,
      replyTo: `"${m.name.replace(/"/g, "")}" <${m.email}>`,
      subject: mine.subject,
      text: mine.text,
      html: mine.html,
    });
    const thanks = thankYouEmail(m);
    await transport
      .sendMail({ from, to: m.email, replyTo: OWNER, subject: thanks.subject, text: thanks.text, html: thanks.html })
      .catch((e) => console.error("[contact-relay] thank-you failed:", e?.message));
  } catch (e) {
    console.error("[contact-relay] send failed:", (e as Error)?.message);
    return json({ ok: false, error: "Couldn't send right now." }, 502);
  }
  return json({ ok: true });
}
