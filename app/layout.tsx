import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ShopIt - Admin Console & Operations",
  description: "Internal control room, analytics, catalog, orders, and payment management for ShopIt wholesale operations.",
  icons: {
    icon: '/icon.svg',
    shortcut: '/icon.svg',
    apple: '/icon.svg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen selection:bg-[#e0ee56] selection:text-[#14212b]">
        {children}
      </body>
    </html>
  );
}
