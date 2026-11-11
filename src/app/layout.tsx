import type { Metadata, Viewport } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { BottomNav } from "@/components/layout/BottomNav";

const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });

export const metadata: Metadata = {
  title: "OutfitAI Pro",
  description: "Sistema inteligente de equipaje estilo tech-lifestyle",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${outfit.variable}`}>
      <body className="bg-[var(--color-canvas)] min-h-screen text-stone-50 antialiased selection:bg-emerald-600 selection:text-white">
        
        {/* Ambient background glows - Autumn/Forest theme */}
        <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-emerald-600/20 blur-[120px] rounded-full pointer-events-none z-0" />
        <div className="fixed bottom-0 right-0 w-[600px] h-[600px] bg-amber-600/10 blur-[150px] rounded-full pointer-events-none z-0" />

        <div className="max-w-md mx-auto relative flex flex-col md:max-w-lg lg:max-w-xl min-h-screen z-10">
          <Header />
          <main className="flex-1 overflow-x-hidden overflow-y-auto pb-28 no-scrollbar relative z-10">
            {children}
          </main>
          <BottomNav />
        </div>
      </body>
    </html>
  );
}
