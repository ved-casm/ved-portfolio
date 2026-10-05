import "@/styles/template.css";
import { SITE_NAME, SITE_URL } from "@/lib/site";
import { Cormorant, Geist, JetBrains_Mono, Manrope } from "next/font/google";
import Header1 from "@/components/headers/Header1";
import TemplateRuntimeProvider from "@/components/common/TemplateRuntimeProvider";
import MenuRuntimeShell from "@/components/headers/MenuRuntimeShell";
import { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
});

// self-hosted by next/font (no render-blocking Google Fonts request)
const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
});

const cormorant = Cormorant({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
});

const REPORTER = "(function(){try{var n=0,t0=Date.now(),K='__vg_alive';function send(o){if(n++>15)return;o.path=location.pathname;o.t=Math.round((Date.now()-t0)/1000);o.y=Math.round(window.scrollY||0);o.w=innerWidth;o.h=innerHeight;o.dpr=devicePixelRatio;var b=JSON.stringify(o);if(navigator.sendBeacon)navigator.sendBeacon('/api/client-log',b);else fetch('/api/client-log',{method:'POST',body:b,keepalive:true});}var prev=null;try{prev=sessionStorage.getItem(K);sessionStorage.setItem(K,location.pathname+'|'+Date.now());}catch(e){}if(prev){var p=prev.split('|');send({kind:'crash-reload?',msg:'previous load of '+p[0]+' never unloaded cleanly ('+Math.round((Date.now()-+p[1])/1000)+'s ago)'});}addEventListener('pagehide',function(){try{sessionStorage.removeItem(K);}catch(e){}});addEventListener('error',function(e){send({kind:'error',msg:e.message+' @'+(e.filename||'')+':'+e.lineno,stack:e.error&&e.error.stack});});addEventListener('unhandledrejection',function(e){var r=e.reason||{};send({kind:'rejection',msg:String(r.message||r),stack:r.stack});});if(/iPhone|iPad|iPod/.test(navigator.userAgent))setTimeout(function(){send({kind:'alive-10s',msg:'ok'});},10000);}catch(e){}})();";

const DESCRIPTION =
  "Vedank Gaur designs and builds websites and digital products end to end, from the first sketch to launch. Based in Jaipur, IN.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Vedank Gaur | Frontend & UI/UX Designer",
  description: DESCRIPTION,
  applicationName: SITE_NAME,
  authors: [{ name: "Vedank Gaur", url: SITE_URL }],
  creator: "Vedank Gaur",
  keywords: [
    "Vedank Gaur",
    "Vedank",
    "Vedank Gaur portfolio",
    "frontend developer Jaipur",
    "UI/UX designer Jaipur",
    "web designer Jaipur",
    "creative developer",
    "Next.js developer",
    "Three.js developer",
  ],
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    locale: "en_IN",
    siteName: SITE_NAME,
    title: "Vedank Gaur | Frontend & UI/UX Designer",
    description: DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: "Vedank Gaur | Frontend & UI/UX Designer",
    description: DESCRIPTION,
  },
  // Google Search Console "HTML tag" check (public token; an env var overrides it)
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION || "mtBqz9zNAWf0bnDelWK2Y9s2YbCiuEU7zBoVWvOZWVc",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="no-touch"
      // no theme switcher: the site is always dark
      color-scheme="dark"
      suppressHydrationWarning
    >
      <head>
        {/* runs before first paint: a reload (even a hard one) always starts at
            the top instead of the browser restoring the old scroll position */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "try{history.scrollRestoration='manual'}catch(e){}window.scrollTo(0,0);",
          }}
        />
        {/* TEMP: report client errors / crash-reloads to Vercel logs (app/api/client-log) */}
        <script dangerouslySetInnerHTML={{ __html: REPORTER }} />
      </head>
      <body
        className={`${manrope.variable} ${jetbrainsMono.variable} ${geist.variable} ${cormorant.variable}`}
        style={
          {
            "--_font-default": "var(--font-manrope)",
            "--_font-accent": "var(--font-jetbrains-mono)",
          } as React.CSSProperties
        }
        suppressHydrationWarning
      >
        <TemplateRuntimeProvider>
          <Header1 />
          <MenuRuntimeShell />
          {children}
        </TemplateRuntimeProvider>
        {/* visitor analytics + real-user speed data (enable both in the Vercel dashboard) */}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
