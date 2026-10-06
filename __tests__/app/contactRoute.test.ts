/**
 * @jest-environment node
 */
import type { POST as PostFn } from "@/app/api/contact/route";

const sendMail = jest.fn().mockResolvedValue({});
jest.mock("nodemailer", () => ({
  __esModule: true,
  default: { createTransport: jest.fn(() => ({ sendMail })) },
}));

const ENV = { ...process.env };
let POST: typeof PostFn;
let ip = 0;

// fresh module per test: the route keeps a per-IP rate limit in memory
beforeEach(async () => {
  jest.resetModules();
  sendMail.mockClear();
  process.env = { ...ENV, SMTP_USER: "me@example.com", SMTP_PASS: "app-password", SITE_URL: "https://example.com" };
  ({ POST } = await import("@/app/api/contact/route"));
});
afterAll(() => {
  process.env = ENV;
});

const valid = { building: "Website", budget: "₹50k – 1.5L", name: "Asha Rao", email: "asha@example.com" };
const post = (body: unknown, raw = false) =>
  POST(
    new Request("http://localhost/api/contact", {
      method: "POST",
      headers: { "content-type": "application/json", "x-forwarded-for": `10.0.0.${++ip}` },
      body: raw ? (body as string) : JSON.stringify(body),
    }),
  );

describe("POST /api/contact", () => {
  it("rejects a body that isn't JSON", async () => {
    const res = await post("{nope", true);
    expect(res.status).toBe(400);
  });

  it("quietly accepts (and drops) a filled honeypot", async () => {
    const res = await post({ ...valid, company: "Spam Inc" });
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
    expect(sendMail).not.toHaveBeenCalled();
  });

  it("asks for the required fields", async () => {
    const res = await post({ name: "Asha" });
    expect(res.status).toBe(422);
    const json = await res.json();
    expect(json.fields).toEqual(["building", "budget", "email"]);
  });

  it("rejects an invalid email", async () => {
    const res = await post({ ...valid, email: "not-an-email" });
    expect(res.status).toBe(422);
  });

  it("sends the brief to me and a thank-you to the sender", async () => {
    const res = await post({ ...valid, sources: ["LinkedIn"] });
    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({ ok: true });
    expect(sendMail).toHaveBeenCalledTimes(2);
    const [mine, theirs] = sendMail.mock.calls.map((c) => c[0]);
    expect(mine).toMatchObject({ to: "me@example.com", replyTo: '"Asha Rao" <asha@example.com>' });
    expect(theirs).toMatchObject({ to: "asha@example.com" });
  });

  it("says so when email isn't configured", async () => {
    const log = jest.spyOn(console, "error").mockImplementation(() => {});
    delete process.env.SMTP_PASS;
    const res = await post(valid);
    expect(res.status).toBe(500);
    expect(sendMail).not.toHaveBeenCalled();
    log.mockRestore();
  });

  it("reports a failed send", async () => {
    const log = jest.spyOn(console, "error").mockImplementation(() => {});
    sendMail.mockRejectedValueOnce(new Error("smtp down"));
    const res = await post(valid);
    expect(res.status).toBe(502);
    log.mockRestore();
  });

  it("rate-limits one IP after five briefs", async () => {
    const send = () =>
      POST(
        new Request("http://localhost/api/contact", {
          method: "POST",
          headers: { "content-type": "application/json", "x-forwarded-for": "10.9.9.9" },
          body: JSON.stringify(valid),
        }),
      );
    for (let i = 0; i < 5; i++) expect((await send()).status).toBe(200);
    expect((await send()).status).toBe(429);
  });
});
