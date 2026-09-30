import type { Metadata } from "next";
<<<<<<< HEAD
import "./globals.css";

export const metadata: Metadata = {
  title: "Fortify One — Hacking e Cibersegurança",
  description:
    "Fortify One — hacking e cibersegurança do zero ao avançado. Grade completa, labs, CTFs e certificação prática.",
=======
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const space = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space",
});

export const metadata: Metadata = {
  title: "Fortify One — Hacking e Cibersegurança do Zero ao Avançado",
  description:
    "A maior formação prática de cibersegurança do Brasil. Labs reais, CTFs com prêmios, 4 certificações práticas e comunidade de pentesters. Do zero ao profissional.",
  keywords: [
    "cibersegurança",
    "pentest",
    "hacking ético",
    "CTF",
    "certificação",
    "blue team",
    "red team",
    "Fortify",
  ],
  openGraph: {
    title: "Fortify One — Hacking e Cibersegurança",
    description: "Do zero ao avançado. Labs, CTFs, certificações e comunidade.",
    url: "https://www.fortifysec.com.br",
    siteName: "Fortify One",
    locale: "pt_BR",
    type: "website",
  },
>>>>>>> a125ad8 (redesign fortify)
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
<<<<<<< HEAD
    <html lang="pt-BR">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Outfit:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-bg text-fg antialiased">{children}</body>
=======
    <html lang="pt-BR" className={`${inter.variable} ${space.variable}`}>
      <body className="font-sans antialiased bg-fortify-dark text-slate-200">
        {children}
      </body>
>>>>>>> a125ad8 (redesign fortify)
    </html>
  );
}