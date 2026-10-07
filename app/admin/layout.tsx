import type { Metadata } from "next";
import KycShell from "@/components/Kyc/Shell";
import { ConvexAuthNextjsServerProvider } from "@convex-dev/auth/nextjs/server";
import "../kyc.css";
export const metadata: Metadata = {
  title: "Panel KYC · OGC",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};
export default function Layout({ children }: { children: React.ReactNode }) {
  const content = <KycShell>{children}</KycShell>;
  return process.env.NEXT_PUBLIC_CONVEX_URL ? (
    <ConvexAuthNextjsServerProvider>
      {content}
    </ConvexAuthNextjsServerProvider>
  ) : (
    content
  );
}
