# Vedank Gaur — portfolio

Next.js 16 (App Router) site with GSAP, Lenis and three.js.

## Pages

- `/` — home
- `/services`
- `/works`, `/works/[slug]` — project data lives in `components/projects/showcase/projectShowcaseData.ts`
- `/about`
- `/contact` — 3D scene + project brief form (`app/api/contact/route.ts` sends the emails)

## Develop

```bash
npm install
npm run dev
```

## Environment

Copy `.env.example` to `.env.local` and fill in the SMTP settings (a Gmail App Password works) so the contact form can send mail. Set the same variables in the Vercel project settings before deploying.
