import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from 'sonner';
import { Analytics } from '@vercel/analytics/react';

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "BLOG.ACERVOBOOK // Protocolo de Dados",
    description: "Sistema de acesso restrito para registro de logs e comunicação entre clãs.",
    metadataBase: new URL('https://blog.acervobook.online'),
    openGraph: {
        title: "BLOG.ACERVOBOOK // Sistema de Acesso",
        description: "Inicie sessão para acessar o banco de dados e as redes de clãs.",
        url: "https://blog.acervobook.online",
        siteName: "BLOG.AcervoBook",
        images: [
            {
                url: "/og-image.png",
                width: 736,
                height: 736,
                alt: "Logo AcervoBook",
            },
        ],
        locale: "pt_BR",
        type: "website",
    },
};

export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="pt-BR">
        <body
            className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
        {children}

        {/* O rastreador da Vercel entra aqui, logo após o conteúdo da página */}
        <Analytics />

        <Toaster position="top-right" richColors theme="dark" />
        </body>
        </html>
    );
}