/*
 * Emails for the /contact brief: a plain, scannable notification for me and
 * a designed thank-you for the sender. Table layout + inline styles so they
 * hold up in Gmail, Outlook and Apple Mail; web fonts fall back to Georgia /
 * Helvetica where a client won't load them.
 */

export type Brief = {
  building: string;
  budget: string;
  name: string;
  email: string;
  picture: string;
  sources: string[];
};

const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
const nl2br = (s: string) => esc(s).replace(/\r?\n/g, "<br>");

const SERIF = "'Cormorant Garamond', 'Cormorant', Georgia, 'Times New Roman', serif";
const SANS = "'Manrope', 'Helvetica Neue', Helvetica, Arial, sans-serif";
const MONO = "'JetBrains Mono', 'SFMono-Regular', Menlo, Consolas, monospace";

const firstName = (n: string) => n.trim().split(/\s+/)[0] || "there";

// ---- to me -------------------------------------------------------------------
export function ownerEmail(b: Brief) {
  const rows: [string, string][] = [
    ["Building", b.building],
    ["Budget", b.budget],
    ["Name", b.name],
    ["Email", b.email],
    ["Found me through", b.sources.join(", ") || "—"],
  ];
  const text = [
    `New project brief from ${b.name}`,
    "",
    ...rows.map(([k, v]) => `${k}: ${v}`),
    "",
    "What they're picturing:",
    b.picture || "—",
  ].join("\n");

  const html = `<!doctype html>
<html><body style="margin:0;padding:0;background:#f4f4f2;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f2;padding:32px 12px;">
<tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:14px;overflow:hidden;">
  <tr><td style="background:#0f0f0f;padding:28px 32px;">
    <p style="margin:0;font:600 11px/1 ${MONO};letter-spacing:2px;text-transform:uppercase;color:#8a8a8a;">New project brief</p>
    <p style="margin:12px 0 0;font:italic 500 34px/1.1 ${SERIF};color:#ffffff;">${esc(b.name)}</p>
  </td></tr>
  <tr><td style="padding:12px 32px 8px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      ${rows
        .map(
          ([k, v]) => `<tr>
        <td style="padding:14px 0;border-bottom:1px solid #ececec;width:38%;font:600 11px/1.4 ${MONO};letter-spacing:1px;text-transform:uppercase;color:#8a8a8a;vertical-align:top;">${esc(k)}</td>
        <td style="padding:14px 0;border-bottom:1px solid #ececec;font:500 15px/1.5 ${SANS};color:#111111;">${k === "Email" ? `<a href="mailto:${esc(v)}" style="color:#111111;">${esc(v)}</a>` : esc(v)}</td>
      </tr>`,
        )
        .join("")}
    </table>
  </td></tr>
  <tr><td style="padding:18px 32px 32px;">
    <p style="margin:0 0 10px;font:600 11px/1 ${MONO};letter-spacing:1px;text-transform:uppercase;color:#8a8a8a;">What they're picturing</p>
    <p style="margin:0;font:500 15px/1.6 ${SANS};color:#111111;">${b.picture ? nl2br(b.picture) : "—"}</p>
    <p style="margin:26px 0 0;"><a href="mailto:${esc(b.email)}?subject=${encodeURIComponent("Re: your project")}" style="display:inline-block;padding:14px 26px;border-radius:99px;background:#0f0f0f;color:#ffffff;text-decoration:none;font:700 12px/1 ${SANS};letter-spacing:1.5px;text-transform:uppercase;">Reply to ${esc(firstName(b.name))}</a></p>
  </td></tr>
</table>
</td></tr></table>
</body></html>`;
  return { subject: `New project — ${b.name} · ${b.building}`, text, html };
}

// ---- to the sender -----------------------------------------------------------
export function thankYouEmail(b: Brief, opts: { siteUrl?: string; ownerEmail: string }) {
  const name = firstName(b.name);
  const logo = opts.siteUrl ? `${opts.siteUrl.replace(/\/$/, "")}/monogram-white.png` : "";
  const site = opts.siteUrl || "";
  const steps = [
    ["01", "I read your brief", "Properly, start to finish — usually the same day."],
    ["02", "A short call", "20–30 minutes to understand the goals, the audience and the timeline."],
    ["03", "A clear proposal", "Scope, schedule and cost, so you know exactly what you're getting."],
  ];
  const text = [
    `Thank you, ${name}.`,
    "",
    "Your brief just landed in my inbox. I'll read it properly and get back to you within 24 hours.",
    "",
    `You're building: ${b.building}`,
    `Budget: ${b.budget}`,
    b.picture ? `\nYou're picturing:\n${b.picture}` : "",
    "",
    "What happens next:",
    ...steps.map(([n, t, d]) => `${n}. ${t}: ${d}`),
    "",
    "Talk soon,",
    "Vedank Gaur",
    "Web design & development · Jaipur, IN",
    opts.ownerEmail,
  ].join("\n");

  const html = `<!doctype html>
<html lang="en"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="dark light"><meta name="supported-color-schemes" content="dark light">
<title>Thank you, ${esc(name)}</title>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@1,500&family=Manrope:wght@400;600;800&family=JetBrains+Mono:wght@500&display=swap" rel="stylesheet">
<style>
  @media (max-width:620px){ .px{padding-left:24px!important;padding-right:24px!important} .h1{font-size:46px!important} .step td{display:block!important;width:auto!important} }
</style>
</head>
<body style="margin:0;padding:0;background:#050505;">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;">Your brief is in. I'll get back to you within 24 hours.</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#050505;padding:28px 10px;">
<tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:620px;background:#0f0f0f;border:1px solid #1f1f1f;border-radius:22px;overflow:hidden;">

  <!-- header -->
  <tr><td class="px" style="padding:30px 44px 0;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
      <td style="vertical-align:middle;">${
        logo
          ? `<img src="${logo}" width="34" height="32" alt="Vedank Gaur" style="display:block;border:0;width:34px;height:auto;">`
          : `<span style="font:italic 500 26px/1 ${SERIF};color:#ffffff;">V</span>`
      }</td>
      <td align="right" style="vertical-align:middle;font:500 10px/1 ${MONO};letter-spacing:2px;text-transform:uppercase;color:#6f6f6f;">Brief received</td>
    </tr></table>
  </td></tr>

  <!-- hero -->
  <tr><td class="px" style="padding:64px 44px 10px;">
    <p style="margin:0 0 18px;font:500 11px/1 ${MONO};letter-spacing:3px;text-transform:uppercase;color:#7c7c7c;">[ Thank you ]</p>
    <h1 class="h1" style="margin:0;font:800 58px/0.95 ${SANS};letter-spacing:-2px;text-transform:uppercase;color:#f2f2f2;">
      <span style="font:italic 500 64px/0.95 ${SERIF};letter-spacing:-1px;text-transform:none;color:#d6d6d6;">Thanks,</span><br>${esc(name)}.
    </h1>
    <p style="margin:26px 0 0;max-width:440px;font:400 16px/1.65 ${SANS};color:#a9a9a9;">
      Your brief just landed in my inbox. I'll read it properly and get back to you <span style="color:#ffffff;">within 24 hours</span> — usually sooner.
    </p>
  </td></tr>

  <!-- divider -->
  <tr><td class="px" style="padding:44px 44px 0;"><div style="height:1px;background:#242424;line-height:1px;font-size:1px;">&nbsp;</div></td></tr>

  <!-- their brief -->
  <tr><td class="px" style="padding:30px 44px 0;">
    <p style="margin:0 0 18px;font:500 11px/1 ${MONO};letter-spacing:2px;text-transform:uppercase;color:#7c7c7c;">Your brief</p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#151515;border:1px solid #232323;border-radius:16px;">
      <tr><td style="padding:22px 24px;border-bottom:1px solid #232323;">
        <p style="margin:0 0 6px;font:500 10px/1 ${MONO};letter-spacing:1.5px;text-transform:uppercase;color:#6f6f6f;">You're building</p>
        <p style="margin:0;font:italic 500 24px/1.2 ${SERIF};color:#ffffff;">${esc(b.building)}</p>
      </td></tr>
      <tr><td style="padding:22px 24px;${b.picture ? "border-bottom:1px solid #232323;" : ""}">
        <p style="margin:0 0 6px;font:500 10px/1 ${MONO};letter-spacing:1.5px;text-transform:uppercase;color:#6f6f6f;">Budget</p>
        <p style="margin:0;font:italic 500 24px/1.2 ${SERIF};color:#ffffff;">${esc(b.budget)}</p>
      </td></tr>
      ${
        b.picture
          ? `<tr><td style="padding:22px 24px;">
        <p style="margin:0 0 8px;font:500 10px/1 ${MONO};letter-spacing:1.5px;text-transform:uppercase;color:#6f6f6f;">You're picturing</p>
        <p style="margin:0;font:400 15px/1.6 ${SANS};color:#c9c9c9;">${nl2br(b.picture)}</p>
      </td></tr>`
          : ""
      }
    </table>
  </td></tr>

  <!-- next steps -->
  <tr><td class="px" style="padding:44px 44px 0;">
    <p style="margin:0 0 6px;font:500 11px/1 ${MONO};letter-spacing:2px;text-transform:uppercase;color:#7c7c7c;">What happens next</p>
    ${steps
      .map(
        ([n, t, d], i) => `<table role="presentation" class="step" width="100%" cellpadding="0" cellspacing="0" style="${i < steps.length - 1 ? "border-bottom:1px solid #1f1f1f;" : ""}"><tr>
      <td style="width:64px;padding:20px 0;vertical-align:top;font:500 12px/1.6 ${MONO};color:#6f6f6f;">${n}</td>
      <td style="padding:20px 0;vertical-align:top;">
        <p style="margin:0 0 4px;font:600 17px/1.3 ${SANS};color:#f2f2f2;">${t}</p>
        <p style="margin:0;font:400 14px/1.6 ${SANS};color:#8f8f8f;">${d}</p>
      </td></tr></table>`,
      )
      .join("")}
  </td></tr>

  <!-- sign-off -->
  <tr><td class="px" style="padding:48px 44px 0;">
    <p style="margin:0;font:400 16px/1.6 ${SANS};color:#a9a9a9;">Talk soon,</p>
    <p style="margin:6px 0 0;font:italic 500 38px/1 ${SERIF};color:#ffffff;">Vedank Gaur</p>
    <p style="margin:10px 0 0;font:500 11px/1.6 ${MONO};letter-spacing:1.5px;text-transform:uppercase;color:#6f6f6f;">Web design &amp; development · Jaipur, IN</p>
  </td></tr>

  <!-- cta -->
  <tr><td class="px" style="padding:34px 44px 0;">
    <table role="presentation" cellpadding="0" cellspacing="0"><tr>
      ${
        site
          ? `<td style="padding-right:12px;"><a href="${esc(site)}/works" style="display:inline-block;padding:15px 26px;border-radius:99px;background:#ffffff;color:#0f0f0f;text-decoration:none;font:700 12px/1 ${SANS};letter-spacing:1.5px;text-transform:uppercase;">See my work &rarr;</a></td>`
          : ""
      }
      <td><a href="mailto:${esc(opts.ownerEmail)}" style="display:inline-block;padding:14px 24px;border-radius:99px;border:1px solid #3a3a3a;color:#f2f2f2;text-decoration:none;font:700 12px/1 ${SANS};letter-spacing:1.5px;text-transform:uppercase;">Add a detail</a></td>
    </tr></table>
  </td></tr>

  <!-- big wordmark -->
  <tr><td class="px" style="padding:60px 44px 12px;">
    <p style="margin:0;font:800 72px/0.8 ${SANS};letter-spacing:-3px;color:#1c1c1c;">VEDANK</p>
  </td></tr>
  <tr><td class="px" style="padding:0 44px 30px;">
    <p style="margin:0;font:400 12px/1.6 ${SANS};color:#5c5c5c;">You're getting this because you sent a project brief${site ? ` on <a href="${esc(site)}" style="color:#8a8a8a;">${esc(site.replace(/^https?:\/\//, ""))}</a>` : ""}. Just reply to this email to add anything.</p>
  </td></tr>

</table>
</td></tr></table>
</body></html>`;
  return { subject: `Thanks, ${name} — your brief is in`, text, html };
}
