import type { Metadata } from "next";
import { Toaster } from "@/components/ui/toaster";

import "./globals.css";
import { GiordanoGoldSerif } from "@/styles/fonts";

import SiteFooter from "@/components/Footer/SiteFooter";
export const metadata: Metadata = {
  title: "LARENA",
  description: "",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es-MX">
      <body className={GiordanoGoldSerif.className}>
        <div className="flex flex-col text-[#4A4A4A] relative">
          <div>{children}</div>
          <Toaster />
          <SiteFooter />
        </div>
      </body>
    </html>
  );
}
