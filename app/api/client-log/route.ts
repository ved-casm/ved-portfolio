import { NextResponse } from "next/server";

/*
 * TEMP diagnostics: the browser reports errors / crash-reloads here and they
 * show up in Vercel -> Logs as "[client]". No personal data: path, user agent,
 * message and a short stack only.
 */
export const runtime = "nodejs";

const clip = (v: unknown, n: number) => String(v ?? "").slice(0, n);

export async function POST(req: Request) {
  let body: Record<string, unknown> = {};
  try {
    body = JSON.parse(await req.text());
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  console.log(
    "[client]",
    JSON.stringify({
      kind: clip(body.kind, 30),
      path: clip(body.path, 120),
      msg: clip(body.msg, 500),
      stack: clip(body.stack, 1500),
      t: body.t,
      y: body.y,
      w: body.w,
      h: body.h,
      dpr: body.dpr,
      ua: clip(req.headers.get("user-agent"), 200),
    }),
  );
  return NextResponse.json({ ok: true });
}
