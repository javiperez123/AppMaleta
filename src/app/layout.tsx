import type { Metadata, Viewport } from "next";
import "@fontsource-variable/outfit";
import "@fontsource-variable/fraunces";
import "./globals.css";
import { APP_DESCRIPTION, APP_NAME, APP_TAGLINE } from "@/lib/brand";

export const metadata: Metadata = {
  title: { default: `${APP_NAME} · ${APP_TAGLINE}`, template: `%s · ${APP_NAME}` },
  description: APP_DESCRIPTION,
  applicationName: APP_NAME,
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#f7f3ec",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body className="min-h-dvh bg-paper text-ink antialiased">
        <a
          href="#contenido"
          className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[100] focus:rounded-full focus:bg-ink focus:px-4 focus:py-2 focus:text-paper"
        >
          Saltar al contenido
        </a>
        {children}
      </body>
    </html>
  );
}
