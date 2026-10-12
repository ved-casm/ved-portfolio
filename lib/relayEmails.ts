/*
 * Emails for the contact forms on the other portfolio sites (product design
 * and generative AI). Same mechanism as /contact: one note for me, one
 * themed thank-you for the sender with what they wrote. Each site gets its
 * own look. Table layout + inline styles for Gmail / Outlook / Apple Mail.
 */

export type RelaySite = "product" | "showdown";

export type RelayMessage = {
  site: RelaySite;
  name: string;
  email: string;
  message: string;
};

export const BOOKING = "https://cal.com/vedankgaur/quick";

export const SITES: Record<RelaySite, { label: string; url: string }> = {
  product: { label: "product design portfolio", url: "https://product-designer-five.vercel.app" },
  showdown: { label: "generative AI portfolio", url: "https://ai-showdown-vg.vercel.app" },
};

const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
const nl2br = (s: string) => esc(s).replace(/\r?\n/g, "<br>");
const firstName = (n: string) => n.trim().split(/\s+/)[0] || "there";

type Theme = {
  bg: string;
  card: string;
  ink: string;
  muted: string;
  accent: string;
  line: string;
  heading: string;
  body: string;
  mono: string;
  radius: string;
  border: string;
  shadow: string;
  btnBg: string;
  btnInk: string;
};

const THEMES: Record<RelaySite, Theme> = {
  // product portfolio: calm, Newsreader italic headings, Inter body, cool blue accent
  product: {
    bg: "#f5f5f5",
    card: "#ffffff",
    ink: "#000000",
    muted: "#808080",
    accent: "#0a84ff",
    line: "#e4e4e4",
    heading: "'Newsreader', Georgia, 'Times New Roman', serif",
    body: "'Inter', 'Helvetica Neue', Helvetica, Arial, sans-serif",
    mono: "'Inter', 'Helvetica Neue', Helvetica, Arial, sans-serif",
    radius: "14px",
    border: "1px solid #e4e4e4",
    shadow: "none",
    btnBg: "#000000",
    btnInk: "#ffffff",
  },
  // showdown: scrapbook paper, heavy black headings, mono labels, hard shadows, yellow highlight
  showdown: {
    bg: "#F4F4F2",
    card: "#FFFFFF",
    ink: "#161616",
    muted: "#4A4A4A",
    accent: "#2B59F0",
    line: "#161616",
    heading: "'Roboto', 'Helvetica Neue', Arial, sans-serif",
    body: "'Roboto', 'Helvetica Neue', Arial, sans-serif",
    mono: "'Roboto Mono', 'SFMono-Regular', Menlo, Consolas, monospace",
    radius: "4px",
    border: "2px solid #161616",
    shadow: "5px 5px 0 #161616",
    btnBg: "#161616",
    btnInk: "#ffffff",
  },
};

function shell(site: RelaySite, preheader: string, inner: string) {
  const t = THEMES[site];
  return `<!doctype html><html><body style="margin:0;padding:0;background:${t.bg};">
<span style="display:none;max-height:0;overflow:hidden;opacity:0;">${esc(preheader)}</span>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${t.bg};padding:32px 12px;">
<tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:${t.card};border:${t.border};border-radius:${t.radius};box-shadow:${t.shadow};">
<tr><td style="padding:32px 32px 28px;font-family:${t.body};color:${t.ink};font-size:16px;line-height:1.6;">${inner}</td></tr>
</table>
</td></tr></table></body></html>`;
}

function detailsBlock(site: RelaySite, m: RelayMessage) {
  const t = THEMES[site];
  const row = (k: string, v: string) =>
    `<tr><td style="padding:10px 0;border-top:1px solid ${t.line};font-family:${t.mono};font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:${t.muted};width:96px;vertical-align:top;">${k}</td><td style="padding:10px 0;border-top:1px solid ${t.line};font-size:15px;color:${t.ink};">${v}</td></tr>`;
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0 8px;">${row("name", esc(m.name))}${row("email", esc(m.email))}${row("message", nl2br(m.message))}</table>`;
}

export function ownerEmail(m: RelayMessage) {
  const t = THEMES[m.site];
  const site = SITES[m.site];
  const subject = `New message from ${m.name} (${site.label})`;
  const text = `New message via your ${site.label} (${site.url})\n\nName: ${m.name}\nEmail: ${m.email}\n\n${m.message}\n\nReply to this email to answer ${m.name} directly.`;
  const html = shell(
    m.site,
    `${m.name} wrote via your ${site.label}`,
    `<p style="margin:0 0 6px;font-family:${t.mono};font-size:12px;letter-spacing:.1em;text-transform:uppercase;color:${t.accent};">new message - ${esc(site.label)}</p>
<h1 style="margin:0 0 8px;font-family:${t.heading};font-size:28px;line-height:1.15;font-weight:${m.site === "showdown" ? 900 : 500};letter-spacing:-.02em;">${esc(m.name)} wrote to you</h1>
${detailsBlock(m.site, m)}
<p style="margin:16px 0 0;font-size:14px;color:${t.muted};">Hit reply to answer ${esc(firstName(m.name))} directly.</p>`,
  );
  return { subject, text, html };
}

export function thankYouEmail(m: RelayMessage) {
  const t = THEMES[m.site];
  const site = SITES[m.site];
  const subject = `Thanks ${firstName(m.name)} - got your message`;
  const text = `Hi ${firstName(m.name)},\n\nThanks for reaching out. I got your message and will reply within 24 hours.\n\nHere is what you sent:\n\nName: ${m.name}\nEmail: ${m.email}\n\n${m.message}\n\nWant to talk sooner? Book a call: ${BOOKING}\n\n- Vedank Gaur\n${site.url}`;
  const hl =
    m.site === "showdown"
      ? `<span style="background:#FFE45C;padding:0 6px;">${esc(firstName(m.name))}</span>`
      : `<em style="color:${t.accent};">${esc(firstName(m.name))}</em>`;
  const html = shell(
    m.site,
    "Thanks for reaching out - I reply within 24 hours.",
    `<p style="margin:0 0 6px;font-family:${t.mono};font-size:12px;letter-spacing:.1em;text-transform:uppercase;color:${t.accent};">message received</p>
<h1 style="margin:0 0 14px;font-family:${t.heading};font-size:32px;line-height:1.12;font-weight:${m.site === "showdown" ? 900 : 500};letter-spacing:-.03em;">Thanks, ${hl}.</h1>
<p style="margin:0 0 6px;">I got your message and will reply within 24 hours. Here is a copy of what you sent:</p>
${detailsBlock(m.site, m)}
<p style="margin:24px 0 14px;">Want to talk sooner? Grab a slot on my calendar.</p>
<a href="${BOOKING}" style="display:inline-block;padding:13px 22px;background:${t.btnBg};color:${t.btnInk};font-family:${t.mono};font-size:14px;font-weight:500;text-decoration:none;border-radius:${m.site === "showdown" ? "4px" : "999px"};${m.site === "showdown" ? `border:2px solid #161616;box-shadow:4px 4px 0 ${t.accent};` : ""}">Book a call &rarr;</a>
<p style="margin:28px 0 0;font-size:14px;color:${t.muted};">- Vedank Gaur<br><a href="${site.url}" style="color:${t.muted};">${site.url.replace("https://", "")}</a></p>`,
  );
  return { subject, text, html };
}
