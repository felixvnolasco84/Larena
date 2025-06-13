import type { Metadata } from "next";
import { Toaster } from "@/components/ui/toaster";

import "./globals.css";
import { GiordanoGoldSerif } from "@/styles/fonts";

import FooterComponent from "@/components/Footer/FooterComponent";
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
    <html lang="es-Mx">
      <body className={GiordanoGoldSerif.className}>
        <div className="flex flex-col text-[#4A4A4A]">
          <main>{children}</main>
          <Toaster />
          <FooterComponent />
        </div>
      </body>
    </html>
  );
}
