"use client";
import { usePathname } from "next/navigation";
import FooterComponent from "./FooterComponent";
export default function SiteFooter() {
  const path = usePathname();
  return path.startsWith("/kyc") || path.startsWith("/admin") ? null : (
    <FooterComponent />
  );
}
