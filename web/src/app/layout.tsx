import type { Metadata } from "next";
import { locale } from "@/lib/i18n";
import "./globals.css";

export const metadata: Metadata = {
  title: "Cinema Seat Booking",
  description: "Book your movie seats online",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang={locale} className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
