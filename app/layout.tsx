import type { Metadata } from "next";
import { Toaster } from "@/components/ui/toaster";

import "./globals.css";
import { MantonicoExtraLight } from "@/styles/fonts";
import FooterComponent from "@/components/Footer/FooterComponent";

export const metadata: Metadata = {
  title: "LARENA",
  description: "lorem ipsum",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es-Mx">
      <body className={MantonicoExtraLight.className}>
        <div className="flex flex-col text-[#424D5E]">
          <main>{children}</main>
          <Toaster />
          <FooterComponent />
        </div>
      </body>
    </html>
  );
}
