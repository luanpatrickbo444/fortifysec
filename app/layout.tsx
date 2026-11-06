import type { Metadata } from "next";
import "./globals.css";
import "./academy.css";

export const metadata: Metadata = {
  title: "FortifySec | Cybersecurity Academy",
  description:
    "Aprenda segurança da informação gratuitamente, desenvolva suas habilidades e pratique na FortifySec Arena.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
