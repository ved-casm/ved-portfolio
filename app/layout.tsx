import "@/styles/template.css";
import { JetBrains_Mono, Manrope } from "next/font/google";
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

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: "Vedank Gaur | Frontend & UI/UX Designer",
  description:
    "Vedank Gaur designs and builds websites and digital products end to end, from the first sketch to launch. Based in Jaipur, IN.",
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
      </head>
      <body
        className={`${manrope.variable} ${jetbrainsMono.variable}`}
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
