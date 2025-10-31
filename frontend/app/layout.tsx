import type { Metadata } from "next";
import { Inter, Sora } from "next/font/google";
import "./globals.css";
import QueryProvider from "@/providers/provider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});
const sora = Sora({
  subsets: ["latin"],
  variable: "--font-sora",
});

export const metadata: Metadata = {
  title: "Codemind",
  description: "Comprends n’importe quel code comme si c’était toi qui l’avais écrit.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className={`${inter.variable} ${sora.variable} antialiased`}>
        <main className="min-h-screen w-full linear">
          <QueryProvider>{children}</QueryProvider>
        </main>
      </body>
    </html>
  );
}
