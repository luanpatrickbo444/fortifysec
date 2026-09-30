import type { Metadata } from "next";
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
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className={`${inter.variable} ${space.variable}`}>
      <body className="font-sans antialiased bg-fortify-dark text-slate-200">
        {children}
      </body>
    </html>
  );
}