import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = { title: 'FortifySec CTF | Capture The Flag', description: 'Competição de segurança da informação da FortifySec. Desafie seus conhecimentos em web, redes, criptografia, OSINT e forense.' };
export default function RootLayout({children}:{children:React.ReactNode}) {return <html lang="pt-BR"><body>{children}</body></html>}
