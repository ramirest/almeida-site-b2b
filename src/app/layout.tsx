import type { Metadata } from "next";
import { Montserrat, Open_Sans } from "next/font/google";
import "./globals.css";

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
});

const openSans = Open_Sans({
  subsets: ["latin"],
  variable: "--font-opensans",
});

export const metadata: Metadata = {
  title: "Jateart - Seu Parceiro Industrial em Jateamento de Vidros",
  description: "Terceirize seu jateamento com tecnologia e prazo garantido. Escale sua vidraçaria sem aumentar sua equipe. Exclusivo para B2B.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="scroll-smooth">
      <body className={`${montserrat.variable} ${openSans.variable} font-sans min-h-screen flex flex-col antialiased bg-white text-[#333333]`}>
        {children}
      </body>
    </html>
  );
}
