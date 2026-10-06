import { ownerEmail, thankYouEmail, type Brief } from "@/lib/contactEmails";
import { BOOKING_URL } from "@/lib/booking";

const brief: Brief = {
  building: "Website",
  budget: "$600 – $1.5K",
  budgetInr: "₹50k – 1.5L",
  name: "Asha Rao",
  email: "asha@example.com",
  picture: "A calm site\nwith <b>bold</b> type",
  sources: ["LinkedIn", "Google"],
};

describe("ownerEmail", () => {
  const mail = ownerEmail(brief);

  it("names the sender and the project in the subject", () => {
    expect(mail.subject).toBe("New project - Asha Rao · Website");
  });

  it("lists every field in the plain-text body", () => {
    expect(mail.text).toContain("Building: Website");
    expect(mail.text).toContain("Budget: $600 – $1.5K  (≈ ₹50k – 1.5L)");
    expect(mail.text).toContain("Email: asha@example.com");
    expect(mail.text).toContain("Found me through: LinkedIn, Google");
  });

  it("escapes HTML the visitor typed and keeps their line breaks", () => {
    expect(mail.html).toContain("&lt;b&gt;bold&lt;/b&gt;");
    expect(mail.html).not.toContain("<b>bold</b>");
    expect(mail.html).toContain("A calm site<br>with");
  });

  it("offers a reply button addressed to the first name", () => {
    expect(mail.html).toContain("mailto:asha@example.com");
    expect(mail.html).toContain("Reply to Asha");
  });

  it("shows the budget once when there is no separate INR tier", () => {
    const m = ownerEmail({ ...brief, budget: "₹50k – 1.5L", budgetInr: "₹50k – 1.5L", sources: [] });
    expect(m.text).toContain("Budget: ₹50k – 1.5L\n");
    expect(m.text).toContain("Found me through: -");
  });
});

describe("thankYouEmail", () => {
  const mail = thankYouEmail(brief, { siteUrl: "https://example.com/", ownerEmail: "me@example.com" });

  it("thanks the sender by first name", () => {
    expect(mail.subject).toBe("Thanks, Asha - your brief is in");
    expect(mail.text).toContain("Thank you, Asha.");
  });

  it("uses the site URL for the logo without a double slash", () => {
    expect(mail.html).toContain("https://example.com/email/monogram-white.png");
  });

  it("links the booking page when one is configured", () => {
    if (BOOKING_URL) {
      expect(mail.html).toContain(BOOKING_URL);
      expect(mail.text).toContain(BOOKING_URL);
    }
  });

  it("lets the sender add a detail by email", () => {
    expect(mail.html).toContain("mailto:me@example.com");
  });
});
