import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import { domAnimation, LazyMotion } from "@/components/animations/Animations";
import { BackgroundFX } from "@/components/atoms/BackgroundFX";
import { ThemeProvider } from "@/components/hooks/themeProvider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Next.js Template",
  description:
    "Template de Next.js con Atomic Design, theming v2, Motion y datos estáticos o Supabase.",
};

/**
 * Anti-FOUC: aplica la paleta guardada en localStorage antes del primer paint.
 * Sin esto, el html arranca sin clase de tema y el usuario ve un flash
 * del tema por defecto.
 */
const ANTI_FOUC_SCRIPT = `(function(){try{var k=localStorage.getItem('theme');var c=document.documentElement;var v=['light','dark','rosepine-dark','rosepine-light'];if(k&&v.indexOf(k)>-1){c.classList.remove.apply(c.classList,v);c.classList.add(k);}else{c.classList.add('rosepine-dark');}}catch(e){}})();`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased scroll-smooth scrollbar-gutter-stable`}
      suppressHydrationWarning
    >
      <body className="min-h-full text-[18px] leading-[145%] tracking-[0.18px] text-foreground bg-background font-display">
        <Script id="theme-anti-fouc" strategy="beforeInteractive">
          {ANTI_FOUC_SCRIPT}
        </Script>
        <ThemeProvider
          attribute="class"
          defaultTheme="rosepine-dark"
          enableSystem={false}
          themes={["light", "dark", "rosepine-dark", "rosepine-light"]}
          disableTransitionOnChange
        >
          <LazyMotion features={domAnimation} strict>
            <BackgroundFX />
            {children}
          </LazyMotion>
        </ThemeProvider>
      </body>
    </html>
  );
}
